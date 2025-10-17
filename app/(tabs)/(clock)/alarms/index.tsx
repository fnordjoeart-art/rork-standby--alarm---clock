import React from "react";
import { Stack } from "expo-router";
import AlarmList from "@/components/AlarmList";

export default function AlarmsPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Sveglie" }} />
      <AlarmList />
    </>
  );
}
