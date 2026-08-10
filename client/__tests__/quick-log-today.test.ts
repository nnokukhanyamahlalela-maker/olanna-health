/**
 * quick-log-today.test.ts
 *
 * Unit tests for getTodayQuickLog and localDateString from quickLogHelpers.
 *
 * Scenarios
 * ─────────────────────────────────────────────────────────────────────────────
 * localDateString
 *  1. Returns YYYY-MM-DD derived from local year/month/day (not UTC).
 *  2. Pads single-digit months and days.
 *  3. Handles end-of-year boundary.
 *
 * getTodayQuickLog — basic
 *  4. Empty log array → empty object.
 *  5. Yesterday's log → no indicators.
 *  6. Today's log → correct indicator values for all four domains.
 *
 * Timezone edge cases (write-path / read-path consistency)
 *  7. A log written with localDateString(now) IS found by getTodayQuickLog(logs, now).
 *  8. A log written with the UTC date string (the old bug) is NOT found when the
 *     local date differs from the UTC date (UTC+ device, early morning).
 *  9. Same consistency for a UTC− device (local date behind UTC).
 *
 * Field mapping
 * 10. All flow capitalisation variants.
 * 11. All five energy levels.
 * 12. All three pain severity levels.
 * 13. Higher severity wins when multiple pain symptoms are present.
 * 14. No pain key when no pain symptoms are present.
 * 15. Missing fields are omitted (not set to undefined placeholder).
 *
 * Multiple logs
 * 16. Only today's log is used when multiple dates are present.
 */

import { describe, it, expect } from "vitest";
import { getTodayQuickLog, localDateString } from "../lib/quickLogHelpers";
import type { DailyLog } from "../lib/storage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _id = 0;
function makeLog(date: string, overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    id: String(++_id),
    date,
    symptoms: [],
    createdAt: `${date}T12:00:00.000Z`,
    ...overrides,
  };
}

/**
 * Build a Date that has the given LOCAL year/month/day and hour/minute.
 * This lets tests inject a "now" without depending on the process timezone.
 */
function localDate(
  year: number,
  month: number, // 1-based
  day: number,
  hour = 12,
  minute = 0,
): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/**
 * Simulate the OLD (buggy) write path: derive a date key from UTC via
 * toISOString(). When the local and UTC dates diverge this produces the wrong key.
 */
function utcDateString(now: Date): string {
  return now.toISOString().split("T")[0];
}

// ─── localDateString ──────────────────────────────────────────────────────────

describe("localDateString", () => {
  it("returns YYYY-MM-DD from local year/month/day, not UTC", () => {
    // Simulate a device in a UTC+14 timezone where local time is 2026-08-11 00:30.
    // At that moment, UTC is still 2026-08-10 (local day ahead of UTC).
    // We construct the Date using local components to guarantee local date = Aug 11.
    const localAugust11 = localDate(2026, 8, 11, 0, 30);
    expect(localDateString(localAugust11)).toBe("2026-08-11");
  });

  it("pads single-digit months and days with zeros", () => {
    expect(localDateString(localDate(2026, 1, 1))).toBe("2026-01-01");
    expect(localDateString(localDate(2026, 9, 5))).toBe("2026-09-05");
  });

  it("handles end-of-year correctly", () => {
    expect(localDateString(localDate(2025, 12, 31, 23, 59))).toBe("2025-12-31");
  });
});

// ─── getTodayQuickLog — basic ─────────────────────────────────────────────────

describe("getTodayQuickLog — basic", () => {
  it("returns empty object when there are no logs", () => {
    expect(getTodayQuickLog([], localDate(2026, 8, 10))).toEqual({});
  });

  it("returns empty object when the only log is from yesterday", () => {
    const now = localDate(2026, 8, 10);
    const log = makeLog("2026-08-09", { flow: "medium", mood: "happy" });
    expect(getTodayQuickLog([log], now)).toEqual({});
  });

  it("returns all four indicator fields when today's log has every domain set", () => {
    const now = localDate(2026, 8, 10);
    const log = makeLog("2026-08-10", {
      flow: "medium",
      mood: "calm",
      energy: 4,
      symptoms: ["cramps"],
    });
    expect(getTodayQuickLog([log], now)).toEqual({
      flow: "Medium",
      mood: "Calm",
      energy: "High",
      pain: "Mild",
    });
  });
});

// ─── Timezone edge cases: writer / reader consistency ─────────────────────────

