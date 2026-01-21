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
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
} as const;

export const Fonts = {
  heading: "PlayfairDisplay_700Bold",
  headingMedium: "PlayfairDisplay_600SemiBold",
  headingLight: "PlayfairDisplay_500Medium",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
  numeric: "Manrope_500Medium",
  numericBold: "Manrope_700Bold",
} as const;

export const Typography = {
  h1: {
    fontFamily: Fonts.headingMedium,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "600" as const,
  },
  h2: {
    fontFamily: Fonts.headingMedium,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h3: {
    fontFamily: Fonts.headingLight,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500" as const,
  },
  h4: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500" as const,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  small: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500" as const,
  },
  numeric: {
    fontFamily: Fonts.numeric,
    fontSize: 16,
    lineHeight: 22,
  },
  numericLarge: {
    fontFamily: Fonts.numericBold,
    fontSize: 28,
    lineHeight: 34,
  },
  link: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
} as const;

export const Shadows = {
  soft: {
    shadowColor: "#3A2F2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  glow: {
    shadowColor: "#C9A24D",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 4,
  },
  sm: {
    shadowColor: "#3A2F2A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: "#3A2F2A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: "#3A2F2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

const OlannaColors = {
  blushLotus: "#F4B6C2",
  blushLotusLight: "#F9D4DC",
  blushLotusDark: "#E8A0AE",
  softClay: "#D6B2A2",
  softClayLight: "#E5CFC4",
  softClayDark: "#C49A88",
  warmIvory: "#FFF7F2",
  sandstoneBeige: "#F1E6DE",
  taupeBrown: "#7A6A5F",
  deepCocoa: "#3A2F2A",
  mutedGold: "#C9A24D",
  mutedGoldLight: "#D9BC7A",
  mutedGoldDark: "#B58D3D",
  dustyLavender: "#C8BFD6",
  dustyLavenderLight: "#DDD7E8",
  dustyLavenderDark: "#AFA3C2",
  sageGreen: "#A8BFA5",
  sageGreenLight: "#C4D5C2",
  sageGreenDark: "#8FA88C",
  softTerracotta: "#D98C7A",
  softTerracottaLight: "#E5A899",
  softTerracottaDark: "#C67560",
};

export const PhaseColors = {
  menstrual: {
    primary: OlannaColors.softTerracotta,
    light: OlannaColors.softTerracottaLight,
    dark: OlannaColors.softTerracottaDark,
    name: "Menstrual",
    lotusState: "closed",
    mood: "Rest & Release",
  },
  follicular: {
    primary: OlannaColors.sageGreen,
    light: OlannaColors.sageGreenLight,
    dark: OlannaColors.sageGreenDark,
    name: "Follicular",
    lotusState: "rising",
    mood: "Emergence & Renewal",
  },
  ovulation: {
    primary: OlannaColors.mutedGold,
    light: OlannaColors.mutedGoldLight,
    dark: OlannaColors.mutedGoldDark,
    name: "Ovulation",
    lotusState: "bloom",
    mood: "Peak & Radiance",
  },
  luteal: {
    primary: OlannaColors.dustyLavender,
    light: OlannaColors.dustyLavenderLight,
    dark: OlannaColors.dustyLavenderDark,
    name: "Luteal",
    lotusState: "closing",
    mood: "Reflection & Integration",
  },
};

export const SemanticColors = {
  neutral: OlannaColors.warmIvory,
  action: OlannaColors.blushLotus,
  insight: OlannaColors.mutedGold,
  pain: OlannaColors.softTerracotta,
  calm: OlannaColors.sageGreen,
  reflection: OlannaColors.dustyLavender,
  textPrimary: OlannaColors.deepCocoa,
  textSecondary: OlannaColors.taupeBrown,
};

export const ThemePresets = {
  olanna: {
    name: "Olanna",
    primary: OlannaColors.blushLotus,
    secondary: OlannaColors.softClay,
    tertiary: OlannaColors.dustyLavender,
    accent: OlannaColors.mutedGold,
    phaseMenstrual: OlannaColors.softTerracotta,
    phaseFollicular: OlannaColors.sageGreen,
    phaseOvulation: OlannaColors.mutedGold,
    phaseLuteal: OlannaColors.dustyLavender,
  },
  blossom: {
    name: "Blossom",
    primary: OlannaColors.blushLotus,
    secondary: OlannaColors.dustyLavender,
    tertiary: OlannaColors.softClay,
    accent: OlannaColors.sageGreen,
    phaseMenstrual: OlannaColors.softTerracotta,
    phaseFollicular: OlannaColors.sageGreen,
    phaseOvulation: OlannaColors.mutedGold,
    phaseLuteal: OlannaColors.dustyLavender,
  },
  garden: {
    name: "Garden",
    primary: OlannaColors.sageGreen,
    secondary: OlannaColors.blushLotus,
    tertiary: OlannaColors.mutedGold,
    accent: OlannaColors.dustyLavender,
    phaseMenstrual: OlannaColors.softTerracotta,
    phaseFollicular: OlannaColors.sageGreen,
    phaseOvulation: OlannaColors.mutedGold,
    phaseLuteal: OlannaColors.dustyLavender,
  },
  dreamy: {
    name: "Dreamy",
    primary: OlannaColors.dustyLavender,
    secondary: OlannaColors.blushLotus,
    tertiary: OlannaColors.sageGreen,
    accent: OlannaColors.mutedGold,
    phaseMenstrual: OlannaColors.softTerracottaLight,
    phaseFollicular: OlannaColors.sageGreenLight,
    phaseOvulation: OlannaColors.mutedGoldLight,
    phaseLuteal: OlannaColors.dustyLavenderLight,
  },
};

export const Colors = {
  light: {
    text: OlannaColors.deepCocoa,
    textSecondary: OlannaColors.taupeBrown,
    background: OlannaColors.warmIvory,
    backgroundRoot: OlannaColors.warmIvory,
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: OlannaColors.sandstoneBeige,
    border: OlannaColors.sandstoneBeige,
    tint: OlannaColors.blushLotus,

    primary: OlannaColors.blushLotus,
    primaryLight: OlannaColors.blushLotusLight,
    primaryDark: OlannaColors.blushLotusDark,
    secondary: OlannaColors.softClay,
    secondaryLight: OlannaColors.softClayLight,
    tertiary: OlannaColors.dustyLavender,
    tertiaryLight: OlannaColors.dustyLavenderLight,
    accent: OlannaColors.mutedGold,
    accentLight: OlannaColors.mutedGoldLight,

    phaseMenstrual: OlannaColors.softTerracotta,
    phaseFollicular: OlannaColors.sageGreen,
    phaseOvulation: OlannaColors.mutedGold,
    phaseLuteal: OlannaColors.dustyLavender,

    success: OlannaColors.sageGreen,
    warning: OlannaColors.mutedGold,
    error: OlannaColors.softTerracotta,
    info: OlannaColors.dustyLavender,

    tabIconDefault: OlannaColors.taupeBrown,
    tabIconSelected: OlannaColors.blushLotus,

    buttonText: OlannaColors.deepCocoa,
    buttonSecondaryText: OlannaColors.taupeBrown,

    cardBackground: OlannaColors.sandstoneBeige,
    cardBorder: OlannaColors.softClayLight,

    lotusCenter: OlannaColors.mutedGold,
    lotusPetal: OlannaColors.blushLotus,
    lotusGlow: "rgba(244, 182, 194, 0.3)",
    lotusGoldGlow: "rgba(201, 162, 77, 0.25)",
    waterRipple: "rgba(168, 191, 165, 0.2)",

    link: OlannaColors.blushLotusDark,

    insightGold: OlannaColors.mutedGold,
    calmSage: OlannaColors.sageGreen,
    moodLavender: OlannaColors.dustyLavender,
    painTerracotta: OlannaColors.softTerracotta,
  },
  dark: {
    text: OlannaColors.deepCocoa,
    textSecondary: OlannaColors.taupeBrown,
    background: OlannaColors.warmIvory,
    backgroundRoot: OlannaColors.warmIvory,
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: OlannaColors.sandstoneBeige,
    border: OlannaColors.sandstoneBeige,
    tint: OlannaColors.blushLotus,

    primary: OlannaColors.blushLotus,
    primaryLight: OlannaColors.blushLotusLight,
    primaryDark: OlannaColors.blushLotusDark,
    secondary: OlannaColors.softClay,
    secondaryLight: OlannaColors.softClayLight,
    tertiary: OlannaColors.dustyLavender,
    tertiaryLight: OlannaColors.dustyLavenderLight,
    accent: OlannaColors.mutedGold,
    accentLight: OlannaColors.mutedGoldLight,

    phaseMenstrual: OlannaColors.softTerracotta,
    phaseFollicular: OlannaColors.sageGreen,
    phaseOvulation: OlannaColors.mutedGold,
    phaseLuteal: OlannaColors.dustyLavender,

    success: OlannaColors.sageGreen,
    warning: OlannaColors.mutedGold,
    error: OlannaColors.softTerracotta,
    info: OlannaColors.dustyLavender,

    tabIconDefault: OlannaColors.taupeBrown,
    tabIconSelected: OlannaColors.blushLotus,

    buttonText: OlannaColors.deepCocoa,
    buttonSecondaryText: OlannaColors.taupeBrown,

    cardBackground: OlannaColors.sandstoneBeige,
    cardBorder: OlannaColors.softClayLight,

    lotusCenter: OlannaColors.mutedGold,
    lotusPetal: OlannaColors.blushLotus,
    lotusGlow: "rgba(244, 182, 194, 0.3)",
    lotusGoldGlow: "rgba(201, 162, 77, 0.25)",
    waterRipple: "rgba(168, 191, 165, 0.2)",

    link: OlannaColors.blushLotusDark,

    insightGold: OlannaColors.mutedGold,
    calmSage: OlannaColors.sageGreen,
    moodLavender: OlannaColors.dustyLavender,
    painTerracotta: OlannaColors.softTerracotta,
  },
};
