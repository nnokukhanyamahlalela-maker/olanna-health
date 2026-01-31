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

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";

export const TAB_BAR_HEIGHT = 82;
export const TAB_BAR_TOTAL_HEIGHT = 110;

const TAB_BAR_SPECS = {
  height: 82,
  paddingTop: 10,
  paddingBottom: 18,
  paddingHorizontal: 22,
  borderRadius: 28,
  centerButtonSize: 58,
  centerButtonOffset: -10,
};

const LIGHT_GLASS = {
  background: "rgba(255,255,255,0.38)",
  border: "rgba(255,255,255,0.45)",
  blurIntensity: 24,
};

const DARK_GLASS = {
  background: "rgba(25,14,28,0.42)",
  border: "rgba(255,255,255,0.12)",
  blurIntensity: 26,
};

const ACCENT_COLOR = "#FF3F9E";

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
}

function CenterButton({ onPress }: CenterButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      <View style={styles.centerButtonHighlight} />
      <Feather name="heart" size={26} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ routeName, isFocused, onPress, onLongPress }: TabItemProps) {
  const { theme } = useTheme();
  const iconName = TAB_ICONS[routeName] || "circle";
  const label = TAB_LABELS[routeName] || routeName;

  const iconColor = isFocused ? ACCENT_COLOR : theme.textSecondary;

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
      <Feather name={iconName} size={22} color={iconColor} />
      <ThemedText
        style={[
          styles.tabLabel,
          { color: iconColor },
          isFocused && styles.tabLabelActive,
        ]}
      >
        {label}
      </ThemedText>
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
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key);

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
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
      />
    );
  };

  const bottomPadding = Math.max(insets.bottom, TAB_BAR_SPECS.paddingBottom);

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
            <View style={styles.tabsContainer}>
              <View style={styles.tabGroup}>
                {leftRoutes.map(renderTabItem)}
              </View>
              <View style={styles.centerSpacer} />
              <View style={styles.tabGroup}>
                {rightRoutes.map(renderTabItem)}
              </View>
            </View>
          </BlurView>
        ) : (
          <View
            style={[
              styles.blurContainer,
              styles.androidContainer,
              {
                backgroundColor: isDark ? "rgba(35,24,38,0.95)" : "rgba(255,255,255,0.95)",
                borderColor: glassStyle.border,
              },
            ]}
          >
            <View style={styles.tabsContainer}>
              <View style={styles.tabGroup}>
                {leftRoutes.map(renderTabItem)}
              </View>
              <View style={styles.centerSpacer} />
              <View style={styles.tabGroup}>
                {rightRoutes.map(renderTabItem)}
              </View>
            </View>
          </View>
        )}

        <CenterButton onPress={handleCenterPress} />
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
    paddingHorizontal: 16,
    alignItems: "center",
  },
  blurContainer: {
    width: "100%",
    height: TAB_BAR_SPECS.height,
    borderRadius: TAB_BAR_SPECS.borderRadius,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  androidContainer: {
    elevation: 8,
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
    width: TAB_BAR_SPECS.centerButtonSize + 16,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: "600",
  },
  centerButton: {
    position: "absolute",
    top: TAB_BAR_SPECS.centerButtonOffset,
    width: TAB_BAR_SPECS.centerButtonSize,
    height: TAB_BAR_SPECS.centerButtonSize,
    borderRadius: TAB_BAR_SPECS.centerButtonSize / 2,
    backgroundColor: ACCENT_COLOR,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  centerButtonHighlight: {
    position: "absolute",
    top: 3,
    left: 8,
    right: 8,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
