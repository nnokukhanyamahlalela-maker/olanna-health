import React, { createContext, useContext, useState, useEffect } from "react";
import { View, StyleSheet, ViewStyle, Platform, AccessibilityInfo } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { DS } from "@/constants/designSystem";

interface ReduceTransparencyContextType {
  reduceTransparency: boolean;
  setReduceTransparency: (value: boolean) => void;
}

const ReduceTransparencyContext = createContext<ReduceTransparencyContextType>({
  reduceTransparency: false,
  setReduceTransparency: () => {},
});

export function ReduceTransparencyProvider({ children }: { children: React.ReactNode }) {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    const checkReduceTransparency = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceTransparencyEnabled();
        setReduceTransparency(isEnabled);
      } catch {
        setReduceTransparency(false);
      }
    };
    checkReduceTransparency();

    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      (isEnabled) => setReduceTransparency(isEnabled)
    );

    return () => subscription.remove();
  }, []);

  return (
    <ReduceTransparencyContext.Provider value={{ reduceTransparency, setReduceTransparency }}>
      {children}
    </ReduceTransparencyContext.Provider>
  );
}

export function useReduceTransparency() {
  return useContext(ReduceTransparencyContext);
}

export const GLASS_TEXT_COLORS = {
  primary: "#2B2B2B",
  secondary: "#6F6F6F",
};

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
  const { reduceTransparency } = useReduceTransparency();
  const useSolid = reduceTransparency || Platform.OS === "web";

  if (useSolid) {
    return (
      <View style={[styles.solidCard, style]}>
        {gradient ? (
          <LinearGradient
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.blurOuter, style]}>
      {gradient ? (
        <LinearGradient
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0.20)"]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        <View style={[styles.inner, styles.blurInner]}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blurOuter: {
    borderRadius: DS.radii.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  blur: {
    borderRadius: DS.radii.card,
  },
  blurInner: {
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  inner: {
    padding: DS.spacing.lg,
  },
  solidCard: {
    borderRadius: DS.radii.card,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
});
