import React, { useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { brand, neutral } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_TOTAL_HEIGHT = 90;

const TAB_BAR_SPECS = {
  height: 68,
  paddingTop: 8,
  paddingBottom: 10,
  paddingHorizontal: 8,
  borderRadius: 28,
};

const LIGHT_GLASS = {
  background: "rgba(255,255,255,0.60)",
  border: "rgba(255,255,255,0.50)",
  blurIntensity: 32,
  shimmer: "rgba(255,255,255,0.70)",
};

const DARK_GLASS = {
  background: "rgba(25,14,28,0.58)",
  border: "rgba(255,255,255,0.10)",
  blurIntensity: 34,
  shimmer: "rgba(255,255,255,0.06)",
};

type TabIconName = "sun" | "calendar" | "book-open" | "activity";

const FEATHER_ICONS: Record<string, TabIconName> = {
  HomeTab: "sun",
  CalendarTab: "calendar",
  HealthTab: "activity",
  LearnTab: "book-open",
};

const TAB_LABELS: Record<string, string> = {
  HomeTab: "Cycle",
  CalendarTab: "Calendar",
  CheckInTab: "Check-in",
  HealthTab: "Health",
  LearnTab: "Learn",
};

function LotusIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C12 3 9 7.5 9 12C9 14.5 10.3 16.5 12 17.5C13.7 16.5 15 14.5 15 12C15 7.5 12 3 12 3Z"
        fill={color}
        opacity={0.85}
      />
      <Path
        d="M6.5 6C6.5 6 4 10 5.5 14C6.3 16 8 17.2 10 17.8C9.2 16.5 8 14.5 8 12C8 9.2 7 7 6.5 6Z"
        fill={color}
        opacity={0.55}
      />
      <Path
        d="M17.5 6C17.5 6 20 10 18.5 14C17.7 16 16 17.2 14 17.8C14.8 16.5 16 14.5 16 12C16 9.2 17 7 17.5 6Z"
        fill={color}
        opacity={0.55}
      />
      <Path
        d="M3.5 9C3.5 9 2 12.5 4 15.5C5 17 7 18 9 18.2C7.5 17 6 15 5.8 13C5.5 11 4 9.5 3.5 9Z"
        fill={color}
        opacity={0.3}
      />
      <Path
        d="M20.5 9C20.5 9 22 12.5 20 15.5C19 17 17 18 15 18.2C16.5 17 18 15 18.2 13C18.5 11 20 9.5 20.5 9Z"
        fill={color}
        opacity={0.3}
      />
      <Path
        d="M12 17.5C12 17.5 11.5 19 11.5 20.5C11.5 21 11.8 21.5 12 21.5C12.2 21.5 12.5 21 12.5 20.5C12.5 19 12 17.5 12 17.5Z"
        fill={color}
        opacity={0.6}
      />
    </Svg>
  );
}

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
}

function TabItem({ routeName, isFocused, onPress, onLongPress, isDark }: TabItemProps) {
  const label = TAB_LABELS[routeName] || routeName;
  const isLotus = routeName === "CheckInTab";

  const activeColor = brand.primary;
  const inactiveColor = isDark ? "rgba(255,255,255,0.40)" : neutral.textTertiary;
  const iconColor = isFocused ? activeColor : inactiveColor;
  const activePillBg = isDark
    ? "rgba(232,62,140,0.14)"
    : "rgba(232,62,140,0.08)";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      testID={`tab-${routeName.toLowerCase()}`}
    >
      <View
        style={[
          styles.tabPill,
          isFocused ? { backgroundColor: activePillBg } : undefined,
        ]}
      >
        {isLotus ? (
          <LotusIcon color={iconColor} size={25} />
        ) : (
          <Feather name={FEATHER_ICONS[routeName] || "circle"} size={22} color={iconColor} />
        )}
        <ThemedText
          style={[
            styles.tabLabel,
            { color: iconColor },
            isFocused ? styles.tabLabelActive : undefined,
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const glassStyle = isDark ? DARK_GLASS : LIGHT_GLASS;

  const renderTabItem = (route: typeof state.routes[0], index: number) => {
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    return (
      <TabItem
        key={route.key}
        routeName={route.name}
        isFocused={isFocused}
        onPress={onPress}
        onLongPress={onLongPress}
        isDark={isDark}
      />
    );
  };

  const tabBarContent = (
    <View style={styles.tabsContainer}>
      {state.routes.map(renderTabItem)}
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarWrapper}>
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={glassStyle.blurIntensity}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.blurContainer,
              {
                backgroundColor: glassStyle.background,
                borderColor: glassStyle.border,
              },
            ]}
          >
            <View style={[styles.topShimmer, { backgroundColor: glassStyle.shimmer }]} />
            {tabBarContent}
          </BlurView>
        ) : (
          <View
            style={[
              styles.blurContainer,
              styles.androidContainer,
              {
                backgroundColor: isDark ? "rgba(35,24,38,0.96)" : "rgba(255,255,255,0.96)",
                borderColor: glassStyle.border,
              },
            ]}
          >
            <View style={[styles.topShimmer, { backgroundColor: glassStyle.shimmer }]} />
            {tabBarContent}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabBarWrapper: {
    width: "100%",
    paddingHorizontal: 14,
    alignItems: "center",
  },
  blurContainer: {
    width: "100%",
    height: TAB_BAR_SPECS.height,
    borderRadius: TAB_BAR_SPECS.borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowColor: "rgba(0,0,0,0.12)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  androidContainer: {
    elevation: 8,
  },
  topShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: TAB_BAR_SPECS.paddingHorizontal,
    paddingTop: TAB_BAR_SPECS.paddingTop,
    paddingBottom: TAB_BAR_SPECS.paddingBottom,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  tabLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontFamily: Fonts.heading,
  },
});
