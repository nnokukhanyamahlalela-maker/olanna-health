import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { ThemeColors, lightTheme } from "@/constants/themeColors";

interface ThemeContextValue {
  theme: ThemeColors;
  isDark: boolean;
  reduceTransparency: boolean;
  reduceMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const checkAccessibility = async () => {
      try {
        if (Platform.OS !== "web") {
          const [transparency, motion] = await Promise.all([
            AccessibilityInfo.isReduceTransparencyEnabled(),
            AccessibilityInfo.isReduceMotionEnabled(),
          ]);
          setReduceTransparency(transparency);
          setReduceMotion(motion);
        } else {
          const motion = await AccessibilityInfo.isReduceMotionEnabled();
          setReduceMotion(motion);
        }
      } catch (error) {
        console.warn("Failed to check accessibility settings:", error);
      }
    };
    checkAccessibility();

    let transparencyListener: any;
    if (Platform.OS !== "web") {
      transparencyListener = AccessibilityInfo.addEventListener(
        "reduceTransparencyChanged",
        setReduceTransparency
      );
    }
    const motionListener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );

    return () => {
      if (transparencyListener) transparencyListener.remove();
      motionListener.remove();
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: lightTheme,
        isDark: false,
        reduceTransparency,
        reduceMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeColors(): ThemeColors {
  const { theme } = useTheme();
  return theme;
}
