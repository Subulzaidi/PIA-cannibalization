import { StyleSheet, Animated, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { router } from "expo-router";

const InitialScreen = ({ navigation }: { navigation: any }) => {
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Start the animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.push("/SignIn");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, opacityAnim]);

  // Animated styles
  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[styles.stretch, animatedStyle]}
        source={require("../assets/images/pia_logo.png")}
      />
    </View>
  );
};

export default InitialScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff5ec",
  },

  stretch: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
});
