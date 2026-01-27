import React from "react";
import { View, StyleSheet } from "react-native";

import { Lotus, CyclePhase, PHASE_INFO } from "./Lotus";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

const DUSTY_ROSE = "#D4A99A";
const DUSTY_ROSE_LIGHT = "#F5E8E4";

interface LotusCycleCardProps {
  phase: CyclePhase;
  currentDay: number;
  cycleLength: number;
  size?: number;
}

export function LotusCycleCard({ 
  phase, 
  currentDay,
  cycleLength,
  size = 160 
}: LotusCycleCardProps) {
  const { theme } = useTheme();
  const phaseInfo = PHASE_INFO[phase];
  
  const phaseName = phase === "ovulation" ? "Ovulatory Phase" : `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`;

  return (
    <View style={styles.container}>
      <View style={[styles.circleBackground, { backgroundColor: DUSTY_ROSE_LIGHT }]}>
        <Lotus phase={phase} size={size * 0.7} strokeColor="#3A3530" strokeWidth={1.2} />
      </View>
      
      <View style={styles.textContainer}>
        <ThemedText style={[styles.phaseName, { color: theme.text }]}>
          {phaseName}
        </ThemedText>
        <ThemedText style={[styles.phaseTitle, { color: DUSTY_ROSE }]}>
          {phaseInfo.title}
        </ThemedText>
        <ThemedText style={[styles.phaseSubtitle, { color: theme.textSecondary }]}>
          {phaseInfo.subtitle}
        </ThemedText>
      </View>
      
      <View style={[styles.dayIndicator, { borderColor: theme.border }]}>
        <ThemedText style={[styles.dayLabel, { color: theme.textSecondary }]}>
          CYCLE DAY
        </ThemedText>
        <ThemedText style={[styles.dayNumber, { color: theme.text }]}>
          {currentDay}
        </ThemedText>
        <ThemedText style={[styles.dayTotal, { color: theme.textSecondary }]}>
          of {cycleLength}
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
  circleBackground: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
    gap: 4,
  },
  phaseName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  phaseTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  phaseSubtitle: {
    fontFamily: "Poppins_300Light_Italic",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
  },
  dayIndicator: {
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    width: "60%",
    marginTop: Spacing.sm,
  },
  dayLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  dayNumber: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 36,
    lineHeight: 42,
  },
  dayTotal: {
    fontFamily: "Poppins_300Light",
    fontSize: 13,
  },
});
