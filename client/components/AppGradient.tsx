/**
 * AppGradient — Gen Z rebrand
 * No gradients anywhere; renders a flat lavender background (#EEEDFE).
 * Kept as a wrapper component so existing call-sites need no change.
 */
import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

interface AppGradientProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppGradient({ children, style }: AppGradientProps) {
  return (
    <View style={[styles.bg, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#EEEDFE",
  },
});
