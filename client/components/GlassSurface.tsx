/**
 * GlassSurface — flat cream card surface
 *
 * Replaces the previous glassmorphism implementation (blur + gradient + glow)
 * with a flat opaque surface consistent with the no-effects brand rule.
 *
 * Light mode: white card (#FFFFFF) on lavender background (#EEEDFE)
 * Dark  mode: deep plum card (#1C193A) on dark background
 *
 * All props kept for API compatibility with existing call sites.
 * `intensity`, `tint` are accepted but no longer affect rendering.
 */

import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "@/components/ThemeProvider";

interface GlassSurfaceProps {
  children:     React.ReactNode;
  style?:       StyleProp<ViewStyle>;
  /** @deprecated no longer affects rendering */
  intensity?:   number;
  padding?:     number;
  borderRadius?: number;
  noPadding?:   boolean;
  /** @deprecated no longer affects rendering */
  noShadow?:    boolean;
  /** @deprecated no longer affects rendering */
  tint?:        "light" | "prominent" | "subtle";
}

export function GlassSurface({
  children,
  style,
  padding     = 16,
  borderRadius = 20,
  noPadding   = false,
}: GlassSurfaceProps) {
  const { isDark } = useTheme();

  const bg          = isDark ? "#1C193A" : "#FFFFFF";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(38, 33, 92, 0.08)";

  const paddingValue = noPadding ? 0 : padding;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bg, borderRadius, borderColor },
        style,
      ]}
    >
      <View style={{ padding: paddingValue, alignSelf: "stretch" }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
