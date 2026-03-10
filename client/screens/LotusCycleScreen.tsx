// src/screens/LotusCycleScreen.tsx

import React from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { useLotusCycle } from "../hooks/useLotusCycle";

export default function LotusCycleScreen() {
  const { loading, prediction } = useLotusCycle();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!prediction) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No cycle data available yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 20 }}>
        Lotus Cycle
      </Text>

      <View
        style={{
          padding: 20,
          borderRadius: 20,
          backgroundColor: "#F8EEF6",
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          Current Cycle Day: {prediction.currentCycleDay}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 8 }}>
          Current Phase: {prediction.currentPhase}
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          Ovulation Date: {prediction.ovulationDate}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Next Period: {prediction.nextPeriodStartDate}
        </Text>
      </View>
    </SafeAreaView>
  );
}
