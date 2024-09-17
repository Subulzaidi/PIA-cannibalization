import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { RootStackParamList } from "@/types/types";
import { ScrollView } from "react-native-gesture-handler";
import Button from "@/components/button";
import BlockB from "./BlockB";

type NotificationDetailRouteProp = RouteProp<
  RootStackParamList,
  "NotificationDetail"
>;

const NotificationDetail = () => {
  const route = useRoute<NotificationDetailRouteProp>();
  const { notificationId, path } = route.params;
  const [notification, setNotification] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [verify, setVerify] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      const email = currentUser?.email || "No user";
      setEmail(email);
      if (currentUser) {
        try {
          setLoading(true);
          const userRef = doc(db, "user1", email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserName(userDoc.data()?.name || "Unknown User"); // Provide fallback value
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

    const fetchNotificationDetails = async () => {
      try {
        const docRef = doc(db, path, notificationId);

        const N_id = path.split("/").pop() ?? "";
        setId(N_id);

        console.log(N_id);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNotification(docSnap.data());
          console.log(notification);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching notification details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchNotificationDetails();
  }, [notificationId, path]);

  const OnClickVerify = async () => {
    setVerify(true);
    try {
      console.log(notificationId)
      const notificationRef = doc(db, "notifications", notificationId);
      await deleteDoc(notificationRef);

      console.log(
        "Notification moved to verified and deleted from original collection."
      );
      setVerify(true);
    } catch (error) {
      console.error("Error verifying and moving notification:", error);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#034c2e" style={styles.loader} />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Cannibalization Request</Text>
      {notification ? (
        <View>
          <View style={styles.reportContainer}>
            <Text style={styles.header}>Report</Text>

            <Text style={styles.detailText}>Nemonclature:</Text>
            <Text style={styles.text}>{notification.nemonclature}</Text>

            <Text style={styles.detailText}>Part No:</Text>
            <Text style={styles.text}> {notification.partNo}</Text>

            <Text style={styles.detailText}>
              Recipient Aircraft Registration:
            </Text>
            <Text style={styles.text}> {notification.recipientReg}</Text>

            <Text style={styles.detailText}>Recipient Station:</Text>
            <Text style={styles.text}> {notification.recipientStation}</Text>

            <Text style={styles.detailText}>
              Proof OF NIL-IN-STOCK:(Voucher No):
            </Text>
            <Text style={styles.text}> {notification.voucherNo}</Text>

            <Text style={styles.detailText}>
              Reason(s) for Cannibalization:
            </Text>
            <Text style={styles.text}> {notification.reason}</Text>

            <Text style={styles.detailText}>ATLB Ref No with Date:</Text>
            <Text style={styles.text}> {notification.ATLB}</Text>

            <Text style={styles.detailText}>
              Shift Incharge/Certifying Staff:
            </Text>
            <Text style={styles.text}> {notification.status}</Text>

            <Text style={styles.detailText}>Created At: </Text>
            <Text style={styles.text}>
              {new Date(notification.createdAt.seconds * 1000).toLocaleString()}
            </Text>
          </View>

          {verify === false ? (
            <Button onClick={OnClickVerify}>Verify Block A</Button>
          ) : (
            <BlockB path={path} userName={userName} />
          )}
        </View>
      ) : (
        <Text style={styles.noData}>No data available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  reportContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#034c2e",
    marginBottom: 10,
  },
  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    paddingBottom: 1,
  },
  line: {
    borderWidth: 1,
    marginVertical: 10,
    borderRadius: 15,
    padding: 10,
  },
});

export default NotificationDetail;
