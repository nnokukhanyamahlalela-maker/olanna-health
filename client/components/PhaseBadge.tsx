import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { CyclePhase, PHASE_INFO, PHASE_COLORS, PHASE_GRADIENTS } from "@/components/Lotus";
import { Spacing } from "@/constants/theme";

interface PhaseBadgeProps {
  phase: CyclePhase;
  size?: "small" | "medium" | "large";
}

const POETIC_NAMES: Record<CyclePhase, string> = {
  menstrual: "Rest & Release",
  follicular: "Rising Energy",
  ovulation: "Full Radiance",
  luteal: "Inner Reflection",
};

export function PhaseBadge({ phase, size = "medium" }: PhaseBadgeProps) {
  const phaseColor = PHASE_COLORS[phase];
  const gradientColors = PHASE_GRADIENTS[phase];
  const poeticName = POETIC_NAMES[phase];

  const sizeStyles = {
    small: { paddingVertical: 4, paddingHorizontal: 12, fontSize: 10 },
    medium: { paddingVertical: 6, paddingHorizontal: 16, fontSize: 12 },
    large: { paddingVertical: 8, paddingHorizontal: 20, fontSize: 14 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.text,
            { fontSize: currentSize.fontSize },
          ]}
        >
          {poeticName}
        </ThemedText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },
  badge: {
    borderRadius: 20,
  },
  text: {
    fontFamily: "DMSans_500Medium",
    color: "#3A2F35",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
