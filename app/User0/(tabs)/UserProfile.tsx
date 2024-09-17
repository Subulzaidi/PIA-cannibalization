import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Button as RNButton,
  Platform,
} from "react-native";
import { auth, db } from "@/firebaseConfig"; // Adjust import path as needed
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import Button from "@/components/button";

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [editableImage, setEditableImage] = useState("");
  const [editableProfession, setEditableProfession] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    const fetchUserData = async () => {
      if (currentUser) {
        const email = currentUser.email || "No user";
        setEmail(email);

        try {
          const userRef = doc(db, "user0", email); // Adjust collection name if needed
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            setEditableName(userData.name || ""); 
            setEditableProfession(userData.profession || "");
            setImageUri(userData.image || ""); 
          } else {
            console.log("No such document!");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setUser(null);
      }
    };

    fetchUserData();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/SignIn");
      Alert.alert("Logged Out", "You have been logged out successfully.");
    } catch (error) {
      console.error("Error logging out: ", error);
      Alert.alert("Logout Error", "An error occurred while logging out.");
    }
  };

  const handleSaveChanges = async () => {
    try {
      const userRef = doc(db, "user0", email);
      await updateDoc(userRef, {
        name: editableName,
        profession: editableProfession,
        image: editableImage,
      });
      setUser({
        ...user,
        name: editableName,
        profession: editableProfession,
        image: editableImage,
      });
      setModalVisible(false);
      Alert.alert("Profile Updated", "Your profile has been updated.");
    } catch (error) {
      console.error("Error updating user data: ", error);
      Alert.alert(
        "Update Error",
        "An error occurred while updating your profile."
      );
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Ensure you handle the result correctly
        if (result.assets && result.assets.length > 0) {
          const selectedAsset = result.assets[0];
          setImageUri(selectedAsset.uri);
          setEditableImage(selectedAsset.uri);
        }
      }
    } else {
      Alert.alert(
        "Permission Denied",
        "You need to grant media library permissions to change the profile image."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#034c2e" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No user data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{user.name || "N/A"}</Text>
      <View style={styles.profileContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} />
        ) : (
          <Image
            source={require("@/assets/images/defaultUserIcon.png")} // Add a default user icon in assets
            style={styles.photo}
          />
        )}

        <Text style={styles.detail}>
          <Text style={styles.label}>Role: </Text>
          {user.role}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Email: </Text>
          {email}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Profession: </Text>
          {user.profession || "N/A"}
        </Text>
      </View>
      <View style={styles.profileContainer2}>
        <Button type="primary" onClick={openModal}>
          Edit Profile
        </Button>

        <Button type="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editableName}
              onChangeText={setEditableName}
            />

            <TextInput
              style={styles.input}
              placeholder="Profession"
              value={editableProfession}
              onChangeText={setEditableProfession}
            />

            <Button type="primary" onClick={handleImagePicker}>
              Change Image
            </Button>

            <Button type="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>

            <Button type="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontStyle: "italic",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#034c2e",
  },
  profileContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderColor: "#2c3e50",
    borderWidth: 2,
  },
  detail: {
    fontSize: 18,
    color: "#34495e",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    color: "#034c2e",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  profileContainer2: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 50,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});

export default UserProfile;
