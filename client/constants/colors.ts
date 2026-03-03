import type { Phase } from "@/constants/phaseConfig";

export const brand = {
  primary: "#E83E8C",
  primaryDeep: "#D633A6",
  primarySoft: "#FDE8F1",
  gradientStart: "#FF6A4D",
  gradientMid: "#FF2F8E",
  gradientEnd: "#D633A6",
} as const;

export const neutral = {
  bgPrimary: "#F8F6F4",
  bgSecondary: "#FFFFFF",
  bgSubtle: "#F1ECE9",
  border: "#E6DFDA",
  textPrimary: "#2D1F2B",
  textSecondary: "#5A3D55",
  textTertiary: "#7A6570",
  textInverse: "#FFFFFF",
} as const;

export const phase = {
  menstrual: {
    solid: "#F472B6",
    softBg: "#FDE8F1",
    gradientStart: "#C2185B",
    gradientMid: "#E8588D",
    gradientEnd: "#F472B6",
  },
  follicular: {
    solid: "#F9C8E0",
    softBg: "#FDF0F6",
    gradientStart: "#D98CB3",
    gradientMid: "#F0B0D0",
    gradientEnd: "#F9C8E0",
  },
  ovulatory: {
    solid: "#F59E0B",
    softBg: "#FEF3C7",
    gradientStart: "#D97706",
    gradientMid: "#F59E0B",
    gradientEnd: "#FBBF24",
  },
  luteal: {
    solid: "#D8B4FE",
    softBg: "#F4ECFA",
    gradientStart: "#9333EA",
    gradientMid: "#C084E8",
    gradientEnd: "#D8B4FE",
  },
} as const;

export const semantic = {
  success: {
    base: "#4C8C6D",
    soft: "#E4F3EC",
    border: "#B9D8C9",
  },
  warning: {
    base: "#C68B2C",
    soft: "#F6E8CF",
    border: "#E8D2A8",
  },
  danger: {
    base: "#A8324A",
    soft: "#F4D7DD",
    border: "#E2A9B5",
  },
  info: {
    base: "#5C6F91",
    soft: "#E4EAF4",
    border: "#C7D2E3",
  },
} as const;

export type PhaseColorKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

const phaseKeyMap: Record<Phase, PhaseColorKey> = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulation: "ovulatory",
  luteal: "luteal",
};

export function getPhaseColors(p: Phase) {
  return phase[phaseKeyMap[p]];
}

export function getPhaseGradient(p: Phase): [string, string, string] {
  const c = phase[phaseKeyMap[p]];
  return [c.gradientStart, c.gradientMid, c.gradientEnd];
}

export function getBrandGradient(): [string, string, string] {
  return [brand.gradientStart, brand.gradientMid, brand.gradientEnd];
}

export const colors = { brand, neutral, phase, semantic } as const;
