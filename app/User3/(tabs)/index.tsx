import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { db } from "@/firebaseConfig";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";
import { RootStackParamList } from "@/types/types";
import { v4 as uuidv4 } from "uuid";
import { usePushNotification } from "@/components/NotificationHandler/usePushNotification";

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const User3Dashboard = () => {
  const [notifications, setNotifications] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { expoPushToken } = usePushNotification("user3", true);
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const [id, setId] = useState("");

  useEffect(() => {
    if (expoPushToken) {
      console.log("Expo Push Token:", expoPushToken);
    }

    const unsubscribe = onSnapshot(
      collection(db, "notification3"),
      (snapshot) => {
        const notificationsList: DocumentData[] = [];
        snapshot.docs.forEach((doc) => {
          notificationsList.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(notificationsList);
        console.log(notificationsList);

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [expoPushToken]);

  const handleNotificationPress = (notification: DocumentData) => {
    navigation.navigate("NotificationDetail", {
      notificationId: notification.id,
      path: notification.path,
      N_id: id,
    });
  };

  const renderNotification = ({ item }: { item: DocumentData }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationBody}>{item.body}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#034c2e" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back</Text>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications available</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
    textAlign: "center",
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  notificationBody: {
    fontSize: 16,
    color: "#555",
  },
  noNotifications: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});

export default User3Dashboard;
