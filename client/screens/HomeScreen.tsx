import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Pressable, Image } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { CycleWheel } from "@/components/CycleWheel";
import { LotusWheel } from "@/components/LotusWheel";
import { InsightCard } from "@/components/InsightCard";
import { QuickStatCard } from "@/components/QuickStatCard";
import { EmptyState } from "@/components/EmptyState";
import { AfricanPattern } from "@/components/AfricanPattern";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { storage, CycleData, UserProfile, calculateCycleData } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getPhaseInsight(phase: CycleData["phase"]): {
  title: string;
  description: string;
} {
  switch (phase) {
    case "menstrual":
      return {
        title: "Rest & Restore",
        description: "Your body is renewing itself. Focus on gentle movement and nourishing foods rich in iron.",
      };
    case "follicular":
      return {
        title: "Rising Energy",
        description: "Like the lotus rising from the water, your energy is building. Great time for new beginnings.",
      };
    case "ovulation":
      return {
        title: "Peak Vitality",
        description: "You are in full bloom. Your energy and confidence are at their highest.",
      };
    case "luteal":
      return {
        title: "Wind Down",
        description: "Time to nurture yourself. Your body is preparing for renewal, like a flower closing for the night.",
      };
  }
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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

  const insight = getPhaseInsight(cycleData.phase);
  const daysUntilPeriod = getDaysUntil(cycleData.nextPeriodStart);
  const daysUntilOvulation = getDaysUntil(cycleData.ovulationDate);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <AfricanPattern opacity={0.02} variant="waves" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["2xl"],
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.brandHeader}>
          <Image
            source={require("../assets/images/olanna-o-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={[styles.brandName, { color: theme.primary }]}>
            Olanna
          </ThemedText>
          <ThemedText type="body" style={[styles.greeting, { color: theme.textSecondary }]}>
            {getGreeting()}, {profile.name.split(" ")[0]}
          </ThemedText>
        </View>

        <View style={styles.wheelSection}>
          <View style={styles.viewToggle}>
            <Pressable
              onPress={toggleView}
              style={[styles.toggleButton, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather
                name={useLotusView ? "circle" : "sun"}
                size={16}
                color={theme.textSecondary}
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {useLotusView ? "Switch to Wheel" : "Switch to Lotus"}
              </ThemedText>
            </Pressable>
          </View>

          {useLotusView ? (
            <LotusWheel cycleData={cycleData} />
          ) : (
            <CycleWheel cycleData={cycleData} />
          )}
        </View>

        <View style={styles.quickStats}>
          <QuickStatCard
            title="Next Period"
            value={daysUntilPeriod > 0 ? `${daysUntilPeriod}` : "Today"}
            subtitle={daysUntilPeriod > 0 ? "days" : ""}
            icon="calendar"
            color={theme.phaseMenstrual}
          />
          <QuickStatCard
            title="Ovulation"
            value={daysUntilOvulation > 0 ? `${daysUntilOvulation}` : "Today"}
            subtitle={daysUntilOvulation > 0 ? "days" : ""}
            icon="star"
            color={theme.phaseOvulation}
          />
          <QuickStatCard
            title="Cycle"
            value={`${cycleData.cycleLength}`}
            subtitle="days"
            icon="repeat"
            color={theme.phaseFollicular}
          />
        </View>

        <View style={styles.insightSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Daily Insight
          </ThemedText>
          <InsightCard
            title={insight.title}
            description={insight.description}
            icon="sun"
            color={theme.primary}
          />
        </View>

        <View style={styles.insightSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.quickActions}>
            <InsightCard
              title="Log Today"
              description="Track your symptoms, mood, and energy"
              icon="edit-3"
              color={theme.secondary}
              onPress={() => navigation.navigate("Main", { screen: "CheckInTab" })}
            />
            <InsightCard
              title="Health Center"
              description="View modules and screening reminders"
              icon="heart"
              color={theme.tertiary}
              onPress={() => navigation.navigate("Main", { screen: "HealthTab" })}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  brandHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: 36,
    fontWeight: "600",
    fontFamily: Typography.h1.fontFamily,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  greeting: {
    opacity: 0.8,
  },
  wheelSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  viewToggle: {
    alignSelf: "flex-end",
    marginBottom: Spacing.md,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  quickStats: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  insightSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  quickActions: {
    gap: Spacing.md,
  },
});
