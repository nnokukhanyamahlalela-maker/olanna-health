import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
} from "react-native-reanimated";

interface ScreenTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: "left" | "right";
}

export function ScreenTransition({ 
  children, 
  isVisible,
  direction = "right",
}: ScreenTransitionProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(direction === "right" ? 30 : -30);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { 
        duration: 250, 
        easing: Easing.out(Easing.cubic) 
      });
      translateX.value = withTiming(0, { 
        duration: 280, 
        easing: Easing.out(Easing.cubic) 
      });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
