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
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Types (copied from storage.ts to avoid importing RN deps) ────────────────

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

// ─── In-memory storage mock ───────────────────────────────────────────────────

let store: DailyLog[] = [];

const storageMock = {
  async getDailyLogs(): Promise<DailyLog[]> {
    return JSON.parse(JSON.stringify(store)); // return a copy
  },
  async addDailyLog(log: DailyLog): Promise<void> {
    const idx = store.findIndex((l) => l.date === log.date);
    if (idx >= 0) {
      store[idx] = log;
    } else {
      store.push(log);
    }
  },
};

const failingStorageMock = {
  async getDailyLogs(): Promise<DailyLog[]> {
    throw new Error("Storage read failure");
  },
  async addDailyLog(_log: DailyLog): Promise<void> {
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

/** Replicates the merge logic inside CheckInScreen.handleSave */
async function checkInMergeAndSave(
  storage: typeof storageMock,
  today: string,
  checkInSymptomIds: string[]
): Promise<DailyLog> {
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
  return mergedLog;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const TODAY = "2026-07-31";

beforeEach(() => {
  store = [];
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
});
