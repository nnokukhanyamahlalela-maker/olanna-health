import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface HeroCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const PINK_PRIMARY = "#F6BFD3";

export function HeroCard({ children, style }: HeroCardProps) {
  const { theme } = useTheme();

  return (
    <View 
      style={[
        styles.card, 
        { backgroundColor: theme.backgroundDefault },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: Spacing.xl,
    shadowColor: PINK_PRIMARY,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 12,
  },
});
