import { colors } from "@/constants/colors";

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 56,
  inputHeight: 52,
  buttonHeight: 52,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Fonts = {
  heading: "DMSans_600SemiBold",
  headingMedium: "DMSans_500Medium",
  headingLight: "DMSans_400Regular",
  body: "DMSans_400Regular",
  bodyLight: "DMSans_300Light",
  bodySemibold: "DMSans_500Medium",
  numeric: "DMSans_500Medium",
  numericBold: "DMSans_700Bold",
  light: "DMSans_300Light",
} as const;

export const Typography = {
  h1: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 42,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  h2: {
    fontFamily: Fonts.headingMedium,
    fontSize: 22,
    lineHeight: 34,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
  },
  h3: {
    fontFamily: Fonts.headingLight,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  h4: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  small: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: Fonts.light,
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
  },
  numeric: {
    fontFamily: Fonts.numeric,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  numericLarge: {
    fontFamily: Fonts.numericBold,
    fontSize: 32,
    lineHeight: 44,
    letterSpacing: 0.1,
  },
  link: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
} as const;

export const Shadows = {
  soft: {
    shadowColor: "#2A2420",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  glow: {
    shadowColor: "#E8C4B8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  sm: {
    shadowColor: "#2A2420",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#2A2420",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: "#2A2420",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

const VogueColors = {
  // Brand Core
  pinkPrimary: "#F6BFD3",
  pinkSoft: "#FBE3EC",
  
  // Neutrals
  bgMain: "#FFF7FA",
  whiteSoft: "rgba(255, 255, 255, 0.85)",
  textPrimary: "#3A2F35",
  textSecondary: "#7A6A73",
  
  // Phase Colors
  menstrual: "#E7B4B8",
  follicular: "#DDE5DC",
  ovulatory: "#E6D2A8",
  luteal: "#D6CEDD",
  
  // Legacy colors for compatibility
  cream: "#FFF7FA",
  warmWhite: "#FFFFFF",
  blush: "#FBE3EC",
  blushLight: "#FDF0F5",
  blushMuted: "#F0D4E0",
  taupe: "#C4B5AD",
  taupeLight: "#DDD4CF",
  taupeDark: "#9A8B82",
  charcoal: "#3A2F35",
  warmGray: "#7A6A73",
  softPink: "#F6BFD3",
  dustyRose: "#F6BFD3",
  sand: "#E5DDD8",
  sandLight: "#F0EBE8",
  ivory: "#FFF7FA",
  espresso: "#2A2420",
  sage: "#DDE5DC",
  sageLight: "#E8EDE8",
  sageMuted: "#C8D4C8",
  gold: "#E6D2A8",
  goldLight: "#F0E4C8",
  goldMuted: "#D4C090",
  lavender: "#D6CEDD",
  lavenderLight: "#E8E2ED",
  lavenderMuted: "#C4B8CC",
  terracotta: "#E7B4B8",
  terracottaLight: "#F2D0D3",
  terracottaMuted: "#D8A0A5",
  logoPink: "#F6BFD3",
  logoPinkLight: "#FBE3EC",
  logoPinkDark: "#E8A8C0",
  periodPink: "#F6BFD3",
  periodPinkLight: "#FBE3EC",
  fertileCoral: "#E6D2A8",
  fertileCoralLight: "#F0E4C8",
  pmsLavender: "#D6CEDD",
  pmsLavenderLight: "#E8E2ED",
};

export const PhaseColors = {
  menstrual: {
    primary: VogueColors.menstrual,
    light: VogueColors.terracottaLight,
    dark: VogueColors.terracottaMuted,
    gradientStart: VogueColors.menstrual,
    gradientEnd: VogueColors.pinkPrimary,
    name: "Menstrual",
    lotusState: "closed",
    mood: "Rest & Release",
  },
  follicular: {
    primary: VogueColors.follicular,
    light: VogueColors.sageLight,
    dark: VogueColors.sageMuted,
    gradientStart: VogueColors.follicular,
    gradientEnd: VogueColors.pinkPrimary,
    name: "Follicular",
    lotusState: "rising",
    mood: "Renewal",
  },
  ovulation: {
    primary: VogueColors.ovulatory,
    light: VogueColors.goldLight,
    dark: VogueColors.goldMuted,
    gradientStart: VogueColors.ovulatory,
    gradientEnd: VogueColors.pinkPrimary,
    name: "Ovulation",
    lotusState: "bloom",
    mood: "Radiance",
  },
  luteal: {
    primary: VogueColors.luteal,
    light: VogueColors.lavenderLight,
    dark: VogueColors.lavenderMuted,
    gradientStart: VogueColors.luteal,
    gradientEnd: VogueColors.pinkPrimary,
    name: "Luteal",
    lotusState: "closing",
    mood: "Reflection",
  },
};

export const SemanticColors = {
  neutral: VogueColors.cream,
  action: VogueColors.dustyRose,
  insight: VogueColors.gold,
  pain: VogueColors.terracotta,
  calm: VogueColors.sage,
  reflection: VogueColors.lavender,
  textPrimary: VogueColors.charcoal,
  textSecondary: VogueColors.warmGray,
};

export const ThemePresets = {
  olanna: {
    name: "Olanna",
    primary: VogueColors.dustyRose,
    secondary: VogueColors.taupe,
    tertiary: VogueColors.lavender,
    accent: VogueColors.gold,
    phaseMenstrual: VogueColors.terracotta,
    phaseFollicular: VogueColors.sage,
    phaseOvulation: VogueColors.gold,
    phaseLuteal: VogueColors.lavender,
  },
  blossom: {
    name: "Blossom",
    primary: VogueColors.softPink,
    secondary: VogueColors.lavender,
    tertiary: VogueColors.taupe,
    accent: VogueColors.sage,
    phaseMenstrual: VogueColors.terracotta,
    phaseFollicular: VogueColors.sage,
    phaseOvulation: VogueColors.gold,
    phaseLuteal: VogueColors.lavender,
  },
  garden: {
    name: "Garden",
    primary: VogueColors.sage,
    secondary: VogueColors.dustyRose,
    tertiary: VogueColors.gold,
    accent: VogueColors.lavender,
    phaseMenstrual: VogueColors.terracotta,
    phaseFollicular: VogueColors.sage,
    phaseOvulation: VogueColors.gold,
    phaseLuteal: VogueColors.lavender,
  },
  dreamy: {
    name: "Dreamy",
    primary: VogueColors.lavender,
    secondary: VogueColors.dustyRose,
    tertiary: VogueColors.sage,
    accent: VogueColors.gold,
    phaseMenstrual: VogueColors.terracottaLight,
    phaseFollicular: VogueColors.sageLight,
    phaseOvulation: VogueColors.goldLight,
    phaseLuteal: VogueColors.lavenderLight,
  },
};

export const Colors = {
  light: {
    text: VogueColors.charcoal,
    textSecondary: VogueColors.warmGray,
    background: VogueColors.cream,
    backgroundRoot: VogueColors.cream,
    backgroundDefault: VogueColors.warmWhite,
    backgroundSecondary: VogueColors.sandLight,
    border: VogueColors.sand,
    tint: VogueColors.dustyRose,

    primary: VogueColors.logoPink,
    primaryLight: VogueColors.logoPinkLight,
    primaryDark: VogueColors.logoPinkDark,
    secondary: VogueColors.taupe,
    secondaryLight: VogueColors.taupeLight,
    tertiary: VogueColors.lavender,
    tertiaryLight: VogueColors.lavenderLight,
    accent: VogueColors.gold,
    accentLight: VogueColors.goldLight,

    phaseMenstrual: VogueColors.terracotta,
    phaseFollicular: VogueColors.sage,
    phaseOvulation: VogueColors.gold,
    phaseLuteal: VogueColors.lavender,

    success: VogueColors.sage,
    warning: VogueColors.gold,
    error: VogueColors.terracotta,
    info: VogueColors.lavender,

    tabIconDefault: VogueColors.taupe,
    tabIconSelected: VogueColors.logoPink,

    buttonText: VogueColors.warmWhite,
    buttonSecondaryText: VogueColors.charcoal,

    cardBackground: VogueColors.warmWhite,
    cardBorder: VogueColors.sand,

    lotusCenter: VogueColors.gold,
    lotusPetal: VogueColors.dustyRose,
    lotusGlow: "rgba(212, 169, 154, 0.2)",
    lotusGoldGlow: "rgba(201, 168, 108, 0.15)",
    waterRipple: "rgba(184, 196, 184, 0.15)",

    link: VogueColors.dustyRose,

    insightGold: VogueColors.gold,
    calmSage: VogueColors.sage,
    moodLavender: VogueColors.lavender,
    painTerracotta: VogueColors.terracotta,

    logoPink: VogueColors.logoPink,
    logoPinkLight: VogueColors.logoPinkLight,
    periodPink: VogueColors.periodPink,
    periodPinkLight: VogueColors.periodPinkLight,
    fertileCoral: VogueColors.fertileCoral,
    fertileCoralLight: VogueColors.fertileCoralLight,
    pmsLavender: VogueColors.pmsLavender,
    pmsLavenderLight: VogueColors.pmsLavenderLight,
  },
  dark: {
    text: VogueColors.charcoal,
    textSecondary: VogueColors.warmGray,
    background: VogueColors.cream,
    backgroundRoot: VogueColors.cream,
    backgroundDefault: VogueColors.warmWhite,
    backgroundSecondary: VogueColors.sandLight,
    border: VogueColors.sand,
    tint: VogueColors.dustyRose,

    primary: VogueColors.logoPink,
    primaryLight: VogueColors.logoPinkLight,
    primaryDark: VogueColors.logoPinkDark,
    secondary: VogueColors.taupe,
    secondaryLight: VogueColors.taupeLight,
    tertiary: VogueColors.lavender,
    tertiaryLight: VogueColors.lavenderLight,
    accent: VogueColors.gold,
    accentLight: VogueColors.goldLight,

    phaseMenstrual: VogueColors.terracotta,
    phaseFollicular: VogueColors.sage,
    phaseOvulation: VogueColors.gold,
    phaseLuteal: VogueColors.lavender,

    success: VogueColors.sage,
    warning: VogueColors.gold,
    error: VogueColors.terracotta,
    info: VogueColors.lavender,

    tabIconDefault: VogueColors.taupe,
    tabIconSelected: VogueColors.logoPink,

    buttonText: VogueColors.warmWhite,
    buttonSecondaryText: VogueColors.charcoal,

    cardBackground: VogueColors.warmWhite,
    cardBorder: VogueColors.sand,

    lotusCenter: VogueColors.gold,
    lotusPetal: VogueColors.dustyRose,
    lotusGlow: "rgba(212, 169, 154, 0.2)",
    lotusGoldGlow: "rgba(201, 168, 108, 0.15)",
    waterRipple: "rgba(184, 196, 184, 0.15)",

    link: VogueColors.dustyRose,

    insightGold: VogueColors.gold,
    calmSage: VogueColors.sage,
    moodLavender: VogueColors.lavender,
    painTerracotta: VogueColors.terracotta,

    logoPink: VogueColors.logoPink,
    logoPinkLight: VogueColors.logoPinkLight,
    periodPink: VogueColors.periodPink,
    periodPinkLight: VogueColors.periodPinkLight,
    fertileCoral: VogueColors.fertileCoral,
    fertileCoralLight: VogueColors.fertileCoralLight,
    pmsLavender: VogueColors.pmsLavender,
    pmsLavenderLight: VogueColors.pmsLavenderLight,
  },
};

export const theme = {
  colors,
  spacing: Spacing,
  radius: BorderRadius,
  shadow: Shadows,
  typography: Typography,
  fonts: Fonts,
} as const;
