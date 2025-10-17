import { Tabs } from "expo-router";
import { Clock, Settings } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0A0A0A" },
        tabBarActiveTintColor: "#FF2E91",
        tabBarInactiveTintColor: "#888888",
      }}
    >
      <Tabs.Screen
        name="(clock)"
        options={{
          title: "Clock",
          tabBarIcon: ({ color }) => <Clock color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  );
}
