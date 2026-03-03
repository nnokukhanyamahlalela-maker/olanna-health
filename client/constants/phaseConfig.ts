import { phase as phaseTokens, neutral } from "@/constants/colors";

export type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface PhaseConfig {
  label: string;
  subtitle: string;
  tagline: string;
  color: string;
  softBg: string;
  lotusVariant: "bud" | "rising" | "bloom" | "closing";
  accentColor: string;
  labelColor: string;
  iconName: string;
  startDay: number;
  endDay: number;
}

export const phaseConfig: Record<Phase, PhaseConfig> = {
  menstrual: {
    label: "Menstrual",
    subtitle: "Rest and Release",
    tagline: "Rest and Release",
    color: phaseTokens.menstrual.solid,
    softBg: phaseTokens.menstrual.softBg,
    lotusVariant: "bud",
    accentColor: phaseTokens.menstrual.gradientEnd,
    labelColor: phaseTokens.menstrual.gradientMid,
    iconName: "droplet",
    startDay: 1,
    endDay: 4,
  },
  follicular: {
    label: "Follicular",
    subtitle: "Growth and Renewal",
    tagline: "Growth and Renewal",
    color: phaseTokens.follicular.solid,
    softBg: phaseTokens.follicular.softBg,
    lotusVariant: "rising",
    accentColor: phaseTokens.follicular.gradientMid,
    labelColor: phaseTokens.follicular.gradientStart,
    iconName: "trending-up",
    startDay: 5,
    endDay: 13,
  },
  ovulation: {
    label: "Ovulatory",
    subtitle: "Radiance and Expression",
    tagline: "Radiance and Expression",
    color: phaseTokens.ovulatory.solid,
    softBg: phaseTokens.ovulatory.softBg,
    lotusVariant: "bloom",
    accentColor: phaseTokens.ovulatory.gradientMid,
    labelColor: phaseTokens.ovulatory.gradientStart,
    iconName: "sun",
    startDay: 14,
    endDay: 16,
  },
  luteal: {
    label: "Luteal",
    subtitle: "Boundaries and Reflection",
    tagline: "Boundaries and Reflection",
    color: phaseTokens.luteal.solid,
    softBg: phaseTokens.luteal.softBg,
    lotusVariant: "closing",
    accentColor: phaseTokens.luteal.gradientMid,
    labelColor: phaseTokens.luteal.gradientStart,
    iconName: "moon",
    startDay: 17,
    endDay: 28,
  },
};

export const PHASE_ORDER: Phase[] = ["menstrual", "follicular", "ovulation", "luteal"];

export function getPhaseForDay(day: number, cycleLength: number = 28): Phase {
  const normalized = ((day - 1) % cycleLength) + 1;
  for (const phase of PHASE_ORDER) {
    const config = phaseConfig[phase];
    if (normalized >= config.startDay && normalized <= config.endDay) {
      return phase;
    }
  }
  return "luteal";
}

export function getPhaseColor(day: number, cycleLength: number = 28): string {
  const phase = getPhaseForDay(day, cycleLength);
  return phaseConfig[phase].color;
}

export function getDayAngle(currentDay: number, cycleLength: number): number {
  return ((currentDay - 1) / cycleLength) * 360 - 90;
}

export function getDaysUntilPeriod(selectedDay: number, cycleLength: number): number {
  if (selectedDay >= cycleLength) return 0;
  return cycleLength - selectedDay;
}

export function getStatusText(selectedDay: number, cycleLength: number): string {
  const daysUntil = getDaysUntilPeriod(selectedDay, cycleLength);
  if (daysUntil === 0) return "Period is expected today";
  if (daysUntil <= 2) return "Period starting soon";
  const phase = getPhaseForDay(selectedDay, cycleLength);
  if (phase === "menstrual") return "Currently in your period";
  return `Period starts in ${daysUntil} days`;
}
