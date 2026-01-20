export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  inputHeight: 52,
  buttonHeight: 52,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Fonts = {
  heading: "Nunito_700Bold",
  body: "Nunito_400Regular",
  semibold: "Nunito_600SemiBold",
  mono: "SpaceMono-Regular",
} as const;

export const Typography = {
  h1: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
  },
  h2: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700" as const,
  },
  h3: {
    fontFamily: Fonts.semibold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h4: {
    fontFamily: Fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  small: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

const OlannaColors = {
  pastelPink: "#FFB6C1",
  pastelPinkLight: "#FFD1DC",
  pastelPinkDark: "#F8A5B0",
  pastelLavender: "#E6E6FA",
  pastelLavenderLight: "#F0F0FF",
  pastelLavenderDark: "#D8D8F0",
  pastelMint: "#B5EAD7",
  pastelMintLight: "#D4F5E9",
  pastelMintDark: "#98D4C0",
  pastelPeach: "#FFDAB9",
  pastelPeachLight: "#FFE8D0",
  pastelPeachDark: "#F5C8A0",
  pastelYellow: "#FFFACD",
  pastelYellowLight: "#FFFCE5",
  pastelYellowDark: "#F5E8A0",
  pastelBlue: "#B4D7E8",
  pastelBlueLight: "#D0E8F5",
  pastelBlueDark: "#98C4D8",
  cream: "#FFF8F5",
  warmWhite: "#FFFAF8",
  softBrown: "#8B7B73",
  dustyRose: "#DCBBB8",
  blush: "#F5E1DF",
  sand: "#F8F0EB",
};

export const ThemePresets = {
  blossom: {
    name: "Blossom",
    primary: OlannaColors.pastelPink,
    secondary: OlannaColors.pastelLavender,
    tertiary: OlannaColors.pastelPeach,
    accent: OlannaColors.pastelMint,
    phaseMenstrual: OlannaColors.pastelPink,
    phaseFollicular: OlannaColors.pastelMint,
    phaseOvulation: OlannaColors.pastelYellow,
    phaseLuteal: OlannaColors.pastelPeach,
  },
  garden: {
    name: "Garden",
    primary: OlannaColors.pastelMint,
    secondary: OlannaColors.pastelPink,
    tertiary: OlannaColors.pastelYellow,
    accent: OlannaColors.pastelLavender,
    phaseMenstrual: OlannaColors.pastelPink,
    phaseFollicular: OlannaColors.pastelMint,
    phaseOvulation: OlannaColors.pastelYellow,
    phaseLuteal: OlannaColors.pastelPeach,
  },
  dreamy: {
    name: "Dreamy",
    primary: OlannaColors.pastelLavender,
    secondary: OlannaColors.pastelPink,
    tertiary: OlannaColors.pastelBlue,
    accent: OlannaColors.pastelMint,
    phaseMenstrual: OlannaColors.pastelPinkLight,
    phaseFollicular: OlannaColors.pastelMintLight,
    phaseOvulation: OlannaColors.pastelYellowLight,
    phaseLuteal: OlannaColors.pastelPeachLight,
  },
};

export const Colors = {
  light: {
    text: OlannaColors.softBrown,
    textSecondary: "#9A8B83",
    background: OlannaColors.cream,
    backgroundRoot: OlannaColors.warmWhite,
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: OlannaColors.blush,
    border: "#F5E8E5",
    tint: OlannaColors.pastelPink,

    primary: OlannaColors.pastelPink,
    primaryLight: OlannaColors.pastelPinkLight,
    primaryDark: OlannaColors.pastelPinkDark,
    secondary: OlannaColors.pastelLavender,
    secondaryLight: OlannaColors.pastelLavenderLight,
    tertiary: OlannaColors.pastelPeach,
    tertiaryLight: OlannaColors.pastelPeachLight,
    accent: OlannaColors.pastelMint,

    phaseMenstrual: OlannaColors.pastelPink,
    phaseFollicular: OlannaColors.pastelMint,
    phaseOvulation: OlannaColors.pastelYellow,
    phaseLuteal: OlannaColors.pastelPeach,

    success: OlannaColors.pastelMint,
    warning: OlannaColors.pastelPeach,
    error: "#E8A0A0",
    info: OlannaColors.pastelBlue,

    tabIconDefault: "#C4B5AD",
    tabIconSelected: OlannaColors.pastelPink,

    buttonText: "#FFFFFF",
    buttonSecondaryText: OlannaColors.softBrown,

    cardBackground: "#FFFFFF",
    cardBorder: "#F8F0ED",

    lotusCenter: OlannaColors.pastelYellow,
    lotusPetal: OlannaColors.pastelPink,
    lotusGlow: "rgba(255, 182, 193, 0.25)",
    waterRipple: "rgba(181, 234, 215, 0.2)",

    link: OlannaColors.pastelPinkDark,
  },
  dark: {
    text: "#FFF5F8",
    textSecondary: "#C4B0B5",
    background: "#1A1518",
    backgroundRoot: "#0F0C0E",
    backgroundDefault: "#252022",
    backgroundSecondary: "#2F2528",
    border: "#3A3035",
    tint: OlannaColors.pastelPinkLight,

    primary: OlannaColors.pastelPinkLight,
    primaryLight: OlannaColors.pastelPink,
    primaryDark: OlannaColors.pastelPinkLight,
    secondary: OlannaColors.pastelLavenderLight,
    secondaryLight: OlannaColors.pastelLavender,
    tertiary: OlannaColors.pastelPeachLight,
    tertiaryLight: OlannaColors.pastelPeach,
    accent: OlannaColors.pastelMintLight,

    phaseMenstrual: OlannaColors.pastelPinkLight,
    phaseFollicular: OlannaColors.pastelMintLight,
    phaseOvulation: OlannaColors.pastelYellowLight,
    phaseLuteal: OlannaColors.pastelPeachLight,

    success: OlannaColors.pastelMintLight,
    warning: OlannaColors.pastelPeachLight,
    error: "#F0B8B8",
    info: OlannaColors.pastelBlueLight,

    tabIconDefault: "#6A5558",
    tabIconSelected: OlannaColors.pastelPinkLight,

    buttonText: "#1A1518",
    buttonSecondaryText: "#FFF5F8",

    cardBackground: "#252022",
    cardBorder: "#3A3035",

    lotusCenter: OlannaColors.pastelYellowLight,
    lotusPetal: OlannaColors.pastelPinkLight,
    lotusGlow: "rgba(255, 209, 220, 0.2)",
    waterRipple: "rgba(212, 245, 233, 0.15)",

    link: OlannaColors.pastelPinkLight,
  },
};
