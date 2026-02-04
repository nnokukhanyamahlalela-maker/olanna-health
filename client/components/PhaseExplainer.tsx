/**
 * PhaseExplainer Component
 * 
 * Displays educational content about what happens during each phase
 * of the menstrual cycle. Content is evidence-based and culturally
 * appropriate for the target audience.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Phase, phaseConfig } from "@/constants/phaseConfig";
import { Spacing } from "@/constants/spacing";

interface PhaseContent {
  title: string;
  duration: string;
  hormones: string;
  body: string;
  energy: string;
  tips: string[];
}

const phaseEducation: Record<Phase, PhaseContent> = {
  menstrual: {
    title: "Menstrual Phase",
    duration: "Days 1-5",
    hormones: "Oestrogen and progesterone are at their lowest levels, triggering the shedding of the uterine lining.",
    body: "Your body is releasing the uterine lining it built up during the last cycle. You may experience cramping, bloating, and fatigue as your body does this important work.",
    energy: "Energy tends to be lower during this phase. Listen to your body's need for rest and gentle movement.",
    tips: [
      "Stay hydrated and nourish yourself with iron-rich foods",
      "Gentle stretching or walks can help ease discomfort",
      "Prioritize rest and quality sleep",
    ],
  },
  follicular: {
    title: "Follicular Phase",
    duration: "Days 6-13",
    hormones: "Oestrogen levels begin rising, stimulating the growth of follicles in your ovaries. One follicle will become the dominant egg.",
    body: "As oestrogen increases, you may notice clearer skin, increased cervical mucus, and a boost in mood. Your body is preparing for potential ovulation.",
    energy: "Energy levels typically rise during this phase. Many women feel more creative, focused, and motivated.",
    tips: [
      "Great time to start new projects or tackle challenging tasks",
      "Your body responds well to higher-intensity exercise",
      "Social activities and planning feel more natural now",
    ],
  },
  ovulation: {
    title: "Ovulation Phase",
    duration: "Days 14-16",
    hormones: "A surge in luteinizing hormone (LH) triggers the release of a mature egg from your ovary. Oestrogen peaks just before ovulation.",
    body: "The egg travels down the fallopian tube. You may notice increased cervical mucus that's clear and stretchy, mild pelvic discomfort, and heightened senses.",
    energy: "This is typically when energy, confidence, and mood are at their highest. Many women feel most social and communicative.",
    tips: [
      "This is your fertile window if you're trying to conceive",
      "Great time for important conversations and connections",
      "High-intensity workouts feel most natural now",
    ],
  },
  luteal: {
    title: "Luteal Phase",
    duration: "Days 17-28",
    hormones: "Progesterone rises to prepare the uterine lining for a potential pregnancy. If no pregnancy occurs, hormone levels drop, triggering your next period.",
    body: "You may experience premenstrual symptoms like breast tenderness, mood changes, food cravings, or bloating as hormones fluctuate. This is completely normal.",
    energy: "Energy gradually decreases as the phase progresses. You may feel more introspective and prefer quieter activities.",
    tips: [
      "Be gentle with yourself if PMS symptoms appear",
      "Complex carbohydrates can help stabilize mood",
      "Restorative activities like yoga or meditation feel supportive",
    ],
  },
};

interface PhaseExplainerProps {
  phase: Phase;
}

export function PhaseExplainer({ phase }: PhaseExplainerProps) {
  const content = phaseEducation[phase];
  const config = phaseConfig[phase];

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={40} tint="light" style={styles.card}>
        <View style={styles.cardInner}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.phaseIndicator, { backgroundColor: config.accentColor }]} />
            <View style={styles.headerText}>
              <ThemedText style={styles.title}>{content.title}</ThemedText>
              <ThemedText style={styles.duration}>{content.duration}</ThemedText>
            </View>
          </View>

          {/* Hormones Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="activity" size={14} color={config.accentColor} />
              <ThemedText style={[styles.sectionTitle, { color: config.labelColor }]}>
                HORMONES
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionText}>{content.hormones}</ThemedText>
          </View>

          {/* Body Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={14} color={config.accentColor} />
              <ThemedText style={[styles.sectionTitle, { color: config.labelColor }]}>
                YOUR BODY
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionText}>{content.body}</ThemedText>
          </View>

          {/* Energy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="zap" size={14} color={config.accentColor} />
              <ThemedText style={[styles.sectionTitle, { color: config.labelColor }]}>
                ENERGY & MOOD
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionText}>{content.energy}</ThemedText>
          </View>

          {/* Tips Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="sun" size={14} color={config.accentColor} />
              <ThemedText style={[styles.sectionTitle, { color: config.labelColor }]}>
                SELF-CARE TIPS
              </ThemedText>
            </View>
            {content.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <View style={[styles.tipBullet, { backgroundColor: config.accentColor }]} />
                <ThemedText style={styles.tipText}>{tip}</ThemedText>
              </View>
            ))}
          </View>
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
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  phaseIndicator: {
    width: 4,
    height: 44,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "rgba(60,50,70,0.95)",
    marginBottom: 2,
  },
  duration: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "rgba(80,60,80,0.6)",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: 6,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  sectionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(60,50,70,0.85)",
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(60,50,70,0.85)",
    lineHeight: 22,
  },
});

export default PhaseExplainer;
