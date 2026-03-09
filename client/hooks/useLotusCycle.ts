import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { storage, UserProfile, DailyLog } from "@/lib/storage";
import {
  generateCyclePrediction,
  detectLatePhase,
} from "@/services/cycleCalculator";
import { getEffectiveLastPeriodStart } from "@/services/cycleProfileService";
import type { CyclePrediction, CycleProfile } from "@/types/cycle";

function toCycleProfile(p: UserProfile): CycleProfile {
  return {
    userId: p.id,
    lastPeriodStartDate: p.lastPeriodStart,
    averageCycleLength: p.cycleLength,
    averagePeriodLength: p.periodLength,
    updatedAt: p.createdAt,
  };
}

export interface UseLotusCycleResult {
  cycleStatus: CyclePrediction | null;
  profile: UserProfile | null;
  dailyLogs: DailyLog[];
  isLate: boolean;
  daysLate: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useLotusCycle(): UseLotusCycleResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [cycleStatus, setCycleStatus] = useState<CyclePrediction | null>(null);
  const [isLate, setIsLate] = useState(false);
  const [daysLate, setDaysLate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [userProfile, logs] = await Promise.all([
        storage.getUserProfile(),
        storage.getDailyLogs(),
      ]);
      setProfile(userProfile);
      setDailyLogs(logs);

      if (userProfile) {
        const cp = toCycleProfile(userProfile);
        const effectiveStart = getEffectiveLastPeriodStart(cp, logs);
        const effectiveProfile: CycleProfile = {
          ...cp,
          lastPeriodStartDate: effectiveStart,
        };
        const prediction = generateCyclePrediction(effectiveProfile);
        setCycleStatus(prediction);

        const late = detectLatePhase(effectiveProfile, logs);
        setIsLate(late.isLate);
        setDaysLate(late.daysLate);
      } else {
        setCycleStatus(null);
        setIsLate(false);
        setDaysLate(0);
      }
    } catch (error) {
      console.error("[useLotusCycle] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await loadData();
      })();
      return () => {
        active = false;
      };
    }, [loadData])
  );

  return {
    cycleStatus,
    profile,
    dailyLogs,
    isLate,
    daysLate,
    isLoading,
    refresh: loadData,
  };
}
