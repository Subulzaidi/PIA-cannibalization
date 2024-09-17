import React from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import CheckBox from "expo-checkbox";
import Button from "@/components/button";
import { db } from "@/firebaseConfig";
import {
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";

type Prop = {
  path: string;
  userName: string; // Added userName to props
};

type FormData = {
  donorReg: string;
  preserved: boolean;
  cOfAValid: boolean;
  remarks: string;
  approvalRef: string;
  status: string;
};

const BlockB: React.FC<Prop> = ({ path, userName }) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      donorReg: "",
      preserved: false,
      cOfAValid: false,
      remarks: "",
      status: "Not Verified",
    },
  });

  const [clicked, setClicked] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const docRef = doc(db, path, "Block B");
      await setDoc(docRef, {
        ...data,
        status: ` ${userName}`,
        createdAt: serverTimestamp(),
      });
      setValue("status", `Verified by ${userName}`); // Update status

      setClicked(true);
      console.log("Document written with ID: ", docRef.id);

      const user2Ref = doc(db, "users", "user2");
      const user2Doc = await getDoc(user2Ref);
      const user2Token = user2Doc.exists()
        ? user2Doc.data().expoPushToken
        : null;

      if (user2Token) {
        await Promise.all([
          sendNotification(user2Token, {
            title: "Cannibalization Request Verified",
            body: "A new request has been verified. Please review it.",
            data: {
              path,
            },
          }),
        ]);

        await addDoc(collection(db, "notification2"), {
          user: "user1",
          title: "Cannibalization Request Verified",
          body: "A new request has been verified. Please review it.",
          path,
          createdAt: serverTimestamp(),
        });

        await setDoc(
          doc(db, "users", "user1"),
          { notificationStatus: "Pending" },
          { merge: true }
        );

        router.push("/User1/(tabs)/");
      } else {
        console.log("Expo push token for user1 is not available.");
      }
    } catch (e) {
      console.error("Error adding document: ", e);
      setValue("status", "Error");
    }
  };

  const sendNotification = async (token: string, payload: object) => {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Notification sent successfully:", responseData);
      Alert.alert(
        "Notification sent!",
        "Cannibalization Permission Request Sent to All Authorities"
      );
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const status = watch("status");

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Block B: Cannibalization Permission</Text>

      {/* Display userName */}
      <Text style={styles.userName}>Logged in as: {userName}</Text>

      <Controller
        control={control}
        name="donorReg"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            placeholder="Donor Aircraft Registration"
            keyboardType="default"
          />
        )}
      />

      <View style={styles.checkboxContainer}>
        <Controller
          control={control}
          name="preserved"
          render={({ field: { onChange, value } }) => (
            <CheckBox
              value={value}
              onValueChange={onChange}
              style={styles.checkbox}
            />
          )}
        />
        <Text style={styles.label}>
          Aircraft is adequately preserved, if required
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Controller
          control={control}
          name="cOfAValid"
          render={({ field: { onChange, value } }) => (
            <CheckBox
              value={value}
              onValueChange={onChange}
              style={styles.checkbox}
            />
          )}
        />
        <Text style={styles.label}>C of A is valid</Text>
      </View>

      <Controller
        control={control}
        name="remarks"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            placeholder="Remarks (if any)"
            keyboardType="default"
          />
        )}
      />

      <Button
        type="secondary"
        onClick={handleSubmit(onSubmit)}
        disable={clicked}
      >
        {clicked ? "Request Sent!" : "Verify"}
      </Button>

      <Text style={styles.status}>{status}</Text>
      <View style={styles.line} />
      <Text style={styles.signatureText}>DCE(Situation Room) / EMOD </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  status: {
    textAlign: "center",
    color: "#b59906",
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  signatureText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#034c2e",
    marginBottom: 20,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: "center",
  },
  label: {
    margin: 8,
  },
  Verified: {
    fontWeight: "bold",
  },
});

export default BlockB;
