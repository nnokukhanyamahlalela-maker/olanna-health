/**
 * PhaseLotus Component
 * 
 * Renders a beautiful white lotus flower SVG that changes based on cycle phase.
 * Features soft lavender shadows and gentle animations on phase changes.
 * 
 * Lotus Variants:
 * - bud: Closed teardrop (menstrual) - simple drop shape
 * - rising: Partially open (follicular) - 3 petals emerging
 * - bloom: Opening bloom (ovulation) - layered petals spreading
 * - closing: Full bloom (luteal) - fully opened with wide petals
 */

import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, G, Ellipse } from "react-native-svg";
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
        <LinearGradient id="budGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#F0E8F0" stopOpacity={0.95} />
        </LinearGradient>
        <LinearGradient id="budGradShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E8DCE8" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#D8C8D8" stopOpacity={0.4} />
        </LinearGradient>
      </Defs>
      <G>
        {/* Shadow layer */}
        <Ellipse
          cx={52}
          cy={88}
          rx={16}
          ry={4}
          fill="rgba(180,160,180,0.2)"
        />
        {/* Main teardrop shape */}
        <Path
          d="M50 18 
             C50 18 30 45 30 62 
             C30 75 38 85 50 85 
             C62 85 70 75 70 62 
             C70 45 50 18 50 18 Z"
          fill="url(#budGradMain)"
        />
        {/* Inner highlight curve */}
        <Path
          d="M50 28 
             C50 28 38 48 38 60 
             C38 68 42 72 50 72"
          fill="none"
          stroke="url(#budGradShadow)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Subtle inner detail */}
        <Path
          d="M46 55 Q50 45 54 55"
          fill="none"
          stroke="rgba(200,180,200,0.3)"
          strokeWidth={1}
        />
      </G>
    </Svg>
  );
}

function LotusRising({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="risingGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#F5EDF5" stopOpacity={0.95} />
        </LinearGradient>
        <LinearGradient id="risingGradLeft" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#EDE5ED" stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient id="risingGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#EDE5ED" stopOpacity={0.9} />
        </LinearGradient>
      </Defs>
      <G>
        {/* Shadow */}
        <Ellipse
          cx={50}
          cy={88}
          rx={22}
          ry={4}
          fill="rgba(180,160,180,0.2)"
        />
        {/* Left petal (back) */}
        <Path
          d="M50 82 
             C35 82 24 70 22 55
             C20 40 28 28 38 22
             C42 32 44 50 46 65
             C47 72 48 78 50 82 Z"
          fill="url(#risingGradLeft)"
        />
        {/* Right petal (back) */}
        <Path
          d="M50 82 
             C65 82 76 70 78 55
             C80 40 72 28 62 22
             C58 32 56 50 54 65
             C53 72 52 78 50 82 Z"
          fill="url(#risingGradRight)"
        />
        {/* Center petal (front) */}
        <Path
          d="M50 82 
             C42 82 36 72 36 60
             C36 45 42 30 50 18
             C58 30 64 45 64 60
             C64 72 58 82 50 82 Z"
          fill="url(#risingGradMain)"
        />
        {/* Center petal inner detail */}
        <Path
          d="M50 30 C48 40 46 52 46 62"
          fill="none"
          stroke="rgba(200,180,200,0.25)"
          strokeWidth={1}
        />
      </G>
    </Svg>
  );
}

