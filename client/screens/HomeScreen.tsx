import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import { CycleWheel } from "@/components/CycleWheel";
import { LotusCycleWheel } from "@/components/LotusCycleWheel";
import { EmptyState } from "@/components/EmptyState";
import { AfricanPattern } from "@/components/AfricanPattern";
import { PHASE_INFO } from "@/components/Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, CycleData, UserProfile, calculateCycleData } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PINK_PRIMARY = "#F6BFD3";
const PINK_SOFT = "#FBE3EC";
const BG_MAIN = "#FFF7FA";
const CHARCOAL = "#3A2F35";

function getPhaseTitle(phase: CycleData["phase"]): string {
  return PHASE_INFO[phase].title;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useLotusView, setUseLotusView] = useState(true);

  const loadData = async () => {
    try {
      const [userProfile, lotusPreference] = await Promise.all([
        storage.getUserProfile(),
        storage.getPreference("useLotusView"),
      ]);
      setProfile(userProfile);
      setUseLotusView(lotusPreference !== "false");
      if (userProfile) {
        const cycle = calculateCycleData(userProfile);
        setCycleData(cycle);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const toggleView = async () => {
    const newValue = !useLotusView;
    setUseLotusView(newValue);
    await storage.setPreference("useLotusView", newValue ? "true" : "false");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body">Loading...</ThemedText>
        </View>
      </View>
    );
  }

  if (!profile || !cycleData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <AfricanPattern opacity={0.03} variant="waves" />
        <View style={[styles.emptyContainer, { paddingTop: insets.top + Spacing.xl }]}>
          <EmptyState
            image={require("../../assets/images/empty-cycle.png")}
            title="Begin Your Wellness Journey"
            description="Set up your profile to track your cycle and receive personalized insights rooted in science and care."
            actionLabel="Get Started"
            onAction={() => navigation.navigate("Onboarding")}
          />
        </View>
      </View>
    );
  }

  const phaseTitle = getPhaseTitle(cycleData.phase);
  const wheelSize = Math.min(SCREEN_WIDTH - 40, 320);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <LinearGradient
          colors={[PINK_PRIMARY, PINK_SOFT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.heroGradient,
            {
              paddingTop: insets.top,
              paddingBottom: tabBarHeight + Spacing.xl,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.phaseBadge}>
              <ThemedText style={styles.phaseBadgeText}>{phaseTitle.toUpperCase()}</ThemedText>
            </View>
            <Pressable
              onPress={toggleView}
              style={styles.toggleButton}
              testID="toggle-view-button"
            >
              <View style={styles.toggleCircle} />
            </Pressable>
          </View>

          <View style={styles.cycleDaySection}>
            <ThemedText style={styles.cycleDayNumber}>{cycleData.currentDay}</ThemedText>
            <ThemedText style={styles.cycleDayLabel}>Day of {cycleData.cycleLength}</ThemedText>
          </View>

          <View style={styles.wheelSection}>
            {useLotusView ? (
              <LotusCycleWheel
                phase={cycleData.phase}
                currentDay={cycleData.currentDay}
                cycleLength={cycleData.cycleLength}
                ovulationDay={14}
                periodLength={5}
                size={wheelSize}
              />
            ) : (
              <CycleWheel cycleData={cycleData} />
            )}
          </View>

          <View style={styles.bottomInfo}>
            <View style={styles.dayIndicator}>
              <ThemedText style={styles.dayIndicatorLabel}>DAY </ThemedText>
              <ThemedText style={styles.dayIndicatorValue}>{cycleData.currentDay}</ThemedText>
              <ThemedText style={styles.dayIndicatorLabel}> of {cycleData.cycleLength}</ThemedText>
            </View>
            
            <ThemedText style={styles.phaseName}>
              {cycleData.phase === "ovulation" 
                ? "Ovulatory Phase" 
                : `${cycleData.phase.charAt(0).toUpperCase() + cycleData.phase.slice(1)} Phase`}
            </ThemedText>
            
            <ThemedText style={styles.phaseSubtitle}>{phaseTitle}</ThemedText>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileButton}
            testID="profile-button"
          >
            <Feather name="user" size={20} color={CHARCOAL} />
          </Pressable>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
  },
  heroGradient: {
    flex: 1,
    borderRadius: 32,
    margin: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  phaseBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  phaseBadgeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    color: CHARCOAL,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: CHARCOAL,
  },
  cycleDaySection: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  cycleDayNumber: {
    fontFamily: "DMSans_700Bold",
    fontSize: 72,
    lineHeight: 80,
    color: CHARCOAL,
    letterSpacing: 0.5,
  },
  cycleDayLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: CHARCOAL,
    opacity: 0.7,
    letterSpacing: 0.3,
    marginTop: -4,
  },
  wheelSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  bottomInfo: {
    alignItems: "center",
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  dayIndicator: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.xs,
  },
  dayIndicatorLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: CHARCOAL,
    opacity: 0.6,
    letterSpacing: 1,
  },
  dayIndicatorValue: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    color: CHARCOAL,
  },
  phaseName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 18,
    color: CHARCOAL,
    letterSpacing: 0.5,
  },
  phaseSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: CHARCOAL,
    opacity: 0.6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  profileButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});
