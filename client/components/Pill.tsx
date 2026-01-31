import React from "react";
import { Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/components/ThemeProvider";
import { AppText } from "@/components/AppText";
import { PillSpacing } from "@/constants/spacing";

interface PillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  testID?: string;
}

export function Pill({
  label,
  selected = false,
  onPress,
  disabled = false,
  style,
  textStyle,
  icon,
  testID,
}: PillProps) {
  const { theme, isDark } = useTheme();

  const backgroundColor = selected
    ? theme.accent
    : isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.04)";

  const borderColor = selected
    ? theme.accent
    : isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(0,0,0,0.08)";

  const textColor = selected
    ? "#FFFFFF"
    : (theme.textPrimary as string);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: backgroundColor as string,
          borderColor: borderColor as string,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      {icon}
      <AppText
        variant="body"
        color={textColor}
        style={[styles.text, textStyle]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: PillSpacing.height,
    minWidth: PillSpacing.minTapTarget,
    paddingHorizontal: PillSpacing.paddingHorizontal,
    borderRadius: PillSpacing.radius,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: PillSpacing.gap,
  },
  text: {
    fontSize: 14,
  },
});
