import React from "react";
import { Pressable, StyleSheet, ViewStyle, ActivityIndicator } from "react-native";
import { useTheme } from "@/components/ThemeProvider";
import { AppText } from "@/components/AppText";
import { ButtonSpacing } from "@/constants/spacing";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
  testID?: string;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  style,
  testID,
  icon,
}: PrimaryButtonProps) {
  const { theme, isDark } = useTheme();

  const getBackgroundColor = () => {
    if (variant === "ghost") return "transparent";
    if (variant === "secondary") {
      return isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
    }
    return theme.accent;
  };

  const getBorderColor = () => {
    if (variant === "ghost") {
      return isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
    }
    return "transparent";
  };

  const getTextColor = () => {
    if (variant === "primary") return "#FFFFFF";
    return theme.textPrimary as string;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor() as string,
          borderColor: getBorderColor() as string,
          borderWidth: variant === "ghost" ? 1 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <AppText
            variant="bodyStrong"
            color={getTextColor()}
            style={styles.text}
          >
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: ButtonSpacing.height,
    paddingHorizontal: ButtonSpacing.paddingHorizontal,
    borderRadius: ButtonSpacing.radius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
