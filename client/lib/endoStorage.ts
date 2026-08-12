/**
 * Endometriosis symptom log — local AsyncStorage persistence.
 *
 * Keyed by YYYY-MM-DD date string. One log per day, overwrites on update.
 * Completely separate from the main DailyLog so endo data stays isolated
 * and can be cleared without touching cycle data.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const ENDO_LOGS_KEY = "@olanna_endo_logs";

export type BleedingLevel = "none" | "spotting" | "light" | "normal" | "heavy";

export interface EndoLog {
  /** YYYY-MM-DD */
  date: string;
  /** 0–10 worst pelvic/abdominal pain in the last 24 hours */
  pelvisPain: number;
  /** Bleeding status today */
  bleeding: BleedingLevel;
  /**
   * Did the pain occur on a bleeding day?
   * null when the question was auto-skipped (pain=0 or bleeding=none).
   */
  painOnBleedingDay: boolean | null;
  /**
   * Sexual activity in the last 24 hours.
   * null means the user chose to skip the question.
   */
  sexActivity: boolean | null;
  /** 0–10 pain during/after sex; null when sex was no/skipped. */
  sexPain: number | null;
  /** Painful bowel movements today */
  bowelPain: boolean;
  /** 0–10 severity; null when bowelPain is false */
  bowelPainScore: number | null;
  /** Pain when urinating, or blood in urine, today */
  urinaryPain: boolean;
  /** 0–10 severity; null when urinaryPain is false */
  urinaryPainScore: number | null;
  /** Unix timestamp (ms) when the log was saved */
  completedAt: number;
}

type EndoLogStore = Record<string, EndoLog>;

async function readStore(): Promise<EndoLogStore> {
  try {
    const raw = await AsyncStorage.getItem(ENDO_LOGS_KEY);
    return raw ? (JSON.parse(raw) as EndoLogStore) : {};
  } catch {
    return {};
  }
}

/** Fetch today's (or any date's) endo log. Returns null if none exists. */
export async function getEndoLog(date: string): Promise<EndoLog | null> {
  const store = await readStore();
  return store[date] ?? null;
}

/** Save (or overwrite) an endo log for its date. */
export async function saveEndoLog(log: EndoLog): Promise<void> {
  try {
    const store = await readStore();
    store[log.date] = log;
    await AsyncStorage.setItem(ENDO_LOGS_KEY, JSON.stringify(store));
  } catch (e) {
    console.error("[EndoStorage] Failed to save endo log:", e);
    throw e;
  }
}

/** Return the full history as a date-keyed record. */
export async function getAllEndoLogs(): Promise<EndoLogStore> {
  return readStore();
}
