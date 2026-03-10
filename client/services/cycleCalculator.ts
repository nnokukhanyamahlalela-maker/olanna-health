// src/services/cycleCalculator.ts

import { CyclePhase, CyclePrediction, CycleProfile } from "../types/cycle";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function diffInDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function getCyclePhase(
  cycleDay: number,
  averageCycleLength: number,
  averagePeriodLength: number
): CyclePhase {
  const ovulationDay = averageCycleLength - 14;

  if (cycleDay <= averagePeriodLength) return "Menstrual";
  if (cycleDay < ovulationDay - 4) return "Follicular";
  if (cycleDay <= ovulationDay + 1) return "Ovulatory";
  return "Luteal";
}

export function generateCyclePrediction(params: {
  profile: CycleProfile;
  effectiveLastPeriodStartDate: string;
  today?: Date;
}): CyclePrediction {
  const { profile, effectiveLastPeriodStartDate, today = new Date() } = params;

  const cycleStartDate = new Date(effectiveLastPeriodStartDate);
  const daysSinceStart = diffInDays(cycleStartDate, today);

  const currentCycleDay =
    ((daysSinceStart % profile.averageCycleLength) + profile.averageCycleLength) %
      profile.averageCycleLength +
    1;

  const currentPhase = getCyclePhase(
    currentCycleDay,
    profile.averageCycleLength,
    profile.averagePeriodLength
  );

  const nextPeriodOffset = profile.averageCycleLength - (currentCycleDay - 1);
  const nextPeriodStart = addDays(today, nextPeriodOffset);

  const ovulationDay = profile.averageCycleLength - 14;
  const fertileWindowStartDay = ovulationDay - 5;
  const fertileWindowEndDay = ovulationDay;

  const currentCycleStart = addDays(today, -(currentCycleDay - 1));
  const ovulationDate = addDays(currentCycleStart, ovulationDay - 1);
  const fertileWindowStart = addDays(currentCycleStart, fertileWindowStartDay - 1);
  const fertileWindowEnd = addDays(currentCycleStart, fertileWindowEndDay - 1);

  const periodDates = Array.from({ length: profile.averagePeriodLength }, (_, i) =>
    formatDate(addDays(nextPeriodStart, i))
  );

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
