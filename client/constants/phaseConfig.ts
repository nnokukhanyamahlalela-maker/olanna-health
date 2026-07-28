import { phase as phaseTokens } from "@/constants/colors";

export type Phase = "menstrual" | "follicular" | "ovulation" | "luteal" | "late";

export interface PhaseConfig {
  label: string;
  subtitle: string;
  tagline: string;
  color: string;
  softBg: string;
  front: string;
  back: string;
  bg: string;
  skin: string;
  ink: string;
  lotusVariant: "bud" | "rising" | "bloom" | "closing" | "waiting";
  accentColor: string;
  labelColor: string;
  iconName: string;
  startDay: number;
  endDay: number;
  aboutText: string;
}

export const phaseConfig: Record<Phase, PhaseConfig> = {
  menstrual: {
    label: "Menstrual",
    subtitle: "Rest and release",
    tagline: "Rest and release",
    color: phaseTokens.menstrual.front,
    softBg: phaseTokens.menstrual.bg,
    front: phaseTokens.menstrual.front,
    back: phaseTokens.menstrual.back,
    bg: phaseTokens.menstrual.bg,
    skin: phaseTokens.menstrual.skin,
    ink: phaseTokens.menstrual.ink,
    lotusVariant: "bud",
    accentColor: phaseTokens.menstrual.back,
    labelColor: phaseTokens.menstrual.front,
    iconName: "droplet",
    startDay: 1,
    endDay: 4,
    aboutText:
      "Rest mode is activated, and that is valid. Your body is doing important work right now, so slow down where you can.",
  },
  follicular: {
    label: "Follicular",
    subtitle: "Growth and renewal",
    tagline: "Growth and renewal",
    color: phaseTokens.follicular.front,
    softBg: phaseTokens.follicular.bg,
    front: phaseTokens.follicular.front,
    back: phaseTokens.follicular.back,
    bg: phaseTokens.follicular.bg,
    skin: phaseTokens.follicular.skin,
    ink: phaseTokens.follicular.ink,
    lotusVariant: "rising",
    accentColor: phaseTokens.follicular.back,
    labelColor: phaseTokens.follicular.front,
    iconName: "trending-up",
    startDay: 5,
    endDay: 13,
    aboutText:
      "Energy is quietly returning as your body preps for ovulation. A good window for new ideas and starting things.",
  },
  ovulation: {
    label: "Ovulatory",
    subtitle: "Radiance and expression",
    tagline: "Radiance and expression",
    color: phaseTokens.ovulatory.front,
    softBg: phaseTokens.ovulatory.bg,
    front: phaseTokens.ovulatory.front,
    back: phaseTokens.ovulatory.back,
    bg: phaseTokens.ovulatory.bg,
    skin: phaseTokens.ovulatory.skin,
    ink: phaseTokens.ovulatory.ink,
    lotusVariant: "bloom",
    accentColor: phaseTokens.ovulatory.back,
    labelColor: phaseTokens.ovulatory.front,
    iconName: "sun",
    startDay: 14,
    endDay: 16,
    aboutText:
      "You are likely at your most energised and social right now, with confidence and communication both peaking.",
  },
  luteal: {
    label: "Luteal",
    subtitle: "Boundaries and reflection",
    tagline: "Boundaries and reflection",
    color: phaseTokens.luteal.front,
    softBg: phaseTokens.luteal.bg,
    front: phaseTokens.luteal.front,
    back: phaseTokens.luteal.back,
    bg: phaseTokens.luteal.bg,
    skin: phaseTokens.luteal.skin,
    ink: phaseTokens.luteal.ink,
    lotusVariant: "closing",
    accentColor: phaseTokens.luteal.back,
    labelColor: phaseTokens.luteal.front,
    iconName: "moon",
    startDay: 17,
    endDay: 28,
    aboutText:
      "Your body is winding down toward your next cycle. Hormones are shifting, so patience with yourself matters here.",
  },
  late: {
    label: "Late Luteal",
    subtitle: "Awaiting your cycle",
    tagline: "Awaiting your cycle",
    color: phaseTokens.luteal.front,
    softBg: phaseTokens.luteal.bg,
    front: phaseTokens.luteal.front,
    back: phaseTokens.luteal.back,
    bg: phaseTokens.luteal.bg,
    skin: phaseTokens.luteal.skin,
    ink: phaseTokens.luteal.ink,
    lotusVariant: "waiting",
    accentColor: phaseTokens.luteal.back,
    labelColor: phaseTokens.luteal.front,
    iconName: "clock",
    startDay: 0,
    endDay: 0,
    aboutText:
      "Your expected period date has passed. This is often perfectly normal — stress, sleep, or hormonal shifts can all affect timing.",
  },
};

export const PHASE_ORDER: Phase[] = ["menstrual", "follicular", "ovulation", "luteal"];

export function getPhaseBoundaries(cycleLength: number = 28, periodLength: number = 5) {
  const clampedPeriod = Math.min(periodLength, Math.floor(cycleLength * 0.3));
  const ovulationDay = Math.max(clampedPeriod + 2, cycleLength - 14);
  const menstrualEnd = clampedPeriod;
  const follicularEnd = Math.max(menstrualEnd + 1, ovulationDay - 2);
  const ovulationEnd = Math.min(cycleLength - 1, ovulationDay + 1);
  return {
    menstrualEnd,
    follicularEnd,
    ovulationEnd,
    lutealEnd: cycleLength,
  };
}

export function getPhaseForDay(day: number, cycleLength: number = 28, periodLength: number = 5): Phase {
  const normalized = ((day - 1) % cycleLength) + 1;
  const bounds = getPhaseBoundaries(cycleLength, periodLength);

  if (normalized <= bounds.menstrualEnd) return "menstrual";
  if (normalized <= bounds.follicularEnd) return "follicular";
  if (normalized <= bounds.ovulationEnd) return "ovulation";
  return "luteal";
}

export function getPhaseColor(day: number, cycleLength: number = 28, periodLength: number = 5): string {
  const p = getPhaseForDay(day, cycleLength, periodLength);
  return phaseConfig[p].color;
}

export function getDayAngle(currentDay: number, cycleLength: number): number {
  return ((currentDay - 1) / cycleLength) * 360 - 90;
}

export function getDaysUntilPeriod(selectedDay: number, cycleLength: number): number {
  if (selectedDay >= cycleLength) return 0;
  return cycleLength - selectedDay;
}

export function getStatusText(
  selectedDay: number,
  cycleLength: number,
  periodLength: number = 5,
  isLate: boolean = false
): string {
  if (isLate) {
    const daysLate = selectedDay - cycleLength;
    if (daysLate <= 1) return "Period expected today";
    return `Period is ${daysLate} days late`;
  }
  const daysUntil = getDaysUntilPeriod(selectedDay, cycleLength);
  if (daysUntil === 0) return "Period is expected today";
  if (daysUntil <= 2) return "Period starting soon";
  const p = getPhaseForDay(selectedDay, cycleLength, periodLength);
  if (p === "menstrual") return "Currently in your period";
  return `Period starts in ${daysUntil} days`;
}
