export type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface PhaseConfig {
  label: string;
  subtitle: string;
  tagline: string;
  ringGradient: {
    start: string;
    end: string;
  };
  color: string;
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
    subtitle: "Rest & Release",
    tagline: "Rest & Release",
    ringGradient: { start: "#F2B5B5", end: "#E8A0A0" },
    color: "#F2B5B5",
    lotusVariant: "bud",
    accentColor: "#E8A0A0",
    labelColor: "#C88080",
    iconName: "droplet",
    startDay: 1,
    endDay: 4,
  },
  follicular: {
    label: "Follicular",
    subtitle: "Growth & Renewal",
    tagline: "Growth & Renewal",
    ringGradient: { start: "#B8DFC8", end: "#A0D0B0" },
    color: "#B8DFC8",
    lotusVariant: "rising",
    accentColor: "#A0D0B0",
    labelColor: "#78B090",
    iconName: "trending-up",
    startDay: 5,
    endDay: 13,
  },
  ovulation: {
    label: "Ovulatory",
    subtitle: "Radiance & Expression",
    tagline: "Radiance & Expression",
    ringGradient: { start: "#F5D89A", end: "#ECC878" },
    color: "#F5D89A",
    lotusVariant: "bloom",
    accentColor: "#ECC878",
    labelColor: "#C8A858",
    iconName: "sun",
    startDay: 14,
    endDay: 16,
  },
  luteal: {
    label: "Luteal",
    subtitle: "Boundaries & Reflection",
    tagline: "Boundaries & Reflection",
    ringGradient: { start: "#D0C0E8", end: "#B8A8D8" },
    color: "#D0C0E8",
    lotusVariant: "closing",
    accentColor: "#B8A8D8",
    labelColor: "#9888B8",
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

export const systemFontStack =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
