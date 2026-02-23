import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { phaseConfig, PHASE_ORDER, Phase } from "@/constants/phaseConfig";
import { Fonts } from "@/constants/theme";

interface PhaseChipProps {
  phase: Phase;
  isActive: boolean;
}

function PhaseChip({ phase, isActive }: PhaseChipProps) {
  const config = phaseConfig[phase];
  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    droplet: "droplet",
    "trending-up": "trending-up",
    sun: "sun",
    moon: "moon",
  };

  return (
    <View style={[styles.chip, isActive ? styles.chipActive : null]}>
      <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
        <Feather
          name={iconMap[config.iconName] || "circle"}
          size={16}
          color={config.labelColor}
        />
      </View>
      <View style={styles.chipText}>
        <Text style={styles.chipName}>{config.label}</Text>
        <Text style={styles.chipTagline}>{config.tagline}</Text>
      </View>
    </View>
  );
}

interface PhaseCardProps {
  currentPhase: Phase;
}

export function PhaseCard({ currentPhase }: PhaseCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>The Lotus Cycle</Text>
      <View style={styles.grid}>
        {PHASE_ORDER.map((phase) => (
          <PhaseChip
            key={phase}
            phase={phase}
            isActive={phase === currentPhase}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: "#3A2F35",
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 10,
    width: "48%",
    flexGrow: 1,
    flexBasis: "45%",
    gap: 10,
  },
  chipActive: {
    backgroundColor: "#F5F0FA",
    borderWidth: 1,
    borderColor: "rgba(180,160,210,0.3)",
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    flex: 1,
  },
  chipName: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: "#3A2F35",
    marginBottom: 1,
  },
  chipTagline: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: "#7A6A73",
    lineHeight: 14,
  },
});