function LotusBloom({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="bloomGradCenter" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#F5EDF5" stopOpacity={0.95} />
        </LinearGradient>
        <LinearGradient id="bloomGradInner" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#EEE6EE" stopOpacity={0.92} />
        </LinearGradient>
        <LinearGradient id="bloomGradOuter" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#FAFAFA" stopOpacity={0.98} />
          <Stop offset="100%" stopColor="#E8DEE8" stopOpacity={0.88} />
        </LinearGradient>
      </Defs>
      <G>
        {/* Shadow */}
        <Ellipse
          cx={50}
          cy={88}
          rx={32}
          ry={5}
          fill="rgba(180,160,180,0.18)"
        />
        {/* Back outer petals */}
        <Path
          d="M50 82 C30 82 14 68 10 50 C8 38 16 26 28 20
             C34 32 40 55 46 70 C48 76 49 80 50 82 Z"
          fill="url(#bloomGradOuter)"
        />
        <Path
          d="M50 82 C70 82 86 68 90 50 C92 38 84 26 72 20
             C66 32 60 55 54 70 C52 76 51 80 50 82 Z"
          fill="url(#bloomGradOuter)"
        />
        {/* Middle petals */}
        <Path
          d="M50 82 C34 82 22 66 20 50 C18 36 26 24 38 18
             C42 30 46 52 48 68 C49 74 50 79 50 82 Z"
          fill="url(#bloomGradInner)"
        />
        <Path
          d="M50 82 C66 82 78 66 80 50 C82 36 74 24 62 18
             C58 30 54 52 52 68 C51 74 50 79 50 82 Z"
          fill="url(#bloomGradInner)"
        />
        {/* Inner petals */}
        <Path
          d="M50 82 C38 82 30 68 28 52 C26 38 34 26 44 18
             C46 30 48 50 49 66 C49 72 50 78 50 82 Z"
          fill="url(#bloomGradInner)"
        />
        <Path
          d="M50 82 C62 82 70 68 72 52 C74 38 66 26 56 18
             C54 30 52 50 51 66 C51 72 50 78 50 82 Z"
          fill="url(#bloomGradInner)"
        />
        {/* Center petal */}
        <Path
          d="M50 82 C42 82 36 70 36 56 C36 40 42 26 50 14
             C58 26 64 40 64 56 C64 70 58 82 50 82 Z"
          fill="url(#bloomGradCenter)"
        />
        {/* Petal details */}
        <Path
          d="M50 24 C48 34 46 48 46 60"
          fill="none"
          stroke="rgba(200,180,200,0.2)"
          strokeWidth={0.8}
        />
      </G>
    </Svg>
  );
}

function LotusClosing({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="fullGradCenter" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#F5EDF5" stopOpacity={0.95} />
        </LinearGradient>
        <LinearGradient id="fullGradInner" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="100%" stopColor="#EEE6EE" stopOpacity={0.92} />
        </LinearGradient>
        <LinearGradient id="fullGradMiddle" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#FAFAFA" stopOpacity={0.98} />
          <Stop offset="100%" stopColor="#E8DEE8" stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient id="fullGradOuter" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#F8F4F8" stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#E0D4E0" stopOpacity={0.85} />
        </LinearGradient>
      </Defs>
      <G>
        {/* Shadow */}
        <Ellipse
          cx={50}
          cy={88}
          rx={38}
          ry={5}
          fill="rgba(180,160,180,0.15)"
        />
        {/* Far outer petals (widest spread) */}
        <Path
          d="M50 82 C24 82 4 62 2 42 C0 28 12 18 26 16
             C34 28 42 52 48 72 C49 77 50 80 50 82 Z"
          fill="url(#fullGradOuter)"
        />
        <Path
          d="M50 82 C76 82 96 62 98 42 C100 28 88 18 74 16
             C66 28 58 52 52 72 C51 77 50 80 50 82 Z"
          fill="url(#fullGradOuter)"
        />
        {/* Outer petals */}
        <Path
          d="M50 82 C28 82 10 64 8 44 C6 30 16 20 30 18
             C36 30 44 54 48 72 C49 77 50 80 50 82 Z"
          fill="url(#fullGradMiddle)"
        />
        <Path
          d="M50 82 C72 82 90 64 92 44 C94 30 84 20 70 18
             C64 30 56 54 52 72 C51 77 50 80 50 82 Z"
          fill="url(#fullGradMiddle)"
        />
        {/* Middle-outer petals */}
        <Path
          d="M50 82 C32 82 18 66 16 48 C14 34 24 22 36 18
             C40 30 46 54 49 70 C49 75 50 79 50 82 Z"
          fill="url(#fullGradInner)"
        />
        <Path
          d="M50 82 C68 82 82 66 84 48 C86 34 76 22 64 18
             C60 30 54 54 51 70 C51 75 50 79 50 82 Z"
          fill="url(#fullGradInner)"
        />
        {/* Inner petals */}
        <Path
          d="M50 82 C38 82 28 68 26 52 C24 38 32 26 44 20
             C46 32 48 52 49 68 C49 74 50 78 50 82 Z"
          fill="url(#fullGradInner)"
        />
        <Path
          d="M50 82 C62 82 72 68 74 52 C76 38 68 26 56 20
             C54 32 52 52 51 68 C51 74 50 78 50 82 Z"
          fill="url(#fullGradInner)"
        />
        {/* Center petal */}
        <Path
          d="M50 82 C42 82 36 70 36 56 C36 42 42 28 50 16
             C58 28 64 42 64 56 C64 70 58 82 50 82 Z"
          fill="url(#fullGradCenter)"
        />
        {/* Center detail */}
        <Path
          d="M50 26 C48 36 46 50 46 62"
          fill="none"
          stroke="rgba(200,180,200,0.18)"
          strokeWidth={0.8}
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
