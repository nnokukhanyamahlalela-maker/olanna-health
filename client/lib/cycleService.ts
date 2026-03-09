/**
 * cycleService.ts — Pure, stateless cycle calculation utility.
 *
 * All functions in this module are deterministic: same inputs → same outputs.
 * They depend only on the profile data and daily logs passed in, never on
 * stored state. UI hooks and storage wrappers call into this service.
 */

import { getPhaseForDay, Phase } from "@/constants/phaseConfig";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Baseline cycle profile — the data collected during onboarding. */
export interface CycleProfile {
  lastPeriodStart: string;   // ISO date, e.g. "2026-02-10"
  cycleLength: number;       // average full-cycle length in days
  periodLength: number;      // average menstruation duration in days
}

/** Computed snapshot of the user's current cycle state. */
export interface CycleStatus {
  currentDay: number;        // 1-indexed day within the cycle
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  nextPeriodStart: string;   // predicted ISO date
  ovulationDate: string;     // predicted ISO date
  fertileWindowStart: string;
  fertileWindowEnd: string;
  phase: Phase;              // current phase (may be "late")
  daysLate: number;          // 0 when not late, else how many days overdue
}

/** Per-day marker produced by generateCalendarMarkers(). */
export interface CalendarDayMarker {
  day: number;               // day-of-month (1-based)
  dateKey: string;           // "YYYY-MM-DD"
  dayInCycle: number;        // 1-indexed cycle day (-1 if before tracking)
  phase: Phase;
  isPeriod: boolean;         // predicted or logged period day
  isFertile: boolean;        // inside fertile window
  isOvulation: boolean;      // predicted ovulation day
  isPMS: boolean;            // inside PMS window (last 7 days of cycle)
  isToday: boolean;
  hasFlowLog: boolean;       // user explicitly logged flow on this date
}

