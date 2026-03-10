// src/screens/CalendarScreen.tsx

import React from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { Calendar } from "react-native-calendars";
import { useCalendarCycle } from "../hooks/useCalendarCycle";

export default function CalendarScreen() {
  const { loading, markedDates } = useCalendarCycle();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Calendar markedDates={markedDates} />
    </SafeAreaView>
  );
}
