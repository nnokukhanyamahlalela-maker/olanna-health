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

function PolicySection({ icon, title, children, delay = 0 }: SectionProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(delay)}>
      <GlassSurface style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: theme.primary + "15" }]}>
            <Feather name={icon} size={18} color={theme.primary} />
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
      <View style={[styles.bulletDot, { backgroundColor: theme.primary }]} />
      <ThemedText type="body" style={[styles.bulletText, { color: theme.textSecondary }]}>
        {text}
      </ThemedText>
    </View>
  );
}

export default function PrivacyStatementScreen() {
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
            <Feather name="shield" size={28} color={theme.primary} />
            <View style={styles.heroContent}>
              <ThemedText type="h3" style={styles.heroTitle}>Your Privacy, Our Priority</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                Olanna Health is built with a privacy-first philosophy. Your reproductive health data is deeply personal, and we treat it with the care and respect it deserves.
              </ThemedText>
            </View>
          </GlassSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(50)}>
          <ThemedText type="small" style={[styles.effectiveDate, { color: theme.textSecondary }]}>
            Effective Date: 1 March 2026
          </ThemedText>
        </Animated.View>

        <PolicySection icon="database" title="What We Collect" delay={100}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            When you use Olanna Health, the following information may be stored:
          </ThemedText>
          <BulletPoint text="Your name and profile preferences" />
          <BulletPoint text="Menstrual cycle dates and patterns" />
          <BulletPoint text="Daily symptom logs, moods, and energy levels" />
          <BulletPoint text="Health goals you select during setup" />
          <BulletPoint text="Product safety logs (if you use this feature)" />
        </PolicySection>

        <PolicySection icon="smartphone" title="Where Your Data Lives" delay={150}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            All your personal health data is stored locally on your device using encrypted storage. This means:
          </ThemedText>
          <BulletPoint text="Your data never leaves your phone unless you choose to share it" />
          <BulletPoint text="No cloud backups of health data are made without your consent" />
          <BulletPoint text="If you delete the app, your data is permanently removed" />
          <BulletPoint text="Other apps on your device cannot access your Olanna data" />
        </PolicySection>

        <PolicySection icon="server" title="What Goes to Our Server" delay={200}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Very little data leaves your device. The only feature that communicates with our server is optional:
          </ThemedText>
          <BulletPoint text="Partner Mode: If you opt in, a limited cycle snapshot is shared with your linked partner. You control exactly what is shared and can revoke access instantly" />
        </PolicySection>

        <PolicySection icon="x-circle" title="What We Never Do" delay={250}>
          <BulletPoint text="We never sell your personal or health data to anyone" />
          <BulletPoint text="We never share your data with advertisers" />
          <BulletPoint text="We never use your data to target you with ads" />
          <BulletPoint text="We never access your data without your knowledge" />
          <BulletPoint text="We never store your cycle data on external servers" />
        </PolicySection>

        <PolicySection icon="unlock" title="Your Rights" delay={300}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Because your data never leaves your device, you exercise these rights directly — no request to us is needed:
          </ThemedText>
          <BulletPoint text="Right to access — export all your data as a JSON file at any time from Privacy & Data settings" />
          <BulletPoint text="Right to rectification — edit or update your profile and health information at any time" />
          <BulletPoint text="Right to erasure — delete specific categories or all data instantly from Privacy & Data settings. Since Olanna never receives a copy of your data, there is nothing on our server to delete. You hold 100% of your data at all times" />
          <BulletPoint text="Right to restriction of processing — disable AI features, Partner Mode, or data sharing at any time" />
          <BulletPoint text="Right to data portability — export your data as a structured JSON file and use it however you choose" />
          <BulletPoint text="Right to object / withdraw consent — disable Share Anonymized Data at any time in Privacy & Data settings. Partner Mode can be revoked instantly" />
        </PolicySection>

        <PolicySection icon="users" title="Partner Mode Privacy" delay={350}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Partner Mode is designed with strict privacy safeguards:
          </ThemedText>
          <BulletPoint text="Sharing is completely opt-in and you choose what to share" />
          <BulletPoint text="Partners only see a filtered snapshot, never your full data" />
          <BulletPoint text="You can revoke your partner's access at any time" />
          <BulletPoint text="Invite codes expire after 24 hours for security" />
          <BulletPoint text="All partner actions are logged for your review" />
        </PolicySection>

        <PolicySection icon="lock" title="Data Security" delay={400}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            We take the following measures to keep your data safe:
          </ThemedText>
          <BulletPoint text="Sensitive data is encrypted using your device's secure storage" />
          <BulletPoint text="All network communications use HTTPS encryption" />
          <BulletPoint text="API endpoints are protected with rate limiting" />
          <BulletPoint text="Server endpoints require authentication" />
        </PolicySection>

        <PolicySection icon="globe" title="Your Legal Rights (GDPR & POPIA)" delay={450}>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary }]}>
            Olanna Health is designed to fulfil GDPR (EU/UK) and POPIA (South Africa) rights by default — not as a compliance exercise, but as an architectural choice.
          </ThemedText>
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary, marginTop: 8 }]}>
            Because Olanna never receives a copy of your personal health data, there is nothing on our servers that could be improperly accessed, shared, or breached. You hold 100% of your data on your own device at all times. This means:
          </ThemedText>
          <BulletPoint text="Your right to erasure is exercised by you, directly, by deleting data from Privacy & Data settings — no request to us required" />
          <BulletPoint text="Your right to data portability is exercised by you, directly, by exporting a JSON file at any time" />
          <BulletPoint text="There is no Olanna server account to delete. We never receive your data, so there is nothing for us to erase on our end" />
          <ThemedText type="body" style={[styles.bodyText, { color: theme.textSecondary, marginTop: 8 }]}>
            If you have any questions about your rights under GDPR or POPIA, or if you believe your data has been handled improperly in any way, contact us at admin@olanna.health.
          </ThemedText>
        </PolicySection>

        <Animated.View entering={FadeInDown.duration(300).delay(500)}>
          <GlassSurface style={styles.contactCard}>
            <Feather name="mail" size={20} color={theme.primary} />
            <View style={styles.contactContent}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Questions or Concerns?</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20 }}>
                If you have any questions about how your data is handled, please reach out to us at admin@olanna.health
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
