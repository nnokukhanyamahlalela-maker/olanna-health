import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CycleData } from "@/lib/storage";

const { width: screenWidth } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(screenWidth - 64, 280);

interface LotusWheelProps {
  cycleData: CycleData;
  showReminders?: boolean;
}

const PHASE_COLORS = {
  menstrual: "#E8A2B0",
  follicular: "#F4C6A6",
  ovulation: "#A7D7C5",
  luteal: "#C7B6E8",
};

export function LotusWheel({ cycleData, showReminders }: LotusWheelProps) {
  const { theme } = useTheme();

  const breatheValue = useSharedValue(0);

  useEffect(() => {
    breatheValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const breatheStyle = useAnimatedStyle(() => {
    const scale = interpolate(breatheValue.value, [0, 1], [0.98, 1.02]);
    return {
      transform: [{ scale }],
    };
  });

  const getPhaseLabel = (phase: CycleData["phase"]) => {
    switch (phase) {
      case "menstrual":
        return "Menstrual Phase";
      case "follicular":
        return "Follicular Phase";
      case "ovulation":
        return "Ovulation";
      case "luteal":
        return "Luteal Phase";
    }
  };

  const getPhaseColor = (phase: CycleData["phase"]) => {
    return PHASE_COLORS[phase];
  };

  const phaseColor = getPhaseColor(cycleData.phase);
  const centerX = WHEEL_SIZE / 2;
  const centerY = WHEEL_SIZE / 2;
  const lotusSize = WHEEL_SIZE * 0.55;

  const createRoundedPetal = (angle: number, length: number, width: number) => {
    const rad = (angle * Math.PI) / 180;
    const tipX = centerX + Math.cos(rad) * length;
    const tipY = centerY + Math.sin(rad) * length;
    
    const leftRad = ((angle - 90) * Math.PI) / 180;
    const rightRad = ((angle + 90) * Math.PI) / 180;
    
    const baseOffset = width * 0.3;
    const leftX = centerX + Math.cos(leftRad) * baseOffset;
    const leftY = centerY + Math.sin(leftRad) * baseOffset;
    const rightX = centerX + Math.cos(rightRad) * baseOffset;
    const rightY = centerY + Math.sin(rightRad) * baseOffset;
    
    const ctrl1X = centerX + Math.cos(rad) * (length * 0.5) + Math.cos(leftRad) * (width * 0.5);
    const ctrl1Y = centerY + Math.sin(rad) * (length * 0.5) + Math.sin(leftRad) * (width * 0.5);
    const ctrl2X = centerX + Math.cos(rad) * (length * 0.5) + Math.cos(rightRad) * (width * 0.5);
    const ctrl2Y = centerY + Math.sin(rad) * (length * 0.5) + Math.sin(rightRad) * (width * 0.5);

    return `M ${leftX} ${leftY} 
            Q ${ctrl1X} ${ctrl1Y} ${tipX} ${tipY}
            Q ${ctrl2X} ${ctrl2Y} ${rightX} ${rightY} 
            Z`;
  };

  const petalLength = lotusSize * 0.45;
  const petalWidth = lotusSize * 0.25;

  const petals = [
    { angle: -90, scale: 1, opacity: 1 },
    { angle: -50, scale: 0.8, opacity: 0.7 },
    { angle: -130, scale: 0.8, opacity: 0.7 },
    { angle: 30, scale: 0.65, opacity: 0.5 },
    { angle: 150, scale: 0.65, opacity: 0.5 },
  ];

  const progress = cycleData.currentDay / cycleData.cycleLength;
  const progressRadius = WHEEL_SIZE * 0.46;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.lotusContainer, breatheStyle]}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={progressRadius}
            fill="none"
            stroke={phaseColor}
            strokeOpacity={0.2}
            strokeWidth={6}
          />
          
          <Circle
            cx={centerX}
            cy={centerY}
            r={progressRadius}
            fill="none"
            stroke={phaseColor}
            strokeOpacity={0.6}
            strokeWidth={6}
            strokeDasharray={`${progress * 2 * Math.PI * progressRadius} ${2 * Math.PI * progressRadius}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />

          {petals.map((petal, index) => (
            <Path
              key={index}
              d={createRoundedPetal(petal.angle, petalLength * petal.scale, petalWidth * petal.scale)}
              fill={phaseColor}
              opacity={petal.opacity}
            />
          ))}

          <Circle
            cx={centerX}
            cy={centerY}
            r={lotusSize * 0.1}
            fill={phaseColor}
            opacity={0.8}
          />
        </Svg>

        <View style={styles.centerContent}>
          <ThemedText style={[styles.dayNumber, { color: theme.text }]}>
            {cycleData.currentDay}
          </ThemedText>
          <ThemedText style={[styles.dayLabel, { color: "#6B6B6B" }]}>
            DAY OF CYCLE
          </ThemedText>
        </View>
      </Animated.View>

      <View style={[styles.phaseLabel, { backgroundColor: phaseColor + "30" }]}>
        <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
        <ThemedText type="body" style={[styles.phaseText, { color: phaseColor }]}>
          {getPhaseLabel(cycleData.phase)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.xl,
  },
  lotusContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 52,
    fontWeight: "700",
    lineHeight: 58,
    fontFamily: "Nunito_700Bold",
  },
  dayLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: "Nunito_400Regular",
  },
  phaseLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    fontWeight: "600",
  },
});
