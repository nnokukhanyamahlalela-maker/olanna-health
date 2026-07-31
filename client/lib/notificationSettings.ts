/**
 * Notification Settings Storage
 *
 * Per-category opt-in flags plus permission state.
 * All categories default on except healthSummaryRefresh (lowest priority)
 * and partnerMode (requires its own consent step).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@olanna_notification_settings";

export type NotificationCategory =
  | "thresholdAlert"      // 1. Tier-3 pattern alert — highest priority
  | "phaseReminder"       // 2. Phase-aware log reminders
  | "dataMilestone"       // 3. Data-milestone nudges
  | "lapsedUser"          // 4. Re-engagement
  | "healthSummaryRefresh" // 5. Periodic summary nudge
  | "partnerMode";        // 6. Partner notifications (needs consent step)

export interface NotificationSettings {
  /** Whether the OS permission has been granted */
  permissionGranted: boolean;
  /** Whether we've already shown the OS permission dialog */
  permissionRequested: boolean;
  thresholdAlert: boolean;
  phaseReminder: boolean;
  dataMilestone: boolean;
  lapsedUser: boolean;
  healthSummaryRefresh: boolean;
  partnerMode: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  permissionGranted: false,
  permissionRequested: false,
  thresholdAlert: true,
  phaseReminder: true,
  dataMilestone: true,
  lapsedUser: true,
  healthSummaryRefresh: false, // off by default — lower priority
  partnerMode: false,          // off by default — needs explicit consent
};

export const notificationSettingsStorage = {
  async get(): Promise<NotificationSettings> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw
        ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) }
        : { ...DEFAULT_NOTIFICATION_SETTINGS };
    } catch {
      return { ...DEFAULT_NOTIFICATION_SETTINGS };
    }
  },

  async save(partial: Partial<NotificationSettings>): Promise<void> {
    try {
      const current = await this.get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...current, ...partial })
      );
    } catch (e) {
      console.error("[NotificationSettings] save error:", e);
    }
  },
};
