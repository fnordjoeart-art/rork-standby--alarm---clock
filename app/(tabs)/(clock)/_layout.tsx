import React from "react";
import { Stack } from "expo-router";

export default function ClockStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTitle: "StandBy+" }}>
      <Stack.Screen name="index" options={{ title: "Clock" }} />
      <Stack.Screen name="details" options={{ title: "Details" }} />
    </Stack>
  );
}
