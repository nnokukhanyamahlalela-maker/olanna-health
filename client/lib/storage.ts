import AsyncStorage from "@react-native-async-storage/async-storage";
import { secureStorage } from "./secureStorage";
import { getPhaseForDay } from "@/constants/phaseConfig";

const STORAGE_KEYS = {
  USER_PROFILE: "@olanna_user_profile",
  CYCLE_DATA: "@olanna_cycle_data",
  DAILY_LOGS: "@olanna_daily_logs",
  HEALTH_GOALS: "@olanna_health_goals",
  SCREENINGS: "@olanna_screenings",
  ONBOARDING_COMPLETE: "@olanna_onboarding_complete",
  PREFERENCES: "@olanna_preferences",
};

export interface UserProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  healthGoals: string[];
  hasPCOS: boolean;
  hasEndometriosis: boolean;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  flow?: "spotting" | "light" | "medium" | "heavy";
  symptoms: string[];
  mood?: string;
  energy?: number;
  sleep?: number;
  notes?: string;
  temperature?: number;
  weight?: number;
  sexualActivity?: boolean;
  createdAt: string;
}

export interface CycleData {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  nextPeriodStart: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  cycles: {
    startDate: string;
    endDate: string;
    length: number;
  }[];
}

export interface Screening {
  id: string;
  type: "pap_smear" | "hpv_test" | "sti_screening" | "mammogram" | "general_checkup";
  lastDate?: string;
  nextDueDate: string;
  reminderEnabled: boolean;
  notes?: string;
}

export const storage = {
  async getUserProfile(): Promise<UserProfile | null> {
    return secureStorage.getUserProfile();
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    await secureStorage.setUserProfile(profile);
  },

  async getCycleData(): Promise<CycleData | null> {
    return secureStorage.getCycleData();
  },

  async setCycleData(cycleData: CycleData): Promise<void> {
    await secureStorage.setCycleData(cycleData);
    try {
      const { pushCycleSnapshot } = require("./partnerSync");
      pushCycleSnapshot();
    } catch {}
  },

  async getDailyLogs(): Promise<DailyLog[]> {
    return secureStorage.getDailyLogs();
  },

  async addDailyLog(log: DailyLog): Promise<void> {
    await secureStorage.addDailyLog(log);
  },

  async removeDailyLog(date: string): Promise<void> {
    await secureStorage.removeDailyLog(date);
  },

  async getScreenings(): Promise<Screening[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCREENINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setScreenings(screenings: Screening[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(screenings));
  },

  async isOnboardingComplete(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return data === "true";
    } catch {
      return false;
    }
  },

  async setOnboardingComplete(complete: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete ? "true" : "false");
  },

  async clearAllData(): Promise<void> {
    await secureStorage.clearAllSecureData();
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  },

  async getPreference(key: string): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      const prefs = data ? JSON.parse(data) : {};
      return prefs[key] ?? null;
    } catch {
      return null;
    }
  },

  async setPreference(key: string, value: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      const prefs = data ? JSON.parse(data) : {};
      prefs[key] = value;
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch {
      console.error("Failed to save preference");
    }
  },
};

export function calculateCycleData(profile: UserProfile): CycleData {
  const lastPeriodStart = new Date(profile.lastPeriodStart);
  const today = new Date();
  const daysSinceLastPeriod = Math.floor(
    (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentDay = (daysSinceLastPeriod % profile.cycleLength) + 1;

  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + profile.cycleLength);
  while (nextPeriodStart < today) {
    nextPeriodStart.setDate(nextPeriodStart.getDate() + profile.cycleLength);
  }

  const ovulationDate = new Date(nextPeriodStart);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  const phase = getPhaseForDay(currentDay, profile.cycleLength, profile.periodLength) as CycleData["phase"];

  return {
    currentDay,
    cycleLength: profile.cycleLength,
    periodLength: profile.periodLength,
    lastPeriodStart: profile.lastPeriodStart,
    nextPeriodStart: nextPeriodStart.toISOString().split("T")[0],
    ovulationDate: ovulationDate.toISOString().split("T")[0],
    fertileWindowStart: fertileWindowStart.toISOString().split("T")[0],
    fertileWindowEnd: fertileWindowEnd.toISOString().split("T")[0],
    phase,
    cycles: [],
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getEffectiveLastPeriodStart(
  profile: UserProfile,
  dailyLogs: DailyLog[]
): string {
  const logsWithFlow = dailyLogs
    .filter((l) => l.flow)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (logsWithFlow.length === 0) return profile.lastPeriodStart;

  let latestPeriodStart = logsWithFlow[0].date;
  for (let i = 1; i < logsWithFlow.length; i++) {
    const prev = new Date(logsWithFlow[i - 1].date + "T12:00:00");
    const curr = new Date(logsWithFlow[i].date + "T12:00:00");
    const gap = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (gap <= 1) {
      latestPeriodStart = logsWithFlow[i].date;
    } else {
      break;
    }
  }

  if (latestPeriodStart > profile.lastPeriodStart) {
    return latestPeriodStart;
  }
  return profile.lastPeriodStart;
}

export function calculateCycleDataWithLogs(
  profile: UserProfile,
  dailyLogs: DailyLog[]
): CycleData {
  const effectiveStart = getEffectiveLastPeriodStart(profile, dailyLogs);
  const effectiveProfile = { ...profile, lastPeriodStart: effectiveStart };
  return calculateCycleData(effectiveProfile);
}

export function detectPeriodStart(
  dateKey: string,
  dailyLogs: DailyLog[],
  currentLastPeriodStart?: string
): boolean {
  const current = dailyLogs.find((l) => l.date === dateKey);
  if (!current || !current.flow) return false;

  const logsWithFlow = dailyLogs
    .filter((l) => l.flow && l.date < dateKey)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (logsWithFlow.length === 0) return true;

  const mostRecentFlowDate = logsWithFlow[0].date;
  const recent = new Date(mostRecentFlowDate + "T12:00:00");
  const current_ = new Date(dateKey + "T12:00:00");
  const gapDays = Math.round(
    (current_.getTime() - recent.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (gapDays <= 1) return false;

  if (currentLastPeriodStart && dateKey <= currentLastPeriodStart) return false;

  return true;
}
