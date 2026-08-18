/**
 * Notification Service
 *
 * Thin wrapper around expo-notifications that handles:
 *  - Permission request (one-shot, gated by permissionRequested flag)
 *  - Quiet-hours enforcement (strict 10pm–8am for reminders, relaxed for alerts)
 *  - Stable-ID scheduling so a rescheduled notification replaces its predecessor
 *  - Immediate (unprompted) notifications for high-priority threshold alerts
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationSettingsStorage } from "./notificationSettings";
import { getApiUrl } from "./query-client";
import { getDeviceId } from "./deviceId";

// Expo project ID (must match app.json extra.eas.projectId)
const EXPO_PROJECT_ID = "73342dce-db45-4b6e-a6f6-657a75b138b6";
const PUSH_TOKEN_KEY  = "@olanna_push_token";

// ─── Push token registration ──────────────────────────────────────────────────

/**
 * Fetch the Expo push token for this device and register it with the server.
 * Safe to call on every app focus — skips if token is unchanged.
 */
export async function registerPushToken(): Promise<void> {
  try {
    if (Platform.OS === "web") return;

    const settings = await notificationSettingsStorage.get();
    if (!settings.permissionGranted) return;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });
    const token = tokenData.data;
    if (!token) return;

    // Skip server call if token hasn't changed since last registration
    const cached = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (cached === token) return;

    const deviceId = await getDeviceId();
    const baseUrl  = getApiUrl();

    const res = await fetch(new URL("/api/push/register", baseUrl).toString(), {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id":  deviceId,
      },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } else {
      console.warn("[NotificationService] push token registration failed:", res.status);
    }
  } catch (e) {
    // Non-fatal — local notifications still work without a remote token
    console.warn("[NotificationService] registerPushToken error:", e);
  }
}

// ─── Handler (must be set at module level) ────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Quiet hours ──────────────────────────────────────────────────────────────

/** Strict quiet hours: 10pm → 8am. Used for reminders and milestone nudges. */
const QH_STRICT = { startHour: 22, endHour: 8 };
/** Relaxed quiet hours: 10pm → 7am. Used for threshold pattern alerts. */
const QH_RELAXED = { startHour: 22, endHour: 7 };

export function isInQuietHours(relaxed = false): boolean {
  const { startHour, endHour } = relaxed ? QH_RELAXED : QH_STRICT;
  const h = new Date().getHours();
  // Wraps midnight (22 > 8)
  return startHour > endHour ? h >= startHour || h < endHour : h >= startHour && h < endHour;
}

/** Return the next Date that falls outside quiet hours, at the wake-up boundary. */
export function nextAllowedTime(relaxed = false): Date {
  const { endHour } = relaxed ? QH_RELAXED : QH_STRICT;
  const next = new Date();
  // Advance to the end-of-quiet hour today or tomorrow
  next.setHours(endHour, 0, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);
  return next;
}

// ─── Permission ───────────────────────────────────────────────────────────────

/**
 * Request OS notification permission and persist the result.
 * Returns true if the user granted it.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === "web") {
      await notificationSettingsStorage.save({ permissionRequested: true, permissionGranted: false });
      return false;
    }
    const existing = await Notifications.getPermissionsAsync() as any;
    const alreadyGranted: boolean = existing.granted ?? (existing.status === "granted");
    if (alreadyGranted) {
      await notificationSettingsStorage.save({ permissionRequested: true, permissionGranted: true });
      return true;
    }
    const result = await Notifications.requestPermissionsAsync() as any;
    const granted: boolean = result.granted ?? (result.status === "granted");
    await notificationSettingsStorage.save({ permissionRequested: true, permissionGranted: granted });
    // Register push token immediately after permission is granted
    if (granted) registerPushToken().catch(() => {});
    return granted;
  } catch (e) {
    console.error("[NotificationService] permission request error:", e);
    await notificationSettingsStorage.save({ permissionRequested: true });
    return false;
  }
}

/**
 * Request permission only if we haven't asked yet.
 * Safe to call from both onboarding and the first check-in save.
 */
export async function maybeRequestPermission(): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    if (settings.permissionRequested) return;
    await requestNotificationPermission();
  } catch (e) {
    console.error("[NotificationService] maybeRequestPermission error:", e);
  }
}

// ─── Scheduling helpers ───────────────────────────────────────────────────────

export interface ScheduleOptions {
  /** Stable identifier — cancels any existing notification with this ID before scheduling. */
  notificationId: string;
  title: string;
  body: string;
  /** When to fire. Will be pushed past quiet hours if needed. */
  fireAt: Date;
  /** Use the lighter quiet-hours window (threshold alerts). */
  relaxedQuietHours?: boolean;
  data?: Record<string, unknown>;
}

/**
 * Schedule a local notification at `fireAt`, respecting quiet hours.
 * Returns the scheduled identifier, or null if permission isn't granted.
 */
export async function scheduleLocalNotification(
  opts: ScheduleOptions
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    const settings = await notificationSettingsStorage.get();
    if (!settings.permissionGranted) return null;

    // Cancel the existing notification with this ID (idempotent reschedule)
    await Notifications.cancelScheduledNotificationAsync(opts.notificationId).catch(() => {});

    // Enforce quiet hours
    let fireAt = new Date(opts.fireAt);
    if (isInQuietHours(opts.relaxedQuietHours)) {
      fireAt = nextAllowedTime(opts.relaxedQuietHours);
    }

    // Never schedule in the past
    const secondsFromNow = Math.max(5, Math.floor((fireAt.getTime() - Date.now()) / 1000));

    const id = await Notifications.scheduleNotificationAsync({
      identifier: opts.notificationId,
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data ?? {},
        sound: false,
      },
      trigger: { seconds: secondsFromNow, repeats: false } as any,
    });
    return id;
  } catch (e) {
    console.error("[NotificationService] schedule error:", e);
    return null;
  }
}

/**
 * Fire an immediate local notification (no trigger).
 * Used for threshold pattern alerts — does not respect quiet hours strictly,
 * but is still blocked between 10pm and 7am.
 */
export async function fireImmediateNotification(
  opts: Omit<ScheduleOptions, "fireAt">
): Promise<void> {
  try {
    if (Platform.OS === "web") return;

    const settings = await notificationSettingsStorage.get();
    if (!settings.permissionGranted) return;

    if (isInQuietHours(true)) {
      // Defer to just after relaxed quiet hours end
      const fireAt = nextAllowedTime(true);
      await scheduleLocalNotification({ ...opts, fireAt, relaxedQuietHours: true });
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: opts.notificationId,
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data ?? {},
        sound: false,
      },
      trigger: null,
    });
  } catch (e) {
    console.error("[NotificationService] immediate notification error:", e);
  }
}

/** Cancel a specific scheduled notification by ID. */
export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}
