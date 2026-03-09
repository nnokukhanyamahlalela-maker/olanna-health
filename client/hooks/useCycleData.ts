/**
 * useCycleData — Shared hook for loading and computing cycle state.
 *
 * Automatically re-fetches profile + logs every time the screen comes
 * into focus (via useFocusEffect), so data stays fresh across tab switches
 * and after onboarding completion.
 *
 * Usage:
 *   const { cycleStatus, profile, isLoading, refresh } = useCycleData();
 */

import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { storage, UserProfile, DailyLog } from "@/lib/storage";
import { computeCycleStatus, CycleStatus } from "@/lib/cycleService";

export interface UseCycleDataResult {
  /** Computed cycle state (current day, phase, predictions). Null before first load. */
  cycleStatus: CycleStatus | null;
  /** The user's stored profile. Null if onboarding hasn't completed. */
  profile: UserProfile | null;
  /** Raw daily logs (for screens that need them). */
  dailyLogs: DailyLog[];
  /** True during the initial load. */
  isLoading: boolean;
  /** Manually trigger a data refresh (e.g. after saving a new log). */
  refresh: () => Promise<void>;
}

export function useCycleData(): UseCycleDataResult {
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
      console.error("[useCycleData] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-load whenever the screen comes into focus.
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
