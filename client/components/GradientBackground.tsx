import React from "react";
import { StyleSheet, ViewStyle, ImageBackground, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const BRAND_COLORS = {
  sunsetOrange: "#F7A37A",
  hotPink: "#E85A9C",
  softPink: "#D070A0",
  lightBlush: "#FDF1F6",
  white: "#FFFFFF",
  text: "#2D2A32",
  textSecondary: "#7A7580",
  glassWhite: "rgba(255, 255, 255, 0.25)",
  glassBorder: "rgba(255, 255, 255, 0.4)",
};

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: "sunset" | "soft" | "card" | "glass";
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
          BRAND_COLORS.softPink,
        ] as const;
      case "soft":
        return [
          BRAND_COLORS.lightBlush,
          "#FFE5F0",
          "#F8D4E8",
        ] as const;
      case "card":
        return [
          BRAND_COLORS.sunsetOrange + "90",
          BRAND_COLORS.hotPink + "80",
          BRAND_COLORS.softPink + "70",
        ] as const;
      case "glass":
        return [
          "rgba(255, 255, 255, 0.3)",
          "rgba(255, 255, 255, 0.15)",
          "rgba(255, 255, 255, 0.1)",
        ] as const;
      default:
        return [
          BRAND_COLORS.sunsetOrange,
          BRAND_COLORS.hotPink,
          BRAND_COLORS.softPink,
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

interface GlassCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.glassCard, style]}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.35)", "rgba(255, 255, 255, 0.15)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassGradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  glassCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  glassGradient: {
    padding: 20,
  },
});
