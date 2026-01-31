import React from "react";
import { View, ScrollView, StyleSheet, ViewStyle, ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@/components/ThemeProvider";
import { ScreenPadding, Spacing, TabBarSpacing } from "@/constants/spacing";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
  useHeaderPadding?: boolean;
  useTabBarPadding?: boolean;
  useGlassTabBar?: boolean;
}

export function getGlassTabBarBottomPadding(insetsBottom: number): number {
  return insetsBottom + TabBarSpacing.totalHeight;
}

export function Screen({
  children,
  scroll = false,
  scrollProps,
  style,
  contentStyle,
  edges = ["top", "bottom"],
  useHeaderPadding = true,
  useTabBarPadding = true,
  useGlassTabBar = true,
}: ScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const paddingTop = edges.includes("top")
    ? useHeaderPadding && headerHeight > 0
      ? headerHeight + Spacing.sm
      : insets.top + Spacing.lg
    : 0;

  const paddingBottom = edges.includes("bottom")
    ? useTabBarPadding
      ? useGlassTabBar
        ? insets.bottom + TabBarSpacing.totalHeight
        : insets.bottom + ScreenPadding.bottomScroll
      : insets.bottom + ScreenPadding.bottomScroll
    : 0;

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.background as string,
  };

  const contentContainerStyle: ViewStyle = {
    paddingTop,
    paddingBottom,
    paddingHorizontal: ScreenPadding.horizontal,
    ...contentStyle,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[containerStyle, style]}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <View style={[styles.content, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
