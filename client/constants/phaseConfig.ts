/**
 * Phase Configuration
 * Central configuration for all cycle phase properties including
 * labels, colors, gradients, and lotus variants.
 * Based on reference design with curved labels on ring segments.
 */

export type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface PhaseConfig {
  label: string;
  subtitle: string;
  ringGradient: {
    start: string;
    end: string;
  };
  lotusVariant: "bud" | "rising" | "bloom" | "closing";
  accentColor: string;
  labelColor: string;
}

/**
 * Phase configuration object containing all display properties
 * for each phase of the menstrual cycle.
 * Colors matched to reference design.
 */
export const phaseConfig: Record<Phase, PhaseConfig> = {
  menstrual: {
    label: "MENSTRUAL",
    subtitle: "Rest & Release",
    ringGradient: {
      start: "#B8A0D8",
      end: "#D4B8E8",
    },
    lotusVariant: "bud",
    accentColor: "#B8A0D8",
    labelColor: "#A090C0",
  },
  follicular: {
    label: "FOLLICULAR",
    subtitle: "Rise & Energize",
    ringGradient: {
      start: "#E8C8D8",
      end: "#D8B8C8",
    },
    lotusVariant: "rising",
    accentColor: "#E8C8D8",
    labelColor: "#C8A0B8",
  },
  ovulation: {
    label: "OVULATION",
    subtitle: "Bloom & Create",
    ringGradient: {
      start: "#F8C8A0",
      end: "#F8A878",
    },
    lotusVariant: "bloom",
    accentColor: "#F8A878",
    labelColor: "#E89060",
  },
  luteal: {
    label: "LUTEAL",
    subtitle: "Slow & Integrate",
    ringGradient: {
      start: "#F898B0",
      end: "#E878A0",
    },
    lotusVariant: "closing",
    accentColor: "#F898B0",
    labelColor: "#E080A0",
  },
};

/**
 * Ring segment configuration for the cycle wheel.
 * Defines the start and end angles for each phase (in degrees).
 * Starting from top (12 o'clock position).
 */
export const ringSegments = {
  follicular: { startAngle: -90, endAngle: -10, percentage: 0.22 },
  ovulation: { startAngle: -10, endAngle: 50, percentage: 0.17 },
  luteal: { startAngle: 50, endAngle: 180, percentage: 0.36 },
  menstrual: { startAngle: 180, endAngle: 270, percentage: 0.25 },
};

/**
 * Calculate the angle for current day indicator
 */
export function getDayAngle(currentDay: number, cycleLength: number): number {
  return ((currentDay - 1) / cycleLength) * 360 - 90;
}

/**
 * System font stack for iOS-like typography
 */
export const systemFontStack =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
