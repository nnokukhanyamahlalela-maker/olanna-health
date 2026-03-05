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

interface SectionProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  children: React.ReactNode;
  delay?: number;
}

function TermsSection({ icon, title, children, delay = 0 }: SectionProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(delay)}>
      <GlassSurface style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: "rgba(106,91,123,0.12)" }]}>
            <Feather name={icon} size={18} color="#6A5B7B" />
          </View>
          <ThemedText type="h4" style={styles.sectionTitle}>{title}</ThemedText>
        </View>
        <View style={styles.sectionBody}>
          {children}
        </View>
      </GlassSurface>
    </Animated.View>
  );
}

function BulletPoint({ text }: { text: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: "#C2185B" }]} />
      <ThemedText type="body" style={[styles.bulletText, { color: theme.textSecondary }]}>
        {text}
      </ThemedText>
    </View>
  );
}

export default function TermsOfServiceScreen() {
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
            <Feather name="file-text" size={28} color="#6A5B7B" />
            <View style={styles.heroContent}>
              <ThemedText type="h3" style={styles.heroTitle}>Terms of Service</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                By using Olanna Health, you agree to the following terms. Please read them carefully.
              </ThemedText>
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(50)}>
          <ThemedText type="small" style={[styles.effectiveDate, { color: theme.textSecondary }]}>
            Effective Date: 1 March 2026
          </ThemedText>
        </Animated.View>

        <TermsSection icon="check-circle" title="Acceptance of Terms" delay={100}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            By downloading, installing, or using the Olanna Health application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
          </ThemedText>
        </TermsSection>

        <TermsSection icon="smartphone" title="Description of Service" delay={150}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Olanna Health is a wellness and health tracking application designed for women, with a focus on:
          </ThemedText>
          <BulletPoint text="Menstrual cycle tracking and period predictions" />
          <BulletPoint text="Symptom logging and daily check-ins" />
          <BulletPoint text="Fertility window and ovulation estimates" />
          <BulletPoint text="Educational health content based on evidence-based research" />
          <BulletPoint text="PMS symptom checking and cycle length calculation tools" />
          <BulletPoint text="Optional Partner Mode for sharing cycle information" />
        </TermsSection>

        <TermsSection icon="alert-triangle" title="Medical Disclaimer" delay={200}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Olanna Health is not a medical device and does not provide medical advice, diagnosis, or treatment. The app is intended for general wellness and informational purposes only.
          </ThemedText>
          <BulletPoint text="Cycle predictions and fertile window estimates are based on general calculations and may not be accurate for every individual" />
          <BulletPoint text="Health content is for educational purposes and should not replace professional medical advice" />
          <BulletPoint text="Always consult a qualified healthcare provider for medical concerns" />
          <BulletPoint text="Do not rely on this app as a method of contraception" />
        </TermsSection>

        <TermsSection icon="user" title="User Responsibilities" delay={250}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            As a user of Olanna Health, you agree to:
          </ThemedText>
          <BulletPoint text="Provide accurate information when setting up your profile" />
          <BulletPoint text="Use the app only for its intended purpose of personal health tracking" />
          <BulletPoint text="Not attempt to reverse engineer, modify, or misuse the application" />
          <BulletPoint text="Be at least 13 years of age to use the app" />
        </TermsSection>

        <TermsSection icon="database" title="Data and Privacy" delay={300}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Your privacy is fundamental to Olanna Health. Key points:
          </ThemedText>
          <BulletPoint text="Your personal health data is stored locally on your device using encrypted storage" />
          <BulletPoint text="We do not sell, share, or transfer your health data to third parties" />
          <BulletPoint text="Partner Mode sharing is entirely opt-in and revocable at any time" />
          <BulletPoint text="Please refer to our Privacy Policy for full details on data handling" />
        </TermsSection>

        <TermsSection icon="book" title="Intellectual Property" delay={350}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            All content, design, and functionality within Olanna Health is the property of Olanna Health and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the app without written permission.
          </ThemedText>
        </TermsSection>

        <TermsSection icon="slash" title="Limitation of Liability" delay={400}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Olanna Health is provided "as is" without warranties of any kind. We are not liable for:
          </ThemedText>
          <BulletPoint text="Inaccuracies in cycle predictions or health estimates" />
          <BulletPoint text="Decisions made based on information provided by the app" />
          <BulletPoint text="Data loss due to device failure, app deletion, or other causes" />
          <BulletPoint text="Any indirect, incidental, or consequential damages arising from use of the app" />
        </TermsSection>

        <TermsSection icon="refresh-cw" title="Changes to Terms" delay={450}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            We may update these Terms of Service from time to time. Continued use of the app after changes are posted constitutes acceptance of the revised terms. We will notify users of significant changes through the app.
          </ThemedText>
        </TermsSection>

        <TermsSection icon="map-pin" title="Governing Law" delay={500}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            These terms are governed by the laws of the Republic of South Africa, including the Consumer Protection Act and the Protection of Personal Information Act (POPIA).
          </ThemedText>
        </TermsSection>

        <Animated.View entering={FadeInDown.duration(300).delay(550)}>
          <GlassSurface style={styles.contactCard}>
            <Feather name="mail" size={20} color="#6A5B7B" />
            <View style={styles.contactContent}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Questions?</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20 }}>
                If you have any questions about these terms, please contact us at admin@olanna.health
              </ThemedText>
            </View>
          </GlassSurface>
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
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: "flex-start",
  },
  heroContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  heroTitle: {
    marginBottom: Spacing.xs,
  },
  effectiveDate: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
  },
  sectionBody: {
    gap: Spacing.sm,
  },
  bodyText: {
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
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
});
