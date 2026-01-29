import React from "react";
import { StyleSheet, Pressable, ViewStyle, TextStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { BRAND_COLORS } from "./GradientBackground";
import * as Haptics from "expo-haptics";

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "glass";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PillButton({
  label,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  style,
  textStyle,
}: PillButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: BRAND_COLORS.white,
          shadowColor: BRAND_COLORS.hotPink,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 6,
        };
      case "secondary":
        return {
          backgroundColor: BRAND_COLORS.hotPink,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: BRAND_COLORS.white,
        };
      case "glass":
        return {
          backgroundColor: "rgba(255,255,255,0.25)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
        };
      default:
        return {};
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
        return BRAND_COLORS.text;
      case "secondary":
      case "outline":
      case "glass":
        return BRAND_COLORS.white;
      default:
        return BRAND_COLORS.text;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "small":
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.lg,
        };
      case "medium":
        return {
          paddingVertical: Spacing.md + 2,
          paddingHorizontal: Spacing.xl,
        };
      case "large":
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing["2xl"],
        };
      default:
        return {};
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case "small": return 13;
      case "medium": return 15;
      case "large": return 17;
      default: return 15;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <ThemedText 
        style={[
          styles.label,
          { color: getTextColor(), fontSize: getFontSize() },
          textStyle,
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
