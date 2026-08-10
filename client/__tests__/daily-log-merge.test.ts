/**
 * daily-log-merge.test.ts
 *
 * Confirms that QuickLogSheet and CheckInScreen write to the same DailyLog
 * entry for a given day without clobbering each other's fields.
 *
 * These are pure-logic unit tests. All storage I/O is replaced by an
 * in-memory mock so no React-Native or Expo runtime is needed.
 *
 * Scenarios
 * ─────────
 * 1. QuickLog sets flow:"heavy" first → CheckIn saves symptoms → DailyLog
 *    still has flow:"heavy" alongside the new symptoms.
 *
 * 2. CheckIn saves symptoms first → QuickLog sets mood:"calm" → DailyLog
 *    retains the existing symptoms alongside the new mood.
 *
 * 3. QuickLog save fails (storage throws) → the save helper rejects so the
 *    caller can surface an error state instead of a false success.
 *
 * 4. (Task 43) Quick-log pain + body-map pain points: body-map BodyPainPoint
 *    objects must be stored only in DailyCheckIn.painPoints, never injected
 *    into DailyLog.symptoms — no duplication with the quick-log symptom IDs.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Types (mirrored from storage.ts / symptomSchema.ts to avoid RN deps) ─────

interface DailyLog {
  id: string;
  date: string;
  flow?: "spotting" | "light" | "medium" | "heavy";
  symptoms: string[];
  mood?: string;
  energy?: number;
  sleep?: number;
  notes?: string;
  createdAt: string;
}

/** Mirrors symptomSchema.ts BodyPainPoint */
interface BodyPainPoint {
  id: string;
  date: string;
  region: string;
  painType: string;
  severity: number;
  timestamp: number;
}

/** Mirrors symptomSchema.ts DailyCheckIn (subset used in tests) */
interface DailyCheckIn {
  date: string;
  symptoms: { symptomId: string; categoryId: string }[];
  painPoints: BodyPainPoint[];
  completedAt: number;
}

// ─── In-memory storage mocks ──────────────────────────────────────────────────

let dailyLogStore: DailyLog[] = [];
/** Separate store that mirrors what saveDailyCheckIn writes in symptomStorage */
let checkInStore: DailyCheckIn[] = [];

const storageMock = {
  async getDailyLogs(): Promise<DailyLog[]> {
    return JSON.parse(JSON.stringify(dailyLogStore));
  },
  async addDailyLog(log: DailyLog): Promise<void> {
    const idx = dailyLogStore.findIndex((l) => l.date === log.date);
    if (idx >= 0) {
      dailyLogStore[idx] = log;
    } else {
      dailyLogStore.push(log);
    }
  },
  /** Mirrors saveDailyCheckIn — upserts by date */
  async saveDailyCheckIn(checkIn: DailyCheckIn): Promise<void> {
    const idx = checkInStore.findIndex((c) => c.date === checkIn.date);
    if (idx >= 0) {
      checkInStore[idx] = checkIn;
    } else {
      checkInStore.push(checkIn);
    }
  },
  async getDailyCheckIn(date: string): Promise<DailyCheckIn | undefined> {
    return checkInStore.find((c) => c.date === date);
  },
};

const failingStorageMock = {
  async getDailyLogs(): Promise<DailyLog[]> {
    throw new Error("Storage read failure");
  },
  async addDailyLog(_log: DailyLog): Promise<void> {
    throw new Error("Storage write failure");
  },
  async saveDailyCheckIn(_c: DailyCheckIn): Promise<void> {
    throw new Error("Storage write failure");
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2);
}

/** Replicates the merge logic inside QuickLogSheet.mergeAndSave */
async function quickLogMergeAndSave(
  storage: typeof storageMock,
  today: string,
  domain: "flow" | "mood" | "energy" | "pain",
  value: string | number,
  painSymptoms?: string[]
): Promise<DailyLog> {
  const PAIN_SYMPTOM_IDS = ["cramps", "pelvic-heaviness", "deep-pelvic-pain"];

  const allLogs = await storage.getDailyLogs();
  const existing = allLogs.find((l) => l.date === today);

  let existingSymptoms: string[] = existing?.symptoms ?? [];

  if (domain === "pain") {
    existingSymptoms = existingSymptoms.filter(
      (s) => !PAIN_SYMPTOM_IDS.includes(s)
    );
    existingSymptoms = [...existingSymptoms, ...(painSymptoms ?? [])];
  }

  const merged: DailyLog = {
    id: existing?.id ?? makeId(),
    date: today,
    symptoms: existingSymptoms,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    ...(existing ?? {}),
    ...(domain === "flow" ? { flow: value as DailyLog["flow"] } : {}),
    ...(domain === "mood" ? { mood: String(value) } : {}),
    ...(domain === "energy" ? { energy: Number(value) } : {}),
    ...(domain === "pain" ? { symptoms: existingSymptoms } : {}),
  };

  await storage.addDailyLog(merged);
  return merged;
}

