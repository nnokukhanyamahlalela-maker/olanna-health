export type Goal =
  | "track_period"
  | "manage_pcos"
  | "manage_endometriosis"
  | "track_fertility"
  | "sexual_health"
  | "general_wellness";

export type CycleRegularity = "regular" | "irregular" | "not_sure";

export type AgeRange = "13-17" | "18-24" | "25-34" | "35-44" | "45+";

export interface OnboardingData {
  name: string;
  dob?: string;
  ageRange?: AgeRange;
  cycleRegularity?: CycleRegularity;
  lastPeriodStart?: string;
  avgCycleLength?: number;
  periodLength?: number;
  dataSource?: "manual" | "screenshot_upload";
  previousPeriodDates?: string[];
  periodDays?: string[];
  goals: Goal[];
}

export const HEALTH_GOALS: { id: Goal; label: string }[] = [
  { id: "track_period", label: "Track my period" },
  { id: "manage_pcos", label: "Manage PCOS" },
  { id: "manage_endometriosis", label: "Manage Endometriosis" },
  { id: "track_fertility", label: "Track fertility" },
  { id: "sexual_health", label: "Sexual health" },
  { id: "general_wellness", label: "General wellness" },
];

export const AGE_RANGES: { id: AgeRange; label: string }[] = [
  { id: "13-17", label: "13-17" },
  { id: "18-24", label: "18-24" },
  { id: "25-34", label: "25-34" },
  { id: "35-44", label: "35-44" },
  { id: "45+", label: "45+" },
];

export const CYCLE_REGULARITY_OPTIONS: { id: CycleRegularity; label: string }[] = [
  { id: "regular", label: "Regular (21-35 days)" },
  { id: "irregular", label: "Irregular" },
  { id: "not_sure", label: "I'm not sure" },
];

export const ONBOARDING_GRADIENT = {
  colors: ["#FFDAB3", "#FFB5C5", "#E8C4E8", "#D4B8E8"] as const,
  locations: [0, 0.35, 0.7, 1] as const,
};

export const BRAND_COLORS = {
  peach: "#FFDAB3",
  pink: "#FFB5C5",
  lilac: "#E8C4E8",
  lavender: "#D4B8E8",
  hotPink: "#E85A9C",
  softPink: "#F6BFD3",
  white: "#FFFFFF",
  textPrimary: "#2D1F2B",
  textSecondary: "#4A3345",
  glassWhite: "rgba(255,255,255,0.25)",
  glassBorder: "rgba(255,255,255,0.4)",
  glassSelected: "rgba(255,255,255,0.9)",
};

export const CAROUSEL_SCREENS = [
  {
    id: 1,
    title: "Track your cycle",
    subtitle: "Log your period, symptoms, and moods with ease",
    icon: "calendar",
  },
  {
    id: 2,
    title: "Gain insights",
    subtitle: "Understand your patterns with personalized health insights",
    icon: "trending-up",
  },
  {
    id: 3,
    title: "Take control",
    subtitle: "Make informed decisions about your reproductive health",
    icon: "heart",
  },
];
