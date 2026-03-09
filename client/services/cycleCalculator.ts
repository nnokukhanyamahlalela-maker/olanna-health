import { getPhaseForDay } from "@/constants/phaseConfig";
import type {
  Phase,
  CyclePhase,
  CycleProfile,
  CyclePrediction,
  CalendarDayMarker,
  FlowLog,
} from "@/types/cycle";
import { toCyclePhase } from "@/types/cycle";
import { getEffectiveLastPeriodStart } from "@/services/cycleProfileService";

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
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
  if (cycleDay >= ovulationDay - 4 && cycleDay <= ovulationDay + 1)
    return "Ovulatory";
  return "Luteal";
}

export function generateCyclePrediction(
  profile: CycleProfile,
  todayInput?: Date
): CyclePrediction {
  const today = todayInput || new Date();
  const lastPeriodStart = parseDate(profile.lastPeriodStartDate);

  const daysSinceLastPeriod = diffInDays(lastPeriodStart, today);
  const currentCycleDay =
    ((daysSinceLastPeriod % profile.averageCycleLength) +
      profile.averageCycleLength) %
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
  const fertileWindowStart = addDays(
    currentCycleStart,
    fertileWindowStartDay - 1
  );
  const fertileWindowEnd = addDays(currentCycleStart, fertileWindowEndDay - 1);

  const periodDates = Array.from(
    { length: profile.averagePeriodLength },
    (_, i) => toDateKey(addDays(nextPeriodStart, i))
  );

  const phaseRanges: CyclePrediction["phaseRanges"] = [
    {
      phase: "Menstrual",
      start: toDateKey(currentCycleStart),
      end: toDateKey(
        addDays(currentCycleStart, profile.averagePeriodLength - 1)
      ),
    },
    {
      phase: "Follicular",
      start: toDateKey(addDays(currentCycleStart, profile.averagePeriodLength)),
      end: toDateKey(addDays(currentCycleStart, ovulationDay - 6)),
    },
    {
      phase: "Ovulatory",
      start: toDateKey(fertileWindowStart),
      end: toDateKey(addDays(ovulationDate, 1)),
    },
    {
      phase: "Luteal",
      start: toDateKey(addDays(ovulationDate, 2)),
      end: toDateKey(
        addDays(currentCycleStart, profile.averageCycleLength - 1)
      ),
    },
  ];

  return {
    currentCycleDay,
    currentPhase,
    nextPeriodStartDate: toDateKey(nextPeriodStart),
    fertileWindowStart: toDateKey(fertileWindowStart),
    fertileWindowEnd: toDateKey(fertileWindowEnd),
    ovulationDate: toDateKey(ovulationDate),
    periodDates,
    phaseRanges,
  };
}

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

export function computeRawDaysSince(
  date: Date,
  lastPeriodStart: string
): number {
  return diffInDays(parseDate(lastPeriodStart), date);
}

export function computePhase(
  dayInCycle: number,
  cycleLength: number,
  periodLength: number
): Phase {
  return getPhaseForDay(dayInCycle, cycleLength, periodLength);
}

export function detectLatePhase(
  profile: CycleProfile,
  logs: FlowLog[]
): { isLate: boolean; daysLate: number; rawCurrentDay: number } {
  const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rawDays = computeRawDaysSince(today, effectiveStart);

  if (rawDays <= profile.averageCycleLength) {
    return { isLate: false, daysLate: 0, rawCurrentDay: rawDays + 1 };
  }

  const predictedNext = addDays(
    parseDate(effectiveStart),
    profile.averageCycleLength
  );
  const hasNewPeriod = logs.some((l) => {
    if (!l.flow) return false;
    return parseDate(l.date) >= predictedNext;
  });

  if (!hasNewPeriod) {
    return {
      isLate: true,
      daysLate: rawDays - profile.averageCycleLength,
      rawCurrentDay: rawDays + 1,
    };
  }

  return { isLate: false, daysLate: 0, rawCurrentDay: rawDays + 1 };
}

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

  const flowDates = new Set(logs.filter((l) => l.flow).map((l) => l.date));
  const todayKey = toDateKey(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const markers: CalendarDayMarker[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = toDateKey(date);
    const dayInCycle = computeCycleDay(date, effectiveStart, cycleLength);
    const hasFlowLog = flowDates.has(dateKey);

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
