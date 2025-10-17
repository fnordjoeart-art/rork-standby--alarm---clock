import React from "react";
import { Stack } from "expo-router";

export default function SettingsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTitle: "Settings" }}>
      <Stack.Screen name="index" options={{ title: "Appearance" }} />
    </Stack>
  );
}
