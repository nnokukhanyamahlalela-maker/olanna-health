import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/components/ThemeProvider";
import { AppText } from "@/components/AppText";
import { ThemeMode } from "@/constants/themeColors";
import { Spacing, BorderRadius } from "@/constants/theme";

const APPEARANCE_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { mode: "light", label: "Light", icon: "sun" },
  { mode: "dark", label: "Dark", icon: "moon" },
  { mode: "system", label: "System", icon: "smartphone" },
];

export default function AppearanceScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const handleSelect = async (mode: ThemeMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background as string }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <AppText variant="h2" style={styles.title}>Appearance</AppText>
      <AppText variant="caption" color={theme.textSecondary as string} style={styles.subtitle}>
        Choose how Olanna Health looks on your device
      </AppText>

      <View style={styles.optionsContainer}>
        {APPEARANCE_OPTIONS.map((option) => {
          const isSelected = themeMode === option.mode;
          return (
            <Pressable
              key={option.mode}
              onPress={() => handleSelect(option.mode)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.surface as string,
                  borderColor: isSelected ? (theme.accent as string) : (theme.divider as string),
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${option.label} mode`}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isSelected ? (theme.accentSoft as string) : (theme.divider as string) }
              ]}>
                <Feather 
                  name={option.icon} 
                  size={24} 
                  color={isSelected ? (theme.accent as string) : (theme.textSecondary as string)} 
                />
              </View>
              <AppText 
                variant="bodyStrong" 
                color={isSelected ? (theme.accent as string) : (theme.textPrimary as string)}
              >
                {option.label}
              </AppText>
              {isSelected ? (
                <View style={[styles.checkmark, { backgroundColor: theme.accent as string }]}>
                  <Feather name="check" size={14} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.previewSection, { backgroundColor: theme.surface as string }]}>
        <AppText variant="bodyStrong" style={styles.previewTitle}>Preview</AppText>
        <View style={[styles.previewCard, { backgroundColor: theme.surfaceElevated as string }]}>
          <View style={styles.previewRow}>
            <View style={[styles.previewDot, { backgroundColor: theme.accent as string }]} />
            <View style={styles.previewLines}>
              <View style={[styles.previewLine, { backgroundColor: theme.textPrimary as string, width: "60%" }]} />
              <View style={[styles.previewLine, { backgroundColor: theme.textSecondary as string, width: "80%" }]} />
            </View>
          </View>
        </View>
        <AppText variant="caption" color={theme.textTertiary as string} style={styles.previewHint}>
          {isDark ? "Dark mode is active" : "Light mode is active"}
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  previewSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  previewTitle: {
    marginBottom: Spacing.md,
  },
  previewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  previewDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  previewLines: {
    flex: 1,
    gap: Spacing.xs,
  },
  previewLine: {
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  previewHint: {
    textAlign: "center",
  },
});
