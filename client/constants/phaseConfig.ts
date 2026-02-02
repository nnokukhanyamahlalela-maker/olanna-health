/**
 * Phase Configuration
 * Central configuration for all cycle phase properties including
 * labels, colors, gradients, and lotus variants.
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
}

/**
 * Phase configuration object containing all display properties
 * for each phase of the menstrual cycle.
 */
export const phaseConfig: Record<Phase, PhaseConfig> = {
  menstrual: {
    label: "MENSTRUAL",
    subtitle: "Rest & Release",
    ringGradient: {
      start: "#C8A8D4",
      end: "#E8C4D8",
    },
    lotusVariant: "bud",
    accentColor: "#C8A8D4",
  },
  follicular: {
    label: "FOLLICULAR",
    subtitle: "Growth & Renewal",
    ringGradient: {
      start: "#E8C4D8",
      end: "#D4B8C0",
    },
    lotusVariant: "rising",
    accentColor: "#D4B8C0",
  },
  ovulation: {
    label: "OVULATION",
    subtitle: "Rise & Shine",
    ringGradient: {
      start: "#F4D0A8",
      end: "#F8B888",
    },
    lotusVariant: "bloom",
    accentColor: "#F8B888",
  },
  luteal: {
    label: "LUTEAL",
    subtitle: "Turn Inward",
    ringGradient: {
      start: "#E888A8",
      end: "#D868A0",
    },
    lotusVariant: "closing",
    accentColor: "#E888A8",
  },
};

/**
 * Ring segment configuration for the cycle wheel.
 * Defines the percentage of the ring each phase occupies.
 */
export const ringSegments = {
  menstrual: { start: 0, end: 18 },
  follicular: { start: 18, end: 46 },
  ovulation: { start: 46, end: 54 },
  luteal: { start: 54, end: 100 },
};

/**
 * Get conic-gradient CSS string for the cycle wheel
 */
export function getCycleWheelGradient(): string {
  const { menstrual, follicular, ovulation, luteal } = phaseConfig;
  const segments = ringSegments;

  return `conic-gradient(
    from 0deg,
    ${menstrual.ringGradient.start} ${segments.menstrual.start}%,
    ${menstrual.ringGradient.end} ${segments.menstrual.end}%,
    ${follicular.ringGradient.start} ${segments.follicular.start}%,
    ${follicular.ringGradient.end} ${segments.follicular.end}%,
    ${ovulation.ringGradient.start} ${segments.ovulation.start}%,
    ${ovulation.ringGradient.end} ${segments.ovulation.end}%,
    ${luteal.ringGradient.start} ${segments.luteal.start}%,
    ${luteal.ringGradient.end} ${segments.luteal.end}%
  )`;
}

/**
 * System font stack for iOS-like typography
 */
export const systemFontStack =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
