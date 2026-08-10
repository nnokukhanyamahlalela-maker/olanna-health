import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, Platform, Share, Switch, ScrollView, Modal } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getDeviceId } from "@/lib/deviceId";
import { setPartnerLinked } from "@/lib/partnerStorage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PartnerStatus {
  status: "linked" | "pending" | "none";
  linkedAt?: string;
  expiresAt?: string;
}

interface SharingSettings {
  shareCyclePhase: boolean;
  shareNextPeriodWindow: boolean;
  shareFertileWindow: boolean;
  shareOvulationEstimate: boolean;
  shareMoodSummary: boolean;
  shareEnergySummary: boolean;
  shareTipsForPartner: boolean;
  precisionLevel: string;
}

const DEFAULT_SETTINGS: SharingSettings = {
  shareCyclePhase: true,
  shareNextPeriodWindow: true,
  shareFertileWindow: false,
  shareOvulationEstimate: false,
  shareMoodSummary: false,
  shareEnergySummary: false,
  shareTipsForPartner: true,
  precisionLevel: "low",
};

const TOGGLE_CONFIG = [
  { key: "shareCyclePhase", label: "Cycle Phase", description: "Shows which phase you're in (e.g., Luteal)", icon: "moon" as const },
  { key: "shareNextPeriodWindow", label: "Next Period Window", description: "Shows approximate period dates as a range", icon: "calendar" as const },
  { key: "shareFertileWindow", label: "Fertile Window", description: "Shows approximate fertile days", icon: "sunrise" as const },
  { key: "shareOvulationEstimate", label: "Ovulation Estimate", description: "Shows approximate ovulation window", icon: "sun" as const },
  { key: "shareMoodSummary", label: "Mood Summary", description: "Shows mood as low/steady/high with a short note", icon: "smile" as const },
  { key: "shareEnergySummary", label: "Energy Summary", description: "Shows energy level with a short note", icon: "zap" as const },
  { key: "shareTipsForPartner", label: "Supportive Tips", description: "Shows partner-friendly suggestions", icon: "heart" as const },
];

