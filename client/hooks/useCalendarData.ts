/**
 * useCalendarData — Hook for calendar screen data.
 *
 * Loads profile + logs on focus, then produces per-day markers for the
 * requested month using the cycle service.  Also exposes a selected-day
 * info helper and the raw daily logs for period-log editing.
 *
 * Usage:
 *   const {
 *     markers, selectedDayInfo, dailyLogs, profile, isLoading, refresh
 *   } = useCalendarData(viewYear, viewMonth, selectedDate);
 */

import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { storage, UserProfile, DailyLog } from "@/lib/storage";
import {
  generateCalendarMarkers,
  CalendarDayMarker,
  computeCycleDay,
  computePhase,
  getEffectiveLastPeriodStart,
} from "@/lib/cycleService";
import { Phase } from "@/constants/phaseConfig";

export interface SelectedDayInfo {
  dayInCycle: number;
  cycleLength: number;
  phase: Phase;
  hasProfile: boolean;
}

export interface UseCalendarDataResult {
  /** Per-day markers for the requested month (period, fertile, phase, etc.). */
  markers: CalendarDayMarker[];
  /** Info about the currently selected date. */
  selectedDayInfo: SelectedDayInfo | null;
  /** The selected date's log entry (if any). */
  selectedLog: DailyLog | null;
  /** Set of dates that have flow logs (for dot indicators). */
  flowLogDates: Set<string>;
  /** Raw daily logs (for period-log sheet). */
  dailyLogs: DailyLog[];
  /** User profile. */
  profile: UserProfile | null;
  /** True during the initial load. */
  isLoading: boolean;
  /** Manually trigger a data refresh. */
  refresh: () => Promise<void>;
}

export function useCalendarData(
  viewYear: number,
  viewMonth: number,
  selectedDate: string | null
): UseCalendarDataResult {
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
      console.error("[useCalendarData] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Build the set of dates with flow logs.
  const flowLogDates = useMemo(() => {
    const set = new Set<string>();
    dailyLogs.forEach((log) => {
      if (log.flow) set.add(log.date);
    });
    return set;
  }, [dailyLogs]);

  // Generate markers for the current month view.
  const markers = useMemo<CalendarDayMarker[]>(() => {
    if (!profile) return [];
    return generateCalendarMarkers(viewYear, viewMonth, profile, dailyLogs);
  }, [viewYear, viewMonth, profile, dailyLogs]);

  // Compute info for the selected date.
  const selectedDayInfo = useMemo<SelectedDayInfo | null>(() => {
    if (!selectedDate) return null;
    const hasFlow = flowLogDates.has(selectedDate);

    if (!profile) {
      return {
        dayInCycle: hasFlow ? 1 : 0,
        cycleLength: 28,
        phase: (hasFlow ? "menstrual" : "follicular") as Phase,
        hasProfile: false,
      };
    }

    const effectiveStart = getEffectiveLastPeriodStart(profile, dailyLogs);
    const date = new Date(selectedDate + "T12:00:00");
    const dayInCycle = computeCycleDay(date, effectiveStart, profile.cycleLength);

    if (dayInCycle <= 0) {
      return {
        dayInCycle: hasFlow ? 1 : 0,
        cycleLength: profile.cycleLength,
        phase: (hasFlow ? "menstrual" : "follicular") as Phase,
        hasProfile: true,
      };
    }

    const phase = hasFlow
      ? ("menstrual" as Phase)
      : computePhase(dayInCycle, profile.cycleLength, profile.periodLength || 5);

    return { dayInCycle, cycleLength: profile.cycleLength, phase, hasProfile: true };
  }, [selectedDate, profile, dailyLogs, flowLogDates]);

  // Find the log entry for the selected date.
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
