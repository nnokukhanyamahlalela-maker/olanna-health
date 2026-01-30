import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { DS } from "@/constants/designSystem";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  gradient?: boolean;
};

export function GlassCard({
  children,
  style,
  intensity = 22,
  gradient = false,
}: Props) {
  if (Platform.OS === "web") {
    return (
      <View style={[styles.outer, DS.shadow.card, styles.fallback, style]}>
        {gradient ? (
          <LinearGradient
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0.20)"]}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.outer, DS.shadow.card, style]}>
      {gradient ? (
        <LinearGradient
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0.20)"]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        <View style={styles.inner}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: DS.radii.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  blur: {
    borderRadius: DS.radii.card,
  },
  inner: {
    padding: DS.spacing.lg,
  },
  fallback: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
