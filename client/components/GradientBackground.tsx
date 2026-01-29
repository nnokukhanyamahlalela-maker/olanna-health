import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const BRAND_COLORS = {
  hotPink: "#FF4FB8",
  sunsetOrange: "#F7A37A",
  softLavender: "#C9B8E8",
  lightBlush: "#FDF1F6",
  white: "#FFFFFF",
  text: "#2D2A32",
  textSecondary: "#7A7580",
};

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: "sunset" | "soft" | "card";
}

export function GradientBackground({ 
  children, 
  style,
  variant = "sunset" 
}: GradientBackgroundProps) {
  const getColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case "sunset":
        return [
          BRAND_COLORS.sunsetOrange,
          BRAND_COLORS.hotPink,
          BRAND_COLORS.softLavender,
        ] as const;
      case "soft":
        return [
          BRAND_COLORS.lightBlush,
          "#FFE5F0",
          BRAND_COLORS.softLavender + "40",
        ] as const;
      case "card":
        return [
          BRAND_COLORS.hotPink + "90",
          BRAND_COLORS.sunsetOrange + "80",
          BRAND_COLORS.softLavender + "70",
        ] as const;
      default:
        return [
          BRAND_COLORS.sunsetOrange,
          BRAND_COLORS.hotPink,
          BRAND_COLORS.softLavender,
        ] as const;
    }
  };

  return (
    <LinearGradient
      colors={getColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
