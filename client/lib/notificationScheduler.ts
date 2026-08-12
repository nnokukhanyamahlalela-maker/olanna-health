/**
 * Notification Scheduler
 *
 * One async function per category. Each is idempotent — safe to call on every
 * app focus or save. They check notification settings, de-duplicate via stable
 * notification IDs and scheduler state, and respect quiet hours via the service.
 *
 * Gates now use the four user-facing category keys set during onboarding:
 *   checkInReminders  → maybeSchedulePhaseReminder
 *   tipsContent       → maybeFireMilestoneNudge, maybeScheduleLapsedUserNudge,
 *                        maybeScheduleHealthSummaryReminder
 *   cyclePredictions  → fertile-window alerts (scheduler added when task ships)
 *   thresholdAlert    → fireThresholdPatternAlert (critical, own key)
 *
 * Copy rules: <15 words, warm and conversational, one emoji max, no guilt,
 * no streak-shaming, no condition names (never write PMOS or Endometriosis).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleLocalNotification, fireImmediateNotification } from "./notificationService";
import { notificationSettingsStorage } from "./notificationSettings";
import type { UserProfile, DailyLog, CycleData } from "./storage";

// ─── Scheduler state ──────────────────────────────────────────────────────────

const SCHEDULER_STATE_KEY = "@olanna_notification_scheduler";

interface SchedulerState {
  firedMilestoneKeys:    string[];
  lastLapsedNotifiedAt:  string | null;
  lastSummaryReminderAt: string | null;
}

const DEFAULT_SCHEDULER_STATE: SchedulerState = {
  firedMilestoneKeys:    [],
  lastLapsedNotifiedAt:  null,
  lastSummaryReminderAt: null,
};

async function getState(): Promise<SchedulerState> {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULER_STATE_KEY);
    return raw
      ? { ...DEFAULT_SCHEDULER_STATE, ...JSON.parse(raw) }
      : { ...DEFAULT_SCHEDULER_STATE };
  } catch {
    return { ...DEFAULT_SCHEDULER_STATE };
  }
}

async function saveState(partial: Partial<SchedulerState>): Promise<void> {
  try {
    const current = await getState();
    await AsyncStorage.setItem(
      SCHEDULER_STATE_KEY,
      JSON.stringify({ ...current, ...partial }),
    );
  } catch {}
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity;
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function tomorrowAt(hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function daysFromNowAt(days: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ─── Category: Threshold Pattern Alert ───────────────────────────────────────
// Gated on: thresholdAlert (own key — most important, never bundled)
// Tone: calm, validating, never alarming. No condition names.

/**
 * Fire an immediate notification when Lanna's pattern engine first detects
 * a Tier-3 pattern. Called from useLannaCheckIn when a new Tier 3 is seen.
 */
export async function fireThresholdPatternAlert(conditionId: string): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    if (!settings.thresholdAlert) return;

    // conditionId is used internally only — never shown to user as a label
    void conditionId;

    await fireImmediateNotification({
      notificationId: `olanna_threshold_${conditionId}`,
      title: "Something worth a look 🌿",
      body: "Lanna noticed a pattern in your recent logs. Might be worth mentioning to your provider.",
      data: { screen: "LannaCheckIn", conditionId },
      relaxedQuietHours: true,
    });
  } catch (e) {
    console.error("[NotificationScheduler] threshold alert error:", e);
  }
}

// ─── Category: Check-In Reminders ────────────────────────────────────────────
// Gated on: checkInReminders
// Tone: gentle nudge, no pressure, no streak language.

/**
 * Schedule the next log reminder, phase-aware.
 * Backs off to weekly for consistent loggers (5+ logs in the past 7 days).
 */
export async function maybeSchedulePhaseReminder(
  profile: UserProfile,
  cycleData: CycleData | null,
  dailyLogs: DailyLog[],
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    // Check new user-facing key; fall back to legacy key for existing installs
    const enabled = settings.checkInReminders ?? settings.phaseReminder ?? true;
    if (!enabled) return;

    const ID = "olanna_phase_reminder";

    // Count logs in the past 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentCount = dailyLogs.filter((l) => new Date(l.date) >= cutoff).length;

    // Consistent logger — back off to weekly
    if (recentCount >= 5) {
      await scheduleLocalNotification({
        notificationId: ID,
        title: "Your data is building up nicely 🌱",
        body: "Logging regularly makes the picture so much clearer. Keep going.",
        fireAt: daysFromNowAt(7, 9),
        data: { screen: "CheckIn" },
      });
      return;
    }

    const phase = cycleData?.phase ?? "follicular";

    let title = "Want to log how you're feeling today?";
    let body  = "No pressure — even a quick note helps Lanna build a clearer picture. 🌿";
    let daysOut = 3;

    if (phase === "luteal") {
      title   = "How are you feeling this week? 🌙";
      body    = "This part of your cycle can feel heavier. Worth noting if it does.";
      daysOut = 2;
    } else if (phase === "menstrual") {
      title   = "A gentle check-in 🌸";
      body    = "Want to note how today's feeling? No rush — whenever you're ready.";
      daysOut = 1;
    }

    await scheduleLocalNotification({
      notificationId: ID,
      title,
      body,
      fireAt: daysFromNowAt(daysOut, 9),
      data: { screen: "CheckIn" },
    });
  } catch (e) {
    console.error("[NotificationScheduler] phase reminder error:", e);
  }
}

