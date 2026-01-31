import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { ThemedText } from "./ThemedText";
import { CyclePhase } from "@/components/Lotus";

interface PhaseGuidanceCardProps {
  phase: CyclePhase;
  title: string;
  body: string;
}

export function PhaseGuidanceCard({ phase, title, body }: PhaseGuidanceCardProps) {
  const CardContent = (
    <View style={styles.content}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.body}>{body}</ThemedText>
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, styles.webFallback]}>
        {CardContent}
      </View>
    );
  }

  return (
    <BlurView intensity={40} tint="light" style={styles.container}>
      {CardContent}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  webFallback: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  content: {
    padding: 20,
  },
  title: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },
});
