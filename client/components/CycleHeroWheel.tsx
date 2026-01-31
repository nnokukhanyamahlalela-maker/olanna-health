import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, AccessibilityInfo } from "react-native";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { CyclePhase } from "@/components/Lotus";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(SCREEN_WIDTH * 0.75, 300);

interface CycleHeroWheelProps {
  phase: CyclePhase;
  currentDay: number;
  cycleLength: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function CycleHeroWheel({ phase, currentDay, cycleLength }: CycleHeroWheelProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  
  const breatheScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const checkReduceMotion = async () => {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(isReduceMotionEnabled);
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breatheScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const currentAngle = ((currentDay - 1) / cycleLength) * 360 - 90;
  const markerX = WHEEL_SIZE / 2 + (WHEEL_SIZE / 2 - 8) * Math.cos((currentAngle * Math.PI) / 180);
  const markerY = WHEEL_SIZE / 2 + (WHEEL_SIZE / 2 - 8) * Math.sin((currentAngle * Math.PI) / 180);

  return (
    <View style={styles.container}>
      <AnimatedView style={[styles.wheelWrapper, animatedStyle]}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          <Defs>
            <RadialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <Stop offset="85%" stopColor="rgba(255,255,255,0.08)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
            </RadialGradient>
          </Defs>

          <Circle
            cx={WHEEL_SIZE / 2}
            cy={WHEEL_SIZE / 2}
            r={WHEEL_SIZE / 2 - 12}
            fill="url(#haloGlow)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.5}
          />

          <LotusShape 
            cx={WHEEL_SIZE / 2} 
            cy={WHEEL_SIZE / 2} 
            size={WHEEL_SIZE * 0.4} 
            phase={phase}
          />

          <Circle
            cx={markerX}
            cy={markerY}
            r={6}
            fill="rgba(255,255,255,0.9)"
          />
          <Circle
            cx={markerX}
            cy={markerY}
            r={10}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1}
          />
        </Svg>
      </AnimatedView>
    </View>
  );
}

function LotusShape({ cx, cy, size, phase }: { cx: number; cy: number; size: number; phase: CyclePhase }) {
  const petalCount = phase === "menstrual" ? 5 : phase === "follicular" ? 6 : phase === "ovulation" ? 8 : 6;
  const petalSpread = phase === "ovulation" ? 0.85 : phase === "menstrual" ? 0.65 : 0.75;
  
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
    const petalLength = size * petalSpread;
    const petalWidth = size * 0.35;
    
    const tipX = cx + Math.cos(angle) * petalLength;
    const tipY = cy + Math.sin(angle) * petalLength;
    
    const cp1X = cx + Math.cos(angle - 0.3) * petalWidth;
    const cp1Y = cy + Math.sin(angle - 0.3) * petalWidth;
    const cp2X = cx + Math.cos(angle + 0.3) * petalWidth;
    const cp2Y = cy + Math.sin(angle + 0.3) * petalWidth;
    
    const d = `M ${cx} ${cy} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${cx} ${cy}`;
    petals.push(<Path key={i} d={d} fill="rgba(255,255,255,0.95)" />);
  }

  return (
    <>
      {petals}
      <Circle cx={cx} cy={cy} r={size * 0.15} fill="rgba(255,255,255,1)" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  wheelWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
