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
  burgundy: "#8B3A4C",
  burgundyLight: "#A85D6F",
  burgundyDark: "#6B2A3C",
  sage: "#7BA387",
  sageLight: "#9BC4A7",
  sageDark: "#5B8367",
  golden: "#D4A84B",
  goldenLight: "#E8C97A",
  goldenDark: "#B48B2B",
  coral: "#C4826B",
  coralLight: "#DBA799",
  coralDark: "#A4624B",
  lavender: "#9B8AA8",
  lavenderLight: "#BDB0C8",
  lavenderDark: "#7B6A88",
  cream: "#FDF8F3",
  warmWhite: "#FAF7F4",
  earthBrown: "#5C4A42",
  dustyRose: "#D4A5A5",
  terracotta: "#C9735B",
  sand: "#E8DDD4",
};

export const ThemePresets = {
  earth: {
    name: "Earth",
    primary: OlannaColors.sage,
    secondary: OlannaColors.coral,
    tertiary: OlannaColors.golden,
    accent: OlannaColors.burgundy,
    phaseMenstrual: OlannaColors.burgundy,
    phaseFollicular: OlannaColors.sage,
    phaseOvulation: OlannaColors.golden,
    phaseLuteal: OlannaColors.coral,
  },
  sunrise: {
    name: "Sunrise",
    primary: OlannaColors.coral,
    secondary: OlannaColors.golden,
    tertiary: OlannaColors.dustyRose,
    accent: OlannaColors.terracotta,
    phaseMenstrual: OlannaColors.burgundy,
    phaseFollicular: OlannaColors.sage,
    phaseOvulation: OlannaColors.golden,
    phaseLuteal: OlannaColors.coral,
  },
  moonlight: {
    name: "Moonlight",
    primary: OlannaColors.lavender,
    secondary: OlannaColors.sage,
    tertiary: OlannaColors.dustyRose,
    accent: OlannaColors.burgundy,
    phaseMenstrual: OlannaColors.burgundyLight,
    phaseFollicular: OlannaColors.sageLight,
    phaseOvulation: OlannaColors.goldenLight,
    phaseLuteal: OlannaColors.coralLight,
  },
};

export const Colors = {
  light: {
    text: OlannaColors.earthBrown,
    textSecondary: "#7A6B63",
    background: OlannaColors.cream,
    backgroundRoot: OlannaColors.warmWhite,
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: OlannaColors.sand,
    border: "#E5DDD5",
    tint: OlannaColors.sage,

    primary: OlannaColors.sage,
    primaryLight: OlannaColors.sageLight,
    primaryDark: OlannaColors.sageDark,
    secondary: OlannaColors.coral,
    secondaryLight: OlannaColors.coralLight,
    tertiary: OlannaColors.golden,
    tertiaryLight: OlannaColors.goldenLight,
    accent: OlannaColors.burgundy,

    phaseMenstrual: OlannaColors.burgundy,
    phaseFollicular: OlannaColors.sage,
    phaseOvulation: OlannaColors.golden,
    phaseLuteal: OlannaColors.coral,

    success: "#5B9A6F",
    warning: "#D4A84B",
    error: "#C4574A",
    info: "#6B8DA8",

    tabIconDefault: "#9A8B83",
    tabIconSelected: OlannaColors.sage,

    buttonText: "#FFFFFF",
    buttonSecondaryText: OlannaColors.earthBrown,

    cardBackground: "#FFFFFF",
    cardBorder: "#F0E8E0",

    lotusCenter: OlannaColors.golden,
    lotusPetal: OlannaColors.dustyRose,
    lotusGlow: "rgba(212, 168, 75, 0.2)",
    waterRipple: "rgba(123, 163, 135, 0.15)",
  },
  dark: {
    text: "#F5F0EB",
    textSecondary: "#A89B93",
    background: "#1A1614",
    backgroundRoot: "#0F0D0C",
    backgroundDefault: "#252220",
    backgroundSecondary: "#2F2A27",
    border: "#3A3530",
    tint: OlannaColors.sageLight,

    primary: OlannaColors.sageLight,
    primaryLight: OlannaColors.sage,
    primaryDark: OlannaColors.sageLight,
    secondary: OlannaColors.coralLight,
    secondaryLight: OlannaColors.coral,
    tertiary: OlannaColors.goldenLight,
    tertiaryLight: OlannaColors.golden,
    accent: OlannaColors.burgundyLight,

    phaseMenstrual: OlannaColors.burgundyLight,
    phaseFollicular: OlannaColors.sageLight,
    phaseOvulation: OlannaColors.goldenLight,
    phaseLuteal: OlannaColors.coralLight,

    success: "#7BC48F",
    warning: "#E8C97A",
    error: "#E4776A",
    info: "#8BADC8",

    tabIconDefault: "#6A5B53",
    tabIconSelected: OlannaColors.sageLight,

    buttonText: "#1A1614",
    buttonSecondaryText: "#F5F0EB",

    cardBackground: "#252220",
    cardBorder: "#3A3530",

    lotusCenter: OlannaColors.goldenLight,
    lotusPetal: OlannaColors.dustyRose,
    lotusGlow: "rgba(232, 201, 122, 0.15)",
    waterRipple: "rgba(155, 196, 167, 0.1)",
  },
};
