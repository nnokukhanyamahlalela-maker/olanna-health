import { getPhaseForDay } from "@/constants/phaseConfig";
import type {
  Phase,
  CycleProfile,
  CycleStatus,
  CalendarDayMarker,
  FlowLog,
} from "@/types/cycle";
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
