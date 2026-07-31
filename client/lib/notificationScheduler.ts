/**
 * Notification Scheduler
 *
 * One async function per category. Each is idempotent — safe to call on every
 * app focus or save. They check notification settings, de-duplicate via stable
 * notification IDs and scheduler state, and respect quiet hours via the service.
 *
 * Category mapping:
 *   1. fireThresholdPatternAlert   — Tier-3 pattern detection (called from useLannaCheckIn)
 *   2. maybeSchedulePhaseReminder  — Phase-aware log reminders (called from LotusCycleScreen)
 *   3. maybeFireMilestoneNudge     — Data-collection milestones (called from LotusCycleScreen)
 *   4. maybeScheduleLapsedUserNudge — Re-engagement after 14+ days quiet (from LotusCycleScreen)
 *   5. maybeScheduleHealthSummaryReminder — Periodic summary nudge (from LotusCycleScreen)
 *   6. Partner mode — infrastructure in place; actual notifications gated on consent UI (TODO)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleLocalNotification, fireImmediateNotification } from "./notificationService";
import { notificationSettingsStorage } from "./notificationSettings";
import type { UserProfile, DailyLog, CycleData } from "./storage";

// ─── Scheduler state ──────────────────────────────────────────────────────────

const SCHEDULER_STATE_KEY = "@olanna_notification_scheduler";

interface SchedulerState {
  firedMilestoneKeys: string[];
  lastLapsedNotifiedAt: string | null;
  lastSummaryReminderAt: string | null;
}

const DEFAULT_SCHEDULER_STATE: SchedulerState = {
  firedMilestoneKeys: [],
  lastLapsedNotifiedAt: null,
  lastSummaryReminderAt: null,
};

async function getState(): Promise<SchedulerState> {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULER_STATE_KEY);
    return raw ? { ...DEFAULT_SCHEDULER_STATE, ...JSON.parse(raw) } : { ...DEFAULT_SCHEDULER_STATE };
  } catch {
    return { ...DEFAULT_SCHEDULER_STATE };
  }
}

async function saveState(partial: Partial<SchedulerState>): Promise<void> {
  try {
    const current = await getState();
    await AsyncStorage.setItem(SCHEDULER_STATE_KEY, JSON.stringify({ ...current, ...partial }));
  } catch {}
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
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

// ─── Category 1 — Threshold Pattern Alert ────────────────────────────────────

const CONDITION_DISPLAY: Record<string, string> = {
  irregular_periods: "a cycle pattern",
  pmos: "a PMOS pattern",
  endometriosis: "an endometriosis pattern",
  menopause: "a cycle change pattern",
};

/**
 * Fire a calm, immediate notification when Lanna's pattern engine first detects
 * a Tier-3 pattern. Called directly from useLannaCheckIn when a new Tier 3 is seen.
 * Tone: validating, never alarming — "worth a look" not "urgent warning."
 */
export async function fireThresholdPatternAlert(conditionId: string): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    if (!settings.thresholdAlert) return;

    const name = CONDITION_DISPLAY[conditionId] ?? "a pattern";

    await fireImmediateNotification({
      notificationId: `olanna_threshold_${conditionId}`,
      title: "Something worth a look",
      body: `We've noticed ${name} in your recent logs. Nothing to worry about — open the app to see what Lanna found. It might be worth mentioning to your provider.`,
      data: { screen: "LannaCheckIn", conditionId },
      relaxedQuietHours: true,
    });
  } catch (e) {
    console.error("[NotificationScheduler] threshold alert error:", e);
  }
}

// ─── Category 2 — Phase-Aware Log Reminders ──────────────────────────────────

/**
 * Schedule the next phase-aware log reminder.
 * Backs off to weekly for consistent loggers (5+ days/week).
 * Luteal phase gets more frequent nudges (PMOS symptom clustering).
 */
