import React, { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { BRAND_COLORS } from "@/constants/onboardingTokens";
import { StyleSheet } from "react-native";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  style?: object;
  onComplete?: () => void;
}

export function AnimatedHeading({ 
  text, 
  delay = 0, 
  style,
  onComplete,
}: AnimatedTextProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(20);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
      scale.value = 1;
      translateY.value = 0;
    } else {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.02, { duration: 500, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.cubic) })
        )
      );
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
    }

    if (onComplete) {
      const timer = setTimeout(onComplete, reduceMotion ? delay + 300 : delay + 1000);
      return () => clearTimeout(timer);
    }
  }, [reduceMotion, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: reduceMotion 
      ? [] 
      : [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={[styles.heading, style]}>{text}</ThemedText>
    </Animated.View>
  );
}

export function AnimatedSubtext({ 
  text, 
  delay = 0, 
  style,
}: AnimatedTextProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
      translateY.value = 0;
    } else {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [reduceMotion, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: reduceMotion ? [] : [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={[styles.subtext, style]}>{text}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: "Poppins_700Bold",
    fontSize: 38,
    color: BRAND_COLORS.white,
    lineHeight: 48,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
  },
});
