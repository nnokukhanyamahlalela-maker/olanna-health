/**
 * painStreakDetector.ts
 *
 * Detects whether the user has logged severe pain for three or more
 * *consecutive* calendar days ending on the most recent pain log date.
 *
 * Extracted from LotusCycleScreen so the logic can be unit-tested without
 * pulling in React-Native / Expo dependencies.
 */

import type { DailyLog } from "@/lib/storage";

/**
 * Returns the ISO date of the most recent consecutive high-severity pain day
 * if the user has logged severe pain ("deep-pelvic-pain" symptom) for 3 or
 * more consecutive calendar days ending on the most recent pain log date.
 * Returns null when the threshold is not met.
 *
 * "high-severity" = QuickLog "Severe" selection, which writes "deep-pelvic-pain"
 * to DailyLog.symptoms.
 */
export function detectConsecutiveHighPain(logs: DailyLog[]): string | null {
  if (logs.length === 0) return null;

  // Deduplicate to one entry per calendar day; keep only severe-pain days.
  const painDates = [
    ...new Set(
      logs
        .filter((l) => l.symptoms.includes("deep-pelvic-pain"))
        .map((l) => l.date.slice(0, 10))
    ),
  ].sort((a, b) => b.localeCompare(a)); // descending — most recent first

  if (painDates.length < 3) return null;

  // The streak MUST be anchored to the most recent pain date.
  // Walk backwards from painDates[0]; any gap before reaching 3 means no
  // active streak — return null immediately rather than scanning further back.
  let streak = 1;
  for (let i = 1; i < painDates.length; i++) {
    const newer = new Date(painDates[i - 1] + "T12:00:00");
    const older = new Date(painDates[i] + "T12:00:00");
    const daysDiff = Math.round(
      (newer.getTime() - older.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff === 1) {
      streak++;
      if (streak >= 3) {
        // Streak is anchored to painDates[0] — use it as the event date so
        // dismissal tracking always maps to the latest pain day in the run.
        return painDates[0];
      }
    } else {
      // Gap found before streak reached 3: no current active streak.
      return null;
    }
  }
  return null;
}
