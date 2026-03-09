import { Phase } from "@/constants/phaseConfig";

export type { Phase };

export type CyclePhase =
  | "Menstrual"
  | "Follicular"
  | "Ovulatory"
  | "Luteal";

export interface CycleProfile {
  userId: string;
  lastPeriodStartDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  onboardingSymptoms?: string[];
  updatedAt: string;
}

export interface CyclePrediction {
  currentCycleDay: number;
  currentPhase: CyclePhase;
  effectiveLastPeriodStart: string;
  nextPeriodStartDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
  periodDates: string[];
  phaseRanges: {
    phase: CyclePhase;
    start: string;
    end: string;
  }[];
  isLate: boolean;
  daysLate: number;
}

export interface CalendarDayMarker {
  day: number;
  dateKey: string;
  dayInCycle: number;
  phase: CyclePhase;
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

const PHASE_TO_INTERNAL: Record<CyclePhase, Phase> = {
  Menstrual: "menstrual",
  Follicular: "follicular",
  Ovulatory: "ovulation",
  Luteal: "luteal",
};

const INTERNAL_TO_PHASE: Record<string, CyclePhase> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulatory",
  luteal: "Luteal",
  late: "Luteal",
};

export function toInternalPhase(cp: CyclePhase): Phase {
  return PHASE_TO_INTERNAL[cp];
}

export function toCyclePhase(p: Phase): CyclePhase {
  return INTERNAL_TO_PHASE[p] ?? "Follicular";
}
