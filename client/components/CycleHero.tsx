import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, AccessibilityInfo } from "react-native";
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { CyclePhase } from "@/components/Lotus";
import { HeroText } from "@/components/HeroText";
import { Spacing } from "@/constants/spacing";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const getWheelSize = () => {
  const baseSize = Math.min(SCREEN_WIDTH * 0.78, 340);
  return Math.max(baseSize, 280);
};

interface CycleHeroProps {
  phase: CyclePhase;
  currentDay: number;
  cycleLength: number;
  phasePhrase: string;
}

const PHASE_RANGES: Record<CyclePhase, { start: number; end: number }> = {
  menstrual: { start: 0, end: 0.18 },
  follicular: { start: 0.18, end: 0.46 },
  ovulation: { start: 0.46, end: 0.54 },
  luteal: { start: 0.54, end: 1 },
  late: { start: 0.96, end: 1 },
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

const LOTUS_PATH = `
  M 50 85
  C 50 85, 35 70, 35 55
  C 35 40, 50 30, 50 30
  C 50 30, 65 40, 65 55
  C 65 70, 50 85, 50 85
  Z
  M 50 30
  C 50 30, 30 35, 25 50
  C 20 65, 30 75, 35 70
  C 40 65, 45 50, 50 30
  Z
  M 50 30
  C 50 30, 70 35, 75 50
  C 80 65, 70 75, 65 70
  C 60 65, 55 50, 50 30
  Z
  M 50 30
  C 50 30, 20 30, 15 45
  C 10 60, 18 68, 25 60
  C 32 52, 40 35, 50 30
  Z
  M 50 30
  C 50 30, 80 30, 85 45
  C 90 60, 82 68, 75 60
  C 68 52, 60 35, 50 30
  Z
  M 50 30
  C 50 30, 45 18, 50 10
  C 55 18, 50 30, 50 30
  Z
`;

export function CycleHero({ phase, currentDay, cycleLength, phasePhrase }: CycleHeroProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const WHEEL_SIZE = getWheelSize();
  const STROKE_WIDTH = SCREEN_WIDTH > 380 ? 12 : 10;
  const RADIUS = (WHEEL_SIZE - STROKE_WIDTH) / 2;
  const CENTER = WHEEL_SIZE / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const LOTUS_SIZE = WHEEL_SIZE * 0.48;

  const breatheScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const checkReduceMotion = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        setReduceMotion(isEnabled);
      } catch {
        setReduceMotion(false);
      }
    };
    checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (isEnabled) => setReduceMotion(isEnabled)
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      breatheScale.value = 1;
      rotation.value = 0;
      return;
    }

    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 3750, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3750, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    rotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion]);

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breatheScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const phaseRange = PHASE_RANGES[phase];
  const activeLength = (phaseRange.end - phaseRange.start) * CIRCUMFERENCE;
  const activeOffset = phaseRange.start * CIRCUMFERENCE;

  const todayAngle = ((currentDay - 1) / cycleLength) * 360 - 90;
  const todayPos = polarToCartesian(CENTER, CENTER, RADIUS, todayAngle + 90);

  return (
    <View style={styles.container}>
      <View style={styles.phraseContainer}>
        <HeroText size="medium" style={styles.phasePhrase}>
          {phasePhrase}
        </HeroText>
      </View>

      <View style={[styles.heroWrapper, { width: WHEEL_SIZE, height: WHEEL_SIZE }]}>
        <Animated.View style={[styles.wheelWrapper, wheelAnimatedStyle]}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
            <Defs>
              <RadialGradient id="todayGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <Stop offset="70%" stopColor="rgba(255,255,255,0.3)" />
                <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </RadialGradient>
            </Defs>

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
            />

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={STROKE_WIDTH + 6}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${activeLength} ${CIRCUMFERENCE}`}
              strokeDashoffset={-activeOffset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              opacity={0.5}
            />

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="rgba(255,255,255,0.62)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${activeLength} ${CIRCUMFERENCE}`}
              strokeDashoffset={-activeOffset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />

            <Circle
              cx={todayPos.x}
              cy={todayPos.y}
              r={14}
              fill="url(#todayGlow)"
            />
            <Circle
              cx={todayPos.x}
              cy={todayPos.y}
              r={5}
              fill="rgba(255,255,255,0.95)"
            />
          </Svg>
        </Animated.View>

        <View style={[styles.lotusContainer, { width: LOTUS_SIZE, height: LOTUS_SIZE }]}>
          <Svg
            width={LOTUS_SIZE}
            height={LOTUS_SIZE}
            viewBox="0 0 100 100"
          >
            <Path
              d={LOTUS_PATH}
              fill="rgba(255,255,255,0.85)"
            />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  phraseContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  phasePhrase: {
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  wheelWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  lotusContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
