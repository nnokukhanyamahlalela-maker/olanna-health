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
    solid: "#F2A2B8",
    softBg: "#FDE8F1",
    gradientStart: "#7A1F4F",
    gradientMid: "#A8326E",
    gradientEnd: "#D86A92",
  },
  follicular: {
    solid: "#CFCBD6",
    softBg: "#F1EFF6",
    gradientStart: "#BFC0D2",
    gradientMid: "#C9B6D9",
    gradientEnd: "#E7D7EF",
  },
  ovulatory: {
    solid: "#F2C9A2",
    softBg: "#F8EADB",
    gradientStart: "#F6C38A",
    gradientMid: "#F2C9A2",
    gradientEnd: "#F9E1C6",
  },
  luteal: {
    solid: "#D7B3E7",
    softBg: "#F4ECFA",
    gradientStart: "#C94F7C",
    gradientMid: "#9E3F6E",
    gradientEnd: "#6E3B63",
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
