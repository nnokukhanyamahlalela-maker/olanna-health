import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, G } from "react-native-svg";
import { phaseConfig, PHASE_ORDER, Phase } from "@/constants/phaseConfig";
import { Fonts } from "@/constants/theme";
import { neutral } from "@/constants/colors";

function LotusIcon({ variant, size = 48, color }: { variant: string; size?: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  if (variant === "bud") {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path
          d={`M ${cx} ${cy + r * 0.6} Q ${cx - r * 0.25} ${cy - r * 0.2} ${cx} ${cy - r * 0.8} Q ${cx + r * 0.25} ${cy - r * 0.2} ${cx} ${cy + r * 0.6} Z`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.6} L ${cx} ${cy + r}`}
          stroke={color}
          strokeWidth={1}
        />
      </Svg>
    );
  }

  if (variant === "rising") {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path
          d={`M ${cx} ${cy + r * 0.4} Q ${cx - r * 0.3} ${cy - r * 0.1} ${cx} ${cy - r * 0.7} Q ${cx + r * 0.3} ${cy - r * 0.1} ${cx} ${cy + r * 0.4} Z`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.3} Q ${cx - r * 0.6} ${cy - r * 0.1} ${cx - r * 0.5} ${cy - r * 0.55} Q ${cx - r * 0.15} ${cy - r * 0.3} ${cx} ${cy + r * 0.3} Z`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          opacity={0.7}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.3} Q ${cx + r * 0.6} ${cy - r * 0.1} ${cx + r * 0.5} ${cy - r * 0.55} Q ${cx + r * 0.15} ${cy - r * 0.3} ${cx} ${cy + r * 0.3} Z`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          opacity={0.7}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.4} L ${cx} ${cy + r}`}
          stroke={color}
          strokeWidth={1}
        />
      </Svg>
    );
  }

  if (variant === "bloom") {
    const petalCount = 6;
    const petals = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 360) / petalCount - 90;
      const rad = (angle * Math.PI) / 180;
      const tipX = cx + r * 0.8 * Math.cos(rad);
      const tipY = cy + r * 0.8 * Math.sin(rad);
      const cp1Angle = rad - 0.35;
      const cp2Angle = rad + 0.35;
      const cp1X = cx + r * 0.45 * Math.cos(cp1Angle);
      const cp1Y = cy + r * 0.45 * Math.sin(cp1Angle);
      const cp2X = cx + r * 0.45 * Math.cos(cp2Angle);
      const cp2Y = cy + r * 0.45 * Math.sin(cp2Angle);
      petals.push(
        <Path
          key={i}
          d={`M ${cx} ${cy} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${cx} ${cy} Z`}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
        />
      );
    }
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>{petals}</G>
        <Circle cx={cx} cy={cy} r={r * 0.15} fill="none" stroke={color} strokeWidth={1} />
      </Svg>
    );
  }

  const petalCount = 8;
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360) / petalCount - 90;
    const rad = (angle * Math.PI) / 180;
    const tipX = cx + r * 0.9 * Math.cos(rad);
    const tipY = cy + r * 0.9 * Math.sin(rad);
    const cp1Angle = rad - 0.3;
    const cp2Angle = rad + 0.3;
    const cp1X = cx + r * 0.5 * Math.cos(cp1Angle);
    const cp1Y = cy + r * 0.5 * Math.sin(cp1Angle);
    const cp2X = cx + r * 0.5 * Math.cos(cp2Angle);
    const cp2Y = cy + r * 0.5 * Math.sin(cp2Angle);
    petals.push(
      <Path
        key={i}
        d={`M ${cx} ${cy} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${cx} ${cy} Z`}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        opacity={i % 2 === 0 ? 1 : 0.6}
      />
    );
  }
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>{petals}</G>
      <Circle cx={cx} cy={cy} r={r * 0.12} fill="none" stroke={color} strokeWidth={1} />
    </Svg>
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
    <View style={styles.card}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: neutral.bgSecondary,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: neutral.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
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
