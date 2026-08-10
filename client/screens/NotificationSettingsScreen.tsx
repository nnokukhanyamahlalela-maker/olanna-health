/**
 * Notification Settings Screen
 *
 * Granular per-category toggles. Each category can be independently enabled
 * or disabled so users can quiet low-priority nudges without muting the
 * threshold pattern alert — the most important notification in the app.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Pressable,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  notificationSettingsStorage,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/lib/notificationSettings";
import {
  requestNotificationPermission,
  maybeRequestPermission,
} from "@/lib/notificationService";

// ─── SettingRow (mirrors PrivacySettingsScreen pattern) ───────────────────────

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  iconColor?: string;
  disabled?: boolean;
}

function SettingRow({ icon, title, description, value, onToggle, iconColor, disabled }: SettingRowProps) {
  const { theme } = useTheme();
  const color = iconColor ?? theme.primary;

  return (
    <GlassSurface style={styles.settingRow} noPadding>
      <View style={[styles.settingRowInner, disabled && { opacity: 0.5 }]}>
        <View style={[styles.settingIcon, { backgroundColor: color + "15" }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <View style={styles.settingContent}>
          <ThemedText type="body" style={styles.settingTitle}>{title}</ThemedText>
          <ThemedText type="caption" style={[styles.settingDesc, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        </View>
        <Switch
          value={value}
          onValueChange={(v) => {
            if (disabled) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(v);
          }}
          trackColor={{ false: theme.border, true: color + "80" }}
          thumbColor={value ? color : theme.backgroundSecondary}
          disabled={disabled}
        />
      </View>
    </GlassSurface>
  );
}

// ─── Permission banner ────────────────────────────────────────────────────────

function PermissionBanner({ onGrant }: { onGrant: () => void }) {
  const { theme } = useTheme();
  return (
    <GlassSurface style={styles.permissionBanner} noPadding>
      <View style={styles.permissionBannerInner}>
        <View style={[styles.settingIcon, { backgroundColor: "#D85A3018" }]}>
          <Feather name="bell-off" size={20} color="#D85A30" />
        </View>
        <View style={styles.settingContent}>
          <ThemedText type="body" style={[styles.settingTitle, { color: theme.text }]}>
            Notifications are off
          </ThemedText>
          <ThemedText type="caption" style={[styles.settingDesc, { color: theme.textSecondary }]}>
            Grant permission to receive pattern alerts and reminders.
          </ThemedText>
        </View>
      </View>
      <Pressable
        onPress={onGrant}
        style={({ pressed }) => [styles.grantBtn, { opacity: pressed ? 0.8 : 1 }]}
      >
        <ThemedText type="body" style={styles.grantBtnText}>
          Grant permission
        </ThemedText>
      </Pressable>
    </GlassSurface>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function NotificationSettingsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<NotificationSettings>({ ...DEFAULT_NOTIFICATION_SETTINGS });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const s = await notificationSettingsStorage.get();
    setSettings(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (key: keyof NotificationSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await notificationSettingsStorage.save({ [key]: value });
  };

  const handleGrant = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await requestNotificationPermission();
    if (granted) {
      setSettings((s) => ({ ...s, permissionGranted: true, permissionRequested: true }));
    } else if (Platform.OS !== "web") {
      Alert.alert(
        "Permission needed",
        "You can enable notifications in your device's Settings app under Olanna Health.",
        [{ text: "OK" }]
      );
    }
  };

  const notPermitted = !settings.permissionGranted;

  if (loading) return <AppGradient style={styles.root}><View /></AppGradient>;

  return (
    <AppGradient style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission banner */}
        {notPermitted && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <PermissionBanner onGrant={handleGrant} />
          </Animated.View>
        )}

        {/* Category 1 — Threshold alerts */}
        <Animated.View entering={FadeInDown.delay(60).duration(300)}>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
            Health alerts
          </ThemedText>
          <SettingRow
            icon="activity"
            iconColor="#E8739E"
            title="Pattern alerts"
            description="A calm heads-up when Lanna's pattern engine detects something worth discussing with a provider. This is the most important notification — we recommend keeping it on."
            value={settings.thresholdAlert}
            onToggle={(v) => toggle("thresholdAlert", v)}
            disabled={notPermitted}
          />
        </Animated.View>

        {/* Category 7 — Fertile window */}
        <Animated.View entering={FadeInDown.delay(90).duration(300)}>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
            Fertile window
          </ThemedText>
          <SettingRow
            icon="sun"
            iconColor="#0F6E56"
            title="Fertile window alerts"
            description="Notified when your fertile window opens and again at predicted ovulation. Based on your logged cycle length — turns itself off if birth control is recorded."
            value={settings.fertileWindow ?? true}
            onToggle={(v) => toggle("fertileWindow", v)}
            disabled={notPermitted}
          />
        </Animated.View>

        {/* Categories 2–4 — Logging & re-engagement */}
        <Animated.View entering={FadeInDown.delay(120).duration(300)}>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
            Logging reminders
          </ThemedText>
          <SettingRow
            icon="calendar"
            iconColor="#C2185B"
            title="Phase-aware reminders"
            description="Timed to when symptoms are most likely — luteal phase for PMOS, around your expected period for flow tracking. Quieter automatically when you're already logging consistently."
            value={settings.phaseReminder}
            onToggle={(v) => toggle("phaseReminder", v)}
            disabled={notPermitted}
          />
          <SettingRow
            icon="trending-up"
            iconColor="#7B5EA7"
            title="Data milestone nudges"
            description="Celebrates how much you've logged — first cycle tracked, two weeks of data, three cycles recorded — and links back to your Health Summary when it's worth sharing."
            value={settings.dataMilestone}
            onToggle={(v) => toggle("dataMilestone", v)}
            disabled={notPermitted}
          />
          <SettingRow
            icon="moon"
            iconColor="#6A5B7B"
            title="Re-engagement nudge"
            description="If you've been away for a while, a gentle reminder that your data is still here — no pressure, no guilt, no streak language."
            value={settings.lapsedUser}
            onToggle={(v) => toggle("lapsedUser", v)}
            disabled={notPermitted}
          />
        </Animated.View>

        {/* Category 5 — Health Summary */}
        <Animated.View entering={FadeInDown.delay(180).duration(300)}>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
            Provider prep
          </ThemedText>
          <SettingRow
            icon="clipboard"
            iconColor="#5A8A6A"
            title="Health Summary refresh"
            description="A low-priority monthly nudge suggesting you update your Health Summary — useful ahead of an appointment. Off by default."
            value={settings.healthSummaryRefresh}
            onToggle={(v) => toggle("healthSummaryRefresh", v)}
            disabled={notPermitted}
          />
        </Animated.View>

        {/* Category 6 — Partner Mode */}
        <Animated.View entering={FadeInDown.delay(240).duration(300)}>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
            Partner Mode
          </ThemedText>
          <SettingRow
            icon="heart"
            iconColor="#D4764E"
            title="Partner notifications"
            description="Light notifications shared with your connected partner — no raw health data, summary context only. Requires your partner's explicit opt-in in Partner Mode settings."
            value={settings.partnerMode}
            onToggle={(v) => toggle("partnerMode", v)}
            disabled={notPermitted}
          />
        </Animated.View>

        {/* Quiet hours note */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <GlassSurface style={styles.noteCard} noPadding>
            <View style={styles.noteCardInner}>
              <Feather name="moon" size={16} color={theme.textSecondary} />
              <ThemedText type="caption" style={[styles.noteText, { color: theme.textSecondary }]}>
                Reminders and milestone nudges respect quiet hours (10pm–8am). Pattern alerts use a slightly lighter window given their importance.
              </ThemedText>
            </View>
          </GlassSurface>
        </Animated.View>
      </ScrollView>
    </AppGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  settingRow: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingRowInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontWeight: "600",
  },
  settingDesc: {
    lineHeight: 18,
  },
  permissionBanner: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  permissionBannerInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  grantBtn: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#D85A30",
    alignItems: "center",
  },
  grantBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  noteCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginTop: Spacing.xs,
  },
  noteCardInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  noteText: {
    flex: 1,
    lineHeight: 18,
  },
});
