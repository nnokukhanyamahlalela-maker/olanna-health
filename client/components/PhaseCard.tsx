import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { phaseConfig, PHASE_ORDER, Phase } from "@/constants/phaseConfig";
import { Fonts } from "@/constants/theme";
import { neutral } from "@/constants/colors";
import { GlassSurface } from "@/components/GlassSurface";

type LotusVariant = "bud" | "rising" | "bloom" | "closing";

const LOTUS_IMAGES: Record<LotusVariant, any> = {
  bud: require("@/assets/images/lotus-menstrual.png"),
  rising: require("@/assets/images/lotus-follicular.png"),
  bloom: require("@/assets/images/lotus-ovulation.png"),
  closing: require("@/assets/images/lotus-luteal.png"),
};

function LotusIcon({ variant, size = 48 }: { variant: string; size?: number; color: string }) {
  return (
    <Image
      source={LOTUS_IMAGES[variant as LotusVariant]}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="contain"
    />
  );
}

interface PhaseItemProps {
  phase: Phase;
  isActive: boolean;
}

function PhaseItem({ phase, isActive }: PhaseItemProps) {
  const config = phaseConfig[phase];

  return (
    <View style={styles.phaseItem}>
      <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
        <View style={[styles.iconHalo, { shadowColor: config.color }]} />
        <LotusIcon variant={config.lotusVariant} size={48} color={config.labelColor} />
      </View>
      <Text style={[styles.phaseName, { color: config.labelColor }, isActive ? styles.phaseNameActive : null]}>
        {config.label}
      </Text>
      <Text style={styles.phaseTagline}>{config.tagline}</Text>
    </View>
  );
}

interface PhaseCardProps {
  currentPhase: Phase;
}

export function PhaseCard({ currentPhase }: PhaseCardProps) {
  return (
    <GlassSurface style={styles.card} padding={20} borderRadius={16}>
      <Text style={styles.cardTitle}>The Lotus Cycle</Text>
      <View style={styles.grid}>
        {PHASE_ORDER.map((phase) => (
          <PhaseItem
            key={phase}
            phase={phase}
            isActive={phase === currentPhase}
          />
        ))}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: neutral.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  phaseItem: {
    alignItems: "center",
    width: "45%",
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.45)",
  },
  iconHalo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 4,
  },
  phaseName: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  phaseNameActive: {
    fontFamily: Fonts.numericBold,
  },
  phaseTagline: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: neutral.textTertiary,
    textAlign: "center",
  },
});
