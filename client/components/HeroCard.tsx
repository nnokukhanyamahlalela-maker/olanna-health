import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, PhaseColors } from "@/constants/theme";
import { CyclePhase, PHASE_GRADIENTS } from "@/components/Lotus";

interface HeroCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  phase?: CyclePhase;
  showGradient?: boolean;
}

const PINK_PRIMARY = "#F6BFD3";
const PINK_SOFT = "#FBE3EC";

export function HeroCard({ children, style, phase, showGradient = true }: HeroCardProps) {
  const { theme } = useTheme();

  const gradientColors = phase 
    ? PHASE_GRADIENTS[phase] 
    : [PINK_SOFT, PINK_PRIMARY];

  if (showGradient) {
    return (
      <View style={[styles.cardWrapper, style]}>
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.card, 
        styles.cardWrapper,
        { backgroundColor: theme.backgroundDefault },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 28,
    shadowColor: PINK_PRIMARY,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 12,
    overflow: "hidden",
  },
  card: {
    borderRadius: 28,
    padding: Spacing.xl,
  },
});
