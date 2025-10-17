import React from "react";
import { Stack } from "expo-router";
import NewAlarmScreen from "@/components/NewAlarmScreen";

export default function NewAlarmPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Nuova sveglia" }} />
      <NewAlarmScreen />
    </>
  );
}
