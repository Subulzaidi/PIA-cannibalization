import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import { db, auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Button from "@/components/button";
import { usePushNotification } from "@/components/NotificationHandler/usePushNotification";

const SignUp = () => {
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [role, setRole] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [token, setToken] = useState("");
  const [modalVisible, setModalVisible] = useState(true);

  const handleUserSelection = (selectedRole: number) => {
    setRole(selectedRole);
    setModalVisible(false);
  };
  const { expoPushToken } = usePushNotification(`user${role}`, true);
  useEffect(() => {
    if (expoPushToken) {
      setToken(expoPushToken);
    }
  }, [expoPushToken]);
  const handleSignUp = async () => {
    if (
      !name ||
      !profession ||
      role === null ||
      !email ||
      !password ||
      !token
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      // Create a new user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save additional user information in Firestore
      await setDoc(doc(db, `user${role}`, email), {
        name,
        profession,
        role,
        email,
        image,
        token, // Store the Expo Push Token here
        user: `user${role}`,
      });

      Alert.alert("Success", "Account created successfully.");
      router.push("/SignIn"); // Navigate back to the SignIn screen
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Error", "An error occurred while creating your account.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal for user selection */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select User Role</Text>
            {[...Array(7).keys()].map((i) => (
              <Button key={i} onClick={() => handleUserSelection(i)}>
                {`User${i}`}
              </Button>
            ))}
          </View>
        </View>
      </Modal>

      <View style={styles.logoContainer}>
        <Image
          style={styles.stretch}
          source={require("@/assets/images/PIA_homeScreen.png")}
        />
      </View>

      <View style={styles.signUpContainer}>
        <Text style={styles.header}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Profession"
          value={profession}
          onChangeText={setProfession}
        />
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
        <Button onClick={handleSignUp}>Create Account</Button>
      </View>
      <Text>Already have an account?</Text>
      <TouchableOpacity onPress={() => router.push("/SignIn")}>
        <Text style={styles.signInText}> Sign in</Text>
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
  signUpContainer: {
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
  signInText: {
    color: "#034c2e",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default SignUp;
