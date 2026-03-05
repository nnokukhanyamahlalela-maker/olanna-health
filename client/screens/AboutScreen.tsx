import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

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
            <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
              Olanna Health is a women's health and menstrual wellness app designed to help you understand your body, your cycle, and your health with clarity and confidence.
            </ThemedText>
            <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
              Our mission is to make reproductive health knowledge more accessible, empowering women to track their cycles, recognize patterns, and better understand the signals their bodies send throughout each phase of the menstrual cycle.
            </ThemedText>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <GlassSurface style={styles.sectionCard}>
            <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
              Olanna Health combines thoughtful design with evidence-informed health insights to support your wellbeing. Whether you are tracking your period, noticing symptoms, understanding hormonal changes, or learning more about conditions such as PCOS or endometriosis, Olanna Health helps you build a deeper relationship with your body.
            </ThemedText>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <GlassSurface style={styles.sectionCard}>
            <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
              Inspired by the lotus flower, our cycle model reflects the natural rhythm of renewal and transformation throughout the menstrual cycle. Each phase represents a different aspect of wellbeing — from rest and reflection to growth, energy, and expression.
            </ThemedText>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(400)}>
          <GlassSurface style={styles.sectionCard}>
            <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
              Olanna Health was created to support women in making informed health decisions, cultivating body awareness, and embracing the natural rhythm of their cycle.
            </ThemedText>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(500)}>
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

        <Animated.View entering={FadeInDown.duration(300).delay(550)}>
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
  bodyText: {
    lineHeight: 22,
    marginBottom: Spacing.sm,
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
