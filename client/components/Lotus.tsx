import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Svg, { Path, G, Circle } from "react-native-svg";
import { PhaseColors } from "@/constants/theme";

const TRANSITION_DURATION = 350;
const PULSE_DURATION = 3000;

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal" | "late";

interface LotusProps {
  phase: CyclePhase;
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  showBackground?: boolean;
  backgroundColor?: string;
  showGlow?: boolean;
}

const CHARCOAL = "#3A2F35";
const PINK_PRIMARY = "#F6BFD3";
const GLOW_COLOR = "rgba(246, 191, 211, 0.6)";

export const PHASE_INFO = {
  menstrual: {
    title: "Rest and Release",
    subtitle: "This is the wisdom phase.",
    description: "A time for introspection and honoring your body's need for rest.",
  },
  follicular: {
    title: "Growth and Renewal",
    subtitle: "This is the becoming phase.",
    description: "Energy rises as your body prepares for new possibilities.",
  },
  ovulation: {
    title: "Radiance and Expression",
    subtitle: "This is the radiance phase.",
    description: "Your energy peaks - embrace connection and creativity.",
  },
  luteal: {
    title: "Boundaries and Reflection",
    subtitle: "This is the refinement phase.",
    description: "A time to complete projects and turn inward.",
  },
  late: {
    title: "Awaiting Your Cycle",
    subtitle: "Your period may be on its way.",
    description: "Your period is later than expected. Log your period when it arrives.",
  },
};

export const PHASE_COLORS = {
  menstrual: PhaseColors.menstrual.primary,
  follicular: PhaseColors.follicular.primary,
  ovulation: PhaseColors.ovulation.primary,
  luteal: PhaseColors.luteal.primary,
  late: PhaseColors.luteal.primary,
};

export const PHASE_BG_COLORS = {
  menstrual: PhaseColors.menstrual.light,
  follicular: PhaseColors.follicular.light,
  ovulation: PhaseColors.ovulation.light,
  luteal: PhaseColors.luteal.light,
  late: PhaseColors.luteal.light,
};

export const PHASE_GRADIENTS = {
  menstrual: [PhaseColors.menstrual.gradientStart, PhaseColors.menstrual.gradientEnd],
  follicular: [PhaseColors.follicular.gradientStart, PhaseColors.follicular.gradientEnd],
  ovulation: [PhaseColors.ovulation.gradientStart, PhaseColors.ovulation.gradientEnd],
  luteal: [PhaseColors.luteal.gradientStart, PhaseColors.luteal.gradientEnd],
  late: [PhaseColors.luteal.gradientStart, PhaseColors.luteal.gradientEnd],
};

