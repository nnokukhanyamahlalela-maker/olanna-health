import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/components/ThemeProvider";

interface AppGradientProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppGradient({ children, style }: AppGradientProps) {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[...theme.gradientStops]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.gradient, style]}
    >
      <View style={[styles.comfortOverlay, { backgroundColor: theme.gradientOverlay as string }]} />
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
  },
});
