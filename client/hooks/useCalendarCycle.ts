import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { storage, UserProfile, DailyLog } from "@/lib/storage";
import {
  generateCalendarMarkers,
  computeCycleDay,
  computePhase,
} from "@/services/cycleCalculator";
import { getEffectiveLastPeriodStart } from "@/services/cycleProfileService";
import type { CalendarDayMarker, CyclePhase, CycleProfile } from "@/types/cycle";
import { toCyclePhase } from "@/types/cycle";

function toCycleProfile(p: UserProfile): CycleProfile {
  return {
    userId: p.id,
    lastPeriodStartDate: p.lastPeriodStart,
    averageCycleLength: p.cycleLength,
    averagePeriodLength: p.periodLength,
    updatedAt: p.createdAt,
  };
}

export interface SelectedDayInfo {
  dayInCycle: number;
  cycleLength: number;
  phase: CyclePhase;
  hasProfile: boolean;
}

export interface UseCalendarCycleResult {
  markers: CalendarDayMarker[];
  selectedDayInfo: SelectedDayInfo | null;
  selectedLog: DailyLog | null;
  flowLogDates: Set<string>;
  dailyLogs: DailyLog[];
  profile: UserProfile | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useCalendarCycle(
  viewYear: number,
  viewMonth: number,
  selectedDate: string | null
): UseCalendarCycleResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [userProfile, logs] = await Promise.all([
        storage.getUserProfile(),
        storage.getDailyLogs(),
      ]);
      setProfile(userProfile);
      setDailyLogs(logs);
    } catch (error) {
      console.error("[useCalendarCycle] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const flowLogDates = useMemo(() => {
    const set = new Set<string>();
    dailyLogs.forEach((log) => {
      if (log.flow) set.add(log.date);
    });
    return set;
  }, [dailyLogs]);

  const markers = useMemo<CalendarDayMarker[]>(() => {
    if (!profile) return [];
    return generateCalendarMarkers(viewYear, viewMonth, toCycleProfile(profile), dailyLogs);
  }, [viewYear, viewMonth, profile, dailyLogs]);

  const selectedDayInfo = useMemo<SelectedDayInfo | null>(() => {
    if (!selectedDate) return null;
    const hasFlow = flowLogDates.has(selectedDate);

    if (!profile) {
      return {
        dayInCycle: hasFlow ? 1 : 0,
        cycleLength: 28,
        phase: (hasFlow ? "Menstrual" : "Follicular") as CyclePhase,
        hasProfile: false,
      };
    }

    const cp = toCycleProfile(profile);
    const effectiveStart = getEffectiveLastPeriodStart(cp, dailyLogs);
    const date = new Date(selectedDate + "T12:00:00");
    const dayInCycle = computeCycleDay(date, effectiveStart, profile.cycleLength);

    if (dayInCycle <= 0) {
      return {
        dayInCycle: hasFlow ? 1 : 0,
        cycleLength: profile.cycleLength,
        phase: (hasFlow ? "Menstrual" : "Follicular") as CyclePhase,
        hasProfile: true,
      };
    }

    const internalPhase = hasFlow
      ? "menstrual" as const
      : computePhase(dayInCycle, profile.cycleLength, profile.periodLength || 5);

    return {
      dayInCycle,
      cycleLength: profile.cycleLength,
      phase: toCyclePhase(internalPhase),
      hasProfile: true,
    };
  }, [selectedDate, profile, dailyLogs, flowLogDates]);

  const selectedLog = useMemo(() => {
    if (!selectedDate) return null;
    return dailyLogs.find((log) => log.date === selectedDate) || null;
  }, [selectedDate, dailyLogs]);

  return {
    markers,
    selectedDayInfo,
    selectedLog,
    flowLogDates,
    dailyLogs,
    profile,
    isLoading,
    refresh: loadData,
  };
}
