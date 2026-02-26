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
    ringGradient: { start: "#F6BFD3", end: "#E8A0B8" },
    color: "#F6BFD3",
    lotusVariant: "bud",
    accentColor: "#E8A0B8",
    labelColor: "#C87898",
    iconName: "droplet",
    startDay: 1,
    endDay: 4,
  },
  follicular: {
    label: "Follicular",
    subtitle: "Growth & Renewal",
    tagline: "Growth & Renewal",
    ringGradient: { start: "#D6CEDD", end: "#C4B8CC" },
    color: "#D6CEDD",
    lotusVariant: "rising",
    accentColor: "#C4B8CC",
    labelColor: "#9888A8",
    iconName: "trending-up",
    startDay: 5,
    endDay: 13,
  },
  ovulation: {
    label: "Ovulatory",
    subtitle: "Radiance & Expression",
    tagline: "Radiance & Expression",
    ringGradient: { start: "#F5D0A8", end: "#ECC090" },
    color: "#F5D0A8",
    lotusVariant: "bloom",
    accentColor: "#ECC090",
    labelColor: "#C8A060",
    iconName: "sun",
    startDay: 14,
    endDay: 16,
  },
  luteal: {
    label: "Luteal",
    subtitle: "Boundaries & Reflection",
    tagline: "Boundaries & Reflection",
    ringGradient: { start: "#E7C2E8", end: "#D0A8D8" },
    color: "#E7C2E8",
    lotusVariant: "closing",
    accentColor: "#D0A8D8",
    labelColor: "#A880B0",
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
