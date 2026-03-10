import { CyclePhase, CyclePrediction, CycleProfile } from "../types/cycle";

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function diffInDays(start: Date, end: Date): number {
  const milliseconds = end.getTime() - start.getTime();
  return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
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

export interface LotusPhaseContent {
  title: string;
  subtitle: string;
}

export function getLotusPhaseContent(phase: CyclePhase): LotusPhaseContent {
  switch (phase) {
    case "Menstrual":
      return {
        title: "Rest & Release",
        subtitle: "A softer time to slow down, replenish, and listen inward.",
      };
    case "Follicular":
      return {
        title: "Growth & Renewal",
        subtitle: "Energy begins to rise. A beautiful time for fresh starts.",
      };
    case "Ovulatory":
      return {
        title: "Radiance & Expression",
        subtitle: "You may feel more open, vibrant, and connected.",
      };
    case "Luteal":
      return {
        title: "Boundaries & Reflection",
        subtitle: "Come back to yourself. Protect your energy and create space.",
      };
    default:
      return {
        title: "Your Lotus Cycle",
        subtitle: "A gentle view of where you are in your cycle.",
      };
  }
}

export function generateCyclePrediction(params: {
  profile: CycleProfile;
  effectiveLastPeriodStartDate: string;
  today?: Date;
}): CyclePrediction {
  const { profile, effectiveLastPeriodStartDate, today = new Date() } = params;

  const cycleStartDate = new Date(effectiveLastPeriodStartDate);
  const daysSinceStart = diffInDays(cycleStartDate, today);

  const rawCycleDay = daysSinceStart + 1;

  const currentCycleDay =
    ((daysSinceStart % profile.averageCycleLength) + profile.averageCycleLength) %
      profile.averageCycleLength +
    1;

  const isLate = rawCycleDay > profile.averageCycleLength;
  const daysLate = isLate ? rawCycleDay - profile.averageCycleLength : 0;
  const expectedPeriodDate = addDays(cycleStartDate, profile.averageCycleLength);

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

  const periodDates = Array.from(
    { length: profile.averagePeriodLength },
    (_, index) => formatDate(addDays(nextPeriodStart, index))
  );

  const phaseRanges: { phase: CyclePhase; start: string; end: string }[] = [
    {
      phase: "Menstrual",
      start: formatDate(currentCycleStart),
      end: formatDate(addDays(currentCycleStart, profile.averagePeriodLength - 1)),
    },
    {
      phase: "Follicular",
      start: formatDate(addDays(currentCycleStart, profile.averagePeriodLength)),
      end: formatDate(addDays(currentCycleStart, ovulationDay - 6)),
    },
    {
      phase: "Ovulatory",
      start: formatDate(fertileWindowStart),
      end: formatDate(addDays(ovulationDate, 1)),
    },
    {
      phase: "Luteal",
      start: formatDate(addDays(ovulationDate, 2)),
      end: formatDate(addDays(currentCycleStart, profile.averageCycleLength - 1)),
    },
  ];

  return {
    currentCycleDay,
    rawCycleDay,
    isLate,
    daysLate,
    expectedPeriodDate: formatDate(expectedPeriodDate),
    currentPhase,
    nextPeriodStartDate: formatDate(nextPeriodStart),
    fertileWindowStart: formatDate(fertileWindowStart),
    fertileWindowEnd: formatDate(fertileWindowEnd),
    ovulationDate: formatDate(ovulationDate),
    periodDates,
    phaseRanges,
  };
}