// ─── Category: Tips and Insights — Milestone Nudges ──────────────────────────
// Gated on: tipsContent
// Tone: warm acknowledgement, no streak language.

/** milestoneKey → notification copy (all bodies ≤15 words) */
const MILESTONE_COPY: Record<string, { title: string; body: string }> = {
  firstlog: {
    title: "First log saved ✨",
    body:  "Good start. The more you log, the clearer the picture becomes.",
  },
  "7days": {
    title: "A week of data 🌱",
    body:  "Seven days in — patterns start to emerge around here.",
  },
  "14days": {
    title: "Two weeks tracked",
    body:  "A fortnight of logs. You're building something genuinely useful.",
  },
  "28days": {
    title: "One month of data ✨",
    body:  "A full month logged. Your cycle history is really taking shape.",
  },
  "1cycle": {
    title: "First full cycle tracked 🌸",
    body:  "One complete cycle. Lanna can start spotting patterns now.",
  },
  "2cycles": {
    title: "Two cycles logged",
    body:  "Two cycles gives a real baseline — your Health Summary is worth updating.",
  },
  "3cycles": {
    title: "Three cycles of data ✨",
    body:  "Enough for a provider to see genuine patterns. Well done for sticking with it.",
  },
};

/**
 * Fire a one-time milestone notification when a new milestone is reached.
 * De-duplicated by milestoneKey — each milestone fires at most once.
 */
export async function maybeFireMilestoneNudge(
  milestoneKey: string,
  _label: string,
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    const enabled = settings.tipsContent ?? settings.dataMilestone ?? true;
    if (!enabled) return;

    const state = await getState();
    if (state.firedMilestoneKeys.includes(milestoneKey)) return;

    const copy = MILESTONE_COPY[milestoneKey];
    if (!copy) return;

    // Fire in 5 minutes so it doesn't interrupt what the user is doing now
    const fireAt = new Date(Date.now() + 5 * 60 * 1000);

    await scheduleLocalNotification({
      notificationId: `olanna_milestone_${milestoneKey}`,
      title: copy.title,
      body:  copy.body,
      fireAt,
      data: { screen: "Home", milestoneKey },
    });

    await saveState({
      firedMilestoneKeys: [...state.firedMilestoneKeys, milestoneKey],
    });
  } catch (e) {
    console.error("[NotificationScheduler] milestone nudge error:", e);
  }
}

/** Map a milestone label back to its stable key for de-duplication. */
export function milestoneKeyFromLabel(label: string): string | null {
  const map: Record<string, string> = {
    "First log!":       "firstlog",
    "7 days tracked":   "7days",
    "14 days tracked":  "14days",
    "28 days tracked":  "28days",
    "1 cycle logged":   "1cycle",
    "2 cycles logged":  "2cycles",
    "3 cycles logged":  "3cycles",
    "60 days of data":  "60days",
    "90 days of data":  "90days",
  };
  return map[label] ?? null;
}

// ─── Category: Tips and Insights — Re-engagement ─────────────────────────────
// Gated on: tipsContent
// Tone: zero guilt, zero streak language, pure warmth.

/**
 * Schedule a re-engagement nudge if the user hasn't logged in 14+ days.
 * Fires at most once per 30 days.
 */
export async function maybeScheduleLapsedUserNudge(
  lastLogDate: string | null,
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    const enabled = settings.tipsContent ?? settings.lapsedUser ?? true;
    if (!enabled) return;

    if (daysSince(lastLogDate) < 14) return;

    const state = await getState();
    if (daysSince(state.lastLapsedNotifiedAt) < 30) return;

    await scheduleLocalNotification({
      notificationId: "olanna_lapsed_user",
      title: "Whenever you're ready 💙",
      body:  "Your cycle data is still here, exactly where you left it.",
      fireAt: tomorrowAt(10),
      data: { screen: "Home" },
    });

    await saveState({ lastLapsedNotifiedAt: today() });
  } catch (e) {
    console.error("[NotificationScheduler] lapsed user nudge error:", e);
  }
}

// ─── Category: Tips and Insights — Health Summary Refresh ────────────────────
// Gated on: tipsContent
// Fires if: 10+ logs + 30+ days since last reminder.

/**
 * Schedule a gentle reminder to regenerate the Health Summary.
 */
export async function maybeScheduleHealthSummaryReminder(
  dailyLogs: DailyLog[],
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    const enabled = settings.tipsContent ?? settings.healthSummaryRefresh ?? false;
    if (!enabled) return;
    if (dailyLogs.length < 10) return;

    const state = await getState();
    if (daysSince(state.lastSummaryReminderAt) < 30) return;

    await scheduleLocalNotification({
      notificationId: "olanna_summary_refresh",
      title: "Good time to refresh your Health Summary 📋",
      body:  "Your data has been building. Worth updating before your next appointment.",
      fireAt: tomorrowAt(9),
      data: { screen: "HealthSummary" },
    });

    await saveState({ lastSummaryReminderAt: today() });
  } catch (e) {
    console.error("[NotificationScheduler] summary reminder error:", e);
  }
}
