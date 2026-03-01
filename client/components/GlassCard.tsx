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
  const { theme, isDark } = useTheme();

  const glassColors = theme.glass;
  const blurTint = isDark ? "dark" : "light";

  const borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.55)";
  const bgColor = isDark ? "rgba(42,23,48,0.42)" : "rgba(255,255,255,0.38)";

  const webBlurStyle: any =
    Platform.OS === "web"
      ? {
          backdropFilter: `blur(${intensity}px) saturate(1.6)`,
          WebkitBackdropFilter: `blur(${intensity}px) saturate(1.6)`,
          backgroundColor: bgColor,
        }
      : {};

  if (Platform.OS === "ios") {
    return (
      <View style={[styles.blurOuter, { borderColor }, style]}>
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

  return (
    <View style={[
      styles.blurOuter,
      { borderColor, backgroundColor: bgColor },
      webBlurStyle,
      style,
    ]}>
      {gradient ? (
        <LinearGradient
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          colors={isDark
            ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
            : ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.12)"]
          }
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.highlightWrap}>
        <View style={[styles.highlightLine, {
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)",
        }]} />
      </View>
      <View style={styles.inner}>{children}</View>
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
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "rgba(80, 40, 60, 0.12)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
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
  highlightWrap: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    zIndex: 3,
  },
  highlightLine: {
    height: StyleSheet.hairlineWidth,
    borderRadius: 1,
  },
});
