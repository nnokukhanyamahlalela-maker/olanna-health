import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INSIGHT_ITEMS = [
  { label: "Scented usage", value: "\u2014", icon: "wind" as const },
  { label: "Most used product type", value: "\u2014", icon: "package" as const },
  { label: "Most used brand", value: "\u2014", icon: "tag" as const },
];

export default function ProductInsightsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [showToast, setShowToast] = useState(false);

  const toastOpacity = useSharedValue(0);
  const exportScale = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const exportAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exportScale.value }],
  }));

  const handleExport = () => {
    setShowToast(true);
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setShowToast(false), 350);
    }, 2500);
  };

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.introCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.introText, { color: theme.textSecondary }]}>
            Coming next: see patterns from your product logs.
          </ThemedText>
        </View>

        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          SUMMARY
        </ThemedText>

        <View style={styles.cardList}>
          {INSIGHT_ITEMS.map((item) => (
            <View
              key={item.label}
              style={[styles.insightCard, { backgroundColor: theme.backgroundDefault }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: "#C4B5AD18" }]}>
                <Feather name={item.icon} size={20} color="#C4B5AD" />
              </View>
              <View style={styles.insightContent}>
                <ThemedText style={[styles.insightLabel, { color: theme.textSecondary }]}>
                  {item.label}
                </ThemedText>
                <ThemedText style={[styles.insightValue, { color: theme.text }]}>
                  {item.value}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <AnimatedPressable
          testID="button-export-csv"
          onPress={handleExport}
          onPressIn={() => {
            exportScale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
          }}
          onPressOut={() => {
            exportScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          }}
          style={[
            styles.exportButton,
            { borderColor: theme.border },
            exportAnimStyle,
          ]}
        >
          <Feather name="download" size={18} color={theme.text} />
          <ThemedText style={[styles.exportText, { color: theme.text }]}>
            Export CSV
          </ThemedText>
        </AnimatedPressable>
      </ScrollView>

      {showToast ? (
        <Animated.View style={[styles.toast, toastStyle]}>
          <ThemedText style={styles.toastText}>
            Export will be enabled in the next update.
          </ThemedText>
        </Animated.View>
      ) : null}
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  introCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  introText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  cardList: {
    gap: 12,
    marginBottom: Spacing.xl,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
    gap: 2,
  },
  insightLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  insightValue: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 17,
  },
  exportButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  exportText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#3A2F35",
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  toastText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
