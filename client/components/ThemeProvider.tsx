import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useColorScheme, AccessibilityInfo, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode, ThemeColors, lightTheme, darkTheme } from "@/constants/themeColors";

const THEME_STORAGE_KEY = "@olanna_theme_mode";

interface ThemeContextValue {
  theme: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  reduceTransparency: boolean;
  reduceMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setThemeModeState(stored);
        }
      } catch (error) {
        console.warn("Failed to load theme preference:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

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

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  }, []);

  const isDark = themeMode === "dark" || (themeMode === "system" && systemColorScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        setThemeMode,
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
