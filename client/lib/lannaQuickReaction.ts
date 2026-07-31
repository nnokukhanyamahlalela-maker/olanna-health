/**
 * lannaQuickReaction
 *
 * Pattern-aware reaction copy for the post-quick-log Lanna card.
 * Inspects the last 5–7 DailyLogs and the just-saved log to return
 * a single templated reaction string.
 *
 * Priority order (highest wins):
 *  1. Pattern-aware: consecutive high-pain streak, frequent symptom cluster,
 *     repeated low-energy — fires regardless of whether it's a first log of day
 *  2. First log of today (or ever) — neutral encouragement
 *  3. Default fallback
 *
 * Tone rules (enforced by copy):
 *  - Never celebratory about symptom-free days
 *  - Never express concern or sadness about high-severity logs
 *  - Always neutral-validating
 */

import { DailyLog } from "@/lib/storage";
import type { QuickLogDomain } from "@/components/QuickLogSheet";

// Symptom IDs that indicate high pain in the quick-log pain domain
const HIGH_PAIN_SYMPTOMS = ["deep-pelvic-pain", "pelvic-heaviness"];

// How many recent logs (other than today) trigger a "frequent symptom" reaction
const FREQUENT_THRESHOLD = 3;

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function prevDayKey(base: string, offsetDays: number): string {
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
}

// ─── Pattern checks ────────────────────────────────────────────────────────────

/**
 * Number of consecutive calendar days *before* today that had high-pain quick logs.
 * We look backward only so the just-saved log doesn't skew the streak count.
 */
function pastHighPainStreak(recentLogs: DailyLog[]): number {
  const today = todayKey();
  let streak = 0;
  for (let i = 1; i <= 7; i++) {
    const key = prevDayKey(today, i);
    const log = recentLogs.find((l) => l.date.slice(0, 10) === key);
    if (!log) break;
    const hasHighPain = HIGH_PAIN_SYMPTOMS.some((s) => (log.symptoms ?? []).includes(s));
    if (hasHighPain) streak++;
    else break;
  }
  return streak;
}

/**
 * Returns the most-frequent pain/mood symptom logged in the last 30 days
 * (excluding today) that meets the threshold, or null.
 */
function frequentSymptom(
  recentLogs: DailyLog[],
  domain: QuickLogDomain
): string | null {
  const today = todayKey();
  const cutoff = prevDayKey(today, 30);
  // Exclude today — we only look at historical pattern
  const historical = recentLogs.filter(
    (l) => l.date.slice(0, 10) < today && l.date.slice(0, 10) >= cutoff
  );

  if (domain === "pain") {
    const counts: Record<string, number> = {};
    for (const log of historical) {
      for (const s of log.symptoms ?? []) {
        if (HIGH_PAIN_SYMPTOMS.includes(s)) {
          counts[s] = (counts[s] ?? 0) + 1;
        }
      }
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= FREQUENT_THRESHOLD) {
      return top[0] === "deep-pelvic-pain" ? "deep pelvic pain" : "pelvic heaviness";
    }
  }

  if (domain === "mood") {
    const counts: Record<string, number> = {};
    for (const log of historical) {
      if (log.mood) counts[log.mood] = (counts[log.mood] ?? 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (
      top &&
      top[1] >= FREQUENT_THRESHOLD &&
      ["anxious", "irritable", "sad"].includes(top[0])
    ) {
      return top[0];
    }
  }

  return null;
}

/**
 * Number of historical days (before today) in the last 7 that had low energy (≤ 2).
 */
function pastLowEnergyDays(recentLogs: DailyLog[]): number {
  const today = todayKey();
  return recentLogs.filter(
    (l) =>
      l.date.slice(0, 10) < today &&
      l.energy !== undefined &&
      l.energy <= 2
  ).length;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface JustSavedLog {
  domain: QuickLogDomain;
  /** The full DailyLog that was just written to storage */
  log: DailyLog;
}

/**
 * Build a pattern-aware, neutral-validating reaction string for Lanna.
 *
 * @param recentLogs         Last 5–7 DailyLogs (already includes today's save)
 * @param justSaved          The domain and log entry that was just saved
 * @param hadExistingTodayLog  Whether today already had a log *before* this save.
 *                           Must be captured from local state before the save fires.
 */
export function buildLannaReaction(
  recentLogs: DailyLog[],
  justSaved: JustSavedLog,
  hadExistingTodayLog: boolean
): string {
  const { domain, log } = justSaved;

  // ── 1. High pain — streak across prior days + today ─────────────────────────
  if (domain === "pain") {
    const todayHasHighPain = HIGH_PAIN_SYMPTOMS.some((s) =>
      (log.symptoms ?? []).includes(s)
    );
    if (todayHasHighPain) {
      const pastStreak = pastHighPainStreak(recentLogs);
      const totalStreak = pastStreak + 1; // +1 for today
      if (totalStreak >= 3) {
        return `This is the third day in a row you've logged high pain. That's worth noting — your summary is building.`;
      }
      if (totalStreak === 2) {
        return "You've logged pain two days in a row. Lanna's keeping track.";
      }
    }
  }

  // ── 2. Frequent symptom / mood cluster ──────────────────────────────────────
  const freqSymptom = frequentSymptom(recentLogs, domain);
  if (freqSymptom) {
    return `You've been logging ${freqSymptom} a lot lately. Lanna's noticed a pattern — check your Check-In.`;
  }

  // ── 3. Repeated low energy ───────────────────────────────────────────────────
  if (domain === "energy" && log.energy !== undefined && log.energy <= 2) {
    const pastDays = pastLowEnergyDays(recentLogs);
    if (pastDays >= 2) {
      return "Low energy logged again. Your pattern is building — check your summary when you're ready.";
    }
  }

  // ── 4. First log of today (or ever) ─────────────────────────────────────────
  if (!hadExistingTodayLog) {
    return "Logged. Tracking this consistently helps build your picture.";
  }

  // ── 5. Default fallback ───────────────────────────────────────────────────────
  return "Logged. Every entry adds to your health picture.";
}
