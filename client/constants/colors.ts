import type { Phase } from "@/constants/phaseConfig";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
// Gen Z-forward: lavender base · deep plum ink · coral CTA · muted teal accent
// No gradients anywhere — flat colour fills only.

export const brand = {
  primary:      "#D85A30",   // coral — the one CTA colour per screen
  primaryDeep:  "#B04020",   // dark coral (pressed state)
  primarySoft:  "#FAECE7",   // cream — text on coral, chip highlights
  teal:         "#0F6E56",   // muted teal — phase status tags + calendar period-fertile
  tealSoft:     "#D6EFE8",   // teal tint background
  gradientStart: "#D85A30",  // kept for legacy compat — app is flat, use brand.primary
  gradientMid:   "#D85A30",
  gradientEnd:   "#FAECE7",
} as const;

// ─── Neutrals ─────────────────────────────────────────────────────────────────

export const neutral = {
  bgPrimary:     "#EEEDFE",   // light lavender — app background
  bgSecondary:   "#FAF8F3",   // warm cream — cards, surfaces, sheets
  bgSubtle:      "#E8E7F8",   // subtler lavender (hover, pressed tints)
  border:        "#D8D6F0",   // lavender border
  textPrimary:   "#26215C",   // deep plum — all primary text + icons
  textSecondary: "#4A4580",   // mid plum
  textTertiary:  "#6B6591",   // soft plum (captions, metadata)
  textInverse:   "#FAECE7",   // cream — text on coral or dark surfaces
} as const;

// ─── Phase colour tokens ──────────────────────────────────────────────────────
// Each phase has petals (front/back), a background tint, a skin colour for the
// mascot face, and ink (always deep plum so Lanna is recognisable across phases).

export const phase = {
  menstrual: {
    // Bud — small, muted lavender petals, resting face
    front: "#B8B4E8",
    back:  "#9490C8",
    bg:    "#EEEDFE",
    skin:  "#E8E6F8",
    ink:   "#26215C",
    // legacy compat aliases
    solid:         "#B8B4E8",
    softBg:        "#EEEDFE",
    gradientStart: "#B8B4E8",
    gradientMid:   "#B8B4E8",
    gradientEnd:   "#EEEDFE",
  },
  follicular: {
    // Opening — medium petals in soft coral, alert face
    front: "#E8A070",
    back:  "#C07848",
    bg:    "#FAF8F3",
    skin:  "#FAE8DC",
    ink:   "#26215C",
    solid:         "#E8A070",
    softBg:        "#FAF8F3",
    gradientStart: "#E8A070",
    gradientMid:   "#E8A070",
    gradientEnd:   "#FAF8F3",
  },
  ovulatory: {
    // Full bloom — largest petals, saturated coral, bright face
    front: "#D85A30",
    back:  "#B04020",
    bg:    "#FAECE7",
    skin:  "#FAE0D0",
    ink:   "#26215C",
    solid:         "#D85A30",
    softBg:        "#FAECE7",
    gradientStart: "#D85A30",
    gradientMid:   "#D85A30",
    gradientEnd:   "#FAECE7",
  },
  luteal: {
    // Settling — soft teal petals, slight droop, calm face
    front: "#7ABFB0",
    back:  "#4A9080",
    bg:    "#E8F5F2",
    skin:  "#D8F0EC",
    ink:   "#26215C",
    solid:         "#7ABFB0",
    softBg:        "#E8F5F2",
    gradientStart: "#7ABFB0",
    gradientMid:   "#7ABFB0",
    gradientEnd:   "#E8F5F2",
  },
} as const;

// ─── Semantic ─────────────────────────────────────────────────────────────────

export const semantic = {
  success: { base: "#0F6E56", soft: "#D6EFE8", border: "#9ACFC4" },
  warning: { base: "#C07848", soft: "#FAE8DC", border: "#E8A070" },
  danger:  { base: "#B04020", soft: "#FAECE7", border: "#D85A30" },
  info:    { base: "#4A4580", soft: "#E8E7F8", border: "#B8B4E8" },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type PhaseColorKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

const phaseKeyMap: Record<Phase, PhaseColorKey> = {
  menstrual:  "menstrual",
  follicular: "follicular",
  ovulation:  "ovulatory",
  luteal:     "luteal",
  late:       "luteal",
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
