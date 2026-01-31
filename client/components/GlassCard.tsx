import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { CardSpacing } from "@/constants/spacing";
import { useTheme, ThemeProvider } from "@/components/ThemeProvider";

export { ThemeProvider };

export function useReduceTransparency() {
  const { reduceTransparency } = useTheme();
  return { reduceTransparency };
}

export const ReduceTransparencyProvider = ThemeProvider;

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  gradient?: boolean;
};

export function GlassCard({
  children,
  style,
  intensity = 60,
  gradient = false,
}: Props) {
  const { theme, isDark, reduceTransparency } = useTheme();
  const useSolid = reduceTransparency || Platform.OS === "web";

  const glassColors = theme.glass;
  const blurTint = isDark ? "dark" : "light";

  if (useSolid) {
    return (
      <View style={[
        styles.solidCard, 
        { 
          backgroundColor: glassColors.solidFallback as string,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        },
        style
      ]}>
        {gradient ? (
          <LinearGradient
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            colors={isDark 
              ? ["rgba(42,23,48,0.95)", "rgba(42,23,48,0.85)"]
              : ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]
            }
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[
      styles.blurOuter, 
      { borderColor: glassColors.border as string },
      style
    ]}>
      {gradient ? (
        <LinearGradient
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          colors={isDark
            ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.05)"]
            : ["rgba(255,255,255,0.55)", "rgba(255,255,255,0.20)"]
          }
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <BlurView intensity={intensity} tint={blurTint} style={styles.blur}>
        <View style={[
          styles.inner, 
          styles.blurInner, 
          { backgroundColor: glassColors.fill as string }
        ]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

export function useGlassTextColors() {
  const { isDark } = useTheme();
  return {
    primary: isDark ? "#F5EEF2" : "#2B2B2B",
    secondary: isDark ? "#BCA8B5" : "#6F6F6F",
  };
}

const styles = StyleSheet.create({
  blurOuter: {
    borderRadius: CardSpacing.radius,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  blur: {
    borderRadius: CardSpacing.radius,
  },
  blurInner: {},
  inner: {
    padding: CardSpacing.padding,
  },
  solidCard: {
    borderRadius: CardSpacing.radius,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
});
