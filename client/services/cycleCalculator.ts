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

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

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

export function computeRawDaysSince(
  date: Date,
  lastPeriodStart: string
): number {
  return daysBetween(date, parseDate(lastPeriodStart));
}

export function computePhase(
  dayInCycle: number,
  cycleLength: number,
  periodLength: number
): Phase {
  return getPhaseForDay(dayInCycle, cycleLength, periodLength);
}

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

function generatePeriodDates(
  effectiveStart: string,
  periodLength: number,
  cycleLength: number
): string[] {
  const dates: string[] = [];
  const start = parseDate(effectiveStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cycleStart = new Date(start);
  while (cycleStart <= addDays(today, cycleLength)) {
    for (let d = 0; d < periodLength; d++) {
      dates.push(toDateKey(addDays(cycleStart, d)));
    }
    cycleStart = addDays(cycleStart, cycleLength);
  }

  return dates;
}

function generatePhaseRanges(
  effectiveStart: string,
  cycleLength: number,
  periodLength: number
): { phase: CyclePhase; start: string; end: string }[] {
  const ranges: { phase: CyclePhase; start: string; end: string }[] = [];
  const origin = parseDate(effectiveStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cycleStart = new Date(origin);
  while (cycleStart <= addDays(today, cycleLength)) {
    const menstrualEnd = periodLength;
    const ovulationDay = Math.max(cycleLength - 14, menstrualEnd + 1);
    const follicularEnd = ovulationDay - 1;
    const ovulationEnd = ovulationDay;

    ranges.push({
      phase: "Menstrual",
      start: toDateKey(cycleStart),
      end: toDateKey(addDays(cycleStart, menstrualEnd - 1)),
    });
    if (follicularEnd > menstrualEnd) {
      ranges.push({
        phase: "Follicular",
        start: toDateKey(addDays(cycleStart, menstrualEnd)),
        end: toDateKey(addDays(cycleStart, follicularEnd - 1)),
      });
    }
    ranges.push({
      phase: "Ovulatory",
      start: toDateKey(addDays(cycleStart, ovulationDay - 1)),
      end: toDateKey(addDays(cycleStart, ovulationEnd - 1)),
    });
    if (cycleLength > ovulationEnd) {
      ranges.push({
        phase: "Luteal",
        start: toDateKey(addDays(cycleStart, ovulationEnd)),
        end: toDateKey(addDays(cycleStart, cycleLength - 1)),
      });
    }

    cycleStart = addDays(cycleStart, cycleLength);
  }

  return ranges;
}

export function computeCyclePrediction(
  profile: CycleProfile,
  logs: FlowLog[]
): CyclePrediction {
  const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { averageCycleLength, averagePeriodLength } = profile;
  const rawDays = computeRawDaysSince(today, effectiveStart);
  const wrappedDay = (rawDays % averageCycleLength) + 1;

  const nextPeriod = predictNextPeriod(effectiveStart, averageCycleLength, today);
  const fertility = predictFertileWindow(nextPeriod);
  const internalPhase = computePhase(wrappedDay, averageCycleLength, averagePeriodLength);

  const prediction: CyclePrediction = {
    currentCycleDay: wrappedDay,
    currentPhase: toCyclePhase(internalPhase),
    effectiveLastPeriodStart: effectiveStart,
    nextPeriodStartDate: nextPeriod,
    ...fertility,
    periodDates: generatePeriodDates(effectiveStart, averagePeriodLength, averageCycleLength),
    phaseRanges: generatePhaseRanges(effectiveStart, averageCycleLength, averagePeriodLength),
    isLate: false,
    daysLate: 0,
  };

  if (rawDays > averageCycleLength) {
    const predictedNext = parseDate(effectiveStart);
    predictedNext.setDate(predictedNext.getDate() + averageCycleLength);
    const hasNewPeriod = logs.some((l) => {
      if (!l.flow) return false;
      return parseDate(l.date) >= predictedNext;
    });

    if (!hasNewPeriod) {
      prediction.isLate = true;
      prediction.currentCycleDay = rawDays + 1;
      prediction.daysLate = rawDays - averageCycleLength;
    }
  }

  return prediction;
}

export function generateCalendarMarkers(
  year: number,
  month: number,
  profile: CycleProfile,
  logs: FlowLog[]
): CalendarDayMarker[] {
  const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
  const { averageCycleLength: cycleLength, averagePeriodLength: periodLength } = profile;
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

    const isPeriod = hasFlowLog || (dayInCycle > 0 && dayInCycle <= periodLength);

    const isFertile =
      dayInCycle > 0 &&
      dayInCycle >= ovulationDay - 5 &&
      dayInCycle <= ovulationDay + 1;

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
