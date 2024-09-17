import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import Button from "@/components/button";
import { db, auth } from "@/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { usePushNotification } from "@/components/NotificationHandler/usePushNotification";
import { router } from "expo-router";

type FormData = {
  nemonclature: string;
  recipientReg: string;
  recipientStation: string;
  partNo: string;
  voucherNo: string;
  reason: string;
  ATLB: string;

  token: string;
  userName: string; // Add userName to form
};

const DEFAULT_FORM_VALUES: FormData = {
  nemonclature: "",
  recipientReg: "",
  recipientStation: "",
  partNo: "",
  voucherNo: "",
  reason: "",
  ATLB: "",
  token: "expoPushToken",
  userName: "", // Add userName to default form values
};

const CannibalizationForm = () => {
  const { expoPushToken } = usePushNotification("user2", true);
  const [path, setPath] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [id, setId] = useState<string>("");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: DEFAULT_FORM_VALUES });

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      const email = currentUser?.email || "No user";
      setEmail(email);

      if (currentUser) {
        try {
          setLoading(true);
          const userRef = doc(db, "user0", email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const fetchedUserName = userDoc.data()?.name || "";
            setValue("userName", fetchedUserName); // Set userName in form
          } else {
            console.log("No user document found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    const generatePath = async () => {
      try {
        const autoId = doc(collection(db, "Cannibalization")).id;
        setId(autoId);
        setPath(`/request/${email}/${autoId}`);
      } catch (error) {
        console.error("Error generating path:", error);
      }
    };

    fetchUserData();
    generatePath();

    if (expoPushToken) {
      setValue("token", expoPushToken); // Set token in form
    }
  }, [email, expoPushToken]);

  const saveNotification = async (notificationData: {
    id: string;
    path: string;
    token: string;
  }) => {
    try {
      const notificationRef = doc(db, "notification1", id);
      await setDoc(notificationRef, notificationData);
      console.log("Notification data saved successfully.");
    } catch (error) {
      console.error("Error saving notification data:", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Store the form data in Firestore
      const docRef = doc(db, path, "Block A");
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      console.log("Document written with ID:", docRef.id);

      // Retrieve user1's expo push token
      const user1Ref = doc(db, "users", "user1");
      const user1Doc = await getDoc(user1Ref);
      const user1Token = user1Doc.exists()
        ? user1Doc.data().expoPushToken
        : null;

      if (user1Token && expoPushToken) {
        const notificationData = {
          title: "Cannibalization Request",
          body: `A new cannibalization request has been submitted by ${data.userName}.`,
          id: docRef.id,
          path: path,
          token: expoPushToken,
        };

        await sendNotification(user1Token, notificationData);
      } else {
        console.error("Expo push token for user1 or user0 not found.");
      }
    } catch (error) {
      console.error("Error adding document:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (
    token: string,
    notificationData: {
      title?: string;
      body?: string;
      id: string;
      path: string;
      token: string;
    }
  ) => {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          sound: "default",
          title: notificationData.title,
          body: notificationData.body,
          channelId: "Channel_user1",
          data: {
            screen: "/User1/index",
            user0Token: notificationData.token, // Include user0's token for reply
          },
        }),
      });

      if (response.ok) {
        await saveNotification(notificationData);
        const responseData = await response.json();
        console.log("Notification sent successfully:", responseData);
        Alert.alert("Notification sent!", "Cannibalization Request Sent!");
        router.push("/User0/(tabs)/HomeScreen");
      } else {
        console.error(`Notification error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.text}>Block A: Cannibalization Request</Text>
        <Controller
          control={control}
          name="nemonclature"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Nemonclature"
              keyboardType="default"
            />
          )}
        />
        <Controller
          control={control}
          name="partNo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Part no"
              keyboardType="numeric"
            />
          )}
        />
        <Controller
          control={control}
          name="recipientReg"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Recipient Aircraft Registration"
              keyboardType="default"
            />
          )}
        />
        <Controller
          control={control}
          name="recipientStation"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Recipient Station"
              keyboardType="default"
            />
          )}
        />
        <Controller
          control={control}
          name="voucherNo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Voucher No"
              keyboardType="default"
            />
          )}
        />
        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Reason for Cannibalization"
              keyboardType="default"
            />
          )}
        />
        <Controller
          control={control}
          name="ATLB"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="ATLB"
              keyboardType="default"
            />
          )}
        />
        <Button onClick={handleSubmit(onSubmit)}>Submit Request</Button>
        {loading && <ActivityIndicator />}
      </View>
    </ScrollView>
  );
};

export default CannibalizationForm;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
});
