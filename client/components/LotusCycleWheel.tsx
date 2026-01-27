import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop, Ellipse } from "react-native-svg";

import { ThemedText } from "./ThemedText";
import { CyclePhase, PHASE_INFO } from "./Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

const DUSTY_ROSE = "#D4A99A";
const DUSTY_ROSE_LIGHT = "#F5E8E4";
const SAGE = "#B8C4B8";
const GOLD = "#C9A86C";
const LAVENDER = "#C8C0D0";
const TERRACOTTA = "#D4A090";
const CREAM = "#FAF6F3";

interface LotusCycleWheelProps {
  currentDay: number;
  cycleLength: number;
  phase: CyclePhase;
  ovulationDay?: number;
  periodLength?: number;
}

const getPhaseColor = (phase: CyclePhase): string => {
  switch (phase) {
    case "menstrual":
      return TERRACOTTA;
    case "follicular":
      return SAGE;
    case "ovulation":
      return GOLD;
    case "luteal":
      return LAVENDER;
  }
};

const getPhaseForDay = (
  day: number,
  cycleLength: number,
  ovulationDay: number,
  periodLength: number
): CyclePhase => {
  if (day <= periodLength) return "menstrual";
  if (day < ovulationDay - 2) return "follicular";
  if (day <= ovulationDay + 1) return "ovulation";
  return "luteal";
};

