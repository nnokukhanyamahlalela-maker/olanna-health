import React from "react";
import { StyleSheet, View, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { BorderRadius, Spacing } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: "light" | "medium" | "heavy";
  gradient?: boolean;
}

export function GlassCard({ 
  children, 
  style,
  intensity = "medium",
  gradient = false,
}: GlassCardProps) {
  const getIntensity = () => {
    switch (intensity) {
      case "light": return 20;
      case "medium": return 40;
      case "heavy": return 60;
      default: return 40;
    }
  };

  const cardContent = (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.fallbackCard, style]}>
        {gradient ? (
          <LinearGradient
            colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0.3)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView 
        intensity={getIntensity()} 
        tint="light"
        style={[styles.blurContainer, style]}
      >
        {gradient ? (
          <LinearGradient
            colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0.2)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.overlay} />
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  blurContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: BorderRadius.xl,
  },
  content: {
    padding: Spacing.lg,
  },
  fallbackCard: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
});
