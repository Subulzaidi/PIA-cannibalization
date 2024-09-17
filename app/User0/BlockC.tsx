import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import React, { PropsWithChildren } from "react";
import CheckBox from "expo-checkbox";
import Button from "@/components/button";
import { db } from "@/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { router } from "expo-router";

type Prop = PropsWithChildren<{
  path: string;
  userName: string;
}>;

const BlockC: React.FC<Prop> = ({ path, userName }) => {
  const [donorAction, setDonorAction] = React.useState({
    defects: false,
    serviceability: false,
    inspected: false,
    atlbRefNoD: "",
    remarks: "",
  });
  const [clicked, setClicked] = React.useState(true);
  const [status, setStatus] = React.useState(userName);

  const [recipientAction, setRecipientAction] = React.useState({
    offPartNo: "",
    offSerialNo: "",
    onPartNo: "",
    onSerialNo: "",
    offLocation: "",
    onLocation: "",
    otherDetail: "",
    ipcRef: "",
    inspected: false,
    maintenanceHistory: false,
    status: userName,
    atlbRefNoR: "",
    remarks: "",
  });

  const handleSubmit = async () => {
    try {
      const data = {
        ...donorAction,
        ...recipientAction,
        createdAt: serverTimestamp(),
      };

      const customId = "Block C";
      const docRef = doc(db, path, customId);
      await setDoc(docRef, data);

      console.log("Document written with ID: ", docRef.id);
      setClicked(false);

      // Fetch the token and send notification
      const user4Ref = doc(db, "users", "user4");
      const user4Doc = await getDoc(user4Ref);
      const user4Token = user4Doc.exists()
        ? user4Doc.data().expoPushToken
        : null;

      if (user4Token) {
        await sendNotification(user4Token);
      }

      await addDoc(collection(db, "notification4"), {
        user: "user1",
        title: "Cannibalization Request Verified",
        body: "A new request has been verified. Please review it.",
        path,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        user: "user1",
        title: "Cannibalization Request Verified",
        body: "A new request has been verified. Please review it.",
        path,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Notification Sent!", "Sent To DCE RP Office");
      router.push("/User0/(tabs)/HomeScreen");
    } catch (e) {
      console.error("Error adding document: ", e);
      setStatus("Error");
    }
  };

  const sendNotification = async (token: string) => {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          sound: "default",
          title: "Post-Permission Action Request Verification",
          body: "A new request has been verified. Please review it.",
          data: { path },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Notification sent successfully:", responseData);
      Alert.alert("Notification sent!", "Post-Permission Action Request!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const saveNotificationToFirestore = async (notification: {
    userToken: string;
    message: string;
    status: string;
  }) => {
    try {
      const notificationRef = doc(
        db,
        "notifications",
        new Date().toISOString()
      );
      await setDoc(notificationRef, notification);
      console.log("Notification saved to Firestore");
    } catch (error) {
      console.error("Error saving notification to Firestore:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Block C: Post-Permission Action</Text>

      {/* Donor Section Action */}
      <Text style={styles.text}>Donor Section Action</Text>
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={donorAction.defects}
          style={styles.checkbox}
          onValueChange={(value) =>
            setDonorAction({ ...donorAction, defects: value })
          }
        />
        <Text style={styles.label}>
          Last flight operation with the provided component revealed no faults
          including C/F defects
        </Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          value={donorAction.serviceability}
          onValueChange={(value) =>
            setDonorAction({ ...donorAction, serviceability: value })
          }
        />
        <Text style={styles.label}>
          There has been no unusual event that could affect the aircraft
          component's serviceability
        </Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          value={donorAction.inspected}
          onValueChange={(value) =>
            setDonorAction({ ...donorAction, inspected: value })
          }
        />
        <Text style={styles.label}>
          Component has been inspected for satisfactory condition, specifically
          for damage, corrosion, or leakage, and Serviceable tag has been issued
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="ATLB/Ref No. with Date"
        value={donorAction.atlbRefNoD}
        onChangeText={(value) =>
          setDonorAction({ ...donorAction, atlbRefNoD: value })
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Remarks (if any)"
        value={donorAction.remarks}
        onChangeText={(value) =>
          setDonorAction({ ...donorAction, remarks: value })
        }
      />

      <Text style={styles.status}>{status}</Text>
      <View style={styles.line} />
      <Text style={styles.signatureText}>Certifying Staff/Shift Incharge</Text>

      {/* Recipient Section Action */}
      <Text style={styles.text}>Recipient Section Action</Text>
      <TextInput
        style={styles.input}
        placeholder="Part Number OFF"
        value={recipientAction.offPartNo}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, offPartNo: value })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Serial Number OFF"
        value={recipientAction.offSerialNo}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, offSerialNo: value })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Part/Component Location (NHA) OFF"
        value={recipientAction.offLocation}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, offLocation: value })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Part Number ON"
        value={recipientAction.onPartNo}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, onPartNo: value })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Serial Number ON"
        value={recipientAction.onSerialNo}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, onSerialNo: value })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Part/Component Location (NHA) ON"
        value={recipientAction.onLocation}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, onLocation: value })
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Other Details (if any)"
        value={recipientAction.otherDetail}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, otherDetail: value })
        }
      />
      <Text style={styles.label}>
        Confirmation with applicable Part Number(s) as per effective IPC
      </Text>
      <TextInput
        style={styles.input}
        placeholder="IPC Reference / Revision / Date"
        value={recipientAction.ipcRef}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, ipcRef: value })
        }
      />
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          value={recipientAction.inspected}
          onValueChange={(value) =>
            setRecipientAction({ ...recipientAction, inspected: value })
          }
        />
        <Text style={styles.label}>
          Maintenance history record including ( flight hours/cycles/landings as
          applicable of any service life-limited parts ) are available in PIACL
          IT System
        </Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={recipientAction.maintenanceHistory}
          style={styles.checkbox}
          onValueChange={(value) =>
            setRecipientAction({
              ...recipientAction,
              maintenanceHistory: value,
            })
          }
        />
        <Text style={styles.label}>
          Component has been inspected for satisfactory condition, specifically
          for damage, corrosion, or leakage, and Serviceable tag has been issued
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="ATLB/Ref No. with Date"
        value={recipientAction.atlbRefNoR}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, atlbRefNoR: value })
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Remarks (if any)"
        value={recipientAction.remarks}
        onChangeText={(value) =>
          setRecipientAction({ ...recipientAction, remarks: value })
        }
      />

      <Text style={styles.status}>{status}</Text>
      <View style={styles.line} />
      <Text style={styles.signatureText}>Recipient Staff/Shift Incharge</Text>
      <Button onClick={handleSubmit}>Submit</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkbox: {
    margin: 8,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginTop: 8,
  },
  status: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 16,
  },
  signatureText: {
    fontSize: 14,

    textAlign: "center",
  },
});

export default BlockC;
