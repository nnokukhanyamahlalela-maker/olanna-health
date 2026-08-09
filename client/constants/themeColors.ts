import { ColorValue } from "react-native";

export interface GlassStyle {
  fill: ColorValue;
  border: ColorValue;
  solidFallback: ColorValue;
}

export interface CycleWheelColors {
  baseHalo: ColorValue;
  inactive: ColorValue;
  active: ColorValue;
  glow: ColorValue;
}

export interface ThemeColors {
  background: ColorValue;
  surface: ColorValue;
  surfaceElevated: ColorValue;
  
  textPrimary: ColorValue;
  textSecondary: ColorValue;
  textTertiary: ColorValue;
  textOnGradient: ColorValue;
  
  accent: ColorValue;
  accentSoft: ColorValue;
  
  divider: ColorValue;
  overlay: ColorValue;
  
  glass: GlassStyle;
  cycleWheel: CycleWheelColors;
  
  gradientStops: readonly [string, string, string, string];
  gradientOverlay: ColorValue;
  
  statusBar: "light" | "dark";
  
  phaseMenstrual: ColorValue;
  phaseFollicular: ColorValue;
  phaseOvulatory: ColorValue;
  phaseLuteal: ColorValue;
}

export const lightTheme: ThemeColors = {
  background: "#FFF7FA",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  
  textPrimary: "#26215C",
  textSecondary: "#4A3345",
  textTertiary: "#5A4550",
  textOnGradient: "#FFFFFF",
  
  accent: "#F6BFD3",
  accentSoft: "#FBE3EC",
  
  divider: "rgba(58, 47, 53, 0.08)",
  overlay: "rgba(0, 0, 0, 0.4)",
  
  glass: {
    fill: "rgba(255, 255, 255, 0.72)",
    border: "rgba(255, 255, 255, 0.55)",
    solidFallback: "#FFFFFF",
  },
  
  cycleWheel: {
    baseHalo: "rgba(246, 191, 211, 0.25)",
    inactive: "rgba(246, 191, 211, 0.15)",
    active: "rgba(246, 191, 211, 0.85)",
    glow: "rgba(246, 191, 211, 0.35)",
  },
  
  gradientStops: ["#FF9A6B", "#FF3F9E", "#F7B0C8", "#E7C2E8"] as const,
  gradientOverlay: "rgba(255, 255, 255, 0.22)",
  
  statusBar: "light",
  
  phaseMenstrual: "#E7B4B8",
  phaseFollicular: "#DDE5DC",
  phaseOvulatory: "#E6D2A8",
  phaseLuteal: "#D6CEDD",
};
