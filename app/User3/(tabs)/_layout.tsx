import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#b59906",
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff" }, // Optional: customize tab bar background color
        tabBarLabelStyle: { fontSize: 12 }, // Optional: customize tab label style
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Report"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="files-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="UserProfile"
        options={{
          title: "User",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
