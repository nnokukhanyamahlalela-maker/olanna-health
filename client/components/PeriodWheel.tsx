import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Line, G, Text as SvgText } from "react-native-svg";

import { Lotus, CyclePhase } from "./Lotus";
import { ThemedText } from "./ThemedText";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(screenWidth - 48, 300);
const LOTUS_SIZE = WHEEL_SIZE * 0.35;

const DUSTY_ROSE = "#D4A99A";

interface PeriodWheelProps {
  currentDay: number;
  cycleLength: number;
  phase: CyclePhase;
  daysUntilPeriod: number;
  fertileWindow?: boolean;
}

const PHASES = [
  { name: "Menstrual", startDay: 1, endDay: 5, opacity: 0.9 },
  { name: "Follicular", startDay: 6, endDay: 13, opacity: 0.6 },
  { name: "Ovulation", startDay: 14, endDay: 16, opacity: 0.75 },
  { name: "Luteal", startDay: 17, endDay: 28, opacity: 0.45 },
];

function getPhaseLabel(phase: string): string {
  switch (phase) {
    case "menstrual":
      return "Menstrual Phase";
    case "follicular":
      return "Follicular Phase";
    case "ovulation":
      return "Fertile Window";
    case "luteal":
      return "Luteal Phase";
    case "late":
      return "Awaiting Your Cycle";
    default:
      return "";
  }
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    x,
    y,
    "Z",
  ].join(" ");
}

export function PeriodWheel({
  currentDay,
  cycleLength,
  phase,
  daysUntilPeriod,
  fertileWindow = false,
}: PeriodWheelProps) {
  const cx = WHEEL_SIZE / 2;
  const cy = WHEEL_SIZE / 2;
  const outerRadius = WHEEL_SIZE * 0.46;
  const innerRadius = WHEEL_SIZE * 0.32;

  const todayAngle = (currentDay / cycleLength) * 360;
  const todayPos = polarToCartesian(cx, cy, outerRadius + 8, todayAngle);
  const todayLineEnd = polarToCartesian(cx, cy, outerRadius - 5, todayAngle);

  const phaseLabel = fertileWindow ? "Fertile Window" : getPhaseLabel(phase);

  return (
    <View style={styles.container}>
      <View style={styles.wheelContainer}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          {PHASES.map((phaseData, index) => {
            const startAngle = ((phaseData.startDay - 1) / cycleLength) * 360;
            const endAngle = (phaseData.endDay / cycleLength) * 360;

            return (
              <Path
                key={index}
                d={describeArc(cx, cy, outerRadius, startAngle, endAngle)}
                fill={DUSTY_ROSE}
                fillOpacity={phaseData.opacity}
              />
            );
          })}

          <Circle cx={cx} cy={cy} r={innerRadius} fill="#FFFFFF" />

          <Circle
            cx={todayPos.x}
            cy={todayPos.y}
            r={6}
            fill={DUSTY_ROSE}
          />
          <Line
            x1={todayPos.x}
            y1={todayPos.y}
            x2={todayLineEnd.x}
            y2={todayLineEnd.y}
            stroke={DUSTY_ROSE}
            strokeWidth={2}
          />
        </Svg>

        <View style={styles.centerContent}>
          <Lotus phase={phase} size={LOTUS_SIZE} color={DUSTY_ROSE} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.dayText}>Day {currentDay}</ThemedText>
        <ThemedText style={styles.phaseText}>{phaseLabel}</ThemedText>
        <ThemedText style={styles.periodText}>
          Next period in {daysUntilPeriod} days
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
  infoContainer: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  dayText: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Fonts.numericBold,
    color: "#2C2C2C",
  },
  phaseText: {
    fontSize: 16,
    fontWeight: "500",
    color: DUSTY_ROSE,
  },
  periodText: {
    fontSize: 14,
    color: "#888888",
    marginTop: Spacing.xs,
  },
});
