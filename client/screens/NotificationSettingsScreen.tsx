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

        {/* ── Section: Your preferences (4 user-facing categories) ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(300)}>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
            Your preferences
          </ThemedText>

          <SettingRow
            icon="moon"
            iconColor="#0F6E56"
            title="Cycle predictions"
            description="Period start estimates and fertile window updates, tailored to your logged cycle."
            value={settings.cyclePredictions ?? true}
            onToggle={(v) => toggle("cyclePredictions", v)}
            disabled={notPermitted}
          />
          <SettingRow
            icon="edit-2"
            iconColor="#C2185B"
            title="Check-in reminders"
            description="A gentle nudge to log how you're feeling. Timed to your cycle — quieter when you're already logging consistently."
            value={settings.checkInReminders ?? true}
            onToggle={(v) => toggle("checkInReminders", v)}
            disabled={notPermitted}
          />
          <SettingRow
            icon="book-open"
            iconColor="#7B5EA7"
            title="Learning content"
            description="Short reads about what's happening in your body right now, sent when they're most relevant to your phase."
            value={settings.learningContent ?? false}
            onToggle={(v) => toggle("learningContent", v)}
            disabled={notPermitted}
          />
          <SettingRow
            icon="sun"
            iconColor="#D4764E"
            title="Tips and insights"
            description="Small encouragements, milestone moments, and cycle insights from Lanna."
            value={settings.tipsContent ?? true}
            onToggle={(v) => toggle("tipsContent", v)}
            disabled={notPermitted}
          />
        </Animated.View>

        {/* ── Section: Health alerts (kept separate — most important) ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(300)}>
          <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
            Health alerts
          </ThemedText>
          <SettingRow
            icon="activity"
            iconColor="#E8739E"
            title="Pattern alerts"
            description="A calm heads-up when Lanna notices something in your logs worth mentioning to a provider. We recommend keeping this one on."
            value={settings.thresholdAlert}
            onToggle={(v) => toggle("thresholdAlert", v)}
            disabled={notPermitted}
          />
        </Animated.View>

        {/* ── Privacy note ── */}
        <Animated.View entering={FadeInDown.delay(180).duration(300)}>
          <GlassSurface style={styles.noteCard} noPadding>
            <View style={styles.noteCardInner}>
              <Feather name="lock" size={16} color={theme.textSecondary} />
              <ThemedText type="caption" style={[styles.noteText, { color: theme.textSecondary }]}>
                Your data stays on your device. Olanna never sells or shares it. Reminders respect quiet hours (10pm–8am).
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
