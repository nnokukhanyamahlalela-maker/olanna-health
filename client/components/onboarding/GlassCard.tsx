import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { BRAND_COLORS } from "@/constants/onboardingTokens";
import { BorderRadius, Spacing } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function OnboardingGlassCard({ children, style, intensity = 20 }: GlassCardProps) {
  if (Platform.OS === "ios") {
    return (
      <BlurView 
        intensity={intensity} 
        tint="light"
        style={[styles.blurCard, style]}
      >
        <View style={styles.innerContent}>
          {children}
        </View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.fallbackCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blurCard: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BRAND_COLORS.glassBorder,
  },
  innerContent: {
    padding: Spacing.xl,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  fallbackCard: {
    backgroundColor: BRAND_COLORS.glassWhite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: BRAND_COLORS.glassBorder,
  },
});
