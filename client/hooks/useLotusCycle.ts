import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { storage, UserProfile, DailyLog } from "@/lib/storage";
import { computeCycleStatus } from "@/services/cycleCalculator";
import type { CycleStatus } from "@/types/cycle";

export interface UseLotusCycleResult {
  cycleStatus: CycleStatus | null;
  profile: UserProfile | null;
  dailyLogs: DailyLog[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useLotusCycle(): UseLotusCycleResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [cycleStatus, setCycleStatus] = useState<CycleStatus | null>(null);
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
        const status = computeCycleStatus(userProfile, logs);
        setCycleStatus(status);
      } else {
        setCycleStatus(null);
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
      return () => { active = false; };
    }, [loadData])
  );

  return { cycleStatus, profile, dailyLogs, isLoading, refresh: loadData };
}
