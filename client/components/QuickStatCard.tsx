import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface QuickStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

export function QuickStatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: QuickStatCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View style={[styles.iconRow]}>
        <Feather name={icon} size={14} color={color} />
      </View>
      <View style={styles.valueRow}>
        <ThemedText style={[styles.value, { color: theme.text }]}>
          {value}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText style={[styles.title, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  iconRow: {
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontFamily: "DMSans_500Medium",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "DMSans_300Light",
    fontSize: 13,
  },
  title: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
