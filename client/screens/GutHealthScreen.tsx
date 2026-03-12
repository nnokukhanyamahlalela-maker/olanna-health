import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

const ACCENT = "#B8860B";

const HABITS = [
  "Eat a variety of fiber-rich foods",
  "Stay hydrated",
  "Include regular movement",
  "Prioritize sleep",
  "Manage everyday stress",
];

const FOODS = [
  "Yogurt or kefir",
  "Oats",
  "Bananas",
  "Leafy greens",
  "Beans and lentils",
  "Fermented foods like kimchi or sauerkraut",
];

const DISCLAIMER =
  "This information is provided for educational and wellness purposes only and is not medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns or before making health-related decisions.";

export default function GutHealthScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: ACCENT + "20" }]}>
            <Feather name="heart" size={22} color={ACCENT} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={[styles.title, { color: theme.text }]}>
              Gut Health
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              Educational digestive wellness insights
            </ThemedText>
          </View>
        </View>

        <GlassSurface
          style={styles.card}
          borderRadius={BorderRadius.lg}
          padding={Spacing.lg}
        >
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
            About gut health
          </ThemedText>
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>
            Gut health refers to general digestive wellness and the balance of
            microorganisms in the gut. Research suggests the gut may play a role
            in digestion, nutrient absorption, and overall well-being.
            Experiences can vary from person to person.
          </ThemedText>
        </GlassSurface>

        <GlassSurface
          style={styles.card}
          borderRadius={BorderRadius.lg}
          padding={Spacing.lg}
        >
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
            Common digestive experiences
          </ThemedText>
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>
            Some people notice patterns such as bloating, digestive discomfort,
            changes in bowel habits, or shifts in energy. Tracking how you feel
            over time may help you better understand your personal wellness
            patterns.
          </ThemedText>
        </GlassSurface>

        <GlassSurface
          style={styles.card}
          borderRadius={BorderRadius.lg}
          padding={Spacing.lg}
        >
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
            Everyday habits that may support gut wellness
          </ThemedText>
          <View style={styles.listContainer}>
            {HABITS.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: ACCENT }]} />
                <ThemedText
                  style={[styles.listText, { color: theme.textSecondary }]}
                >
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
        </GlassSurface>

        <GlassSurface
          style={styles.card}
          borderRadius={BorderRadius.lg}
          padding={Spacing.lg}
        >
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
            Foods commonly associated with gut wellness
          </ThemedText>
          <View style={styles.listContainer}>
            {FOODS.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: ACCENT }]} />
                <ThemedText
                  style={[styles.listText, { color: theme.textSecondary }]}
                >
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
        </GlassSurface>

        <View style={styles.disclaimerContainer}>
          <Feather
            name="info"
            size={14}
            color={theme.textSecondary}
            style={styles.disclaimerIcon}
          />
          <ThemedText
            style={[styles.disclaimerText, { color: theme.textSecondary }]}
          >
            {DISCLAIMER}
          </ThemedText>
        </View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 20,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    lineHeight: 22,
  },
  cardBody: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  listContainer: {
    gap: 10,
    marginTop: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  listText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: Spacing.lg,
    paddingHorizontal: 4,
  },
  disclaimerIcon: {
    marginTop: 2,
  },
  disclaimerText: {
    fontFamily: Fonts.bodyLight,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
    opacity: 0.7,
  },
});
