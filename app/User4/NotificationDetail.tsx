import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { RootStackParamList } from "@/types/types";
import Button from "@/components/button";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useForm, Controller } from "react-hook-form";

type NotificationDetailRouteProp = RouteProp<
  RootStackParamList,
  "NotificationDetail"
>;

const NotificationDetail = () => {
  const route = useRoute<NotificationDetailRouteProp>();
  const { notificationId, path } = route.params;

  const [notificationA, setNotificationA] = useState<any>(null);
  const [notificationB, setNotificationB] = useState<any>(null);
  const [notificationC, setNotificationC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verify, setVerify] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [initiatorToken, setInitiatorToken] = useState<string>("");

  const { control, handleSubmit } = useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      const email = currentUser?.email || "No user";
      setEmail(email);
      if (currentUser) {
        try {
          setLoading(true);
          const userRef = doc(db, "user4", email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserName(userDoc.data()?.name || "Unknown User");
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
        }

        const docRefB = doc(db, path, "Block B");
        const docSnapB = await getDoc(docRefB);
        if (docSnapB.exists()) {
          setNotificationB(docSnapB.data());
        }

        const docRefC = doc(db, path, "Block C");
        const docSnapC = await getDoc(docRefC);
        if (docSnapC.exists()) {
          setNotificationC(docSnapC.data());
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

  const OnClickVerify = async (data: any) => {
    try {
      setVerify(true);
      generateReport();

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
      }
    } catch (error) {}
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
        "Cannibalization Post Permission Action Request sent!"
      );
      router.push("/User4/(tabs)/");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const generateReport = () => {
    if (!notificationA || !notificationB || !notificationC) {
      Alert.alert(
        "Incomplete Data",
        "Cannot generate report without all data."
      );
      return;
    }

    const reportContent = `
      Cannibalization Request Report\n
      Block A:
      - Nemonclature: ${notificationA.nemonclature}
      - Part No: ${notificationA.partNo}
      - Recipient Reg: ${notificationA.recipientReg}
      - Recipient Station: ${notificationA.recipientStation}
      - Reason: ${notificationA.reason}
      - ATLB Ref: ${notificationA.ATLB}
      - Requested At: ${new Date(notificationA.createdAt.seconds * 1000).toLocaleString() || ""}

      Block B:
      - Donor Reg: ${notificationB.donorReg}
      - Preserved: ${notificationB.preserved ? "Yes" : "No"}
      - C of A Valid: ${notificationB.cOfAValid ? "Yes" : "No"}
      - Remarks: ${notificationB.remarks}
      - Approval Ref: ${notificationB.approvalRef}
      - Approved By: ${notificationB.ApprovedByChiefMOC}
      - Responded At: ${new Date(notificationB.createdAt.seconds * 1000).toLocaleString() || ""}

      Block C:
      Donor Section:
      - Defects: ${notificationC.defects ? "Yes" : "No"}
      - Serviceability: ${notificationC.serviceability ? "Yes" : "No"}
      - ATLB Ref No: ${notificationC.atlbRefNoD}

      Recipient Section:
      - Off Part No: ${notificationC.offPartNo}
      - On Part No: ${notificationC.onPartNo}
      - Off Serial No: ${notificationC.offSerialNo}
      - On Serial No: ${notificationC.onSerialNo}
      - Off Location: ${notificationC.offLocation}
      - On Location: ${notificationC.onLocation}
      - IPC Ref: ${notificationC.ipcRef}
      - Maintenance History: ${notificationC.maintenanceHistory ? "Yes" : "No"}
      - Remarks: ${notificationC.remarks}
      -DCE RP OFFICER:${userName} 
    `;

    saveReport(reportContent);
  };

  const saveReport = async (content: string) => {
    const fileUri =
      FileSystem.documentDirectory +
      `cannibalization_report_${notificationId}.txt`;
    try {
      // Save report locally
      await FileSystem.writeAsStringAsync(fileUri, content);
      Alert.alert(
        "Report Generated",
        "The report has been generated successfully."
      );
      shareReport(fileUri);

      await saveReportToFirestore(content, notificationId);
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  const saveReportToFirestore = async (
    content: string,
    notificationId: string
  ) => {
    const reportDocRef = doc(db, `reports/${notificationId}`);
    try {
      await setDoc(reportDocRef, { content, createdAt: new Date() });
      console.log("Report saved to Firestore successfully");
    } catch (error) {
      console.error("Error saving report to Firestore:", error);
    }
  };

  const shareReport = async (fileUri: string) => {
    try {
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing report:", error);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#034c2e" style={styles.loader} />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Notification Details</Text>
        <View style={styles.notification}>
          <Text style={styles.label}>Notification ID:</Text>
          <Text style={styles.value}>{notificationId}</Text>
        </View>
        <View style={styles.notification}>
          <Text style={styles.label}>Block A Details:</Text>
          <Text style={styles.value}>
            {notificationA ? JSON.stringify(notificationA) : "No data"}
          </Text>
        </View>
        <View style={styles.notification}>
          <Text style={styles.label}>Block B Details:</Text>
          <Text style={styles.value}>
            {notificationB ? JSON.stringify(notificationB) : "No data"}
          </Text>
        </View>
        <View style={styles.notification}>
          <Text style={styles.label}>Block C Details:</Text>
          <Text style={styles.value}>
            {notificationC ? JSON.stringify(notificationC) : "No data"}
          </Text>
        </View>
        <Button onClick={handleSubmit(OnClickVerify)}>Verify</Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  wrapper: {
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notification: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});

export default NotificationDetail;
