import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { BRAND_COLORS } from "@/constants/onboardingTokens";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

function Dot({ isActive, index }: { isActive: boolean; index: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 120 }),
    opacity: withSpring(isActive ? 1 : 0.5, { damping: 15, stiffness: 120 }),
    backgroundColor: isActive ? BRAND_COLORS.white : "rgba(255,255,255,0.5)",
  }));

  return (
    <Animated.View 
      style={[styles.dot, animatedStyle]}
      accessibilityLabel={`Step ${index + 1}`}
      accessibilityState={{ selected: isActive }}
    />
  );
}

export function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <View 
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: currentStep + 1, max: totalSteps }}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <Dot key={index} isActive={index === currentStep} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
