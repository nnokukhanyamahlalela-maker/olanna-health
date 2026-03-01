import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { InsightCard } from "@/components/InsightCard";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

const stiInfo = [
  {
    name: "Chlamydia",
    description: "Most common STI. Often no symptoms. Easily treatable with antibiotics.",
    testFrequency: "Annual screening recommended",
  },
  {
    name: "Gonorrhoea",
    description: "Bacterial infection that can cause serious complications if untreated.",
    testFrequency: "Annual screening recommended",
  },
  {
    name: "Syphilis",
    description: "Bacterial infection that progresses in stages. Curable with treatment.",
    testFrequency: "Test during pregnancy and as needed",
  },
  {
    name: "HIV",
    description: "Viral infection that attacks the immune system. Manageable with treatment.",
    testFrequency: "Regular testing recommended",
  },
];

export default function SexualHealthModuleScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

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
      <GlassSurface style={styles.guidelineCard}>
        <Feather name="book-open" size={24} color={theme.info} />
        <View style={styles.guidelineContent}>
          <ThemedText type="h4" style={{ color: theme.info }}>
            South African Guidelines
          </ThemedText>
          <ThemedText type="small" style={{ opacity: 0.8 }}>
            Based on the Southern African HIV Clinicians Society 2022 guidelines for STI screening.
          </ThemedText>
        </View>
      </GlassSurface>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Screening Recommendations
        </ThemedText>
        <ThemedText type="body" style={styles.sectionDescription}>
          Regular screening is important for early detection and treatment.
        </ThemedText>

        <View style={styles.recommendationsList}>
          <InsightCard
            title="Annual Screening"
            description="Chlamydia and gonorrhoea testing recommended yearly for sexually active women."
            icon="calendar"
            color={theme.primary}
          />
          <InsightCard
            title="Pregnancy Testing"
            description="All pregnant women should be tested at the first antenatal visit."
            icon="heart"
            color={theme.secondary}
          />
          <InsightCard
            title="Risk-Based Testing"
            description="More frequent testing if you have multiple partners or new partners."
            icon="shield"
            color={theme.tertiary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Common STIs
        </ThemedText>

        {stiInfo.map((sti, index) => (
          <GlassSurface
            key={index}
            style={styles.stiCard}
          >
            <View style={styles.stiHeader}>
              <ThemedText type="h4">{sti.name}</ThemedText>
              <View style={[styles.frequencyBadge, { backgroundColor: theme.success + "20" }]}>
                <ThemedText type="caption" style={{ color: theme.success }}>
                  {sti.testFrequency}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="small" style={styles.stiDescription}>
              {sti.description}
            </ThemedText>
          </GlassSurface>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Prevention Tips
        </ThemedText>

        <GlassSurface style={styles.tipCard} noPadding>
          <View style={styles.tipCardInner}>
            <View style={[styles.tipIcon, { backgroundColor: theme.success + "20" }]}>
              <Feather name="check-circle" size={20} color={theme.success} />
            </View>
            <ThemedText type="body" style={styles.tipText}>
              Use barrier protection consistently
            </ThemedText>
          </View>
        </GlassSurface>

        <GlassSurface style={styles.tipCard} noPadding>
          <View style={styles.tipCardInner}>
            <View style={[styles.tipIcon, { backgroundColor: theme.success + "20" }]}>
              <Feather name="check-circle" size={20} color={theme.success} />
            </View>
            <ThemedText type="body" style={styles.tipText}>
              Get tested regularly with new partners
            </ThemedText>
          </View>
        </GlassSurface>

        <GlassSurface style={styles.tipCard} noPadding>
          <View style={styles.tipCardInner}>
            <View style={[styles.tipIcon, { backgroundColor: theme.success + "20" }]}>
              <Feather name="check-circle" size={20} color={theme.success} />
            </View>
            <ThemedText type="body" style={styles.tipText}>
              Communicate openly with partners about testing
            </ThemedText>
          </View>
        </GlassSurface>

        <GlassSurface style={styles.tipCard} noPadding>
          <View style={styles.tipCardInner}>
            <View style={[styles.tipIcon, { backgroundColor: theme.success + "20" }]}>
              <Feather name="check-circle" size={20} color={theme.success} />
            </View>
            <ThemedText type="body" style={styles.tipText}>
              Consider HPV vaccination if eligible
            </ThemedText>
          </View>
        </GlassSurface>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.ctaButton,
          { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Feather name="map-pin" size={20} color={theme.buttonText} />
        <ThemedText type="body" style={{ color: theme.buttonText, fontWeight: "600" }}>
          Find Testing Centers Near You
        </ThemedText>
      </Pressable>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guidelineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  guidelineContent: {
    flex: 1,
    gap: Spacing.xs,
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
  recommendationsList: {
    gap: Spacing.md,
  },
  stiCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  stiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  frequencyBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  stiDescription: {
    opacity: 0.7,
    lineHeight: 20,
  },
  tipCard: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  tipCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    flex: 1,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