export function Lotus({ 
  phase, 
  size = 120, 
  strokeColor = CHARCOAL,
  strokeWidth = 1,
  showBackground = false,
  backgroundColor,
  showGlow = false,
}: LotusProps) {
  const viewBoxSize = 100;
  const cx = viewBoxSize / 2;

  const bgColor = backgroundColor || PHASE_BG_COLORS[phase];
  const isActive = phase === "ovulation" || showGlow;
  
  const pulseValue = useSharedValue(0);
  
  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseValue.value, [0, 1], [1, 1.02]);
    const shadowOpacity = isActive 
      ? interpolate(pulseValue.value, [0, 1], [0.4, 0.7])
      : 0;
    const shadowRadius = isActive 
      ? interpolate(pulseValue.value, [0, 1], [8, 16])
      : 0;
    
    return {
      transform: [{ scale }],
      shadowColor: PINK_PRIMARY,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity,
      shadowRadius,
      elevation: isActive ? 8 : 0,
    };
  });

  const renderMenstrualLotus = () => {
    return (
      <G>
        <Path
          d="M50 75 L50 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M50 68 Q50 55 50 40 Q44 48 42 56 Q41 63 46 67 Q48 68 50 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M47 55 Q46 58 45 60"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 68 Q50 55 50 40 Q56 48 58 56 Q59 63 54 67 Q52 68 50 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M53 55 Q54 58 55 60"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 68 Q50 52 50 35"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 45 Q50 50 50 55"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M46 69 Q44 72 40 71"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M54 69 Q56 72 60 71"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  };

  const renderFollicularLotus = () => {
    return (
      <G>
        <Path
          d="M50 78 L50 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M50 68 Q50 50 50 32 Q43 42 40 54 Q39 62 46 67 Q48 68 50 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M46 50 Q45 55 44 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 68 Q50 50 50 32 Q57 42 60 54 Q61 62 54 67 Q52 68 50 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M54 50 Q55 55 56 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M44 68 Q36 52 32 38 Q26 50 32 62 Q38 68 44 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M37 52 Q36 56 35 59"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M56 68 Q64 52 68 38 Q74 50 68 62 Q62 68 56 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M63 52 Q64 56 65 59"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 68 Q50 48 50 28"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 40 Q50 48 50 55"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M44 70 Q40 74 35 72"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M56 70 Q60 74 65 72"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  };

  const renderOvulationLotus = () => {
    return (
      <G>
        <Path
          d="M50 80 L50 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M50 65 Q50 50 50 30 Q45 40 44 52 Q44 60 50 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M47 45 Q46 50 46 54"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 65 Q50 50 50 30 Q55 40 56 52 Q56 60 50 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M53 45 Q54 50 54 54"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M46 66 Q38 50 34 35 Q26 48 34 62 Q40 68 46 66"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M38 48 Q36 54 36 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M54 66 Q62 50 66 35 Q74 48 66 62 Q60 68 54 66"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M62 48 Q64 54 64 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M40 68 Q28 58 22 42 Q14 56 24 66 Q34 72 40 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M28 54 Q26 58 26 62"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M60 68 Q72 58 78 42 Q86 56 76 66 Q66 72 60 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M72 54 Q74 58 74 62"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M34 70 Q18 65 12 50 Q6 66 18 72 Q30 76 34 70"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20 60 Q18 64 18 67"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M66 70 Q82 65 88 50 Q94 66 82 72 Q70 76 66 70"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M80 60 Q82 64 82 67"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M42 72 Q36 78 28 76"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M58 72 Q64 78 72 76"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  };

  const renderLutealLotus = () => {
    return (
      <G>
        <Path
          d="M50 78 L50 66"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M50 66 Q50 48 50 30 Q44 40 42 52 Q41 60 48 66 Q50 67 50 66"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M46 48 Q45 52 45 56"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 66 Q50 48 50 30 Q56 40 58 52 Q59 60 52 66 Q50 67 50 66"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M54 48 Q55 52 55 56"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M44 68 Q36 52 30 36 Q22 50 30 62 Q38 70 44 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M35 50 Q34 55 34 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M56 68 Q64 52 70 36 Q78 50 70 62 Q62 70 56 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M65 50 Q66 55 66 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M38 70 Q26 60 20 44 Q12 58 22 68 Q32 74 38 70"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M26 56 Q24 60 24 64"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M62 70 Q74 60 80 44 Q88 58 78 68 Q68 74 62 70"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M74 56 Q76 60 76 64"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 66 Q50 45 50 26"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 38 Q50 45 50 52"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M42 72 Q36 76 30 74"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M58 72 Q64 76 70 74"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.7}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  };

  const renderLotus = () => {
    switch (phase) {
      case "menstrual":
        return renderMenstrualLotus();
      case "follicular":
        return renderFollicularLotus();
      case "ovulation":
        return renderOvulationLotus();
      case "luteal":
        return renderLutealLotus();
    }
  };

  if (showBackground) {
    return (
      <Animated.View style={[styles.backgroundContainer, { width: size, height: size }, animatedContainerStyle]}>
        <View 
          style={[
            styles.circleBackground, 
            { 
              width: size * 0.9, 
              height: size * 0.9, 
              borderRadius: size * 0.45,
              backgroundColor: bgColor,
            }
          ]} 
        />
        <Svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          style={styles.svg}
        >
          {renderLotus()}
        </Svg>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ width: size, height: size }, animatedContainerStyle]}>
      <Svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        {renderLotus()}
      </Svg>
    </Animated.View>
  );
}

export function LotusIcon({ phase, size = 24, strokeColor = CHARCOAL }: LotusProps) {
  return <Lotus phase={phase} size={size} strokeColor={strokeColor} strokeWidth={1.5} />;
}

export function LotusWithBackground({ 
  phase, 
  size = 80, 
  strokeColor = CHARCOAL 
}: Omit<LotusProps, 'showBackground'>) {
  return (
    <Lotus 
      phase={phase} 
      size={size} 
      strokeColor={strokeColor} 
      strokeWidth={1.2}
      showBackground={true}
    />
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
  },
  svg: {
    zIndex: 1,
  },
});
