import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { RootStackParamList } from "@/types/types";
import { ScrollView } from "react-native-gesture-handler";
import Button from "@/components/button";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";

type NotificationDetailRouteProp = RouteProp<
  RootStackParamList,
  "NotificationDetail"
>;

const NotificationDetail = () => {
  const route = useRoute<NotificationDetailRouteProp>();
  const { notificationId, path } = route.params;
  const [notificationA, setNotificationA] = useState<any>(null);
  const [notificationB, setNotificationB] = useState<any>(null);
  const [notificationC, setNotificationC] = useState<any>(null); // New state for Block C
  const [loading, setLoading] = useState(true);
  const [verify, setVerify] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [initiatorToken, setInitiatorToken] = useState<string>("");

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      const email = currentUser?.email || "No user";
      setEmail(email);
      if (currentUser) {
        try {
          setLoading(true);
          const userRef = doc(db, "user3", email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserName(userDoc.data()?.name || "Unknown User");
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
        const docRefA = doc(db, path, "Block A");
        const docSnapA = await getDoc(docRefA);
        if (docSnapA.exists()) {
          setNotificationA(docSnapA.data());
          setInitiatorToken(docSnapA.data().token);
        } else {
          console.log("No Block A document!");
        }

        const docRefB = doc(db, path, "Block B");
        const docSnapB = await getDoc(docRefB);
        if (docSnapB.exists()) {
          setNotificationB(docSnapB.data());
        } else {
          console.log("No Block B document!");
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
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const OnClickVerify = async (data: any) => {
    try {
      setVerify(true);

      const ApprovedByChiefMOC = userName;

      const notificationBRef = doc(db, path, "Block B");
      await setDoc(
        notificationBRef,
        {
          ApprovedByChiefMOC,
        },
        { merge: true }
      );

      console.log(
        "Notification verified and updated by MOC:",
        ApprovedByChiefMOC
      );

      if (initiatorToken) {
        await Promise.all([
          sendNotification(initiatorToken, {
            title: "Cannibalization Request Verified",
            body: `A new request for Donor Section Action by ${userName}.`,
            data: {
              path,
            },
          }),
        ]);

        await addDoc(collection(db, "notification"), {
          user: "user1",
          title: "Cannibalization Request Verified",
          body: "A new request has been verified. Please review it.",
          path,
          createdAt: serverTimestamp(),
        });
        console.log(notificationId);

        const notificationRef = doc(db, "notification2", notificationId);
        await deleteDoc(notificationRef);

        router.push("/User1/(tabs)/");
      }
    } catch (error) {
      console.error("Error verifying notification:", error);
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
      <View style={styles.reportContainer}>
        <Text style={styles.header}>Block A :Cannibalization Request</Text>
        {notificationA ? (
          <>
            <Text style={styles.detailText}>Nemonclature:</Text>
            <Text style={styles.text}>{notificationA.nemonclature}</Text>
            <Text style={styles.detailText}>Part No:</Text>
            <Text style={styles.text}>{notificationA.partNo}</Text>
            <Text style={styles.detailText}>
              Recipient Aircraft Registration:
            </Text>
            <Text style={styles.text}>{notificationA.recipientReg}</Text>
            <Text style={styles.detailText}>Recipient Station:</Text>
            <Text style={styles.text}>{notificationA.recipientStation}</Text>
            <Text style={styles.detailText}>
              Proof OF NIL-IN-STOCK (Voucher No):
            </Text>
            <Text style={styles.text}>{notificationA.voucherNo}</Text>
            <Text style={styles.detailText}>
              Reason(s) for Cannibalization:
            </Text>
            <Text style={styles.text}>{notificationA.reason}</Text>
            <Text style={styles.detailText}>ATLB Ref No with Date:</Text>
            <Text style={styles.text}>{notificationA.ATLB}</Text>
            <Text style={styles.Verified}>{notificationA.userName}</Text>
            <View style={styles.line} />
            <Text style={styles.incharge}>
              Shift Incharge/ Certifying staff
            </Text>
            <Text style={styles.detailText}>Requested At:</Text>
            <Text style={styles.text}>
              {new Date(
                notificationA.createdAt.seconds * 1000
              ).toLocaleString()}
            </Text>
          </>
        ) : (
          <Text style={styles.noData}>No Block A data available</Text>
        )}

        <Text style={styles.header}>Block B:Cannibalization Permission</Text>
        {notificationB ? (
          <>
            <Text style={styles.detailText}>Donor Aircraft Registration:</Text>
            <Text style={styles.text}>{notificationB.donorReg}</Text>
            <Text style={styles.detailText}>Preserved:</Text>
            <Text style={styles.text}>
              {notificationB.preserved ? "Yes" : "No"}
            </Text>
            <Text style={styles.detailText}>C of A Valid:</Text>
            <Text style={styles.text}>
              {notificationB.cOfAValid ? "Yes" : "No"}
            </Text>
            <Text style={styles.detailText}>Remarks:</Text>
            <Text style={styles.text}>{notificationB.remarks}</Text>
            <Text style={styles.detailText}>Approval Ref No:</Text>
            <Text style={styles.text}>{notificationB.approvalRef}</Text>
            <Text style={styles.Verified}>{notificationB.status}</Text>
            <View style={styles.line} />
            <Text style={styles.incharge}>DCE(Situation Room)/EMOD</Text>
            <Text style={styles.detailText}>Responded At:</Text>
            <Text style={styles.text}>
              {new Date(
                notificationA.createdAt.seconds * 1000
              ).toLocaleString()}
            </Text>
            <Text style={styles.Verified}>{notificationB.EndorsedByDCE}</Text>
            <View style={styles.line} />
            <Text style={styles.incharge}>
              Endrosed By DCE Rotable Planning
            </Text>
          </>
        ) : (
          <Text style={styles.noData}>No Block B data available</Text>
        )}
        <Button onClick={handleSubmit(OnClickVerify)}>
          Verify Notification
        </Button>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,

    backgroundColor: "#f8f8f8",
    marginBottom: 1,
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
    margin: 2,
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
  Verified: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  incharge: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#034c2e",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
  },
});

export default NotificationDetail;