export async function maybeSchedulePhaseReminder(
  profile: UserProfile,
  cycleData: CycleData | null,
  dailyLogs: DailyLog[]
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    if (!settings.phaseReminder) return;

    const ID = "olanna_phase_reminder";

    // Count logs in the past 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentCount = dailyLogs.filter((l) => new Date(l.date) >= cutoff).length;

    // Consistent logger: back off to weekly
    if (recentCount >= 5) {
      await scheduleLocalNotification({
        notificationId: ID,
        title: "Your cycle data is building",
        body: "You're logging regularly — keep it up. Data across multiple cycles is most useful to a provider.",
        fireAt: daysFromNowAt(7, 9),
        data: { screen: "CheckIn" },
      });
      return;
    }

    const phase = cycleData?.phase ?? "follicular";

    let title = "Log how you're feeling today";
    let body = "A quick check-in takes less than a minute and builds a picture your provider can actually use.";
    let daysOut = 3;

    if (phase === "luteal") {
      title = "Luteal phase check-in";
      body = "This is when PMOS symptoms often cluster. Even a brief note helps Lanna build a clearer picture.";
      daysOut = 2;
    } else if (phase === "menstrual") {
      title = "Period log reminder";
      body = "Logging your flow accurately tracks your cycle length. Worth 30 seconds if you can.";
      daysOut = 1;
    } else if (phase === "follicular") {
      daysOut = 3;
    } else if (phase === "ovulation") {
      daysOut = 3;
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

// ─── Category 3 — Data Milestone Nudges ──────────────────────────────────────

/** milestoneKey → user-facing notification copy */
const MILESTONE_COPY: Record<string, { title: string; body: string }> = {
  firstlog: {
    title: "First log saved",
    body: "Good start. The more you log, the clearer the picture — for you and anyone you choose to share it with.",
  },
  "7days": {
    title: "7 days of data",
    body: "A week of logs is a solid foundation. Keep going — patterns take a bit of time to emerge.",
  },
  "14days": {
    title: "Two weeks tracked",
    body: "You're building a useful picture. Two weeks shows how your cycle affects your week-to-week experience.",
  },
  "28days": {
    title: "One month of data",
    body: "A full month logged. Your cycle history is building into something genuinely useful.",
  },
  "1cycle": {
    title: "First complete cycle",
    body: "One full cycle tracked. Lanna can start noticing patterns — and your Health Summary is worth generating.",
  },
  "2cycles": {
    title: "Two cycles logged",
    body: "Two cycles gives your provider a real baseline. Your Health Summary is worth updating.",
  },
  "3cycles": {
    title: "Three cycles tracked",
    body: "Three cycles of data — enough for a provider to see a genuine pattern. Your Health Summary could make a real difference at your next appointment.",
  },
};

/**
 * Fire a one-time milestone notification when a new milestone is reached.
 * De-duplicated by milestoneKey so each milestone fires at most once.
 */
export async function maybeFireMilestoneNudge(
  milestoneKey: string,
  _label: string
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    if (!settings.dataMilestone) return;

    const state = await getState();
    if (state.firedMilestoneKeys.includes(milestoneKey)) return;

    const copy = MILESTONE_COPY[milestoneKey];
    if (!copy) return;

    // Fire in 5 minutes so it doesn't interrupt whatever the user is doing now
    const fireAt = new Date(Date.now() + 5 * 60 * 1000);

    await scheduleLocalNotification({
      notificationId: `olanna_milestone_${milestoneKey}`,
      title: copy.title,
      body: copy.body,
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
    "First log!": "firstlog",
    "7 days tracked": "7days",
    "14 days tracked": "14days",
    "28 days tracked": "28days",
    "1 cycle logged": "1cycle",
    "2 cycles logged": "2cycles",
    "3 cycles logged": "3cycles",
    "60 days of data": "60days",
    "90 days of data": "90days",
  };
  return map[label] ?? null;
}

// ─── Category 4 — Lapsed User Re-engagement ──────────────────────────────────

/**
 * Schedule a re-engagement nudge if the user hasn't logged in 14+ days.
 * Zero guilt, no streak language. Fires at most once per 30 days.
 */
export async function maybeScheduleLapsedUserNudge(
  lastLogDate: string | null
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    if (!settings.lapsedUser) return;

    if (daysSince(lastLogDate) < 14) return;

    const state = await getState();
    if (daysSince(state.lastLapsedNotifiedAt) < 30) return;

    await scheduleLocalNotification({
      notificationId: "olanna_lapsed_user",
      title: "Whenever you're ready",
      body: "Your cycle data is still here, exactly where you left it. No pressure — even one log builds the picture.",
      fireAt: tomorrowAt(10),
      data: { screen: "Home" },
    });

    await saveState({ lastLapsedNotifiedAt: today() });
  } catch (e) {
    console.error("[NotificationScheduler] lapsed user nudge error:", e);
  }
}

// ─── Category 5 — Health Summary Refresh Reminder ────────────────────────────

/**
 * Schedule a gentle reminder to regenerate the Health Summary.
 * Fires if: category enabled + 10+ logs + 30+ days since last reminder.
 */
export async function maybeScheduleHealthSummaryReminder(
  dailyLogs: DailyLog[]
): Promise<void> {
  try {
    const settings = await notificationSettingsStorage.get();
    if (!settings.healthSummaryRefresh) return;
    if (dailyLogs.length < 10) return;

    const state = await getState();
    if (daysSince(state.lastSummaryReminderAt) < 30) return;

    await scheduleLocalNotification({
      notificationId: "olanna_summary_refresh",
      title: "Worth updating your Health Summary",
      body: "Your cycle data has been building. An updated summary could be useful if you have an appointment coming up.",
      fireAt: tomorrowAt(9),
      data: { screen: "HealthSummary" },
    });

    await saveState({ lastSummaryReminderAt: today() });
  } catch (e) {
    console.error("[NotificationScheduler] summary reminder error:", e);
  }
}
