/**
 * PhaseLotus Component
 * 
 * Renders a beautiful lotus flower SVG that changes based on cycle phase.
 * Features soft gradients and gentle animations on phase changes.
 * 
 * Lotus Variants:
 * - bud: Closed lotus (menstrual) - tight closed bud
 * - rising: Half-open lotus (follicular) - petals starting to open
 * - bloom: Fully open lotus (ovulation) - fully bloomed with many petals
 * - closing: Gently closing lotus (luteal) - petals curving inward
 */

import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, G } from "react-native-svg";
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
}

function LotusBud({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="lotusBudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <Stop offset="100%" stopColor="rgba(240,220,230,0.9)" />
        </LinearGradient>
      </Defs>
      <G>
        {/* Center petal */}
        <Path
          d="M50 70 Q50 50 50 35 Q45 45 44 55 Q44 65 50 70 Z"
          fill="url(#lotusBudGrad)"
          stroke="rgba(200,180,200,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M50 70 Q50 50 50 35 Q55 45 56 55 Q56 65 50 70 Z"
          fill="url(#lotusBudGrad)"
          stroke="rgba(200,180,200,0.3)"
          strokeWidth={0.5}
        />
        {/* Side petals */}
        <Path
          d="M46 70 Q38 55 36 42 Q32 55 40 66 Q44 70 46 70"
          fill="url(#lotusBudGrad)"
          stroke="rgba(200,180,200,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M54 70 Q62 55 64 42 Q68 55 60 66 Q56 70 54 70"
          fill="url(#lotusBudGrad)"
          stroke="rgba(200,180,200,0.3)"
          strokeWidth={0.5}
        />
      </G>
    </Svg>
  );
}

function LotusRising({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="lotusRisingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <Stop offset="100%" stopColor="rgba(248,200,180,0.85)" />
        </LinearGradient>
      </Defs>
      <G>
        {/* Center petals */}
        <Path
          d="M50 72 Q50 50 50 30 Q44 42 43 55 Q43 68 50 72 Z"
          fill="url(#lotusRisingGrad)"
          stroke="rgba(240,180,160,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M50 72 Q50 50 50 30 Q56 42 57 55 Q57 68 50 72 Z"
          fill="url(#lotusRisingGrad)"
          stroke="rgba(240,180,160,0.3)"
          strokeWidth={0.5}
        />
        {/* Inner side petals */}
        <Path
          d="M45 72 Q36 52 32 35 Q26 52 36 66 Q42 73 45 72"
          fill="url(#lotusRisingGrad)"
          stroke="rgba(240,180,160,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M55 72 Q64 52 68 35 Q74 52 64 66 Q58 73 55 72"
          fill="url(#lotusRisingGrad)"
          stroke="rgba(240,180,160,0.3)"
          strokeWidth={0.5}
        />
        {/* Outer petals */}
        <Path
          d="M40 74 Q28 56 24 40 Q18 58 28 70 Q36 76 40 74"
          fill="url(#lotusRisingGrad)"
          stroke="rgba(240,180,160,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M60 74 Q72 56 76 40 Q82 58 72 70 Q64 76 60 74"
          fill="url(#lotusRisingGrad)"
          stroke="rgba(240,180,160,0.3)"
          strokeWidth={0.5}
        />
      </G>
    </Svg>
  );
}

function LotusBloom({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="lotusBloomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
          <Stop offset="50%" stopColor="rgba(255,240,245,0.95)" />
          <Stop offset="100%" stopColor="rgba(248,220,230,0.9)" />
        </LinearGradient>
      </Defs>
      <G>
        {/* Back petals (widest) */}
        <Path
          d="M30 76 Q14 62 8 42 Q2 62 16 74 Q26 80 30 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        <Path
          d="M70 76 Q86 62 92 42 Q98 62 84 74 Q74 80 70 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        {/* Middle-outer petals */}
        <Path
          d="M36 76 Q22 56 16 36 Q10 56 24 72 Q32 78 36 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        <Path
          d="M64 76 Q78 56 84 36 Q90 56 76 72 Q68 78 64 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        {/* Inner-outer petals */}
        <Path
          d="M42 76 Q30 52 26 32 Q20 52 34 70 Q40 77 42 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        <Path
          d="M58 76 Q70 52 74 32 Q80 52 66 70 Q60 77 58 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        {/* Inner side petals */}
        <Path
          d="M46 76 Q38 50 36 28 Q30 50 40 70 Q44 76 46 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        <Path
          d="M54 76 Q62 50 64 28 Q70 50 60 70 Q56 76 54 76"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        {/* Center petals */}
        <Path
          d="M50 76 Q50 48 50 22 Q44 40 44 58 Q44 72 50 76 Z"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
        <Path
          d="M50 76 Q50 48 50 22 Q56 40 56 58 Q56 72 50 76 Z"
          fill="url(#lotusBloomGrad)"
          stroke="rgba(240,200,210,0.4)"
          strokeWidth={0.5}
        />
      </G>
    </Svg>
  );
}

function LotusClosing({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="lotusClosingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <Stop offset="100%" stopColor="rgba(248,180,200,0.85)" />
        </LinearGradient>
      </Defs>
      <G>
        {/* Outer petals - curving inward */}
        <Path
          d="M34 74 Q24 58 22 42 Q18 58 28 70 Q32 75 34 74"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M66 74 Q76 58 78 42 Q82 58 72 70 Q68 75 66 74"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
        {/* Middle petals */}
        <Path
          d="M40 74 Q32 54 30 38 Q26 54 36 68 Q38 74 40 74"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M60 74 Q68 54 70 38 Q74 54 64 68 Q62 74 60 74"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
        {/* Inner petals */}
        <Path
          d="M45 74 Q40 52 38 36 Q34 52 42 68 Q44 74 45 74"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M55 74 Q60 52 62 36 Q66 52 58 68 Q56 74 55 74"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
        {/* Center petals */}
        <Path
          d="M50 74 Q50 50 50 32 Q46 46 46 60 Q46 70 50 74 Z"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
        <Path
          d="M50 74 Q50 50 50 32 Q54 46 54 60 Q54 70 50 74 Z"
          fill="url(#lotusClosingGrad)"
          stroke="rgba(240,160,180,0.3)"
          strokeWidth={0.5}
        />
      </G>
    </Svg>
  );
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

  const renderLotus = () => {
    switch (config.lotusVariant) {
      case "bud":
        return <LotusBud size={size} />;
      case "rising":
        return <LotusRising size={size} />;
      case "bloom":
        return <LotusBloom size={size} />;
      case "closing":
        return <LotusClosing size={size} />;
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
