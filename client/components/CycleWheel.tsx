import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CycleData } from "@/lib/storage";

interface CycleWheelProps {
  cycleData: CycleData;
}

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width - Spacing["4xl"] * 2, 280);
const STROKE_WIDTH = 24;
const RADIUS = (WHEEL_SIZE - STROKE_WIDTH) / 2;
const CENTER = WHEEL_SIZE / 2;

export function CycleWheel({ cycleData }: CycleWheelProps) {
  const { theme } = useTheme();
  const circumference = 2 * Math.PI * RADIUS;

  const getPhaseColor = (phase: CycleData["phase"]) => {
    switch (phase) {
      case "menstrual":
        return theme.phaseMenstrual;
      case "follicular":
        return theme.phaseFollicular;
      case "ovulation":
        return theme.phaseOvulation;
      case "luteal":
        return theme.phaseLuteal;
      default:
        return theme.primary;
    }
  };

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
      default:
        return "Cycle Phase";
    }
  };

  const progress = cycleData.currentDay / cycleData.cycleLength;
  const strokeDashoffset = circumference * (1 - progress);

  const phaseColor = getPhaseColor(cycleData.phase);

  const menstrualEnd = cycleData.periodLength / cycleData.cycleLength;
  const follicularEnd = (cycleData.cycleLength - 14) / cycleData.cycleLength;
  const ovulationEnd = (cycleData.cycleLength - 12) / cycleData.cycleLength;

  return (
    <View style={styles.container}>
      <View style={styles.wheelContainer}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
          <Defs>
            <LinearGradient id="menstrualGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.phaseMenstrual} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.phaseMenstrual} stopOpacity="0.7" />
            </LinearGradient>
            <LinearGradient id="follicularGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.phaseFollicular} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.phaseFollicular} stopOpacity="0.7" />
            </LinearGradient>
            <LinearGradient id="ovulationGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.phaseOvulation} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.phaseOvulation} stopOpacity="0.7" />
            </LinearGradient>
            <LinearGradient id="lutealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={theme.phaseLuteal} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.phaseLuteal} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={theme.backgroundSecondary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={theme.phaseMenstrual}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${circumference * menstrualEnd} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            opacity={0.3}
          />

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={theme.phaseFollicular}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${circumference * (follicularEnd - menstrualEnd)} ${circumference}`}
            strokeDashoffset={-circumference * menstrualEnd}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            opacity={0.3}
          />

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={theme.phaseOvulation}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${circumference * (ovulationEnd - follicularEnd)} ${circumference}`}
            strokeDashoffset={-circumference * follicularEnd}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            opacity={0.3}
          />

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={theme.phaseLuteal}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${circumference * (1 - ovulationEnd)} ${circumference}`}
            strokeDashoffset={-circumference * ovulationEnd}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            opacity={0.3}
          />

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={phaseColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </Svg>

        <View style={styles.centerContent}>
          <ThemedText type="h1" style={[styles.dayNumber, { color: phaseColor }]}>
            {cycleData.currentDay}
          </ThemedText>
          <ThemedText type="small" style={styles.dayLabel}>
            Day of Cycle
          </ThemedText>
        </View>
      </View>

      <View style={[styles.phaseLabel, { backgroundColor: phaseColor + "20" }]}>
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
    gap: Spacing.lg,
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 56,
    lineHeight: 64,
  },
  dayLabel: {
    opacity: 0.7,
    marginTop: -Spacing.xs,
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
