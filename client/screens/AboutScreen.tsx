import React from "react";
import { View, StyleSheet, ScrollView, Image, Dimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FeatureItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  color: string;
}

function FeatureItem({ icon, title, description, color }: FeatureItemProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={styles.featureContent}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>{title}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20 }}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <GlassSurface style={styles.heroCard} tint="prominent">
            <View style={styles.heroInner}>
              <View style={[styles.logoCircle, { backgroundColor: "rgba(194,24,91,0.1)" }]}>
                <Feather name="heart" size={32} color="#C2185B" />
              </View>
              <ThemedText type="h2" style={styles.appName}>Olanna Health</ThemedText>
              <ThemedText type="body" style={[styles.tagline, { color: theme.textSecondary }]}>
                Your cycle. Your wellness. Your way.
              </ThemedText>
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <GlassSurface style={styles.sectionCard}>
            <ThemedText type="h4" style={styles.sectionTitle}>Our Mission</ThemedText>
            <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
              Olanna Health is a femtech wellness application created for African women, with a particular focus on South Africa. We believe every woman deserves access to accurate, culturally relevant health information and tools to understand her body.
            </ThemedText>
            <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
              Our app combines evidence-based reproductive health tracking with a privacy-first approach, empowering you to take control of your cycle, symptoms, and overall wellness.
            </ThemedText>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <GlassSurface style={styles.sectionCard}>
            <ThemedText type="h4" style={styles.sectionTitle}>What Olanna Offers</ThemedText>
            <View style={styles.featureList}>
              <FeatureItem
                icon="sun"
                title="Cycle Tracking"
                description="Track your menstrual cycle with our interactive lotus wheel. Log periods, predict phases, and understand your body's rhythms."
                color="#C2185B"
              />
              <FeatureItem
                icon="calendar"
                title="Smart Calendar"
                description="View your cycle on a beautiful calendar with phase-coloured days, fertile window highlights, and daily cycle insights."
                color="#B8860B"
              />
              <FeatureItem
                icon="edit-3"
                title="Daily Check-ins"
                description="Log symptoms, mood, energy, and flow with over 200 trackable symptoms across 15 categories."
                color="#7B5EA7"
              />
              <FeatureItem
                icon="activity"
                title="Health Tools"
                description="PMS Symptom Checker and Cycle Length Calculator to help you understand your patterns and plan ahead."
                color="#D4764E"
              />
              <FeatureItem
                icon="book-open"
                title="Health Education"
                description="Evidence-based articles on periods, PCOS, endometriosis, and reproductive health, grounded in South African health guidelines."
                color="#5A8A6A"
              />
              <FeatureItem
                icon="users"
                title="Partner Mode"
                description="Optionally share cycle information with a partner through secure, privacy-first sharing with full control over what is visible."
                color="#6A5B7B"
              />
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <GlassSurface style={styles.sectionCard}>
            <ThemedText type="h4" style={styles.sectionTitle}>Our Approach</ThemedText>
            <View style={styles.approachList}>
              <View style={styles.approachItem}>
                <Feather name="shield" size={16} color="#7B5EA7" />
                <ThemedText type="body" style={[styles.approachText, { color: theme.textSecondary }]}>
                  Privacy-first: Your health data stays on your device
                </ThemedText>
              </View>
              <View style={styles.approachItem}>
                <Feather name="check-circle" size={16} color="#5A8A6A" />
                <ThemedText type="body" style={[styles.approachText, { color: theme.textSecondary }]}>
                  Evidence-based: Following SAHCS and SASOG guidelines
                </ThemedText>
              </View>
              <View style={styles.approachItem}>
                <Feather name="heart" size={16} color="#C2185B" />
                <ThemedText type="body" style={[styles.approachText, { color: theme.textSecondary }]}>
                  Culturally grounded: Designed by and for African women
                </ThemedText>
              </View>
              <View style={styles.approachItem}>
                <Feather name="lock" size={16} color="#B8860B" />
                <ThemedText type="body" style={[styles.approachText, { color: theme.textSecondary }]}>
                  POPIA compliant: Respecting South African data protection law
                </ThemedText>
              </View>
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(400)}>
          <GlassSurface style={styles.contactCard}>
            <Feather name="mail" size={20} color="#C2185B" />
            <View style={styles.contactContent}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Get in Touch</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20 }}>
                Questions, feedback, or just want to say hello? Reach us at admin@olanna.health
              </ThemedText>
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(450)}>
          <ThemedText type="small" style={[styles.versionText, { color: theme.textSecondary }]}>
            Version 1.0.0
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  heroInner: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  appName: {
    textAlign: "center",
  },
  tagline: {
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
  },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  bodyText: {
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  featureList: {
    gap: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
    gap: 2,
  },
  approachList: {
    gap: Spacing.md,
  },
  approachItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  approachText: {
    flex: 1,
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    alignItems: "flex-start",
    marginTop: Spacing.md,
  },
  contactContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  versionText: {
    textAlign: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