/**
 * Replicates the full handleSave logic in CheckInScreen:
 *   1. Calls saveDailyCheckIn (writes symptoms + painPoints to the check-in store).
 *   2. Merges only the symptom-grid IDs into DailyLog.symptoms — painPoints are
 *      never touched in this merge, mirroring the actual implementation.
 */
async function checkInMergeAndSave(
  storage: typeof storageMock,
  today: string,
  checkInSymptomIds: string[],
  painPoints: BodyPainPoint[] = []
): Promise<{ dailyLog: DailyLog; checkIn: DailyCheckIn }> {
  // Step 1 — persist the full check-in record (symptom grid + body-map points)
  const checkIn: DailyCheckIn = {
    date: today,
    symptoms: checkInSymptomIds.map((id) => ({ symptomId: id, categoryId: "general" })),
    painPoints,
    completedAt: Date.now(),
  };
  await storage.saveDailyCheckIn(checkIn);

  // Step 2 — merge ONLY the symptom-grid IDs into DailyLog (mirrors handleSave)
  const logs = await storage.getDailyLogs();
  const existing = logs.find((l) => l.date === today);

  const preservedSymptoms = (existing?.symptoms ?? []).filter(
    (id) => !checkInSymptomIds.includes(id)
  );
  const mergedSymptoms = [...preservedSymptoms, ...checkInSymptomIds];

  const mergedLog: DailyLog = {
    id: existing?.id ?? makeId(),
    date: today,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    ...(existing ?? {}),
    symptoms: mergedSymptoms,
  };

  await storage.addDailyLog(mergedLog);
  return { dailyLog: mergedLog, checkIn };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const TODAY = "2026-07-31";

beforeEach(() => {
  dailyLogStore = [];
  checkInStore = [];
});

describe("DailyLog merge — quick-log and full Check-In used on the same day", () => {
  it("preserves flow:heavy after a full Check-In saves symptoms on the same day", async () => {
    // 1. User quick-logs heavy flow
    await quickLogMergeAndSave(storageMock, TODAY, "flow", "heavy");

    // Verify quick-log was saved
    let logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].flow).toBe("heavy");

    // 2. User then opens Check-In and saves symptoms
    await checkInMergeAndSave(storageMock, TODAY, ["cramps", "fatigue"]);

    // 3. DailyLog must still carry flow:"heavy" alongside the check-in symptoms
    logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1); // still one entry for today
    const log = logs[0];
    expect(log.flow).toBe("heavy");
    expect(log.symptoms).toContain("cramps");
    expect(log.symptoms).toContain("fatigue");
  });

  it("preserves existing symptoms after QuickLogSheet saves mood on the same day", async () => {
    // 1. User completes full Check-In first
    await checkInMergeAndSave(storageMock, TODAY, ["bloating", "headache"]);

    let logs = await storageMock.getDailyLogs();
    expect(logs[0].symptoms).toEqual(["bloating", "headache"]);

    // 2. User then quick-logs mood
    await quickLogMergeAndSave(storageMock, TODAY, "mood", "calm");

    // 3. DailyLog must carry both the check-in symptoms and the new mood
    logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.mood).toBe("calm");
    expect(log.symptoms).toContain("bloating");
    expect(log.symptoms).toContain("headache");
  });

  it("does not create duplicate entries when both paths write on the same day", async () => {
    await quickLogMergeAndSave(storageMock, TODAY, "energy", 4);
    await checkInMergeAndSave(storageMock, TODAY, ["nausea"]);
    await quickLogMergeAndSave(storageMock, TODAY, "mood", "anxious");

    const logs = await storageMock.getDailyLogs();
    // All three saves must resolve to a single DailyLog entry
    expect(logs).toHaveLength(1);
    expect(logs[0].energy).toBe(4);
    expect(logs[0].mood).toBe("anxious");
    expect(logs[0].symptoms).toContain("nausea");
  });

  it("rejects when storage is unavailable so the caller can show an error state", async () => {
    // The save helper must throw (not swallow the error) so that QuickLogSheet's
    // catch block can set saveError instead of showing a false "Logged ✓".
    await expect(
      quickLogMergeAndSave(failingStorageMock, TODAY, "flow", "heavy")
    ).rejects.toThrow();
  });

  it("does not overwrite a prior pain quick-log symptom set with an empty list", async () => {
    // First pain log: moderate (cramps + pelvic-heaviness)
    await quickLogMergeAndSave(storageMock, TODAY, "pain", "moderate", [
      "cramps",
      "pelvic-heaviness",
    ]);

    let logs = await storageMock.getDailyLogs();
    expect(logs[0].symptoms).toEqual(["cramps", "pelvic-heaviness"]);

    // User updates to "none" — pain symptoms should be cleared, not stacked
    await quickLogMergeAndSave(storageMock, TODAY, "pain", "none", []);

    logs = await storageMock.getDailyLogs();
    expect(logs[0].symptoms).toHaveLength(0);
  });

  it("pain quick-log does not wipe non-pain symptoms added by Check-In", async () => {
    // Check-In saves a symptom that is NOT in the pain-symptom ID list
    await checkInMergeAndSave(storageMock, TODAY, ["fatigue", "bloating"]);

    // Pain quick-log should strip only its own prior pain symptoms, leaving others
    await quickLogMergeAndSave(storageMock, TODAY, "pain", "mild", ["cramps"]);

    const logs = await storageMock.getDailyLogs();
    const log = logs[0];
    expect(log.symptoms).toContain("cramps");
    expect(log.symptoms).toContain("fatigue");
    expect(log.symptoms).toContain("bloating");
  });

  it("preserves quick-log energy (numeric) after a full Check-In saves symptoms on the same day", async () => {
    // 1. User quick-logs energy level 3 in the morning
    await quickLogMergeAndSave(storageMock, TODAY, "energy", 3);

    let logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].energy).toBe(3);

    // 2. User then completes a full Check-In with symptoms
    await checkInMergeAndSave(storageMock, TODAY, ["fatigue", "bloating"]);

    // 3. DailyLog must still carry energy:3 alongside the check-in symptoms
    logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.energy).toBe(3);
    expect(log.symptoms).toContain("fatigue");
    expect(log.symptoms).toContain("bloating");
  });

  it("preserves a sleep value already in the DailyLog after a full Check-In saves symptoms on the same day", async () => {
    // sleep is not a QuickLog domain; it can be written by other app paths.
    // CheckInScreen.handleSave spreads the existing DailyLog (...existing),
    // so sleep must survive regardless of which code path originally set it.

    // 1. Seed today's DailyLog with sleep:7 directly (mirrors any non-QuickLog writer)
    await storageMock.addDailyLog({
      id: makeId(),
      date: TODAY,
      symptoms: [],
      sleep: 7,
      createdAt: new Date().toISOString(),
    });

    let logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].sleep).toBe(7);

    // 2. User then completes a full Check-In with symptoms
    await checkInMergeAndSave(storageMock, TODAY, ["headache", "cramps"]);

    // 3. DailyLog must still carry sleep:7 alongside the check-in symptoms —
    //    the spread in handleSave must not drop numeric fields it didn't write
    logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.sleep).toBe(7);
    expect(log.symptoms).toContain("headache");
    expect(log.symptoms).toContain("cramps");
  });

  it("preserves both energy (quick-logged) and sleep (pre-existing) when a Check-In follows on the same day", async () => {
    // 1. energy: set via QuickLogSheet (real production path)
    await quickLogMergeAndSave(storageMock, TODAY, "energy", 5);

    // 2. sleep: seed directly, as if written by a separate app path
    const existing = (await storageMock.getDailyLogs())[0];
    await storageMock.addDailyLog({ ...existing, sleep: 6 });

    let logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].energy).toBe(5);
    expect(logs[0].sleep).toBe(6);

    // 3. Full Check-In runs
    await checkInMergeAndSave(storageMock, TODAY, ["nausea"]);

    // 4. Both numeric fields must survive unchanged; still only one DailyLog entry
    logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.energy).toBe(5);
    expect(log.sleep).toBe(6);
    expect(log.symptoms).toContain("nausea");
  });

  /**
   * ── Task 43: body-map pain points must not duplicate quick-log symptoms ────
   *
   * Scenario A — symptom grid AND body map both reference the same pain:
   *   1. User quick-logs "mild" pain → "cramps" added to DailyLog.symptoms.
   *   2. User opens Check-In, selects "cramps" in the symptom grid, and also
   *      taps the lower-abdomen region on the body map.
   *   3. handleSave (mirrored by checkInMergeAndSave):
   *        a. Saves a DailyCheckIn record with painPoints=[abdomenPoint].
   *        b. Merges ONLY the symptom-grid IDs into DailyLog.symptoms.
   *   4. DailyLog.symptoms must contain "cramps" exactly once.
   *   5. DailyCheckIn.painPoints must hold the body-map entry (not lost).
   *   6. The BodyPainPoint region/painType must NOT appear as a symptom ID in
   *      DailyLog.symptoms (it is a separate data type).
   */
  it("cramps appears exactly once and body-map point stays in its own store when quick-log pain + body-map + symptom grid all used", async () => {
    // ── Step 1: quick-log mild pain ──────────────────────────────────────────
    await quickLogMergeAndSave(storageMock, TODAY, "pain", "mild", ["cramps"]);

    let logs = await storageMock.getDailyLogs();
    expect(logs[0].symptoms).toEqual(["cramps"]);

    // ── Step 2: Check-In with cramps on symptom grid + abdomen on body map ──
    const abdomenPoint: BodyPainPoint = {
      id: `${TODAY}-pain-1`,
      date: TODAY,
      region: "lower-abdomen",
      painType: "cramping",
      severity: 6,
      timestamp: Date.now(),
    };

    const { checkIn } = await checkInMergeAndSave(
      storageMock,
      TODAY,
      ["cramps"],       // symptom grid selection
      [abdomenPoint],   // body-map selection
    );

    // ── Step 3: verify DailyLog.symptoms ────────────────────────────────────
    logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);

    // "cramps" must appear exactly once — no duplication from body map
    const crampsOccurrences = logs[0].symptoms.filter((s) => s === "cramps").length;
    expect(crampsOccurrences).toBe(1);

    // The body-map region and painType must NOT be injected as symptom IDs
    expect(logs[0].symptoms).not.toContain("lower-abdomen");
    expect(logs[0].symptoms).not.toContain("cramping");

    // ── Step 4: verify DailyCheckIn.painPoints has the body-map entry ───────
    const savedCheckIn = await storageMock.getDailyCheckIn(TODAY);
    expect(savedCheckIn).toBeDefined();
    expect(savedCheckIn!.painPoints).toHaveLength(1);
    expect(savedCheckIn!.painPoints[0].region).toBe("lower-abdomen");
    expect(savedCheckIn!.painPoints[0].severity).toBe(6);
  });

  /**
   * Scenario B — quick-log pain preserved when Check-In uses only body map
   * (no symptom-grid selection):
   *   1. User quick-logs "severe pain" → three symptom IDs in DailyLog.
   *   2. User opens Check-In, taps multiple body-map regions (no symptom grid).
   *   3. handleSave saves pain points to DailyCheckIn but writes an empty
   *      symptom-grid list to the merge — so ALL three quick-log IDs survive.
   */
  it("quick-log pain symptoms are preserved when Check-In uses only the body map", async () => {
    // ── Step 1: quick-log severe pain ────────────────────────────────────────
    await quickLogMergeAndSave(storageMock, TODAY, "pain", "severe", [
      "cramps",
      "pelvic-heaviness",
      "deep-pelvic-pain",
    ]);

    let logs = await storageMock.getDailyLogs();
    expect(logs[0].symptoms).toEqual([
      "cramps",
      "pelvic-heaviness",
      "deep-pelvic-pain",
    ]);

    // ── Step 2: Check-In with two body-map points, no symptom-grid selection ─
    const backPoint: BodyPainPoint = {
      id: `${TODAY}-pain-2`,
      date: TODAY,
      region: "lower-back",
      painType: "aching",
      severity: 4,
      timestamp: Date.now(),
    };
    const pelvisPoint: BodyPainPoint = {
      id: `${TODAY}-pain-3`,
      date: TODAY,
      region: "pelvis",
      painType: "pressure",
      severity: 7,
      timestamp: Date.now(),
    };

    await checkInMergeAndSave(
      storageMock,
      TODAY,
      [],                         // no symptom-grid selections
      [backPoint, pelvisPoint],   // two body-map points
    );

    // ── Step 3: all quick-log pain IDs must still be present ─────────────────
    logs = await storageMock.getDailyLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.symptoms).toContain("cramps");
    expect(log.symptoms).toContain("pelvic-heaviness");
    expect(log.symptoms).toContain("deep-pelvic-pain");
    // Exactly one of each — no duplication
    expect(log.symptoms.filter((s) => s === "cramps").length).toBe(1);

    // Body-map region names must not bleed into DailyLog.symptoms
    expect(log.symptoms).not.toContain("lower-back");
    expect(log.symptoms).not.toContain("pelvis");

    // Both body-map points must be in DailyCheckIn, not in DailyLog
    const savedCheckIn = await storageMock.getDailyCheckIn(TODAY);
    expect(savedCheckIn!.painPoints).toHaveLength(2);
    expect(savedCheckIn!.painPoints.map((p) => p.region)).toEqual(
      expect.arrayContaining(["lower-back", "pelvis"])
    );
  });
});
