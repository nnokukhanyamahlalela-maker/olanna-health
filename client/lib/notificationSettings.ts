/**
 * Notification Settings Storage
 *
 * Four user-facing category prefs (set during onboarding, editable in Settings)
 * plus the internal permission state and the critical health-alert toggle.
 *
 * User-facing categories:
 *   cyclePredictions  — period estimates + fertile window
 *   checkInReminders  — gentle log reminders
 *   learningContent   — phase-relevant educational content
 *   tipsContent       — milestones, encouragements, re-engagement
 *
 * Internal-only (not surfaced in the 4-category onboarding UI):
 *   thresholdAlert    — pattern alert (most important, kept separate)
 *   partnerMode       — requires its own consent step
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@olanna_notification_settings";

export type NotificationCategory =
  // ── User-facing (onboarding + settings) ──────────────────────────────────
  | "cyclePredictions"   // 1. Cycle phase + fertile window updates
  | "checkInReminders"   // 2. Gentle log / symptom reminders
  | "learningContent"    // 3. Educational phase content
  | "tipsContent"        // 4. Milestones, encouragements, re-engagement
  // ── Internal / special-case ──────────────────────────────────────────────
  | "thresholdAlert"     // Health pattern alert — separate section in Settings
  | "partnerMode"        // Partner notifications — needs its own consent UI
  // ── Legacy (kept for backward-compat; scheduler now reads user-facing keys) ──
  | "phaseReminder"
  | "dataMilestone"
  | "lapsedUser"
  | "healthSummaryRefresh"
  | "fertileWindow";

export interface NotificationSettings {
  /** OS permission state */
  permissionGranted:   boolean;
  permissionRequested: boolean;

  /** ── User-facing categories (set in onboarding, editable in Settings) ── */
  cyclePredictions:  boolean;  // period estimates + fertile window
  checkInReminders:  boolean;  // gentle log reminders
  learningContent:   boolean;  // phase-relevant reads
  tipsContent:       boolean;  // milestones + encouragements + re-engagement

  /** ── Internal / special-case ── */
  thresholdAlert:      boolean;  // pattern alert — most important, own row
  partnerMode:         boolean;  // partner notifications (own consent step)

  /** ── Legacy fields — scheduler reads user-facing keys now ── */
  phaseReminder:         boolean;
  dataMilestone:         boolean;
  lapsedUser:            boolean;
  healthSummaryRefresh:  boolean;
  fertileWindow:         boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  permissionGranted:   false,
  permissionRequested: false,

  cyclePredictions: true,
  checkInReminders: true,
  learningContent:  false,  // off by default — lower-priority
  tipsContent:      true,

  thresholdAlert: true,
  partnerMode:    false,   // off — needs explicit consent

  // Legacy
  phaseReminder:        true,
  dataMilestone:        true,
  lapsedUser:           true,
  healthSummaryRefresh: false,
  fertileWindow:        true,
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
        JSON.stringify({ ...current, ...partial }),
      );
    } catch (e) {
      console.error("[NotificationSettings] save error:", e);
    }
  },
};