export default function PartnerSettingsScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [status, setStatus] = useState<PartnerStatus>({ status: "none" });
  const [settings, setSettings] = useState<SharingSettings>(DEFAULT_SETTINGS);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteExpiry, setInviteExpiry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  const fetchStatus = async () => {
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/partner/status", baseUrl), {
        headers: { "x-device-id": deviceId },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.status === "linked") {
          await setPartnerLinked(true, data.linkedAt);
        }
      }
    } catch {
      setFetchError(true);
    }
  };

  const fetchSettings = async () => {
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/partner/settings", baseUrl), {
        headers: { "x-device-id": deviceId },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          shareCyclePhase: data.shareCyclePhase,
          shareNextPeriodWindow: data.shareNextPeriodWindow,
          shareFertileWindow: data.shareFertileWindow,
          shareOvulationEstimate: data.shareOvulationEstimate,
          shareMoodSummary: data.shareMoodSummary,
          shareEnergySummary: data.shareEnergySummary,
          shareTipsForPartner: data.shareTipsForPartner,
          precisionLevel: data.precisionLevel,
        });
      }
    } catch {
      setFetchError(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setFetchError(false);
      Promise.all([fetchStatus(), fetchSettings()]).finally(() => setLoading(false));
    }, [])
  );

  const handleGenerateInviteConfirmed = async () => {
    setShowPrivacyNotice(false);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/partner/invite", baseUrl), {
        method: "POST",
        headers: { "x-device-id": deviceId, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
        setInviteExpiry(data.expiresAt);
        setStatus({ status: "pending", expiresAt: data.expiresAt });
      } else {
        const err = await res.json();
        Alert.alert("Error", err.error || "Could not generate invite");
      }
    } catch {
      Alert.alert("Error", "Failed to generate invite code");
    }
  };

  const handleShareCode = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: `Join me on Olanna Health! Enter this code in Partner Mode: ${inviteCode}`,
      });
    } catch {
      Alert.alert("Error", "Unable to share the invite code.");
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      await fetch(new URL("/api/partner/settings", baseUrl), {
        method: "PUT",
        headers: { "x-device-id": deviceId, "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      setSettings(settings);
    }
  };

  const handlePrecision = async (level: string) => {
    setSettings((prev) => ({ ...prev, precisionLevel: level }));
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      await fetch(new URL("/api/partner/settings", baseUrl), {
        method: "PUT",
        headers: { "x-device-id": deviceId, "Content-Type": "application/json" },
        body: JSON.stringify({ precisionLevel: level }),
      });
    } catch {
      setSettings((prev) => ({ ...prev, precisionLevel: settings.precisionLevel }));
    }
  };

  const confirmRevoke = (emergency: boolean) => {
    const title = emergency ? "Emergency Revoke" : "Revoke Access";
    const message = emergency
      ? "This immediately invalidates your partner's access token. They will be logged out instantly."
      : "This will remove your partner's access to your cycle insights.";

    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) {
        handleRevoke(emergency);
      }
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: emergency ? "Emergency Revoke" : "Revoke", style: "destructive", onPress: () => handleRevoke(emergency) },
      ]);
    }
  };

  const handleRevoke = async (emergency: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const endpoint = emergency ? "/api/partner/revoke-emergency" : "/api/partner/revoke";
      const res = await fetch(new URL(endpoint, baseUrl), {
        method: "POST",
        headers: { "x-device-id": deviceId },
      });
      if (res.ok) {
        setStatus({ status: "none" });
        setInviteCode(null);
        await setPartnerLinked(false);
      } else {
        Alert.alert("Error", "Could not revoke partner access. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Failed to revoke partner access. Please check your connection.");
    }
  };

  if (fetchError && !loading) {
    return (
      <AppGradient style={styles.container}>
        <View style={{ paddingTop: headerHeight + Spacing.xl, paddingHorizontal: Spacing.lg, alignItems: "center" }}>
          <Feather name="wifi-off" size={48} color={theme.textSecondary} />
          <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.lg, textAlign: "center" }}>
            Unable to load partner settings
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: "center" }}>
            Please check your connection and try again.
          </ThemedText>
          <Pressable
            onPress={() => {
              setFetchError(false);
              setLoading(true);
              Promise.all([fetchStatus(), fetchSettings()]).finally(() => setLoading(false));
            }}
            style={{ marginTop: Spacing.lg, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, backgroundColor: theme.primary, borderRadius: BorderRadius.lg }}
          >
            <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>Retry</ThemedText>
          </Pressable>
        </View>
      </AppGradient>
    );
  }

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <GlassSurface tint="prominent" style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: status.status === "linked" ? "#4CAF50" : theme.primary }]}>
            <Feather
              name={status.status === "linked" ? "check-circle" : status.status === "pending" ? "clock" : "heart"}
              size={20}
              color="#fff"
            />
          </View>
          <View style={styles.statusInfo}>
            <ThemedText type="h4" style={{ color: theme.text }}>
              {status.status === "linked" ? "Partner Linked" : status.status === "pending" ? "Invite Pending" : "Not Set Up"}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {status.status === "linked" && status.linkedAt
                ? `Linked since ${new Date(status.linkedAt).toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" })}`
                : status.status === "pending"
                  ? "Waiting for your partner to enter the code"
                  : "Share select cycle insights with a partner"}
            </ThemedText>
          </View>
        </GlassSurface>

        {status.status === "none" ? (
          <View style={styles.section}>
            <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
              Your partner installs Olanna Health and enters your invite code in the Partner Dashboard. You control exactly what they can see.
            </ThemedText>
            <Pressable
              testID="button-generate-invite"
              onPress={() => setShowPrivacyNotice(true)}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="send" size={18} color="#fff" />
              <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
                Generate Invite Code
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {inviteCode ? (
          <GlassSurface tint="prominent" style={styles.codeCard}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Invite Code (expires in 24h)
            </ThemedText>
            <ThemedText type="h2" style={{ color: theme.text, letterSpacing: 6, textAlign: "center" }}>
              {inviteCode}
            </ThemedText>
            <Pressable
              testID="button-share-code"
              onPress={handleShareCode}
              style={({ pressed }) => [
                styles.shareButton,
                { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)", opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="share-2" size={16} color={theme.text} />
              <ThemedText type="body" style={{ color: theme.text }}>Share Code</ThemedText>
            </Pressable>
          </GlassSurface>
        ) : null}

        {status.status === "linked" ? (
          <>
            <View style={styles.section}>
              <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
                What to Share
              </ThemedText>
              <GlassSurface noPadding borderRadius={BorderRadius.xl}>
                {TOGGLE_CONFIG.map((item, idx) => (
                  <View
                    key={item.key}
                    style={[
                      styles.toggleRow,
                      idx < TOGGLE_CONFIG.length - 1
                        ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }
                        : null,
                    ]}
                  >
                    <View style={[styles.toggleIcon, { backgroundColor: isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.25)" }]}>
                      <Feather name={item.icon} size={16} color={theme.primary} />
                    </View>
                    <View style={styles.toggleInfo}>
                      <ThemedText type="body" style={{ color: theme.text }}>{item.label}</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.description}</ThemedText>
                    </View>
                    <Switch
                      testID={`toggle-${item.key}`}
                      value={(settings as any)[item.key]}
                      onValueChange={(v) => handleToggle(item.key, v)}
                      trackColor={{ false: isDark ? "#555" : "#ddd", true: theme.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                ))}
              </GlassSurface>
            </View>

            <View style={styles.section}>
              <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
                Precision Level
              </ThemedText>
              <GlassSurface style={styles.precisionCard}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                  Controls how precise date ranges appear to your partner.
                </ThemedText>
                <View style={styles.precisionRow}>
                  {(["low", "medium"] as const).map((level) => (
                    <Pressable
                      key={level}
                      testID={`precision-${level}`}
                      onPress={() => handlePrecision(level)}
                      style={[
                        styles.precisionPill,
                        {
                          backgroundColor: settings.precisionLevel === level
                            ? theme.primary
                            : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                        },
                      ]}
                    >
                      <ThemedText
                        type="body"
                        style={{
                          color: settings.precisionLevel === level ? "#fff" : theme.textSecondary,
                          fontWeight: settings.precisionLevel === level ? "600" : "400",
                        }}
                      >
                        {level === "low" ? "Low (wider ranges)" : "Medium (tighter ranges)"}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </GlassSurface>
            </View>

            <View style={styles.section}>
              <Pressable
                testID="button-preview"
                onPress={() => navigation.navigate("PartnerPreview")}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    borderColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather name="eye" size={18} color={theme.primary} />
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                  Preview What Your Partner Sees
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Pressable
                testID="button-revoke"
                onPress={() => confirmRevoke(false)}
                style={({ pressed }) => [
                  styles.dangerButton,
                  { opacity: pressed ? 0.8 : 1, borderColor: theme.error },
                ]}
              >
                <Feather name="user-x" size={18} color={theme.error} />
                <ThemedText type="body" style={{ color: theme.error }}>
                  Revoke Partner Access
                </ThemedText>
              </Pressable>

              <Pressable
                testID="button-emergency-revoke"
                onPress={() => confirmRevoke(true)}
                style={({ pressed }) => [
                  styles.emergencyButton,
                  { opacity: pressed ? 0.8 : 1, backgroundColor: theme.error },
                ]}
              >
                <Feather name="alert-triangle" size={18} color="#fff" />
                <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
                  Emergency Revoke
                </ThemedText>
              </Pressable>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                Emergency revoke immediately invalidates your partner's access token.
              </ThemedText>
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* ── Partner Mode privacy notice ── shown once before generating an invite */}
      <Modal
        visible={showPrivacyNotice}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyNotice(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
            <View style={[styles.modalIconRow, { backgroundColor: theme.primary + "15" }]}>
              <Feather name="shield" size={22} color={theme.primary} />
            </View>

            <ThemedText type="h4" style={[styles.modalTitle, { color: theme.text }]}>
              Before you share with a partner
            </ThemedText>

            <ThemedText type="body" style={[styles.modalBody, { color: theme.textSecondary }]}>
              Partner Mode sends a limited snapshot to Olanna's server so your partner can read it securely. Here is exactly what that snapshot may contain — you control each item individually after setup:
            </ThemedText>

            <View style={styles.modalList}>
              {[
                { icon: "moon"      as const, text: "Which cycle phase you're in (e.g. Luteal)" },
                { icon: "calendar"  as const, text: "Approximate next period dates (shown as a range, not an exact date)" },
                { icon: "sunrise"   as const, text: "Approximate fertile window (off by default)" },
                { icon: "sun"       as const, text: "Approximate ovulation window (off by default)" },
                { icon: "smile"     as const, text: "Mood as a level and a short canned note (off by default)" },
                { icon: "zap"       as const, text: "Energy as a level and a short canned note (off by default)" },
                { icon: "heart"     as const, text: "Supportive tips for your partner" },
              ].map(({ icon, text }) => (
                <View key={icon} style={styles.modalListRow}>
                  <Feather name={icon} size={14} color={theme.primary} style={{ marginTop: 3, flexShrink: 0 }} />
                  <ThemedText type="small" style={[styles.modalListText, { color: theme.textSecondary }]}>
                    {text}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={[styles.modalNote, { backgroundColor: theme.primary + "10", borderColor: theme.primary + "25" }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 19 }}>
                <ThemedText type="small" style={{ fontWeight: "700", color: theme.text }}>What is never shared: </ThemedText>
                your full symptom logs, pain records, body-map data, diagnosis details, notes, or any other health record. Only the snapshot fields above are ever sent.
              </ThemedText>
            </View>

            <View style={[styles.modalNote, { backgroundColor: theme.primary + "10", borderColor: theme.primary + "25", marginTop: 8 }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 19 }}>
                <ThemedText type="small" style={{ fontWeight: "700", color: theme.text }}>Not shared with third parties: </ThemedText>
                this snapshot is stored only on Olanna's server for your partner to read. It is never sold, shared with advertisers, or passed to any third party. You can revoke access instantly at any time.
              </ThemedText>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowPrivacyNotice(false)}
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              >
                <ThemedText type="body" style={{ color: theme.textSecondary }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleGenerateInviteConfirmed}
                style={[styles.modalConfirmBtn, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>I understand, continue</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusInfo: {
    flex: 1,
    gap: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  codeCard: {
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.20)",
  },
  toggleInfo: {
    flex: 1,
    gap: 1,
  },
  precisionCard: {
    gap: Spacing.xs,
  },
  precisionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  precisionPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  // Partner privacy notice modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalCard: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    maxHeight: "90%",
  },
  modalIconRow: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  modalTitle: {
    marginTop: Spacing.xs,
  },
  modalBody: {
    lineHeight: 22,
  },
  modalList: {
    gap: 8,
  },
  modalListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  modalListText: {
    flex: 1,
    lineHeight: 20,
  },
  modalNote: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: "center",
  },
  modalConfirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
});
