import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { db, auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth"; // Correct import
import Button from "@/components/button";
import { FirebaseError } from "firebase/app";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const role = await determineUserRole(user.email || "");
      console.log(role);
      setLoading(false);
      switch (role) {
        case "user0":
          router.push("/User0");
          break;
        case "user1":
          router.push("/User1");
          break;
        case "user2":
          router.push("/User2");
          break;
        case "user3":
          router.push("/User3");
          break;
        case "user4":
          router.push("/User4");
          break;
        default:
          Alert.alert("Login Failed", "User role not recognized.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error signing in:", error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-email":
            Alert.alert(
              "Login Failed",
              "The email address is badly formatted."
            );
            break;
          case "auth/user-not-found":
            Alert.alert(
              "Login Failed",
              "No user corresponding to the given email."
            );
            break;
          case "auth/wrong-password":
            Alert.alert("Login Failed", "The password is invalid.");
            break;
          default:
            Alert.alert("Login Failed", "An error occurred while signing in.");
        }
      } else {
        Alert.alert("Login Failed", "An unexpected error occurred.");
      }
    }
  };
  const savePushTokenToFirestore = async (token: string, role: string) => {
    try {
      const userRef = doc(db, `users/${role}`, email);

      await setDoc(
        userRef,
        { expoPushToken: arrayUnion(token) },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving push token to Firestore:", error);
    }
  };

  const determineUserRole = async (email: string) => {
    const roles = [
      "user0",
      "user1",
      "user2",
      "user3",
      "user4",
      "user5",
      "user6",
    ];

    for (const role of roles) {
      const userDoc = await getDoc(doc(db, `/${role}`, email));

      if (userDoc.exists()) {
        return role;
      }
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.stretch}
          source={require("@/assets/images/PIA_homeScreen.png")}
        />
      </View>

      <View style={styles.signInContainer}>
        <Text style={styles.header}>Log In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="large" color="#b59906" />
        ) : (
          <Button onClick={handleLogin}>Log In</Button>
        )}
      </View>

      <Text>If you don't have an account,</Text>
      <TouchableOpacity onPress={() => router.push("/SignUp")}>
        <Text style={styles.signUpText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
  },
  signInContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#034c2e",
  },
  stretch: {
    width: 180,
    height: 120,
    resizeMode: "contain",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpText: {
    color: "#034c2e",
    textAlign: "center",
  },
});

export default SignIn;