/** Minimal daily-log shape needed by the service (avoids coupling to storage types). */
export interface FlowLog {
  date: string;              // "YYYY-MM-DD"
  flow?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Format a Date to "YYYY-MM-DD". */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a "YYYY-MM-DD" string into a local midnight Date. */
function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

/** Whole-day difference: floor((a - b) / 86400000). */
function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  Effective period start (reconciles profile + logs)                  */
/* ------------------------------------------------------------------ */

/**
 * Determine the "real" start of the most recent period by scanning flow
 * logs.  If the user logged a new period after the profile's stored date,
 * use the log-derived date instead.
 */
export function getEffectiveLastPeriodStart(
  profile: CycleProfile,
  logs: FlowLog[]
): string {
  const logsWithFlow = logs
    .filter((l) => l.flow)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (logsWithFlow.length === 0) return profile.lastPeriodStart;

  // Walk backwards through consecutive flow days to find the streak start.
  let streakStart = logsWithFlow[0].date;
  for (let i = 1; i < logsWithFlow.length; i++) {
    const prev = parseDate(logsWithFlow[i - 1].date);
    const curr = parseDate(logsWithFlow[i].date);
    const gap = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (gap <= 1) {
      streakStart = logsWithFlow[i].date;
    } else {
      break;
    }
  }

  // Use whichever is more recent: the profile date or the log streak.
  return streakStart > profile.lastPeriodStart
    ? streakStart
    : profile.lastPeriodStart;
}

/* ------------------------------------------------------------------ */
/*  Core cycle calculations                                            */
/* ------------------------------------------------------------------ */

/**
 * Compute the cycle day for a given date relative to a profile.
 * Returns -1 if the date is before tracking started.
 */
export function computeCycleDay(
  date: Date,
  lastPeriodStart: string,
  cycleLength: number
): number {
  const start = parseDate(lastPeriodStart);
  const diff = daysBetween(date, start);
  if (diff < 0) return -1;
  return (diff % cycleLength) + 1;
}

/**
 * Compute the raw (un-wrapped) number of days since the last period.
 * Used for late-phase detection.
 */
export function computeRawDaysSince(
  date: Date,
  lastPeriodStart: string
): number {
  return daysBetween(date, parseDate(lastPeriodStart));
}

/**
 * Compute the current phase for a given cycle day.
 * Does NOT handle the "late" phase — that requires log context (see computeCycleStatus).
 */
export function computePhase(
  dayInCycle: number,
  cycleLength: number,
  periodLength: number
): Phase {
  return getPhaseForDay(dayInCycle, cycleLength, periodLength);
}

/**
 * Predict the next period start date from a given reference.
 * Keeps advancing by cycleLength until the date is in the future.
 */
export function predictNextPeriod(
  lastPeriodStart: string,
  cycleLength: number,
  referenceDate?: Date
): string {
  const ref = referenceDate ?? new Date();
  const next = parseDate(lastPeriodStart);
  next.setDate(next.getDate() + cycleLength);
  while (next < ref) {
    next.setDate(next.getDate() + cycleLength);
  }
  return toDateKey(next);
}

/**
 * Predict the fertile window and ovulation date based on the next period prediction.
 * Ovulation is estimated at 14 days before the next period.
 */
export function predictFertileWindow(nextPeriodStart: string): {
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
} {
  const ovulation = parseDate(nextPeriodStart);
  ovulation.setDate(ovulation.getDate() - 14);

  const fwStart = new Date(ovulation);
  fwStart.setDate(fwStart.getDate() - 5);

  const fwEnd = new Date(ovulation);
  fwEnd.setDate(fwEnd.getDate() + 1);

  return {
    ovulationDate: toDateKey(ovulation),
    fertileWindowStart: toDateKey(fwStart),
    fertileWindowEnd: toDateKey(fwEnd),
  };
}

/* ------------------------------------------------------------------ */
/*  Full cycle status (combines everything)                            */
/* ------------------------------------------------------------------ */

/**
 * Compute the full CycleStatus from a profile and daily logs.
 *
 * This is the primary entry-point for screens that need the user's
 * current cycle state.  It:
 *   1. Resolves the effective period start from logs
 *   2. Computes current day, phase, predictions
 *   3. Detects "late" phase when the cycle is overdue
 */
export function computeCycleStatus(
  profile: CycleProfile,
  logs: FlowLog[]
): CycleStatus {
  const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawDays = computeRawDaysSince(today, effectiveStart);
  const wrappedDay = (rawDays % profile.cycleLength) + 1;

  const nextPeriod = predictNextPeriod(effectiveStart, profile.cycleLength, today);
  const fertility = predictFertileWindow(nextPeriod);
  const phase = computePhase(wrappedDay, profile.cycleLength, profile.periodLength);

  const status: CycleStatus = {
    currentDay: wrappedDay,
    cycleLength: profile.cycleLength,
    periodLength: profile.periodLength,
    lastPeriodStart: effectiveStart,
    nextPeriodStart: nextPeriod,
    ...fertility,
    phase,
    daysLate: 0,
  };

  // Late-phase detection: cycle day exceeds expected length with no new period logged.
  if (rawDays > profile.cycleLength) {
    const predictedNext = parseDate(effectiveStart);
    predictedNext.setDate(predictedNext.getDate() + profile.cycleLength);
    const hasNewPeriod = logs.some((l) => {
      if (!l.flow) return false;
      return parseDate(l.date) >= predictedNext;
    });

    if (!hasNewPeriod) {
      status.phase = "late";
      status.currentDay = rawDays + 1;
      status.daysLate = rawDays - profile.cycleLength;
    }
  }

  return status;
}

/* ------------------------------------------------------------------ */
/*  Calendar marker generation                                         */
/* ------------------------------------------------------------------ */

/**
 * Generate per-day markers for an entire month, suitable for rendering
 * a calendar grid.  Merges predicted cycle data with actual flow logs.
 *
 * @param year      - Full year (e.g. 2026)
 * @param month     - 0-indexed month (0 = January)
 * @param profile   - Baseline cycle profile
 * @param logs      - All daily logs (only flow field is read)
 * @returns Array of CalendarDayMarker[], one per day of the month.
 *          The array does NOT include leading nulls for alignment;
 *          consumers can prepend those using getFirstDayOfMonth().
 */
export function generateCalendarMarkers(
  year: number,
  month: number,
  profile: CycleProfile,
  logs: FlowLog[]
): CalendarDayMarker[] {
  const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
  const { cycleLength, periodLength } = profile;
  const ovulationDay = Math.max(cycleLength - 14, 1);

  const flowDates = new Set(logs.filter((l) => l.flow).map((l) => l.date));
  const todayKey = toDateKey(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const markers: CalendarDayMarker[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = toDateKey(date);
    const dayInCycle = computeCycleDay(date, effectiveStart, cycleLength);
    const hasFlowLog = flowDates.has(dateKey);

    // Period: either the user logged flow, or it's a predicted period day.
    const isPeriod = hasFlowLog || (dayInCycle > 0 && dayInCycle <= periodLength);

    // Fertile window: ovulationDay - 5 .. ovulationDay + 1
    const isFertile =
      dayInCycle > 0 &&
      dayInCycle >= ovulationDay - 5 &&
      dayInCycle <= ovulationDay + 1;

    const isOvulation = dayInCycle > 0 && dayInCycle === ovulationDay;

    // PMS: last 7 days of the cycle
    const isPMS =
      dayInCycle > 0 &&
      dayInCycle > cycleLength - 7 &&
      dayInCycle <= cycleLength;

    // Phase: actual flow overrides predicted phase.
    const phase: Phase = hasFlowLog
      ? "menstrual"
      : dayInCycle > 0
        ? computePhase(dayInCycle, cycleLength, periodLength)
        : "follicular";

    markers.push({
      day: d,
      dateKey,
      dayInCycle,
      phase,
      isPeriod,
      isFertile,
      isOvulation,
      isPMS,
      isToday: dateKey === todayKey,
      hasFlowLog,
    });
  }

  return markers;
}
