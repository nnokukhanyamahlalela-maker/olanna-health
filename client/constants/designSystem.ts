export const DS = {
  colors: {
    bg: "#FFF6F8",
    bg2: "#FCEFF3",
    text: "#2B2B2B",
    subtext: "#7A7A7A",
    accent: "#FF4FA3",
    white: "#FFFFFF",
    glassPrimary: "#2B2B2B",
    glassSecondary: "#6F6F6F",
    gradient: {
      coral: "#FF9A6B",
      hotPink: "#FF3F9E",
      blush: "#F7B0C8",
      lilac: "#E7C2E8",
    },
  },
  radii: {
    card: 24,
    pill: 999,
    button: 12,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    "2xl": 36,
  },
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    soft: {
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  },
  heroText: {
    color: "#FFFFFF",
    fontWeight: "800" as const,
    textShadowColor: "rgba(0,0,0,0.22)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
};

export const GRADIENT_COLORS = ["#FF9A6B", "#FF3F9E", "#F7B0C8", "#E7C2E8"] as const;
export const GRADIENT_START = { x: 0.15, y: 0 };
export const GRADIENT_END = { x: 0.85, y: 1 };
