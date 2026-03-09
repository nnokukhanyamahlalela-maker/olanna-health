import React, { useEffect } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Phase, phaseConfig } from "@/constants/phaseConfig";

type LotusVariant = "bud" | "rising" | "bloom" | "closing" | "waiting";

const LOTUS_IMAGES: Record<LotusVariant, any> = {
  bud: require("@/assets/images/lotus-menstrual.png"),
  rising: require("@/assets/images/lotus-follicular.png"),
  bloom: require("@/assets/images/lotus-ovulation.png"),
  closing: require("@/assets/images/lotus-luteal.png"),
  waiting: require("@/assets/images/lotus-luteal.png"),
};

interface PhaseLotusProps {
  phase: Phase;
  size?: number;
}

export function PhaseLotus({ phase, size = 90 }: PhaseLotusProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(0.7, { duration: 100, easing: Easing.out(Easing.ease) }, () => {
      opacity.value = withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) });
    });
    scale.value = withTiming(0.95, { duration: 100, easing: Easing.out(Easing.ease) }, () => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) });
    });
  }, [phase]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const config = phaseConfig[phase];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image
        source={LOTUS_IMAGES[config.lotusVariant]}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PhaseLotus;
