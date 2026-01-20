import { Colors, ThemePresets } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemePreset = keyof typeof ThemePresets;

export function useTheme(preset: ThemePreset = "earth") {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const baseTheme = isDark ? Colors.dark : Colors.light;
  const presetColors = ThemePresets[preset];

  const theme = {
    ...baseTheme,
    primary: presetColors.primary,
    secondary: presetColors.secondary,
    tertiary: presetColors.tertiary,
    accent: presetColors.accent,
    phaseMenstrual: presetColors.phaseMenstrual,
    phaseFollicular: presetColors.phaseFollicular,
    phaseOvulation: presetColors.phaseOvulation,
    phaseLuteal: presetColors.phaseLuteal,
    tint: presetColors.primary,
    tabIconSelected: presetColors.primary,
  };

  return {
    theme,
    isDark,
    preset,
    presetName: presetColors.name,
  };
}
