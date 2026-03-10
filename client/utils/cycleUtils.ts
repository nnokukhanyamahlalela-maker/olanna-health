/**
 * Cycle Utilities
 *
 * Utility functions for cycle data processing, late phase detection,
 * and calendar marker generation. These work alongside the core
 * cycleCalculator and cycleProfileService.
 *
 * Key functions:
 *   - getEffectiveLastPeriodStart: Determines the "real" period start by
 *     comparing the profile baseline with actual flow logs. This is the
 *     mechanism by which logged data overrides prediction data.
 *   - detectLatePhase: Checks if the user is past their expected cycle
 *     length without logging a new period.
 *   - generateCalendarMarkers: Produces per-day marker data for a calendar
 *     grid, combining predictions with actual logs.
 */
import { getPhaseForDay } from "@/constants/phaseConfig";
import type {
  Phase,
  CycleProfile,
  CalendarDayMarker,
  FlowLog,
} from "@/types/cycle";
import { toCyclePhase } from "@/types/cycle";

/**
 * Format a Date as a YYYY-MM-DD string (local timezone).
 * Uses manual formatting to avoid timezone issues with toISOString().
 */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date at midnight local time.
 * Appending T00:00:00 prevents timezone-related off-by-one errors.
 */
function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

/** Add days to a date, returning a new Date. */
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Calculate the number of whole days between two dates (end - start). */
function diffInDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Compute which day of the cycle a given date falls on.
 * Uses modulo to wrap across multiple cycles.
 *
 * @param date - The date to check
 * @param lastPeriodStart - ISO date of last period start
 * @param cycleLength - Average cycle length in days
 * @returns 1-indexed cycle day, or -1 if date is before lastPeriodStart
 */
export function computeCycleDay(
  date: Date,
  lastPeriodStart: string,
  cycleLength: number
): number {
  const start = parseDate(lastPeriodStart);
  const diff = diffInDays(start, date);
  if (diff < 0) return -1;
  return (diff % cycleLength) + 1;
}

/**
 * Compute raw (unwrapped) days since last period start.
 * Unlike computeCycleDay, this does NOT apply modulo — it returns
 * the actual number of days elapsed, which is needed for late detection.
 */
export function computeRawDaysSince(
  date: Date,
  lastPeriodStart: string
): number {
  return diffInDays(parseDate(lastPeriodStart), date);
}

/**
 * Map a cycle day to its internal phase name using phaseConfig.
 * Delegates to the shared getPhaseForDay() which handles phase boundaries
 * consistently across all screens.
 */
export function computePhase(
  dayInCycle: number,
  cycleLength: number,
  periodLength: number
): Phase {
  return getPhaseForDay(dayInCycle, cycleLength, periodLength);
}

/**
 * Determine the effective last period start date.
 *
 * This is the key function that allows logged data to override predictions:
 *   - If the user has logged flow data, find the most recent consecutive
 *     streak of flow days (the most recent period).
 *   - Compare with the profile's lastPeriodStartDate.
 *   - Return whichever is more recent.
 *
 * This ensures that when a user logs a period on the Calendar, the Lotus
 * wheel immediately reflects the new Day 1.
 *
 * @param profile - The user's CycleProfile (baseline from onboarding)
 * @param logs - Array of flow logs from the user's daily log entries
 * @returns ISO date string of the effective period start
 */
export function getEffectiveLastPeriodStart(
  profile: CycleProfile,
  logs: FlowLog[]
): string {
  // Filter to only logs with actual flow data, sorted newest first
  const logsWithFlow = logs
    .filter((l) => l.flow)
    .sort((a, b) => b.date.localeCompare(a.date));

  // No flow logs — use the onboarding baseline as-is
  if (logsWithFlow.length === 0) return profile.lastPeriodStartDate;

  // Walk backwards from the most recent flow log to find the start
  // of the consecutive streak (the first day of the most recent period)
  let streakStart = logsWithFlow[0].date;
  for (let i = 1; i < logsWithFlow.length; i++) {
    const prev = parseDate(logsWithFlow[i - 1].date);
    const curr = parseDate(logsWithFlow[i].date);
    const gap = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Consecutive days (gap of 0 or 1) extend the streak
    if (gap <= 1) {
      streakStart = logsWithFlow[i].date;
    } else {
      break;
    }
  }

  // Return whichever is more recent: the logged streak start or the profile baseline
  return streakStart > profile.lastPeriodStartDate
    ? streakStart
    : profile.lastPeriodStartDate;
}

