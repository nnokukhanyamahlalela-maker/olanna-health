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
import { useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { brand, neutral } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

export const TAB_BAR_HEIGHT = 82;
export const TAB_BAR_TOTAL_HEIGHT = 110;

const TAB_BAR_SPECS = {
  height: 78,
  paddingTop: 8,
  paddingBottom: 14,
  paddingHorizontal: 18,
  borderRadius: 32,
  centerButtonSize: 60,
  centerButtonOffset: -14,
};

const LIGHT_GLASS = {
  background: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.50)",
  blurIntensity: 32,
  shimmer: "rgba(255,255,255,0.70)",
};

const DARK_GLASS = {
  background: "rgba(25,14,28,0.55)",
  border: "rgba(255,255,255,0.10)",
  blurIntensity: 34,
  shimmer: "rgba(255,255,255,0.06)",
};

type TabIconName = "sun" | "calendar" | "book-open" | "activity";

const TAB_ICONS: Record<string, TabIconName> = {
  HomeTab: "sun",
  CalendarTab: "calendar",
  HealthTab: "activity",
  LearnTab: "book-open",
};

const TAB_LABELS: Record<string, string> = {
  HomeTab: "Cycle",
  CalendarTab: "Calendar",
  HealthTab: "Health",
  LearnTab: "Learn",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CenterButtonProps {
  onPress: () => void;
  isDark: boolean;
}

function CenterButton({ onPress, isDark }: CenterButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePress = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      style={[styles.centerButton, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel="Check-in"
      testID="center-button-checkin"
    >
      <View style={styles.centerButtonOuterRing} />
      <LinearGradient
        colors={[brand.gradientStart, brand.gradientMid, brand.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.centerButtonGradient}
      >
        <View style={styles.centerButtonShine} />
        <Feather name="heart" size={26} color={neutral.textInverse} />
      </LinearGradient>
    </AnimatedPressable>
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
  const iconName = TAB_ICONS[routeName] || "circle";
  const label = TAB_LABELS[routeName] || routeName;

  const activeColor = brand.primary;
  const inactiveColor = isDark ? "rgba(255,255,255,0.45)" : neutral.textTertiary;
  const iconColor = isFocused ? activeColor : inactiveColor;
  const activePillBg = isDark
    ? "rgba(232,62,140,0.12)"
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
        <Feather name={iconName} size={23} color={iconColor} />
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
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const visibleRoutes = state.routes.filter(
    (route) => route.name !== "CheckInTab"
  );

  const leftRoutes = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(2);

  const handleCenterPress = useCallback(() => {
    rootNavigation.navigate("CheckInSheet");
  }, [rootNavigation]);

  const renderTabItem = (route: typeof state.routes[0], index: number) => {
    const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key);

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
      <View style={styles.tabGroup}>
        {leftRoutes.map(renderTabItem)}
      </View>
      <View style={styles.centerSpacer} />
      <View style={styles.tabGroup}>
        {rightRoutes.map(renderTabItem)}
      </View>
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

        <CenterButton onPress={handleCenterPress} isDark={isDark} />
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
    shadowColor: "rgba(0,0,0,0.15)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  androidContainer: {
    elevation: 10,
  },
  topShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.6,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: TAB_BAR_SPECS.paddingHorizontal,
    paddingTop: TAB_BAR_SPECS.paddingTop,
    paddingBottom: TAB_BAR_SPECS.paddingBottom,
  },
  tabGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  centerSpacer: {
    width: TAB_BAR_SPECS.centerButtonSize + 20,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 58,
  },
  tabPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontFamily: Fonts.heading,
  },
  centerButton: {
    position: "absolute",
    top: TAB_BAR_SPECS.centerButtonOffset,
    width: TAB_BAR_SPECS.centerButtonSize,
    height: TAB_BAR_SPECS.centerButtonSize,
    borderRadius: TAB_BAR_SPECS.centerButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButtonOuterRing: {
    position: "absolute",
    width: TAB_BAR_SPECS.centerButtonSize + 8,
    height: TAB_BAR_SPECS.centerButtonSize + 8,
    borderRadius: (TAB_BAR_SPECS.centerButtonSize + 8) / 2,
    borderWidth: 2,
    borderColor: "rgba(232,62,140,0.15)",
    top: -4,
    left: -4,
  },
  centerButtonGradient: {
    width: TAB_BAR_SPECS.centerButtonSize,
    height: TAB_BAR_SPECS.centerButtonSize,
    borderRadius: TAB_BAR_SPECS.centerButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  centerButtonShine: {
    position: "absolute",
    top: 3,
    left: 10,
    right: 10,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
});
