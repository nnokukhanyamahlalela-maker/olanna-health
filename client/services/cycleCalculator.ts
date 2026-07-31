import { CyclePhase, CyclePrediction, CycleProfile } from "../types/cycle";
import { isLatePeriod } from "../utils/cycleUtils";

/**
 * Minimal shape required by countLoggedCycles — a subset of DailyLog so
 * the function can be used without importing the full storage module.
 */
interface FlowEntry {
  date: string;
  flow?: string | null;
}

/**
 * Count the number of distinct menstrual cycles the user has actually logged,
 * derived from flow entries in their daily logs.
 *
 * A new cycle is counted each time a flow day appears after a gap of more
 * than `minGapDays` days with no flow (default 14 — long enough to skip
 * any spotting mid-cycle but short enough to catch a new period).
 *
 * Spotting-only days are intentionally excluded so that mid-cycle spotting
 * does not inflate the count.
 *
 * Returns 0 when no flow has been logged at all.
 */
export function countLoggedCycles(
  logs: FlowEntry[],
  minGapDays = 14
): number {
  const flowDates = [
    ...new Set(
      logs
        .filter((l) => l.flow && l.flow !== "spotting")
        .map((l) => l.date.slice(0, 10))
    ),
  ].sort(); // ascending ISO order

  if (flowDates.length === 0) return 0;

  let cycles = 1;
  for (let i = 1; i < flowDates.length; i++) {
    const prev = new Date(flowDates[i - 1] + "T12:00:00");
    const curr = new Date(flowDates[i] + "T12:00:00");
    const gap = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (gap > minGapDays) {
      cycles++;
    }
  }
  return cycles;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function diffInDays(start: Date, end: Date): number {
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.round((endMidnight - startMidnight) / (1000 * 60 * 60 * 24));
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
    case "Late Luteal":
      return {
        title: "Awaiting Your Cycle",
        subtitle: "You remain in the luteal phase until a new bleed is logged.",
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

  const cycleStartDate = new Date(effectiveLastPeriodStartDate + "T00:00:00");
  if (isNaN(cycleStartDate.getTime())) {
    return {
      currentCycleDay: 1,
      rawCycleDay: 1,
      isLate: false,
      daysLate: 0,
      expectedPeriodDate: formatDate(today),
      isPeriodDueSoon: false,
      currentPhase: "Follicular" as CyclePhase,
      nextPeriodStartDate: formatDate(today),
      fertileWindowStart: formatDate(today),
      fertileWindowEnd: formatDate(today),
      ovulationDate: formatDate(today),
      periodDates: [],
      phaseRanges: [],
      uiLabel: "Follicular Phase",
      message: "Set your cycle details to get predictions.",
      helperText: "Visit your profile to enter your last period date.",
    };
  }
  const daysSinceStart = diffInDays(cycleStartDate, today);

  const rawCycleDay = daysSinceStart + 1;

  const late = isLatePeriod(
    effectiveLastPeriodStartDate,
    profile.averageCycleLength,
    formatDate(today)
  );
  const { isLate, daysLate } = late;
  const expectedPeriodDate = late.expectedPeriodDate;

  const currentCycleDay = isLate
    ? rawCycleDay
    : ((daysSinceStart % profile.averageCycleLength) + profile.averageCycleLength) %
        profile.averageCycleLength +
      1;

  const basePhase = getCyclePhase(
    currentCycleDay,
    profile.averageCycleLength,
    profile.averagePeriodLength
  );
  const daysUntilPeriod = diffInDays(today, expectedPeriodDate);
  const isPeriodDueSoon = daysUntilPeriod <= 2 && daysUntilPeriod >= 0;
  const currentPhase: CyclePhase = isLate ? "Late Luteal" : basePhase;

  let uiLabel = `${currentPhase} Phase`;
  let message = `You are currently in the ${currentPhase.toLowerCase()} phase.`;
  let helperText = "Your body may still be preparing for your next bleed.";

  if (currentPhase === "Menstrual") {
    helperText = "This phase begins when bleeding starts.";
  } else if (currentPhase === "Follicular") {
    helperText = "A phase often associated with growth and renewal.";
  } else if (currentPhase === "Ovulatory") {
    helperText = "Ovulation often happens around the middle of the cycle.";
  } else if (currentPhase === "Luteal") {
    helperText = "Your next cycle begins once bleeding starts.";
  }

  if (isPeriodDueSoon && !isLate) {
    message = "Your period is expected soon.";
    helperText = "Your next cycle begins once bleeding starts.";
  }

  if (isLate && daysLate >= 5) {
    uiLabel = "Late Luteal Phase";
    message = "Your cycle is taking a little longer this month.";
    helperText = "You remain in the luteal phase until a new bleed is logged.";
  }

  if (isLate && daysLate > 45) {
    uiLabel = "Late Luteal Phase";
    message = "Your cycle has been extended for a while.";
    helperText = "If this is unusual for you, consider speaking with a healthcare provider.";
  }

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
    isPeriodDueSoon,
    currentPhase,
    nextPeriodStartDate: formatDate(nextPeriodStart),
    fertileWindowStart: formatDate(fertileWindowStart),
    fertileWindowEnd: formatDate(fertileWindowEnd),
    ovulationDate: formatDate(ovulationDate),
    periodDates,
    phaseRanges,
    uiLabel,
    message,
    helperText,
  };
}
