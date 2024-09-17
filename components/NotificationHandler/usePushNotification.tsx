import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";
import Constants from "expo-constants";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Adjust your Firebase path

export interface PushNotification {
  notification?: Notifications.Notification;
  expoPushToken?: string;
}

export const usePushNotification = (
  userId: string,
  logToken = true
): PushNotification => {
  const channelId = `channel_${userId}`;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: true,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Save the push token to Firestore
  const savePushTokenToFirestore = async (token: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { expoPushToken: token }, { merge: true });
      console.log("Expo Push Token saved to Firestore for user:", userId);
    } catch (error) {
      console.error("Error saving push token to Firestore:", error);
    }
  };

  // Register for push notifications
  async function registerForPushNotificationAsync() {
    let token;

    // Check if the device is a physical device
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If permission is not granted, show an alert
      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for push notifications!");
        return;
      }

      // Get the Expo Push Token
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.projectId,
        })
      ).data;

      if (logToken && token) {
        console.log("Expo Push Token:", token);
      }

      // Set notification channel for Android with a unique user-specific channel ID
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(channelId, {
          name: `Notification Channel for User ${userId}`,
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // Save the push token to Firestore
      if (token) {
        savePushTokenToFirestore(token);
      }
    } else {
      console.log("ERROR: Must use a physical device for push notifications");
    }

    return token;
  }

  useEffect(() => {
    // Register for push notifications and set the token state
    registerForPushNotificationAsync().then((token) => setExpoPushToken(token));

    // Listener for receiving notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Listener for notification response (when a user taps on a notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // Clean up listeners on component unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
