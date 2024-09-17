import { Text, StyleSheet, Image, View, ImageBackground } from "react-native";
import React from "react";
import Button from "@/components/button";
import { router } from "expo-router";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.stretch}
          source={require("@/assets/images/PIA_homeScreen.png")}
        />
      </View>
      <ImageBackground
        source={require("@/assets/images/cannibal.webp")}
        resizeMode="cover"
        style={styles.contentContainerA}
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>Cannibalization Form</Text>
          <Button
            type="primary"
            onClick={() => {
              router.push("/User0/CannibalizationForm");
            }}
          >
            Cannibalization
          </Button>
        </View>
      </ImageBackground>
      <ImageBackground
        source={require("@/assets/images/serial_num.jpeg")}
        resizeMode="cover"
        style={styles.contentContainerB}
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>Serial Number Tracibility Form</Text>
          <Button
            type="primary"
            onClick={() => {
              // router.push("/SerialNumberForm");
            }}
          >
            Serial Number
          </Button>
        </View>
      </ImageBackground>
    
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    alignItems: "center",
    paddingTop: 15,
  },
  stretch: {
    width: 180,
    height: 120,
    resizeMode: "contain",
  },
  contentContainerA: {
    flex: 1,
    width: 320,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 120,
    borderRadius: 25,
    overflow: "hidden",
  },
  contentContainerB: {
    flex: 1,
    width: 320,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 25,
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
  },
  text: {
    fontSize: 20,
    color: "#fff",
    margin: 10,
  },
});