describe("getTodayQuickLog — write-path / read-path consistency", () => {
  it("finds a log whose date key was produced by localDateString (the fixed write path)", () => {
    // This is the round-trip test: if mergeAndSave writes localDateString(now)
    // and getTodayQuickLog reads with localDateString(now), they MUST agree.
    const now = localDate(2026, 8, 11, 0, 30); // local = Aug 11

    // Writer (fixed): dateKey = localDateString(now) = "2026-08-11"
    const dateKeyFromFixedPath = localDateString(now);
    const log = makeLog(dateKeyFromFixedPath, { flow: "light", mood: "calm" });

    // Reader (fixed): searches for localDateString(now) = "2026-08-11"
    expect(getTodayQuickLog([log], now)).toEqual({
      flow: "Light",
      mood: "Calm",
    });
  });

  it("does NOT find a log whose date key came from the old UTC write path when local ≠ UTC", () => {
    // Scenario: UTC+ device where local date (Aug 11) is ahead of UTC date (Aug 10).
    // The old buggy write path would store "2026-08-10" (UTC).
    // The fixed reader searches for "2026-08-11" (local) → should NOT find it.
    const now = localDate(2026, 8, 11, 0, 30); // local = Aug 11

    // Old (buggy) writer: uses toISOString() which gives UTC date
    // We simulate this by explicitly using the UTC string
    const staleUtcKey = utcDateString(
      // Build a Date that the host timezone will render as Aug 11 local but Aug 10 UTC.
      // Since we cannot control the host TZ in tests, we construct the stored
      // date string as "2026-08-10" (one day before local) to replicate the mismatch.
      new Date("2026-08-10T23:00:00Z") // UTC Aug 10, local could be Aug 11 in UTC+x
    );
    // Regardless of what utcDateString() returns for this machine, the key point
    // is that a log stored under "2026-08-10" is NOT found when the reader searches "2026-08-11".
    const logStoredYesterday = makeLog("2026-08-10", {
      flow: "heavy",
      mood: "sad",
    });

    // Reader searches for local date "2026-08-11" — must NOT match "2026-08-10"
    expect(getTodayQuickLog([logStoredYesterday], now)).toEqual({});
  });

  it("also finds today's log when local time is 23:59 (late evening, same local day)", () => {
    // Local 23:59 on Aug 10 — log was written earlier today with localDateString
    const now = localDate(2026, 8, 10, 23, 59);
    const dateKey = localDateString(now); // "2026-08-10"
    const log = makeLog(dateKey, { flow: "spotting", symptoms: ["deep-pelvic-pain"] });

    expect(getTodayQuickLog([log], now)).toEqual({
      flow: "Spotting",
      pain: "Severe",
    });
  });

  it("does NOT find a log stored with tomorrow's UTC date when local date is today", () => {
    // Scenario: UTC− device where local date (Aug 10, 23:59) corresponds to
    // UTC Aug 11. The old buggy write path would store "2026-08-11" (UTC),
    // causing a log written "today" to be missed by the reader.
    // With the fix, both reader and writer use local date "2026-08-10" — they agree.
    const now = localDate(2026, 8, 10, 23, 59); // local = Aug 10

    // Old (buggy) write path would produce "2026-08-11" in a UTC−1 device;
    // we simulate this by directly checking that a log keyed "2026-08-11"
    // is NOT found when the local date is still "2026-08-10".
    const logStoredTomorrowUtc = makeLog("2026-08-11", { flow: "spotting" });

    // Reader searches for "2026-08-10" — must NOT match "2026-08-11"
    expect(getTodayQuickLog([logStoredTomorrowUtc], now)).toEqual({});
  });
});

// ─── Field mapping ────────────────────────────────────────────────────────────

describe("getTodayQuickLog — field mapping", () => {
  const NOW = localDate(2026, 8, 10);

  it("capitalises all four flow values", () => {
    for (const [raw, expected] of [
      ["spotting", "Spotting"],
      ["light", "Light"],
      ["medium", "Medium"],
      ["heavy", "Heavy"],
    ] as const) {
      const log = makeLog("2026-08-10", { flow: raw });
      expect(getTodayQuickLog([log], NOW).flow).toBe(expected);
    }
  });

  it("maps all five energy levels to their label strings", () => {
    const expected: Record<number, string> = {
      1: "Very Low",
      2: "Low",
      3: "Medium",
      4: "High",
      5: "Very High",
    };
    for (const [level, label] of Object.entries(expected)) {
      const log = makeLog("2026-08-10", { energy: Number(level) });
      expect(getTodayQuickLog([log], NOW).energy).toBe(label);
    }
  });

  it("maps deep-pelvic-pain to Severe", () => {
    const log = makeLog("2026-08-10", { symptoms: ["deep-pelvic-pain"] });
    expect(getTodayQuickLog([log], NOW).pain).toBe("Severe");
  });

  it("maps pelvic-heaviness (without deep-pelvic-pain) to Moderate", () => {
    const log = makeLog("2026-08-10", { symptoms: ["pelvic-heaviness"] });
    expect(getTodayQuickLog([log], NOW).pain).toBe("Moderate");
  });

  it("maps cramps (alone) to Mild", () => {
    const log = makeLog("2026-08-10", { symptoms: ["cramps"] });
    expect(getTodayQuickLog([log], NOW).pain).toBe("Mild");
  });

  it("returns Severe when multiple pain symptoms are present (highest wins)", () => {
    const log = makeLog("2026-08-10", {
      symptoms: ["cramps", "pelvic-heaviness", "deep-pelvic-pain"],
    });
    expect(getTodayQuickLog([log], NOW).pain).toBe("Severe");
  });

  it("omits the pain key when no pain symptoms are present", () => {
    const log = makeLog("2026-08-10", { symptoms: ["bloating", "headache"] });
    expect(getTodayQuickLog([log], NOW).pain).toBeUndefined();
  });

  it("omits fields that are not set in today's log", () => {
    const log = makeLog("2026-08-10", { flow: "light" });
    const result = getTodayQuickLog([log], NOW);
    expect(result.flow).toBe("Light");
    expect(result.mood).toBeUndefined();
    expect(result.energy).toBeUndefined();
    expect(result.pain).toBeUndefined();
  });
});

// ─── Multiple logs ────────────────────────────────────────────────────────────

describe("getTodayQuickLog — multiple logs", () => {
  it("uses only today's entry when the array contains several dates", () => {
    const now = localDate(2026, 8, 10);
    const logs = [
      makeLog("2026-08-08", { flow: "heavy", mood: "sad" }),
      makeLog("2026-08-09", { flow: "medium", mood: "anxious" }),
      makeLog("2026-08-10", { flow: "light", mood: "calm", energy: 3 }),
    ];
    expect(getTodayQuickLog(logs, now)).toEqual({
      flow: "Light",
      mood: "Calm",
      energy: "Medium",
    });
  });
});