/**
 * Pure late-period detection based on dates and cycle length alone.
 * No dependency on flow logs — the caller is responsible for providing
 * the correct `lastPeriodStartDate` (via getEffectiveLastPeriodStart).
 *
 * Rule: expected period date passed + no new bleed logged = "Late Luteal"
 */
export function isLatePeriod(
  lastPeriodStartDate: string,
  averageCycleLengthDays = 28,
  today?: string
) {
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const add = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const diff = (from: Date, to: Date) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const fromMidnight = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    ).getTime();
    const toMidnight = new Date(
      to.getFullYear(),
      to.getMonth(),
      to.getDate()
    ).getTime();
    return Math.floor((toMidnight - fromMidnight) / msPerDay);
  };

  const start = parseLocalDate(lastPeriodStartDate);
  const current = today ? parseLocalDate(today) : new Date();
  const expected = add(start, averageCycleLengthDays);
  const daysLate = Math.max(0, diff(expected, current));

  return {
    isLate: diff(expected, current) >= 0,
    daysLate,
    expectedPeriodDate: expected,
  };
}

/**
 * Detect whether the user's cycle is "late" — past the expected length
 * without a new period being logged.
 *
 * Delegates to isLatePeriod for the core date math, using the effective
 * last period start derived from flow logs.
 *
 * @returns Object with isLate flag, daysLate count, and raw current day
 */
export function detectLatePhase(
  profile: CycleProfile,
  logs: FlowLog[]
): { isLate: boolean; daysLate: number; rawCurrentDay: number } {
  const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rawDays = computeRawDaysSince(today, effectiveStart);
  const rawCurrentDay = rawDays + 1;

  const late = isLatePeriod(effectiveStart, profile.averageCycleLength);

  return {
    isLate: late.isLate,
    daysLate: late.daysLate,
    rawCurrentDay,
  };
}

/**
 * Generate calendar day markers for a given month.
 *
 * Combines the user's cycle profile predictions with actual flow logs
 * to produce per-day marker data for the calendar grid. Each marker
 * includes phase, period/fertile/ovulation/PMS flags, and whether the
 * user has logged flow for that day.
 *
 * If the user has logged flow on a day, it is always marked as a period
 * day regardless of what the prediction says — this is how actual data
 * overrides predictions.
 *
 * @param year - Calendar year
 * @param month - Calendar month (0-indexed, January = 0)
 * @param profile - The user's CycleProfile
 * @param logs - Array of flow logs
 * @returns Array of CalendarDayMarker objects, one per day in the month
 */
export function generateCalendarMarkers(
  year: number,
  month: number,
  profile: CycleProfile,
  logs: FlowLog[]
): CalendarDayMarker[] {
  const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
  const {
    averageCycleLength: cycleLength,
    averagePeriodLength: periodLength,
  } = profile;
  const ovulationDay = Math.max(cycleLength - 14, 1);

  // Build a set of dates with logged flow for O(1) lookup
  const flowDates = new Set(logs.filter((l) => l.flow).map((l) => l.date));
  const todayKey = toDateKey(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const markers: CalendarDayMarker[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = toDateKey(date);
    const dayInCycle = computeCycleDay(date, effectiveStart, cycleLength);
    const hasFlowLog = flowDates.has(dateKey);

    // A day is marked as period if the user logged flow OR it falls
    // within the predicted period window — logged data takes priority
    const isPeriod =
      hasFlowLog || (dayInCycle > 0 && dayInCycle <= periodLength);

    const isFertile =
      dayInCycle > 0 &&
      dayInCycle >= ovulationDay - 5 &&
      dayInCycle <= ovulationDay;

    const isOvulation = dayInCycle > 0 && dayInCycle === ovulationDay;

    const isPMS =
      dayInCycle > 0 &&
      dayInCycle > cycleLength - 7 &&
      dayInCycle <= cycleLength;

    // Use logged flow to force menstrual phase, otherwise derive from prediction
    const internalPhase: Phase = hasFlowLog
      ? "menstrual"
      : dayInCycle > 0
        ? computePhase(dayInCycle, cycleLength, periodLength)
        : "follicular";

    markers.push({
      day: d,
      dateKey,
      dayInCycle,
      phase: toCyclePhase(internalPhase),
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
