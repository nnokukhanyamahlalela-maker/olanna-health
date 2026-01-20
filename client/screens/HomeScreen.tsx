import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { CycleWheel } from "@/components/CycleWheel";
import { InsightCard } from "@/components/InsightCard";
import { QuickStatCard } from "@/components/QuickStatCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { storage, CycleData, UserProfile, calculateCycleData } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

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
        description: "Your body is renewing itself. Focus on gentle movement and nourishing foods.",
      };
    case "follicular":
      return {
        title: "Rising Energy",
        description: "Great time for new projects and creative thinking. Your energy is building.",
      };
    case "ovulation":
      return {
        title: "Peak Vitality",
        description: "You may feel more social and confident. This is your fertile window.",
      };
    case "luteal":
      return {
        title: "Wind Down",
        description: "Prioritize self-care and completion of tasks. Your body is preparing for the next cycle.",
      };
  }
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const userProfile = await storage.getUserProfile();
      setProfile(userProfile);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
        <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
          <EmptyState
            image={require("../../assets/images/empty-cycle.png")}
            title="Start Your Wellness Journey"
            description="Set up your profile to track your cycle and receive personalized insights."
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.greeting}>
        <ThemedText type="h2">
          {getGreeting()}, {profile.name.split(" ")[0]}
        </ThemedText>
        <ThemedText type="body" style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </ThemedText>
      </View>

      <View style={styles.wheelSection}>
        <CycleWheel cycleData={cycleData} />
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
          color={theme.secondary}
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
            description="Track your symptoms, mood, and more"
            icon="edit-3"
            color={theme.secondary}
            onPress={() => navigation.navigate("Main", { screen: "TrackTab" })}
          />
          <InsightCard
            title="Health Check"
            description="View your screening reminders"
            icon="heart"
            color={theme.tertiary}
            onPress={() => navigation.navigate("Main", { screen: "HealthTab" })}
          />
        </View>
      </View>
    </ScrollView>
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
  greeting: {
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  dateText: {
    opacity: 0.7,
  },
  wheelSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
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
