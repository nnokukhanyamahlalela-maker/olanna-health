import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import Svg, { Circle, Path, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import {
  Phase,
  getPhaseForDay,
  PHASE_ORDER,
  phaseConfig,
} from "@/constants/phaseConfig";
import { Fonts } from "@/constants/theme";
import { neutral } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CYCLE_LENGTH = 28;
const CURRENT_DAY = 12;

const PHASE_CIRCLE_COLORS: Record<Phase, string> = {
  menstrual: "#E8588D",
  follicular: "#EF7B2C",
  ovulation: "#F5B06B",
  luteal: "#C9A2D7",
};

const PHASE_LABEL_COLORS: Record<Phase, string> = {
  menstrual: "#D6456F",
  follicular: "#E06A1B",
  ovulation: "#E09940",
  luteal: "#A87ABD",
};

function LotusIconSvg({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const petalH = size * 0.32;
  const petalW = size * 0.18;

  const petal = (angle: number, scale: number) => {
    const rad = (angle * Math.PI) / 180;
    const tipX = cx + Math.cos(rad) * petalH * scale;
    const tipY = cy + Math.sin(rad) * petalH * scale;
    const perpRad = ((angle + 90) * Math.PI) / 180;
    const bw = petalW * scale * 0.3;
    const lx = cx + Math.cos(perpRad) * bw;
    const ly = cy + Math.sin(perpRad) * bw;
    const rx = cx - Math.cos(perpRad) * bw;
    const ry = cy - Math.sin(perpRad) * bw;
    const cw = petalW * scale * 0.6;
    const c1x = cx + Math.cos(rad) * petalH * scale * 0.5 + Math.cos(perpRad) * cw;
    const c1y = cy + Math.sin(rad) * petalH * scale * 0.5 + Math.sin(perpRad) * cw;
    const c2x = cx + Math.cos(rad) * petalH * scale * 0.5 - Math.cos(perpRad) * cw;
    const c2y = cy + Math.sin(rad) * petalH * scale * 0.5 - Math.sin(perpRad) * cw;
    return `M ${lx} ${ly} Q ${c1x} ${c1y} ${tipX} ${tipY} Q ${c2x} ${c2y} ${rx} ${ry} Z`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={petal(-90, 1)} fill={color} opacity={1} />
      <Path d={petal(-45, 0.88)} fill={color} opacity={0.85} />
      <Path d={petal(-135, 0.88)} fill={color} opacity={0.85} />
      <Path d={petal(0, 0.72)} fill={color} opacity={0.7} />
      <Path d={petal(-180, 0.72)} fill={color} opacity={0.7} />
      <Circle cx={cx} cy={cy} r={size * 0.06} fill={color} opacity={0.9} />
    </Svg>
  );
}

function PhaseGridCard({ phase }: { phase: Phase }) {
  const config = phaseConfig[phase];
  const circleColor = PHASE_CIRCLE_COLORS[phase];
  const labelColor = PHASE_LABEL_COLORS[phase];
  const circleSize = (SCREEN_WIDTH - 80) / 2 - 16;
  const iconSize = circleSize * 0.55;

  return (
    <View style={styles.phaseCardItem}>
      <View style={[styles.phaseCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2, backgroundColor: circleColor }]}>
        <LotusIconSvg size={iconSize} color="#FFFFFF" />
      </View>
      <Text style={[styles.phaseLabel, { color: labelColor }]}>{config.label}</Text>
      <Text style={styles.phaseSubtitle}>{config.subtitle}</Text>
    </View>
  );
}

function ArcWheel({
  cycleLength,
  currentDay,
}: {
  cycleLength: number;
  currentDay: number;
}) {
  const arcWidth = SCREEN_WIDTH - 40;
  const arcHeight = arcWidth * 0.58;
  const svgHeight = arcHeight + 20;
  const svgWidth = arcWidth + 20;
  const cx = svgWidth / 2;
  const cy = svgHeight - 10;
  const radius = arcWidth * 0.42;

  const numDots = 14;
  const startAngle = 190;
  const endAngle = 350;
  const angleRange = endAngle - startAngle;

  const getPhaseColorForPosition = (index: number): string => {
    const dayInCycle = Math.round((index / (numDots - 1)) * (cycleLength - 1)) + 1;
    const p = getPhaseForDay(dayInCycle, cycleLength);
    return PHASE_CIRCLE_COLORS[p];
  };

  const dotRadius = 14;
  const currentDotIndex = Math.round(((currentDay - 1) / (cycleLength - 1)) * (numDots - 1));

  return (
    <View style={styles.arcContainer}>
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <Path
          d={describeArc(cx, cy, radius, startAngle, endAngle)}
          stroke="rgba(0,0,0,0.04)"
          strokeWidth={dotRadius * 2 + 8}
          fill="none"
          strokeLinecap="round"
        />

        {Array.from({ length: numDots }).map((_, i) => {
          const angle = startAngle + (i / (numDots - 1)) * angleRange;
          const rad = (angle * Math.PI) / 180;
          const x = cx + radius * Math.cos(rad);
          const y = cy + radius * Math.sin(rad);
          const color = getPhaseColorForPosition(i);
          const isCurrentDay = i === currentDotIndex;
          const r = isCurrentDay ? dotRadius + 3 : dotRadius;

          return (
            <G key={i}>
              {isCurrentDay ? (
                <Circle cx={x} cy={y} r={r + 3} fill="rgba(255,255,255,0.7)" />
              ) : null}
              <Circle cx={x} cy={y} r={r} fill={color} />
              <LotusIconInArc cx={x} cy={y} size={r * 1.1} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function LotusIconInArc({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const petalH = size * 0.6;
  const petalW = size * 0.35;

  const petal = (angle: number, scale: number) => {
    const rad = (angle * Math.PI) / 180;
    const tipX = cx + Math.cos(rad) * petalH * scale;
    const tipY = cy + Math.sin(rad) * petalH * scale;
    const perpRad = ((angle + 90) * Math.PI) / 180;
    const bw = petalW * scale * 0.25;
    const lx = cx + Math.cos(perpRad) * bw;
    const ly = cy + Math.sin(perpRad) * bw;
    const rx = cx - Math.cos(perpRad) * bw;
    const ry = cy - Math.sin(perpRad) * bw;
    const cw = petalW * scale * 0.55;
    const c1x = cx + Math.cos(rad) * petalH * scale * 0.5 + Math.cos(perpRad) * cw;
    const c1y = cy + Math.sin(rad) * petalH * scale * 0.5 + Math.sin(perpRad) * cw;
    const c2x = cx + Math.cos(rad) * petalH * scale * 0.5 - Math.cos(perpRad) * cw;
    const c2y = cy + Math.sin(rad) * petalH * scale * 0.5 - Math.sin(perpRad) * cw;
    return `M ${lx} ${ly} Q ${c1x} ${c1y} ${tipX} ${tipY} Q ${c2x} ${c2y} ${rx} ${ry} Z`;
  };

  return (
    <G>
      <Path d={petal(-90, 1)} fill="rgba(255,255,255,0.95)" />
      <Path d={petal(-50, 0.8)} fill="rgba(255,255,255,0.8)" />
      <Path d={petal(-130, 0.8)} fill="rgba(255,255,255,0.8)" />
      <Path d={petal(-10, 0.6)} fill="rgba(255,255,255,0.65)" />
      <Path d={petal(-170, 0.6)} fill="rgba(255,255,255,0.65)" />
    </G>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export function CycleScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: tabBarHeight + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>The Lotus Cycle</Text>

        <View style={styles.phaseGrid}>
          {PHASE_ORDER.map((phase) => (
            <PhaseGridCard key={phase} phase={phase} />
          ))}
        </View>

        <ArcWheel cycleLength={CYCLE_LENGTH} currentDay={CURRENT_DAY} />

        <Text style={styles.dayText}>
          Day {CURRENT_DAY} of {CYCLE_LENGTH}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: neutral.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: neutral.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 24,
  },
  phaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  phaseCardItem: {
    width: (SCREEN_WIDTH - 80) / 2,
    alignItems: "center",
    marginBottom: 24,
  },
  phaseCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  phaseLabel: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  phaseSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: neutral.textSecondary,
    letterSpacing: 0.1,
  },
  arcContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  dayText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: neutral.textPrimary,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});

export default CycleScreen;
