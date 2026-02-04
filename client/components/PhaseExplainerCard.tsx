/**
 * PhaseExplainerCard Component
 * 
 * A clean, iOS-friendly card explaining what happens during each cycle phase.
 * Uses concise bullet points instead of paragraphs for easy scanning.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { Phase, phaseConfig } from "@/constants/phaseConfig";
import { Spacing } from "@/constants/spacing";

type PhaseId = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface PhaseContent {
  phaseName: string;
  whatsHappening: string[];
  youMightNotice: string[];
  tryThis?: string;
}

const phaseContent: Record<PhaseId, PhaseContent> = {
  menstrual: {
    phaseName: "Menstrual",
    whatsHappening: [
      "Uterine lining sheds as your period begins",
      "Hormone levels are at their lowest",
      "Your body is in a natural rest state",
    ],
    youMightNotice: [
      "Lower energy and desire for rest",
      "Cramps, bloating, or mild fatigue",
      "A need for comfort and warmth",
    ],
    tryThis: "Gentle stretching and iron-rich foods to support your body.",
  },
  follicular: {
    phaseName: "Follicular",
    whatsHappening: [
      "Oestrogen rises as follicles develop",
      "Your body prepares to release an egg",
      "Uterine lining begins rebuilding",
    ],
    youMightNotice: [
      "Rising energy and motivation",
      "Clearer skin and better mood",
      "Increased creativity and focus",
    ],
    tryThis: "Start new projects—your brain is primed for planning.",
  },
  ovulatory: {
    phaseName: "Ovulation",
    whatsHappening: [
      "An egg is released from the ovary",
      "Oestrogen peaks, then drops",
      "This is your fertile window",
    ],
    youMightNotice: [
      "Peak energy and confidence",
      "Heightened senses and libido",
      "Clear, stretchy cervical mucus",
    ],
    tryThis: "Social activities and important conversations feel natural.",
  },
  luteal: {
    phaseName: "Luteal",
    whatsHappening: [
      "Progesterone rises to prepare for pregnancy",
      "If no pregnancy, hormones drop",
      "Your body shifts toward rest mode",
    ],
    youMightNotice: [
      "PMS symptoms like bloating or cravings",
      "Mood changes or feeling sensitive",
      "Energy gradually decreasing",
    ],
    tryThis: "Complex carbs and calming activities can ease symptoms.",
  },
};

const phaseIdToPhase: Record<PhaseId, Phase> = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulatory: "ovulation",
  luteal: "luteal",
};

interface PhaseExplainerCardProps {
  phaseId: PhaseId;
}

export function PhaseExplainerCard({ phaseId }: PhaseExplainerCardProps) {
  const content = phaseContent[phaseId];
  const phase = phaseIdToPhase[phaseId];
  const config = phaseConfig[phase];

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={40} tint="light" style={styles.card}>
        <View style={styles.cardInner}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>This phase</ThemedText>
            <View style={[styles.phaseBadge, { backgroundColor: config.accentColor + "30" }]}>
              <ThemedText style={[styles.phaseCaption, { color: config.labelColor }]}>
                {content.phaseName}
              </ThemedText>
            </View>
          </View>

          {/* What's happening */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>What's happening</ThemedText>
            {content.whatsHappening.map((item, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: config.accentColor }]} />
                <ThemedText style={styles.bulletText}>{item}</ThemedText>
              </View>
            ))}
          </View>

          {/* You might notice */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>You might notice</ThemedText>
            {content.youMightNotice.map((item, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: config.accentColor }]} />
                <ThemedText style={styles.bulletText}>{item}</ThemedText>
              </View>
            ))}
          </View>

          {/* Try this */}
          {content.tryThis ? (
            <View style={[styles.tryThisContainer, { backgroundColor: config.accentColor + "15" }]}>
              <ThemedText style={[styles.tryThisLabel, { color: config.labelColor }]}>
                Try this
              </ThemedText>
              <ThemedText style={styles.tryThisText}>{content.tryThis}</ThemedText>
            </View>
          ) : null}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
  },
  cardInner: {
    padding: Spacing.lg,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: "rgba(60,50,70,0.95)",
  },
  phaseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  phaseCaption: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "rgba(60,50,70,0.85)",
    marginBottom: Spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(60,50,70,0.8)",
    lineHeight: 20,
  },
  tryThisContainer: {
    padding: Spacing.md,
    borderRadius: 16,
  },
  tryThisLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tryThisText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(60,50,70,0.85)",
    lineHeight: 20,
  },
});

export default PhaseExplainerCard;
