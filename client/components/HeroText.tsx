import React from "react";
import { Text, StyleSheet, TextStyle, StyleProp, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// QA: Small screen responsiveness - adapt font sizes for devices < 380px width
const isSmallScreen = SCREEN_WIDTH < 380;

interface HeroTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  size?: "large" | "medium" | "small";
}

export function HeroText({ children, style, size = "large" }: HeroTextProps) {
  const sizeStyle = size === "large" 
    ? (isSmallScreen ? styles.largeSmallScreen : styles.large)
    : size === "medium" 
    ? (isSmallScreen ? styles.mediumSmallScreen : styles.medium)
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
  largeSmallScreen: {
    fontSize: 36,
    lineHeight: 44,
  },
  medium: {
    fontSize: 28,
    lineHeight: 36,
  },
  mediumSmallScreen: {
    fontSize: 24,
    lineHeight: 32,
  },
  small: {
    fontSize: 20,
    lineHeight: 28,
  },
});
