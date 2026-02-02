/**
 * PhaseLotus Component
 * 
 * Renders the correct lotus SVG variant based on the current phase.
 * Includes subtle fade/scale animation when phase changes.
 * 
 * Lotus Variants:
 * - bud: Closed lotus (menstrual) - fewest petals, tight
 * - rising: Half-open lotus (follicular) - more petals, opening
 * - bloom: Fully open lotus (ovulation) - most petals, wide open
 * - closing: Gently closing lotus (luteal) - petals curving inward
 */

import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Phase, phaseConfig } from "@/constants/phaseConfig";

interface PhaseLotusProps {
  phase: Phase;
  size?: number;
  color?: string;
}

/**
 * Lotus Bud - Menstrual Phase
 * Closed, minimal petals representing rest
 */
function LotusBud({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        {/* Stem */}
        <Path d="M50 85 L50 65" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        {/* Center petal */}
        <Path
          d="M50 65 Q50 45 50 30 Q45 40 44 52 Q44 60 50 65 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d="M50 65 Q50 45 50 30 Q55 40 56 52 Q56 60 50 65 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
          strokeLinejoin="round"
        />
        {/* Small side petals */}
        <Path
          d="M46 66 Q40 55 38 45 Q34 55 40 63 Q44 67 46 66"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M54 66 Q60 55 62 45 Q66 55 60 63 Q56 67 54 66"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
      </G>
    </Svg>
  );
}

/**
 * Lotus Rising - Follicular Phase
 * Half-open with more visible petals
 */
function LotusRising({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Path d="M50 85 L50 62" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        {/* Center petals */}
        <Path
          d="M50 62 Q50 42 50 25 Q43 38 42 50 Q42 58 50 62 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M50 62 Q50 42 50 25 Q57 38 58 50 Q58 58 50 62 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Side petals - left */}
        <Path
          d="M44 64 Q34 48 30 35 Q24 50 32 60 Q40 66 44 64"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Side petals - right */}
        <Path
          d="M56 64 Q66 48 70 35 Q76 50 68 60 Q60 66 56 64"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Outer petals */}
        <Path
          d="M38 66 Q26 55 22 42 Q16 58 26 66 Q34 70 38 66"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M62 66 Q74 55 78 42 Q84 58 74 66 Q66 70 62 66"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
      </G>
    </Svg>
  );
}

/**
 * Lotus Bloom - Ovulation Phase
 * Fully open with maximum petals
 */
function LotusBloom({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Path d="M50 88 L50 60" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        {/* Center petals */}
        <Path
          d="M50 60 Q50 40 50 22 Q44 34 43 48 Q43 56 50 60 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M50 60 Q50 40 50 22 Q56 34 57 48 Q57 56 50 60 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Inner side petals */}
        <Path
          d="M45 62 Q35 46 32 32 Q26 48 34 58 Q42 64 45 62"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M55 62 Q65 46 68 32 Q74 48 66 58 Q58 64 55 62"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Middle petals */}
        <Path
          d="M40 64 Q28 52 22 38 Q14 54 24 64 Q34 70 40 64"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M60 64 Q72 52 78 38 Q86 54 76 64 Q66 70 60 64"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Outer petals */}
        <Path
          d="M34 68 Q18 60 12 45 Q6 62 18 70 Q30 74 34 68"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M66 68 Q82 60 88 45 Q94 62 82 70 Q70 74 66 68"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Outermost petals */}
        <Path
          d="M28 72 Q14 68 8 55 Q4 70 14 76 Q24 78 28 72"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M72 72 Q86 68 92 55 Q96 70 86 76 Q76 78 72 72"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
      </G>
    </Svg>
  );
}

/**
 * Lotus Closing - Luteal Phase
 * Petals gently curving inward
 */
function LotusClosing({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Path d="M50 85 L50 62" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        {/* Center petals - slightly closing */}
        <Path
          d="M50 62 Q50 44 50 28 Q44 40 43 52 Q44 59 50 62 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M50 62 Q50 44 50 28 Q56 40 57 52 Q56 59 50 62 Z"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Side petals - curving inward */}
        <Path
          d="M45 64 Q36 50 34 38 Q28 52 36 60 Q42 65 45 64"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M55 64 Q64 50 66 38 Q72 52 64 60 Q58 65 55 64"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Outer petals - more closed */}
        <Path
          d="M40 66 Q30 54 26 42 Q20 56 28 64 Q36 69 40 66"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M60 66 Q70 54 74 42 Q80 56 72 64 Q64 69 60 66"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        {/* Falling petals hint */}
        <Path
          d="M34 70 Q26 62 22 52 Q18 64 26 70 Q32 73 34 70"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M66 70 Q74 62 78 52 Q82 64 74 70 Q68 73 66 70"
          stroke={color}
          strokeWidth={1}
          fill="none"
        />
      </G>
    </Svg>
  );
}

export function PhaseLotus({ phase, size = 80, color = "rgba(255,255,255,0.85)" }: PhaseLotusProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Animate on phase change: fade out, scale down, then back
    opacity.value = withTiming(0.6, { duration: 100, easing: Easing.out(Easing.ease) }, () => {
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

  const renderLotus = () => {
    switch (config.lotusVariant) {
      case "bud":
        return <LotusBud size={size} color={color} />;
      case "rising":
        return <LotusRising size={size} color={color} />;
      case "bloom":
        return <LotusBloom size={size} color={color} />;
      case "closing":
        return <LotusClosing size={size} color={color} />;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {renderLotus()}
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
