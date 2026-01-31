import React from "react";
import { Text, StyleSheet, TextStyle, StyleProp } from "react-native";

interface HeroTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  size?: "large" | "medium" | "small";
}

export function HeroText({ children, style, size = "large" }: HeroTextProps) {
  const sizeStyle = size === "large" 
    ? styles.large 
    : size === "medium" 
    ? styles.medium 
    : styles.small;

  return (
    <Text style={[styles.base, sizeStyle, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.22)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  large: {
    fontSize: 44,
    lineHeight: 52,
  },
  medium: {
    fontSize: 28,
    lineHeight: 36,
  },
  small: {
    fontSize: 20,
    lineHeight: 28,
  },
});
