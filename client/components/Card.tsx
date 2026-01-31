import React from "react";
import { StyleSheet, Pressable, ViewStyle, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  title,
  description,
  children,
  onPress,
  style,
}: CardProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  // QA: Dark mode readability - adjust glass fill and border
  const cardBackground = isDark 
    ? "rgba(45, 45, 55, 0.85)" 
    : "rgba(255, 255, 255, 0.7)";
  const cardBorder = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(255, 255, 255, 0.4)";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card, 
        { backgroundColor: cardBackground, borderColor: cardBorder, borderWidth: 1 },
        animatedStyle, 
        style
      ]}
    >
      <BlurView intensity={isDark ? 24 : 16} tint={isDark ? "dark" : "light"} style={styles.blurContainer}>
        <View style={styles.cardContent}>
          {title ? (
            <ThemedText type="h4" style={styles.cardTitle}>
              {title}
            </ThemedText>
          ) : null}
          {description ? (
            <ThemedText type="small" style={styles.cardDescription}>
              {description}
            </ThemedText>
          ) : null}
          {children}
        </View>
      </BlurView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  blurContainer: {
    flex: 1,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    opacity: 0.7,
  },
});
