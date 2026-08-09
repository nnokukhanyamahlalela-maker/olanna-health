/**
 * pain-streak-detector.test.ts
 *
 * Unit tests for detectConsecutiveHighPain.
 *
 * The function should only return a date (fire the threshold card) when the
 * user's most recent pain logs form an unbroken run of ≥3 consecutive calendar
 * days.  Scattered or non-consecutive days must never trigger it.
 *
 * Scenarios
 * ─────────
 * 1. Exactly 3 consecutive days          → fires (returns the most-recent date)
 * 2. Only 2 consecutive days             → does not fire (returns null)
 * 3. 3 pain days with a gap in between   → does not fire (returns null)
 * 4. Old 3-day streak, gap, then new
 *    3-day streak at the end             → fires for the NEW streak only
 * 5. No logs at all                      → returns null
 * 6. Single pain day                     → returns null
 * 7. 4 consecutive days                  → fires (≥3 is enough)
 * 8. Duplicate entries on the same day
 *    don't artificially inflate the count → counted as one day
 */

import { describe, it, expect } from "vitest";
import { detectConsecutiveHighPain } from "../lib/painStreakDetector";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal DailyLog shape — only the fields the detector reads. */
interface MinimalLog {
  id: string;
  date: string;
  symptoms: string[];
  createdAt: string;
  flow?: string;
  mood?: string;
  energy?: number;
  sleep?: number;
  notes?: string;
}

let _id = 0;
function makeLog(date: string, severe: boolean): MinimalLog {
  return {
    id: String(++_id),
    date,
    symptoms: severe ? ["deep-pelvic-pain"] : [],
    createdAt: `${date}T00:00:00.000Z`,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("detectConsecutiveHighPain", () => {
  it("returns null when there are no logs", () => {
    expect(detectConsecutiveHighPain([])).toBeNull();
  });

  it("returns null for a single severe-pain day (streak < 3)", () => {
    const logs = [makeLog("2026-07-10", true)];
    expect(detectConsecutiveHighPain(logs as any)).toBeNull();
  });

  it("returns null for exactly 2 consecutive severe-pain days", () => {
    const logs = [
      makeLog("2026-07-10", true),
      makeLog("2026-07-11", true),
    ];
    expect(detectConsecutiveHighPain(logs as any)).toBeNull();
  });

  it("fires and returns the latest date for exactly 3 consecutive severe-pain days", () => {
    const logs = [
      makeLog("2026-07-10", true),
      makeLog("2026-07-11", true),
      makeLog("2026-07-12", true),
    ];
    expect(detectConsecutiveHighPain(logs as any)).toBe("2026-07-12");
  });

  it("fires for 4 consecutive severe-pain days (≥3 is sufficient)", () => {
    const logs = [
      makeLog("2026-07-10", true),
      makeLog("2026-07-11", true),
      makeLog("2026-07-12", true),
      makeLog("2026-07-13", true),
    ];
    expect(detectConsecutiveHighPain(logs as any)).toBe("2026-07-13");
  });

  it("returns null when 3 pain days are scattered (2-day gap)", () => {
    // Days 10, 12, 14 — none are consecutive
    const logs = [
      makeLog("2026-07-10", true),
      makeLog("2026-07-12", true),
      makeLog("2026-07-14", true),
    ];
    expect(detectConsecutiveHighPain(logs as any)).toBeNull();
  });

  it("returns null when 3 pain days have a 1-day gap breaking the run", () => {
    // Days 10, 11, 13 — gap between 11 and 13
    const logs = [
      makeLog("2026-07-10", true),
      makeLog("2026-07-11", true),
      makeLog("2026-07-13", true),
    ];
    expect(detectConsecutiveHighPain(logs as any)).toBeNull();
  });

  it("fires for a new 3-day streak that follows an older streak separated by a gap", () => {
    // Old streak: 1-3 July.  Gap: 4-6.  New streak: 7-9 July (anchored to today).
    const logs = [
      // Old streak
      makeLog("2026-07-01", true),
      makeLog("2026-07-02", true),
      makeLog("2026-07-03", true),
      // Gap days (non-severe)
      makeLog("2026-07-04", false),
      makeLog("2026-07-05", false),
      // New streak
      makeLog("2026-07-07", true),
      makeLog("2026-07-08", true),
      makeLog("2026-07-09", true),
    ];
    // Must fire for the new streak, returning the most-recent pain date
    expect(detectConsecutiveHighPain(logs as any)).toBe("2026-07-09");
  });

  it("does not fire when the most-recent pain day breaks a prior run (reset case)", () => {
    // Streak: 10-12, then a gap, isolated day 15 — latest pain is NOT part of a 3-day run
    const logs = [
      makeLog("2026-07-10", true),
      makeLog("2026-07-11", true),
      makeLog("2026-07-12", true),
      makeLog("2026-07-15", true), // isolated — breaks the anchor
    ];
    // The streak is not anchored to day 15 (the most-recent), so must return null
    expect(detectConsecutiveHighPain(logs as any)).toBeNull();
  });

  it("counts duplicate log entries on the same day as a single day", () => {
    // Two entries for 2026-07-12 — should not double-count the day
    const logs = [
      makeLog("2026-07-10", true),
      makeLog("2026-07-11", true),
      makeLog("2026-07-12", true),
      makeLog("2026-07-12", true), // duplicate
    ];
    // Deduplication keeps this as a valid 3-day streak
    expect(detectConsecutiveHighPain(logs as any)).toBe("2026-07-12");
  });

  it("ignores non-severe symptom days when counting the streak", () => {
    // Days 10 and 12 are severe; day 11 has symptoms but NOT deep-pelvic-pain
    const logs = [
      makeLog("2026-07-10", true),
      { ...makeLog("2026-07-11", false), symptoms: ["cramps"] }, // not severe
      makeLog("2026-07-12", true),
    ];
    // Only 2 severe days; they are not consecutive from the detector's view
    expect(detectConsecutiveHighPain(logs as any)).toBeNull();
  });
});
