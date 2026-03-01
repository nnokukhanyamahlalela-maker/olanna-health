import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { InsightCard } from "@/components/InsightCard";
import { SymptomChip } from "@/components/SymptomChip";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

const pcosSymptoms = [
  { id: "irregular_periods", label: "Irregular periods" },
  { id: "acne", label: "Acne" },
  { id: "hair_loss", label: "Hair loss" },
  { id: "hirsutism", label: "Excess hair growth" },
  { id: "weight_gain", label: "Weight changes" },
  { id: "fatigue", label: "Fatigue" },
  { id: "mood_swings", label: "Mood swings" },
  { id: "sleep_issues", label: "Sleep issues" },
];

const lifestyleTips = [
  {
    title: "Anti-inflammatory Diet",
    description: "Focus on whole foods, lean proteins, and healthy fats to reduce inflammation.",
    icon: "coffee" as const,
    color: "#B5EAD7",
  },
  {
    title: "Regular Exercise",
    description: "30 minutes of moderate activity daily helps manage insulin resistance.",
    icon: "activity" as const,
    color: "#B4D7E8",
  },
  {
    title: "Stress Management",
    description: "Practice mindfulness, meditation, or yoga to reduce cortisol levels.",
    icon: "heart" as const,
    color: "#E6E6FA",
  },
  {
    title: "Quality Sleep",
    description: "Aim for 7-9 hours of sleep to support hormone regulation.",
    icon: "moon" as const,
    color: "#FFDAB9",
  },
];

export default function PCOSModuleScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"symptoms" | "lifestyle" | "insights">("symptoms");

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  return (
    <AppGradient style={styles.container}>
      <View style={[styles.tabBar, { paddingTop: headerHeight + Spacing.sm }]}>
        {(["symptoms", "lifestyle", "insights"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: theme.primary + "20" },
            ]}
          >
            <ThemedText
              type="small"
              style={[
                styles.tabText,
                { color: activeTab === tab ? theme.primary : theme.textSecondary },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "symptoms" ? (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Track Your Symptoms
            </ThemedText>
            <ThemedText type="body" style={styles.sectionDescription}>
              Select the symptoms you're experiencing today. Regular tracking helps identify patterns.
            </ThemedText>
            <View style={styles.symptomsGrid}>
              {pcosSymptoms.map((symptom) => (
                <SymptomChip
                  key={symptom.id}
                  label={symptom.label}
                  selected={selectedSymptoms.includes(symptom.id)}
                  onPress={() => toggleSymptom(symptom.id)}
                />
              ))}
            </View>

            <GlassSurface style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: theme.info + "20" }]}>
                <Feather name="info" size={20} color={theme.info} />
              </View>
              <View style={styles.infoContent}>
                <ThemedText type="h4">What is PCOS?</ThemedText>
                <ThemedText type="small" style={styles.infoText}>
                  Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. It can affect your periods, fertility, hormones, and appearance.
                </ThemedText>
              </View>
            </GlassSurface>
          </View>
        ) : null}

        {activeTab === "lifestyle" ? (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Lifestyle Management
            </ThemedText>
            <ThemedText type="body" style={styles.sectionDescription}>
              Evidence-based lifestyle changes can significantly improve PCOS symptoms.
            </ThemedText>
            <View style={styles.tipsList}>
              {lifestyleTips.map((tip, index) => (
                <InsightCard
                  key={index}
                  title={tip.title}
                  description={tip.description}
                  icon={tip.icon}
                  color={tip.color}
                />
              ))}
            </View>
          </View>
        ) : null}

        {activeTab === "insights" ? (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Your PCOS Insights
            </ThemedText>
            <ThemedText type="body" style={styles.sectionDescription}>
              Track your symptoms regularly to see personalized insights and patterns.
            </ThemedText>

            <GlassSurface style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Feather name="trending-up" size={24} color={theme.primary} />
                <ThemedText type="h4">Symptom Trends</ThemedText>
              </View>
              <ThemedText type="body" style={styles.insightText}>
                Continue tracking your symptoms to see trends and correlations with your cycle.
              </ThemedText>
            </GlassSurface>

            <GlassSurface style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Feather name="calendar" size={24} color={theme.secondary} />
                <ThemedText type="h4">Cycle Patterns</ThemedText>
              </View>
              <ThemedText type="body" style={styles.insightText}>
                Your cycle data will be analyzed to identify patterns related to PCOS.
              </ThemedText>
            </GlassSurface>
          </View>
        ) : null}
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: "center",
  },
  tabText: {
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoText: {
    opacity: 0.7,
    lineHeight: 20,
  },
  tipsList: {
    gap: Spacing.md,
  },
  insightCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  insightText: {
    opacity: 0.7,
    marginLeft: 40,
  },
});