export function LotusCycleWheel({
  currentDay,
  cycleLength,
  phase,
  ovulationDay = 14,
  periodLength = 5,
}: LotusCycleWheelProps) {
  const { theme } = useTheme();
  const phaseInfo = PHASE_INFO[phase];
  const phaseColor = getPhaseColor(phase);
  
  const size = 280;
  const center = size / 2;
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius - 35;
  const lotusRadius = innerRadius - 15;

  const createPetalPath = (
    cx: number,
    cy: number,
    day: number,
    dayPhase: CyclePhase,
    isCurrentDay: boolean
  ): string => {
    const anglePerDay = (2 * Math.PI) / cycleLength;
    const angle = anglePerDay * (day - 1) - Math.PI / 2;
    
    const baseRadius = innerRadius + 5;
    let petalLength = 22;
    let petalWidth = 6;
    
    if (dayPhase === "ovulation") {
      petalLength = 30;
      petalWidth = 10;
    } else if (dayPhase === "menstrual") {
      petalLength = 18;
      petalWidth = 5;
    } else if (dayPhase === "follicular") {
      petalLength = 24;
      petalWidth = 7;
    } else {
      petalLength = 20;
      petalWidth = 6;
    }
    
    if (isCurrentDay) {
      petalLength += 6;
      petalWidth += 2;
    }

    const baseX = cx + Math.cos(angle) * baseRadius;
    const baseY = cy + Math.sin(angle) * baseRadius;
    const tipX = cx + Math.cos(angle) * (baseRadius + petalLength);
    const tipY = cy + Math.sin(angle) * (baseRadius + petalLength);
    
    const perpAngle = angle + Math.PI / 2;
    const leftX = baseX + Math.cos(perpAngle) * petalWidth / 2;
    const leftY = baseY + Math.sin(perpAngle) * petalWidth / 2;
    const rightX = baseX - Math.cos(perpAngle) * petalWidth / 2;
    const rightY = baseY - Math.sin(perpAngle) * petalWidth / 2;
    
    const midRadius = baseRadius + petalLength * 0.6;
    const ctrlLeftX = cx + Math.cos(angle) * midRadius + Math.cos(perpAngle) * petalWidth * 0.8;
    const ctrlLeftY = cy + Math.sin(angle) * midRadius + Math.sin(perpAngle) * petalWidth * 0.8;
    const ctrlRightX = cx + Math.cos(angle) * midRadius - Math.cos(perpAngle) * petalWidth * 0.8;
    const ctrlRightY = cy + Math.sin(angle) * midRadius - Math.sin(perpAngle) * petalWidth * 0.8;

    return `M${leftX} ${leftY} Q${ctrlLeftX} ${ctrlLeftY} ${tipX} ${tipY} Q${ctrlRightX} ${ctrlRightY} ${rightX} ${rightY} Z`;
  };

  const renderCentralLotus = () => {
    const lx = center;
    const ly = center;
    const petalCount = phase === "ovulation" ? 8 : phase === "follicular" ? 6 : phase === "luteal" ? 6 : 4;
    const petalLength = phase === "ovulation" ? lotusRadius * 0.7 : phase === "menstrual" ? lotusRadius * 0.5 : lotusRadius * 0.6;
    
    const petals = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * 2 * Math.PI - Math.PI / 2;
      const tipX = lx + Math.cos(angle) * petalLength;
      const tipY = ly + Math.sin(angle) * petalLength;
      const perpAngle = angle + Math.PI / 2;
      const width = petalLength * 0.35;
      
      const leftX = lx + Math.cos(perpAngle) * width * 0.3;
      const leftY = ly + Math.sin(perpAngle) * width * 0.3;
      const rightX = lx - Math.cos(perpAngle) * width * 0.3;
      const rightY = ly - Math.sin(perpAngle) * width * 0.3;
      
      const ctrlLeftX = lx + Math.cos(angle) * petalLength * 0.5 + Math.cos(perpAngle) * width;
      const ctrlLeftY = ly + Math.sin(angle) * petalLength * 0.5 + Math.sin(perpAngle) * width;
      const ctrlRightX = lx + Math.cos(angle) * petalLength * 0.5 - Math.cos(perpAngle) * width;
      const ctrlRightY = ly + Math.sin(angle) * petalLength * 0.5 - Math.sin(perpAngle) * width;
      
      const path = `M${leftX} ${leftY} Q${ctrlLeftX} ${ctrlLeftY} ${tipX} ${tipY} Q${ctrlRightX} ${ctrlRightY} ${rightX} ${rightY} Z`;
      
      petals.push(
        <Path
          key={`lotus-petal-${i}`}
          d={path}
          fill={`${phaseColor}40`}
          stroke={phaseColor}
          strokeWidth={1}
        />
      );
    }
    
    return (
      <G>
        <Circle
          cx={lx}
          cy={ly}
          r={lotusRadius}
          fill={CREAM}
        />
        {petals}
        <Circle
          cx={lx}
          cy={ly}
          r={12}
          fill={`${phaseColor}60`}
        />
      </G>
    );
  };

  const renderDayPetals = () => {
    const petals = [];
    
    for (let day = 1; day <= cycleLength; day++) {
      const dayPhase = getPhaseForDay(day, cycleLength, ovulationDay, periodLength);
      const isCurrentDay = day === currentDay;
      const color = getPhaseColor(dayPhase);
      
      const path = createPetalPath(center, center, day, dayPhase, isCurrentDay);
      
      petals.push(
        <Path
          key={`petal-${day}`}
          d={path}
          fill={isCurrentDay ? color : `${color}70`}
          stroke={isCurrentDay ? "#3A3530" : color}
          strokeWidth={isCurrentDay ? 1.5 : 0.5}
        />
      );
    }
    
    return <G>{petals}</G>;
  };

  const phaseName = phase === "ovulation" ? "Ovulatory Phase" : `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={DUSTY_ROSE_LIGHT} />
            <Stop offset="100%" stopColor={CREAM} />
          </LinearGradient>
        </Defs>
        
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="url(#bgGradient)"
          stroke={DUSTY_ROSE}
          strokeWidth={1}
          opacity={0.5}
        />
        
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill={CREAM}
          stroke={`${DUSTY_ROSE}40`}
          strokeWidth={1}
        />
        
        {renderDayPetals()}
        
        {renderCentralLotus()}
      </Svg>
      
      <View style={styles.infoContainer}>
        <View style={styles.dayBadge}>
          <ThemedText style={[styles.dayLabel, { color: theme.textSecondary }]}>
            DAY
          </ThemedText>
          <ThemedText style={[styles.dayNumber, { color: phaseColor }]}>
            {currentDay}
          </ThemedText>
          <ThemedText style={[styles.cycleLength, { color: theme.textSecondary }]}>
            of {cycleLength}
          </ThemedText>
        </View>
        
        <ThemedText style={[styles.phaseName, { color: theme.text }]}>
          {phaseName}
        </ThemedText>
        <ThemedText style={[styles.phaseTitle, { color: phaseColor }]}>
          {phaseInfo.title}
        </ThemedText>
        <ThemedText style={[styles.phaseSubtitle, { color: theme.textSecondary }]}>
          {phaseInfo.subtitle}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: 4,
  },
  dayBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  dayLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    letterSpacing: 2,
  },
  dayNumber: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    lineHeight: 32,
  },
  cycleLength: {
    fontFamily: "Poppins_300Light",
    fontSize: 14,
  },
  phaseName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  phaseTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  phaseSubtitle: {
    fontFamily: "Poppins_300Light_Italic",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
  },
});
