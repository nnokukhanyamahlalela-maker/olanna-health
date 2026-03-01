import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { InsightCard } from "@/components/InsightCard";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

const painLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const endoSymptoms = [
  { id: "pelvic_pain", label: "Pelvic pain", icon: "zap" as const },
  { id: "fatigue", label: "Fatigue", icon: "battery" as const },
  { id: "bowel_issues", label: "Bowel issues", icon: "activity" as const },
  { id: "bladder_issues", label: "Bladder issues", icon: "droplet" as const },
  { id: "painful_periods", label: "Painful periods", icon: "alert-circle" as const },
  { id: "pain_during_sex", label: "Pain during intimacy", icon: "heart" as const },
  { id: "nausea", label: "Nausea", icon: "frown" as const },
  { id: "bloating", label: "Bloating", icon: "circle" as const },
];

export default function EndometriosisModuleScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [painLevel, setPainLevel] = useState<number>(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (symptomId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return theme.success;
    if (level <= 6) return theme.warning;
    return theme.error;
  };

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
      <GlassSurface style={styles.supportCard}>
        <Feather name="heart" size={24} color={theme.primary} />
        <ThemedText type="body" style={[styles.supportText, { color: theme.primary }]}>
          You are not alone. Millions of women live with endometriosis. We're here to support you.
        </ThemedText>
      </GlassSurface>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Today's Pain Level
        </ThemedText>
        <ThemedText type="body" style={styles.sectionDescription}>
          Rate your pain from 1 (minimal) to 10 (severe)
        </ThemedText>
        <View style={styles.painScale}>
          {painLevels.map((level) => (
            <Pressable
              key={level}
              onPress={() => {
                setPainLevel(level);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.painDot,
                {
                  backgroundColor:
                    level <= painLevel ? getPainColor(level) : theme.backgroundSecondary,
                  transform: [{ scale: level === painLevel ? 1.2 : 1 }],
                },
              ]}
            >
              <ThemedText
                type="caption"
                style={{
                  color: level <= painLevel ? theme.buttonText : theme.textSecondary,
                  fontWeight: "600",
                }}
              >
                {level}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {painLevel > 0 ? (
          <GlassSurface style={styles.painDisplay}>
            <ThemedText type="h2" style={{ color: getPainColor(painLevel) }}>
              {painLevel}/10
            </ThemedText>
            <ThemedText type="small">
              {painLevel <= 3
                ? "Mild discomfort"
                : painLevel <= 6
                ? "Moderate pain"
                : "Severe pain - consider speaking with your doctor"}
            </ThemedText>
          </GlassSurface>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Symptoms
        </ThemedText>
        <View style={styles.symptomsGrid}>
          {endoSymptoms.map((symptom) => (
            <Pressable
              key={symptom.id}
              onPress={() => toggleSymptom(symptom.id)}
              style={[
                styles.symptomCard,
                {
                  backgroundColor: selectedSymptoms.includes(symptom.id)
                    ? theme.secondary + "20"
                    : theme.backgroundDefault,
                  borderColor: selectedSymptoms.includes(symptom.id)
                    ? theme.secondary
                    : "transparent",
                },
              ]}
            >
              <Feather
                name={symptom.icon}
                size={20}
                color={
                  selectedSymptoms.includes(symptom.id)
                    ? theme.secondary
                    : theme.textSecondary
                }
              />
              <ThemedText
                type="small"
                style={[
                  styles.symptomLabel,
                  {
                    color: selectedSymptoms.includes(symptom.id)
                      ? theme.secondary
                      : theme.text,
                  },
                ]}
              >
                {symptom.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Management Tips
        </ThemedText>
        <View style={styles.tipsList}>
          <InsightCard
            title="Heat Therapy"
            description="Apply a heating pad to your lower abdomen for pain relief."
            icon="sun"
            color={theme.tertiary}
          />
          <InsightCard
            title="Gentle Movement"
            description="Light stretching and walking can help reduce inflammation."
            icon="activity"
            color={theme.secondary}
          />
          <InsightCard
            title="Track Triggers"
            description="Note foods, activities, and stress levels that worsen symptoms."
            icon="edit-3"
            color={theme.primary}
          />
        </View>
      </View>

      <GlassSurface style={styles.exportCard}>
        <View style={styles.exportContent}>
          <Feather name="file-text" size={24} color={theme.info} />
          <View style={styles.exportText}>
            <ThemedText type="h4">Share with Your Doctor</ThemedText>
            <ThemedText type="small" style={{ opacity: 0.7 }}>
              Generate a report of your symptoms and pain patterns.
            </ThemedText>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </GlassSurface>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  supportText: {
    flex: 1,
    fontWeight: "500",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: Spacing.lg,
  },
  painScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  painDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  painDisplay: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  symptomCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  symptomLabel: {
    fontWeight: "500",
  },
  tipsList: {
    gap: Spacing.md,
  },
  exportCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  exportContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  exportText: {
    flex: 1,
    gap: 2,
  },
});
