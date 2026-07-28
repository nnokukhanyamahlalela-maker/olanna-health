import type { Phase } from "@/constants/phaseConfig";

export const brand = {
  primary: "#F06B9A",
  primaryDeep: "#A84B6C",
  primarySoft: "#F9C4D7",
  gradientStart: "#F06B9A",
  gradientMid: "#D178B3",
  gradientEnd: "#C9A0DC",
} as const;

export const neutral = {
  bgPrimary: "#FDF5F8",
  bgSecondary: "#FFFFFF",
  bgSubtle: "#F5EDF3",
  border: "#EDD8E7",
  textPrimary: "#2D1F2B",
  textSecondary: "#5A4252",
  textTertiary: "#8A6F80",
  textInverse: "#FFFFFF",
} as const;

// Phase tokens: front, back, bg, skin, ink
export const phase = {
  menstrual: {
    front: "#F06B9A",
    back: "#A84B6C",
    bg: "#F9C4D7",
    skin: "#FCE1EB",
    ink: "#431E2B",
    // legacy compat
    solid: "#F06B9A",
    softBg: "#F9C4D7",
    gradientStart: "#A84B6C",
    gradientMid: "#F06B9A",
    gradientEnd: "#FCE1EB",
  },
  follicular: {
    front: "#D178B3",
    back: "#92547D",
    bg: "#EAC2DD",
    skin: "#F5E1EE",
    ink: "#3B2232",
    solid: "#D178B3",
    softBg: "#EAC2DD",
    gradientStart: "#92547D",
    gradientMid: "#D178B3",
    gradientEnd: "#F5E1EE",
  },
  ovulatory: {
    front: "#DE73DE",
    back: "#9B509B",
    bg: "#F0C0F0",
    skin: "#F8E0F8",
    ink: "#3E203E",
    solid: "#DE73DE",
    softBg: "#F0C0F0",
    gradientStart: "#9B509B",
    gradientMid: "#DE73DE",
    gradientEnd: "#F8E0F8",
  },
  luteal: {
    front: "#C9A0DC",
    back: "#8D709A",
    bg: "#E9D9F1",
    skin: "#F4ECF8",
    ink: "#382D3E",
    solid: "#C9A0DC",
    softBg: "#E9D9F1",
    gradientStart: "#8D709A",
    gradientMid: "#C9A0DC",
    gradientEnd: "#F4ECF8",
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
  late: "luteal",
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
