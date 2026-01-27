import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { PeriodWheel } from "./PeriodWheel";
import { ThemedText } from "./ThemedText";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { CycleData } from "@/lib/storage";

const DUSTY_ROSE = "#D4A99A";

interface LotusWheelProps {
  cycleData: CycleData;
  showReminders?: boolean;
  onLogPeriod?: () => void;
}

export function LotusWheel({ cycleData, showReminders, onLogPeriod }: LotusWheelProps) {
  const daysUntilPeriod = cycleData.cycleLength - cycleData.currentDay + 1;
  const fertileWindow = cycleData.phase === "ovulation" || 
    (cycleData.currentDay >= 10 && cycleData.currentDay <= 16);

  return (
    <View style={styles.container}>
      <PeriodWheel
        currentDay={cycleData.currentDay}
        cycleLength={cycleData.cycleLength}
        phase={cycleData.phase}
        daysUntilPeriod={daysUntilPeriod > 0 ? daysUntilPeriod : cycleData.cycleLength}
        fertileWindow={fertileWindow}
      />

      {onLogPeriod ? (
        <Pressable
          style={styles.logButton}
          onPress={onLogPeriod}
        >
          <ThemedText style={styles.logButtonText}>Log Period</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.xl,
  },
  logButton: {
    backgroundColor: DUSTY_ROSE,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  logButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.bodyMedium,
  },
});
