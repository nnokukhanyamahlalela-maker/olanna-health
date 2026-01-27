import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "./ThemedText";
import { Lotus, CyclePhase, PHASE_INFO, PHASE_COLORS, PHASE_GRADIENTS, PHASE_BG_COLORS } from "./Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, PhaseColors } from "@/constants/theme";

const PINK_PRIMARY = "#F6BFD3";
const PINK_SOFT = "#FBE3EC";
const BG_MAIN = "#FFF7FA";
const CHARCOAL = "#3A2F35";

interface LotusCycleWheelProps {
  currentDay: number;
  cycleLength: number;
  phase: CyclePhase;
  ovulationDay?: number;
  periodLength?: number;
}

const getPhaseColor = (phase: CyclePhase): string => {
  return PHASE_COLORS[phase];
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
  const phaseBgColor = PHASE_BG_COLORS[phase];
  
  const size = 280;
  const center = size / 2;
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius - 35;
  const lotusSize = innerRadius * 1.4;

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
          stroke={isCurrentDay ? CHARCOAL : color}
          strokeWidth={isCurrentDay ? 1.5 : 0.5}
        />
      );
    }
    
    return <G>{petals}</G>;
  };

  const phaseName = phase === "ovulation" ? "Ovulatory Phase" : `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`;

  return (
    <View style={styles.container}>
      <View style={styles.wheelContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <SvgLinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={PINK_SOFT} />
              <Stop offset="100%" stopColor={BG_MAIN} />
            </SvgLinearGradient>
          </Defs>
          
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="url(#bgGradient)"
            stroke={PINK_PRIMARY}
            strokeWidth={1}
            opacity={0.5}
          />
          
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill={BG_MAIN}
            stroke={`${PINK_PRIMARY}40`}
            strokeWidth={1}
          />
          
          {renderDayPetals()}
        </Svg>
        
        <View style={styles.lotusContainer}>
          <LinearGradient 
            colors={PHASE_GRADIENTS[phase] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.lotusBg, 
              { 
                width: lotusSize * 0.75,
                height: lotusSize * 0.75,
                borderRadius: lotusSize * 0.375,
              }
            ]} 
          />
          <Lotus 
            phase={phase} 
            size={lotusSize} 
            strokeColor={CHARCOAL}
            strokeWidth={1}
          />
        </View>
      </View>
      
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
  wheelContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  lotusContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  lotusBg: {
    position: "absolute",
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
