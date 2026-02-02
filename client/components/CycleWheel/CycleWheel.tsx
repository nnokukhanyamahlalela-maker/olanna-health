/**
 * CycleWheel Component
 * 
 * A circular donut-style wheel showing the 4 menstrual cycle phases
 * using pure CSS conic-gradient with mask for the donut effect.
 * Includes a current day indicator dot positioned on the ring.
 */

import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Phase, phaseConfig, ringSegments } from "@/constants/phaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CycleWheelProps {
  phase: Phase;
  currentDay: number;
  cycleLength: number;
  size?: number;
  children?: React.ReactNode;
}

/**
 * Calculate position on the ring for the current day indicator
 */
function getIndicatorPosition(
  currentDay: number,
  cycleLength: number,
  size: number,
  strokeWidth: number
) {
  const angle = ((currentDay - 1) / cycleLength) * 360 - 90;
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const angleRad = (angle * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleRad) - 8,
    y: centerY + radius * Math.sin(angleRad) - 8,
  };
}

export function CycleWheel({
  phase,
  currentDay,
  cycleLength,
  size: propSize,
  children,
}: CycleWheelProps) {
  const size = propSize || Math.min(SCREEN_WIDTH - 80, 280);
  const strokeWidth = 18;
  const innerSize = size - strokeWidth * 2;

  const indicatorPos = getIndicatorPosition(currentDay, cycleLength, size, strokeWidth);
  const config = phaseConfig[phase];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer gradient ring using conic-gradient */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />

      {/* Inner mask to create donut effect */}
      <View
        style={[
          styles.innerMask,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      />

      {/* Current day indicator dot */}
      <View
        style={[
          styles.indicator,
          {
            left: indicatorPos.x,
            top: indicatorPos.y,
          },
        ]}
      >
        <View style={[styles.indicatorInner, { backgroundColor: config.accentColor }]} />
      </View>

      {/* Center content (children slot for lotus + text) */}
      <View style={styles.centerContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    backgroundColor: "#E8D0E0",
  },
  innerMask: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  indicator: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CycleWheel;
