import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AppGradientProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GRADIENT_COLORS = ["#FF9A6B", "#FF3F9E", "#F7B0C8", "#E7C2E8"] as const;

export function AppGradient({ children, style }: AppGradientProps) {
  return (
    <LinearGradient
      colors={[...GRADIENT_COLORS]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.gradient, style]}
    >
      <View style={styles.comfortOverlay} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  comfortOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
