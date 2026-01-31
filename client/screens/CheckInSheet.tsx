import React, { useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
  FadeOut,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing } from "@/constants/spacing";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SHEET_SPECS = {
  borderRadius: 28,
  maxHeight: SCREEN_HEIGHT * 0.55,
};

const LIGHT_GLASS = {
  background: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.45)",
  blurIntensity: 24,
};

const DARK_GLASS = {
  background: "rgba(25,14,28,0.55)",
  border: "rgba(255,255,255,0.12)",
  blurIntensity: 26,
};

const BACKDROP_COLOR = "rgba(0,0,0,0.25)";
const ACCENT_COLOR = "#FF3F9E";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface QuickActionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

function QuickAction({ icon, label, onPress, theme }: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickAction,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <Feather name={icon} size={18} color={ACCENT_COLOR} />
      <ThemedText style={[styles.quickActionLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function CheckInSheet() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const glassStyle = isDark ? DARK_GLASS : LIGHT_GLASS;

  const handleDismiss = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleQuickAction = useCallback(
    (action: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate("Main", { screen: "CheckInTab" });
      }, 150);
    },
    [navigation]
  );

  const handleStartCheckIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
    setTimeout(() => {
      navigation.navigate("Main", { screen: "CheckInTab" });
    }, 150);
  }, [navigation]);

  const renderSheetContent = () => (
    <View style={styles.sheetContent}>
      <View style={styles.handleContainer}>
        <View style={[styles.handle, { backgroundColor: isDark ? "rgba(245,242,244,0.25)" : "rgba(255,255,255,0.45)" }]} />
      </View>

      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: theme.text }]}>
          Quick Check-in
        </ThemedText>
        <Pressable
          onPress={handleDismiss}
          style={[styles.closeButton, { backgroundColor: theme.backgroundDefault }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Track how you're feeling today
      </ThemedText>

      <View style={styles.quickActions}>
        <QuickAction
          icon="activity"
          label="Log Symptoms"
          onPress={() => handleQuickAction("symptoms")}
          theme={theme}
        />
        <QuickAction
          icon="smile"
          label="Log Mood"
          onPress={() => handleQuickAction("mood")}
          theme={theme}
        />
        <QuickAction
          icon="droplet"
          label="Log Flow"
          onPress={() => handleQuickAction("flow")}
          theme={theme}
        />
        <QuickAction
          icon="edit-3"
          label="Add Note"
          onPress={() => handleQuickAction("note")}
          theme={theme}
        />
      </View>

      <Pressable
        onPress={handleStartCheckIn}
        style={styles.ctaButton}
        testID="start-checkin-button"
      >
        <Feather name="heart" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <ThemedText style={styles.ctaButtonText}>Start Check-in</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={handleDismiss} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.springify().damping(18).stiffness(140)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheetContainer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={glassStyle.blurIntensity}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.sheet,
              {
                backgroundColor: glassStyle.background,
                borderColor: glassStyle.border,
              },
            ]}
          >
            {renderSheetContent()}
          </BlurView>
        ) : (
          <View
            style={[
              styles.sheet,
              styles.androidSheet,
              {
                backgroundColor: isDark ? "rgba(35,24,38,0.98)" : "rgba(255,255,255,0.98)",
                borderColor: glassStyle.border,
              },
            ]}
          >
            {renderSheetContent()}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKDROP_COLOR,
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContainer: {
    paddingHorizontal: 12,
  },
  sheet: {
    borderRadius: SHEET_SPECS.borderRadius,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
  },
  androidSheet: {
    elevation: 16,
  },
  sheetContent: {
    padding: Spacing.xl,
  },
  handleContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    marginBottom: Spacing.xl,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: 22,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  quickActionLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 999,
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
