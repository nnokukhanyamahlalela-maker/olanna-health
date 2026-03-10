// src/services/cycleStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CycleLog, CycleProfile } from "../types/cycle";

const CYCLE_PROFILE_KEY = "cycle_profile";
const CYCLE_LOGS_KEY = "cycle_logs";

export async function saveCycleProfile(
  profile: Omit<CycleProfile, "updatedAt">
): Promise<CycleProfile> {
  const fullProfile: CycleProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(CYCLE_PROFILE_KEY, JSON.stringify(fullProfile));
  return fullProfile;
}

export async function getCycleProfile(): Promise<CycleProfile | null> {
  const raw = await AsyncStorage.getItem(CYCLE_PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveCycleLog(log: CycleLog): Promise<void> {
  const existing = await getCycleLogs();
  const updated = [log, ...existing];
  await AsyncStorage.setItem(CYCLE_LOGS_KEY, JSON.stringify(updated));
}

export async function getCycleLogs(): Promise<CycleLog[]> {
  const raw = await AsyncStorage.getItem(CYCLE_LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Returns the most relevant cycle start date:
 * - use actual logged data if available
 * - otherwise use onboarding baseline
 */
export async function getEffectiveLastPeriodStartDate(): Promise<string | null> {
  const logs = await getCycleLogs();

  if (logs.length > 0) {
    const sorted = [...logs].sort(
      (a, b) =>
        new Date(b.periodStartDate).getTime() - new Date(a.periodStartDate).getTime()
    );
    return sorted[0].periodStartDate;
  }

  const profile = await getCycleProfile();
  return profile?.lastPeriodStartDate ?? null;
}
