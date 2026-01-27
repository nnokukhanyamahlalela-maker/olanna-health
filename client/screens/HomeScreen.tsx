import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { CycleWheel } from "@/components/CycleWheel";
import { LotusCycleCard } from "@/components/LotusCycleCard";
import { InsightCard } from "@/components/InsightCard";
import { QuickStatCard } from "@/components/QuickStatCard";
import { EmptyState } from "@/components/EmptyState";
import { AfricanPattern } from "@/components/AfricanPattern";
import { PHASE_INFO } from "@/components/Lotus";
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
  const info = PHASE_INFO[phase];
  return {
    title: info.title,
    description: info.description,
  };
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
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={[styles.profileButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            testID="profile-button"
          >
            <Feather name="user" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.greetingSection}>
          <ThemedText style={[styles.dateLabel, { color: theme.textSecondary }]}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).toUpperCase()}
          </ThemedText>
          <ThemedText style={[styles.heroTitle, { color: theme.text }]}>
            {getGreeting()},
          </ThemedText>
          <ThemedText style={[styles.heroName, { color: theme.primary }]}>
            {profile.name.split(" ")[0]}
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
            <LotusCycleCard 
              phase={cycleData.phase}
              currentDay={cycleData.currentDay}
              cycleLength={cycleData.cycleLength}
              size={180}
            />
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

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.insightSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            TODAY'S INSIGHT
          </ThemedText>
          <View style={styles.pullQuote}>
            <ThemedText style={[styles.pullQuoteTitle, { color: theme.text }]}>
              {insight.title}
            </ThemedText>
            <ThemedText style={[styles.pullQuoteText, { color: theme.textSecondary }]}>
              {insight.description}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.insightSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            QUICK ACTIONS
          </ThemedText>
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.actionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              onPress={() => navigation.navigate("CheckIn")}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: theme.secondaryLight }]}>
                <Feather name="edit-3" size={18} color={theme.textSecondary} />
              </View>
              <View style={styles.actionContent}>
                <ThemedText style={[styles.actionTitle, { color: theme.text }]}>Log Today</ThemedText>
                <ThemedText style={[styles.actionDescription, { color: theme.textSecondary }]}>
                  Track symptoms, mood & energy
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={theme.textSecondary} />
            </Pressable>
            <Pressable
              style={[styles.actionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              onPress={() => navigation.navigate("Main", { screen: "HealthTab" })}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: theme.tertiaryLight }]}>
                <Feather name="heart" size={18} color={theme.textSecondary} />
              </View>
              <View style={styles.actionContent}>
                <ThemedText style={[styles.actionTitle, { color: theme.text }]}>Health Center</ThemedText>
                <ThemedText style={[styles.actionDescription, { color: theme.textSecondary }]}>
                  Modules & screening reminders
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={theme.textSecondary} />
            </Pressable>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.lg,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  greetingSection: {
    marginBottom: Spacing["2xl"],
  },
  dateLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontFamily: "Poppins_300Light",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
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
    marginBottom: Spacing.xl,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
  insightSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  pullQuote: {
    paddingLeft: Spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: "#D4A99A",
  },
  pullQuoteTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 20,
    lineHeight: 28,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  pullQuoteText: {
    fontFamily: "Poppins_300Light",
    fontSize: 15,
    lineHeight: 24,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  quickActions: {
    gap: Spacing.md,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
  },
  actionDescription: {
    fontFamily: "Poppins_300Light",
    fontSize: 13,
  },
});
