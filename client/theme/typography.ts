import { TextStyle, Platform } from "react-native";

export const defaultTextColor = "#1C1C1E";

const systemFont = Platform.select({
  ios: undefined,
  android: "Roboto",
  default: undefined,
});

const serifFont = Platform.select({
  ios: "New York",
  android: "serif",
  default: "Georgia",
});

const serifFallback = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});

export type AppTextVariant =
  | "h1"
  | "h2"
  | "body"
  | "label"
  | "caption"
  | "editorialTitle";

export const typography: Record<AppTextVariant, TextStyle> = {
  h1: {
    fontFamily: systemFont,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  h2: {
    fontFamily: systemFont,
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: systemFont,
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 24,
  },
  label: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: "500",
  },
  caption: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  editorialTitle: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: "500",
  },
};

export const serifFallbackFamily = serifFallback;
