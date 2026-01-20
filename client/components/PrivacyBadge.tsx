import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface PrivacyBadgeProps {
  variant?: "inline" | "tooltip";
  message?: string;
  onPress?: () => void;
}

export function PrivacyBadge({
  variant = "inline",
  message = "Your data is encrypted and stored locally",
  onPress,
}: PrivacyBadgeProps) {
  const { theme } = useTheme();

  if (variant === "tooltip") {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.tooltipBadge,
          { backgroundColor: theme.info + "15", opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="lock" size={14} color={theme.info} />
        <ThemedText type="caption" style={{ color: theme.info }}>
          {message}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.inlineBadge, { backgroundColor: theme.info + "10" }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.info + "20" }]}>
        <Feather name="shield" size={12} color={theme.info} />
      </View>
      <ThemedText type="caption" style={[styles.message, { color: theme.info }]}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  inlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
  },
  tooltipBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
});
