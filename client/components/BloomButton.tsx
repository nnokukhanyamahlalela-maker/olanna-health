import React from "react";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

const PINK_PRIMARY = "#F6BFD3";
const TRANSITION_DURATION = 350;

interface BloomButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BloomButton({
  label,
  onPress,
  icon,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
  testID,
}: BloomButtonProps) {
  const { theme } = useTheme();
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowRadius = interpolate(pressed.value, [0, 1], [4, 20]);
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.15, 0.6]);
    
    return {
      transform: [{ scale: scale.value }],
      shadowColor: PINK_PRIMARY,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: shadowOpacity,
      shadowRadius: shadowRadius,
      elevation: interpolate(pressed.value, [0, 1], [2, 8]),
    };
  });

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: TRANSITION_DURATION });
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: TRANSITION_DURATION });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundSecondary;
    switch (variant) {
      case "primary":
        return PINK_PRIMARY;
      case "secondary":
        return theme.backgroundDefault;
      case "ghost":
        return "transparent";
      default:
        return PINK_PRIMARY;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    switch (variant) {
      case "primary":
        return "#3A2F35";
      case "secondary":
        return theme.text;
      case "ghost":
        return theme.primary;
      default:
        return "#3A2F35";
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      testID={testID}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === "secondary" && { borderWidth: 1, borderColor: theme.border },
        animatedStyle,
        style,
      ]}
    >
      {icon ? (
        <Feather name={icon} size={18} color={getTextColor()} style={styles.icon} />
      ) : null}
      <ThemedText
        style={[
          styles.label,
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 24,
    gap: Spacing.sm,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
