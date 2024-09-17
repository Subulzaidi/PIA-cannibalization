import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCm-i7wilFlbpCQ1Apaj-cSqPwiYGcfDiE",
  authDomain: "pia-application-e7674.firebaseapp.com",
  projectId: "pia-application-e7674",
  storageBucket: "pia-application-e7674.appspot.com",
  messagingSenderId: "814009539294",
  appId: "1:814009539294:android:d897b29d878583d5ee404f",
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication with AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
// export const auth = getAuth(app);
