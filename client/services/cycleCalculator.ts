/**
 * Cycle Calculator — Pure Stateless Prediction Engine
 *
 * This module contains the core math for menstrual cycle predictions.
 * It is intentionally stateless: it takes a CycleProfile as input and
 * returns a CyclePrediction as output, with no side effects.
 *
 * Exported functions:
 *   - getCyclePhase(cycleDay, cycleLength, periodLength) → CyclePhase
 *   - generateCyclePrediction(profile, todayInput?) → CyclePrediction
 *
 * Phase boundaries follow standard gynecological definitions:
 *   - Menstrual:   Day 1 through periodLength
 *   - Follicular:  After period ends through 5 days before ovulation
 *   - Ovulatory:   5 days before ovulation through 1 day after
 *   - Luteal:      After ovulation through end of cycle
 *
 * Ovulation is estimated at cycleLength - 14 (the luteal phase is
 * typically a consistent 14 days across most women).
 */
import { CyclePhase, CyclePrediction, CycleProfile } from "../types/cycle";

/** Add a number of days to a date, returning a new Date object. */
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Format a Date as an ISO date string (YYYY-MM-DD). */
function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

/** Calculate the number of whole days between two dates (end - start). */
function diffInDays(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Determine the cycle phase for a given day within the cycle.
 *
 * @param cycleDay - The current day in the cycle (1-indexed)
 * @param averageCycleLength - Total cycle length in days
 * @param averagePeriodLength - Number of menstrual flow days
 * @returns The CyclePhase ("Menstrual", "Follicular", "Ovulatory", or "Luteal")
 *
 * Phase boundaries:
 *   Menstrual:  day 1 → periodLength
 *   Follicular: periodLength+1 → ovulationDay-5
 *   Ovulatory:  ovulationDay-4 → ovulationDay+1
 *   Luteal:     ovulationDay+2 → cycleLength
 */
export function getCyclePhase(
  cycleDay: number,
  averageCycleLength: number,
  averagePeriodLength: number
): CyclePhase {
  // Ovulation typically occurs 14 days before the next period
  const ovulationDay = averageCycleLength - 14;

  if (cycleDay <= averagePeriodLength) return "Menstrual";
  if (cycleDay < ovulationDay - 4) return "Follicular";
  if (cycleDay >= ovulationDay - 4 && cycleDay <= ovulationDay + 1) return "Ovulatory";
  return "Luteal";
}

/**
 * Generate a full cycle prediction from a user's cycle profile.
 *
 * This is the main prediction function. Given the user's baseline data
 * (last period start, average cycle length, average period length), it
 * calculates:
 *   - What day of the cycle the user is on today
 *   - What phase they are in
 *   - When the next period is predicted to start
 *   - The fertile window and ovulation date
 *   - Predicted period dates for the next cycle
 *   - Phase date ranges for the current cycle
 *
 * @param profile - The user's CycleProfile (from onboarding or storage)
 * @param todayInput - Optional override for "today" (useful for testing)
 * @returns A complete CyclePrediction object
 */
export function generateCyclePrediction(
  profile: CycleProfile,
  todayInput?: Date
): CyclePrediction {
  const today = todayInput || new Date();
  const lastPeriodStart = new Date(profile.lastPeriodStartDate);

  // Calculate current cycle day using modulo to handle multiple elapsed cycles.
  // The formula wraps around so day ranges from 1 to cycleLength.
  const daysSinceLastPeriod = diffInDays(lastPeriodStart, today);
  const currentCycleDay =
    ((daysSinceLastPeriod % profile.averageCycleLength) + profile.averageCycleLength) %
      profile.averageCycleLength +
    1;

  // Determine the current phase based on the cycle day
  const currentPhase = getCyclePhase(
    currentCycleDay,
    profile.averageCycleLength,
    profile.averagePeriodLength
  );

  // Calculate when the next period starts (days remaining in current cycle)
  const nextPeriodOffset = profile.averageCycleLength - (currentCycleDay - 1);
  const nextPeriodStart = addDays(today, nextPeriodOffset);

  // Ovulation and fertile window calculations
  // Fertile window: 5 days before ovulation through ovulation day
  const ovulationDay = profile.averageCycleLength - 14;
  const fertileWindowStartDay = ovulationDay - 5;
  const fertileWindowEndDay = ovulationDay;

  // Derive the start of the current cycle to anchor all date calculations
  const currentCycleStart = addDays(today, -(currentCycleDay - 1));
  const ovulationDate = addDays(currentCycleStart, ovulationDay - 1);
  const fertileWindowStart = addDays(currentCycleStart, fertileWindowStartDay - 1);
  const fertileWindowEnd = addDays(currentCycleStart, fertileWindowEndDay - 1);

  // Generate predicted period dates for the NEXT cycle
  const periodDates = Array.from({ length: profile.averagePeriodLength }, (_, i) =>
    formatDate(addDays(nextPeriodStart, i))
  );

  // Build phase ranges with concrete date boundaries for the current cycle
  const phaseRanges = [
    {
      phase: "Menstrual" as CyclePhase,
      start: formatDate(currentCycleStart),
      end: formatDate(addDays(currentCycleStart, profile.averagePeriodLength - 1)),
    },
    {
      phase: "Follicular" as CyclePhase,
      start: formatDate(addDays(currentCycleStart, profile.averagePeriodLength)),
      end: formatDate(addDays(currentCycleStart, ovulationDay - 6)),
    },
    {
      phase: "Ovulatory" as CyclePhase,
      start: formatDate(fertileWindowStart),
      end: formatDate(addDays(ovulationDate, 1)),
    },
    {
      phase: "Luteal" as CyclePhase,
      start: formatDate(addDays(ovulationDate, 2)),
      end: formatDate(addDays(currentCycleStart, profile.averageCycleLength - 1)),
    },
  ];

  return {
    currentCycleDay,
    currentPhase,
    nextPeriodStartDate: formatDate(nextPeriodStart),
    fertileWindowStart: formatDate(fertileWindowStart),
    fertileWindowEnd: formatDate(fertileWindowEnd),
    ovulationDate: formatDate(ovulationDate),
    periodDates,
    phaseRanges,
  };
}
