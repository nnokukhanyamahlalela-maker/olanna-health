import { getPhaseForDay } from "@/constants/phaseConfig";
import type {
  Phase,
  CycleProfile,
  CalendarDayMarker,
  FlowLog,
} from "@/types/cycle";
import { toCyclePhase } from "@/types/cycle";

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

export function getEffectiveLastPeriodStart(
  profile: CycleProfile,
  logs: FlowLog[]
): string {
  const logsWithFlow = logs
    .filter((l) => l.flow)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (logsWithFlow.length === 0) return profile.lastPeriodStartDate;

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

  return streakStart > profile.lastPeriodStartDate
    ? streakStart
    : profile.lastPeriodStartDate;
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
