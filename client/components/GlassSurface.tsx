import React from "react";
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/components/ThemeProvider";

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
  borderRadius?: number;
  noPadding?: boolean;
  noShadow?: boolean;
}

const LIGHT_GLASS = {
  background: "rgba(255, 255, 255, 0.52)",
  border: "rgba(255, 255, 255, 0.60)",
  highlight: "rgba(255, 255, 255, 0.45)",
  fallback: "rgba(255, 255, 255, 0.88)",
};

const DARK_GLASS = {
  background: "rgba(42, 23, 48, 0.48)",
  border: "rgba(255, 255, 255, 0.10)",
  highlight: "rgba(255, 255, 255, 0.06)",
  fallback: "rgba(42, 23, 48, 0.82)",
};

export function GlassSurface({
  children,
  style,
  intensity = 20,
  padding = 16,
  borderRadius = 20,
  noPadding = false,
  noShadow = false,
}: GlassSurfaceProps) {
  const { isDark } = useTheme();
  const glass = isDark ? DARK_GLASS : LIGHT_GLASS;
  const paddingValue = noPadding ? 0 : padding;

  const outerStyle: ViewStyle = {
    borderRadius,
    overflow: "hidden" as const,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.border,
    ...(noShadow
      ? {}
      : {
          shadowColor: "rgba(0, 0, 0, 0.12)",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 3,
        }),
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
        <View style={styles.highlight}>
          <View
            style={[styles.highlightLine, { backgroundColor: glass.highlight }]}
          />
        </View>
        <View style={{ padding: paddingValue }}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        outerStyle,
        { backgroundColor: glass.fallback },
        style,
      ]}
    >
      <View style={styles.highlight}>
        <View
          style={[styles.highlightLine, { backgroundColor: glass.highlight }]}
        />
      </View>
      <View style={{ padding: paddingValue }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  highlightLine: {
    height: 1,
  },
});
