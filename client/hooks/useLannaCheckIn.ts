/**
 * Lanna's Check-In — Orchestration Hook
 *
 * Loads data, runs the pattern engine, checks nudge state,
 * and returns the single highest-priority nudge to show (if any).
 */

import { useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/storage";
import { getSymptomLogs } from "@/lib/symptomStorage";
import { runPatternEngine, DetectedPattern } from "@/lib/lannaPatternEngine";
import {
  shouldShowNudge,
  recordNudgeShown,
  postponeNudge,
  markNudgeActioned,
  getAllNudgeStates,
  NudgeState,
} from "@/lib/lannaNudgeStorage";
import type { ConditionId } from "@/data/lannaContent";

export interface ActiveNudge {
  pattern: DetectedPattern;
  isFollowUp: boolean;
  nudgeState: NudgeState | null;
}

export interface UseLannaCheckInResult {
  /** The single highest-priority nudge to surface (null if none) */
  activeNudge: ActiveNudge | null;
  /** All detected patterns (for debugging / future multi-nudge UI) */
  allPatterns: DetectedPattern[];
  isLoading: boolean;
  /** Call when the user opens the nudge screen */
  onNudgeOpened: (conditionId: ConditionId) => Promise<void>;
  /** Call when the user taps "not now" */
  onPostpone: (conditionId: ConditionId) => Promise<void>;
  /** Call when the user confirms they took action (booked / found care) */
  onActioned: (conditionId: ConditionId) => Promise<void>;
  /** Manually refresh (e.g. after returning from check-in) */
  refresh: () => Promise<void>;
}

export function useLannaCheckIn(): UseLannaCheckInResult {
  const [activeNudge, setActiveNudge] = useState<ActiveNudge | null>(null);
  const [allPatterns, setAllPatterns] = useState<DetectedPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const evaluate = useCallback(async () => {
    try {
      setIsLoading(true);

      const [profile, dailyLogs, symptomLogs, nudgeStates] = await Promise.all([
        storage.getUserProfile(),
        storage.getDailyLogs(),
        getSymptomLogs(),
        getAllNudgeStates(),
      ]);

      if (!profile) {
        setIsLoading(false);
        return;
      }

      // Build CycleData-compatible object from DailyLogs
      // DailyLogs with flow = "medium" | "heavy" | "light" are period days
      const cycleData = buildCycleDataFromLogs(profile, dailyLogs);

      const patterns = runPatternEngine({
        profile,
        cycleData,
        symptomLogs,
      });

      setAllPatterns(patterns);

      // Find the highest-priority nudge that should be shown
      for (const pattern of patterns) {
        const { show, isFollowUp } = await shouldShowNudge(
          pattern.conditionId,
          pattern.tier
        );
        if (show) {
          setActiveNudge({
            pattern,
            isFollowUp,
            nudgeState: nudgeStates[pattern.conditionId] ?? null,
          });
          break;
        }
      }
    } catch (e) {
      console.error("[useLannaCheckIn] Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  const onNudgeOpened = useCallback(
    async (conditionId: ConditionId) => {
      const pattern = allPatterns.find((p) => p.conditionId === conditionId);
      if (!pattern) return;
      const nudgeStates = await getAllNudgeStates();
      const isFollowUp =
        nudgeStates[conditionId]?.lastAction === "postponed" &&
        !!nudgeStates[conditionId]?.followUpSentAt === false;
      await recordNudgeShown(conditionId, pattern.tier, isFollowUp);
    },
    [allPatterns]
  );

  const onPostpone = useCallback(async (conditionId: ConditionId) => {
    await postponeNudge(conditionId);
    setActiveNudge(null);
  }, []);

  const onActioned = useCallback(async (conditionId: ConditionId) => {
    await markNudgeActioned(conditionId);
    setActiveNudge(null);
  }, []);

  return {
    activeNudge,
    allPatterns,
    isLoading,
    onNudgeOpened,
    onPostpone,
    onActioned,
    refresh: evaluate,
  };
}

// ─── Helper: reconstruct basic cycle data from DailyLogs ─────────────────────

import { DailyLog, UserProfile, CycleData } from "@/lib/storage";

function buildCycleDataFromLogs(
  profile: UserProfile,
  dailyLogs: DailyLog[]
): CycleData {
  const periodDays = dailyLogs
    .filter((l) => l.flow && l.flow !== "spotting")
    .map((l) => l.date)
    .sort();

  // Detect cycle starts: a period day that is ≥ 15 days after the previous period day
  const cycleStarts: string[] = [];
  let lastPeriodDay: string | null = null;
  for (const d of periodDays) {
    if (!lastPeriodDay) {
      cycleStarts.push(d);
    } else {
      const gap = Math.floor(
        (new Date(d).getTime() - new Date(lastPeriodDay).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (gap >= 15) cycleStarts.push(d);
    }
    lastPeriodDay = d;
  }

  // Build cycles array
  const cycles: CycleData["cycles"] = [];
  for (let i = 0; i < cycleStarts.length - 1; i++) {
    const startDate = cycleStarts[i];
    const endDate = cycleStarts[i + 1];
    const length = Math.floor(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (length >= 14 && length <= 90) {
      cycles.push({ startDate, endDate, length });
    }
  }

  const lastPeriodStart =
    cycleStarts[cycleStarts.length - 1] || profile.lastPeriodStart || "";
  const cycleLength = profile.cycleLength || 28;
  const periodLength = profile.periodLength || 5;

  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

  const ovulationDate = new Date(lastPeriodStart);
  ovulationDate.setDate(ovulationDate.getDate() + Math.round(cycleLength * 0.45));

  const now = new Date();
  const lastStart = new Date(lastPeriodStart);
  const daysSince = Math.max(
    1,
    Math.floor((now.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24))
  );
  const currentDay = (daysSince % cycleLength) + 1;

  return {
    currentDay,
    cycleLength,
    periodLength,
    lastPeriodStart,
    nextPeriodStart: nextPeriodDate.toISOString().split("T")[0],
    ovulationDate: ovulationDate.toISOString().split("T")[0],
    fertileWindowStart: ovulationDate.toISOString().split("T")[0],
    fertileWindowEnd: ovulationDate.toISOString().split("T")[0],
    phase: "follicular",
    cycles,
  };
}
