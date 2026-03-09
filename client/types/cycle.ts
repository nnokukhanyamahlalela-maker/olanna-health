import { Phase } from "@/constants/phaseConfig";

export type { Phase };

export interface CycleProfile {
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
}

export interface CycleStatus {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  nextPeriodStart: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  phase: Phase;
  daysLate: number;
}

export interface CalendarDayMarker {
  day: number;
  dateKey: string;
  dayInCycle: number;
  phase: Phase;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPMS: boolean;
  isToday: boolean;
  hasFlowLog: boolean;
}

export interface FlowLog {
  date: string;
  flow?: string | null;
}
