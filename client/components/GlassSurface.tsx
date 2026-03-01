import React from "react";
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/components/ThemeProvider";

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
  borderRadius?: number;
  noPadding?: boolean;
  noShadow?: boolean;
  tint?: "light" | "prominent" | "subtle";
}

const LIGHT_GLASS = {
  background: "rgba(255, 255, 255, 0.38)",
  border: "rgba(255, 255, 255, 0.55)",
  highlight: "rgba(255, 255, 255, 0.70)",
  innerGlow: "rgba(255, 255, 255, 0.12)",
  shadow: "rgba(80, 40, 60, 0.08)",
  gradientStart: "rgba(255, 255, 255, 0.30)",
  gradientEnd: "rgba(255, 255, 255, 0.05)",
};

const DARK_GLASS = {
  background: "rgba(42, 23, 48, 0.42)",
  border: "rgba(255, 255, 255, 0.12)",
  highlight: "rgba(255, 255, 255, 0.10)",
  innerGlow: "rgba(255, 255, 255, 0.04)",
  shadow: "rgba(0, 0, 0, 0.25)",
  gradientStart: "rgba(255, 255, 255, 0.08)",
  gradientEnd: "rgba(255, 255, 255, 0.02)",
};

const LIGHT_PROMINENT = {
  background: "rgba(255, 255, 255, 0.55)",
  border: "rgba(255, 255, 255, 0.65)",
  highlight: "rgba(255, 255, 255, 0.80)",
  innerGlow: "rgba(255, 255, 255, 0.18)",
  shadow: "rgba(80, 40, 60, 0.10)",
  gradientStart: "rgba(255, 255, 255, 0.40)",
  gradientEnd: "rgba(255, 255, 255, 0.10)",
};

const DARK_PROMINENT = {
  background: "rgba(42, 23, 48, 0.58)",
  border: "rgba(255, 255, 255, 0.15)",
  highlight: "rgba(255, 255, 255, 0.12)",
  innerGlow: "rgba(255, 255, 255, 0.06)",
  shadow: "rgba(0, 0, 0, 0.30)",
  gradientStart: "rgba(255, 255, 255, 0.10)",
  gradientEnd: "rgba(255, 255, 255, 0.03)",
};

const LIGHT_SUBTLE = {
  background: "rgba(255, 255, 255, 0.22)",
  border: "rgba(255, 255, 255, 0.35)",
  highlight: "rgba(255, 255, 255, 0.45)",
  innerGlow: "rgba(255, 255, 255, 0.08)",
  shadow: "rgba(80, 40, 60, 0.05)",
  gradientStart: "rgba(255, 255, 255, 0.18)",
  gradientEnd: "rgba(255, 255, 255, 0.03)",
};

const DARK_SUBTLE = {
  background: "rgba(42, 23, 48, 0.28)",
  border: "rgba(255, 255, 255, 0.08)",
  highlight: "rgba(255, 255, 255, 0.06)",
  innerGlow: "rgba(255, 255, 255, 0.03)",
  shadow: "rgba(0, 0, 0, 0.18)",
  gradientStart: "rgba(255, 255, 255, 0.06)",
  gradientEnd: "rgba(255, 255, 255, 0.01)",
};

function getGlassTokens(isDark: boolean, tint: "light" | "prominent" | "subtle") {
  if (tint === "prominent") return isDark ? DARK_PROMINENT : LIGHT_PROMINENT;
  if (tint === "subtle") return isDark ? DARK_SUBTLE : LIGHT_SUBTLE;
  return isDark ? DARK_GLASS : LIGHT_GLASS;
}

export function GlassSurface({
  children,
  style,
  intensity = 25,
  padding = 16,
  borderRadius = 20,
  noPadding = false,
  noShadow = false,
  tint = "light",
}: GlassSurfaceProps) {
  const { isDark } = useTheme();
  const glass = getGlassTokens(isDark, tint);
  const paddingValue = noPadding ? 0 : padding;

  const shadowStyle: ViewStyle = noShadow
    ? {}
    : {
        shadowColor: glass.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 4,
      };

  const outerStyle: ViewStyle = {
    borderRadius,
    overflow: "hidden" as const,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.border,
    ...shadowStyle,
  };

  if (Platform.OS === "ios") {
    return (
      <View style={[outerStyle, style]}>
        <BlurView
          intensity={intensity}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: glass.background },
          ]}
        />
        <View style={glassStyles.highlightContainer}>
          <View
            style={[glassStyles.highlightLine, { backgroundColor: glass.highlight }]}
          />
        </View>
        <View
          style={[
            StyleSheet.absoluteFill,
            glassStyles.innerGlow,
            { borderColor: glass.innerGlow, borderRadius },
          ]}
        />
        <View style={{ padding: paddingValue, zIndex: 2 }}>{children}</View>
      </View>
    );
  }

  const webBlurStyle: any =
    Platform.OS === "web"
      ? {
          backdropFilter: `blur(${intensity}px) saturate(1.6)`,
          WebkitBackdropFilter: `blur(${intensity}px) saturate(1.6)`,
        }
      : {};

  return (
    <View
      style={[
        outerStyle,
        { backgroundColor: glass.background },
        webBlurStyle,
        style,
      ]}
    >
      <LinearGradient
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        colors={[glass.gradientStart, glass.gradientEnd] as [string, string]}
        style={StyleSheet.absoluteFill}
      />
      <View style={glassStyles.highlightContainer}>
        <View
          style={[glassStyles.highlightLine, { backgroundColor: glass.highlight }]}
        />
      </View>
      <View
        style={[
          StyleSheet.absoluteFill,
          glassStyles.innerGlow,
          { borderColor: glass.innerGlow, borderRadius },
        ]}
      />
      <View style={{ padding: paddingValue, zIndex: 2 }}>{children}</View>
    </View>
  );
}

const glassStyles = StyleSheet.create({
  highlightContainer: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    zIndex: 3,
  },
  highlightLine: {
    height: 1,
    borderRadius: 1,
  },
  innerGlow: {
    borderWidth: 1,
    zIndex: 1,
  },
});
