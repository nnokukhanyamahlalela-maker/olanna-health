import { TextStyle, Platform } from "react-native";

const systemFont = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle["fontWeight"];
  letterSpacing: number;
  fontFamily?: string;
}

export interface TypographyScale {
  display: TypographyToken;
  h1: TypographyToken;
  h2: TypographyToken;
  body: TypographyToken;
  bodyStrong: TypographyToken;
  caption: TypographyToken;
  micro: TypographyToken;
}

export const type: TypographyScale = {
  display: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "800",
    letterSpacing: -0.5,
    fontFamily: "Poppins_800ExtraBold",
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontFamily: "Poppins_700Bold",
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: -0.2,
    fontFamily: "Poppins_600SemiBold",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: 0.1,
    fontFamily: "Poppins_400Regular",
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily: "Poppins_600SemiBold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: 0.2,
    fontFamily: "Poppins_400Regular",
  },
  micro: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
    fontFamily: "Poppins_500Medium",
  },
} as const;

export const heroTextShadow: TextStyle = {
  textShadowColor: "rgba(0, 0, 0, 0.25)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 8,
};

export type TypographyVariant = keyof TypographyScale;
