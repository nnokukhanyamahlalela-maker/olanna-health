/**
 * quickLogHelpers.ts
 *
 * Utilities for deriving today's quick-log summary from the DailyLog array.
 * Extracted here so they can be unit-tested independently of the screen.
 *
 * Timezone safety
 * ───────────────
 * `new Date().toISOString()` returns a UTC timestamp.  On devices in UTC+12–14
 * timezones during early-morning hours, the UTC date is one day behind the
 * local calendar date.  A log saved on "today" (local) would have a local date
 * string (e.g. 2026-08-11) that would NOT match the UTC date string (2026-08-10)
 * returned by toISOString().  Conversely, on UTC− devices at 23:xx local, the
 * UTC date is already tomorrow, so the log saved "today" would be missed.
 *
 * We therefore always derive today's date from the LOCAL clock via
 * `getFullYear / getMonth / getDate`, matching how logs are written.
 */

import type { DailyLog } from "./storage";

// ─── Exported for testing ────────────────────────────────────────────────────

/**
 * Returns the local calendar date as a YYYY-MM-DD string.
 * Accepts an optional `now` argument so tests can inject a fixed date.
 */
export function localDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TodayQuickLog {
  flow?: string;
  mood?: string;
  pain?: string;
  energy?: string;
}

export const ENERGY_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

// ─── Main helper ─────────────────────────────────────────────────────────────

/**
 * Finds the log entry for the current local calendar day and maps its fields
 * to display strings for the quick-log indicator row.
 *
 * Returns an empty object when no log exists for today.
 *
 * @param logs  - Full array of DailyLog entries from storage.
 * @param now   - Optional override for "now" (used in tests).
 */
export function getTodayQuickLog(
  logs: DailyLog[],
  now?: Date,
): TodayQuickLog {
  const today = localDateString(now);
  const todayLog = logs.find((l) => l.date.slice(0, 10) === today);
  if (!todayLog) return {};

  const result: TodayQuickLog = {};

  if (todayLog.flow) {
    result.flow =
      todayLog.flow.charAt(0).toUpperCase() + todayLog.flow.slice(1);
  }
  if (todayLog.mood) {
    result.mood =
      todayLog.mood.charAt(0).toUpperCase() + todayLog.mood.slice(1);
  }
  if (todayLog.energy != null) {
    result.energy = ENERGY_LABELS[todayLog.energy] ?? String(todayLog.energy);
  }

  // Derive pain level from symptom IDs written by QuickLogSheet.
  // "pain-none" is a sentinel for an explicit "No pain" choice.
  if (todayLog.symptoms.includes("pain-none")) {
    result.pain = "None";
  } else if (todayLog.symptoms.includes("deep-pelvic-pain")) {
    result.pain = "Severe";
  } else if (todayLog.symptoms.includes("pelvic-heaviness")) {
    result.pain = "Moderate";
  } else if (todayLog.symptoms.includes("cramps")) {
    result.pain = "Mild";
  }

  return result;
}
