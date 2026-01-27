import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { CycleWheel } from "@/components/CycleWheel";
import { LotusCycleWheel } from "@/components/LotusCycleWheel";
import { InsightCard } from "@/components/InsightCard";
import { QuickStatCard } from "@/components/QuickStatCard";
import { EmptyState } from "@/components/EmptyState";
import { AfricanPattern } from "@/components/AfricanPattern";
import { HeroCard } from "@/components/HeroCard";
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

        <HeroCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <ThemedText style={[styles.phaseTitle, { color: theme.text }]}>
              {insight.title}
            </ThemedText>
            <Pressable
              onPress={toggleView}
              style={[styles.toggleButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Feather
                name={useLotusView ? "circle" : "sun"}
                size={14}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>
          
          <ThemedText style={[styles.phaseSubtitle, { color: theme.textSecondary }]}>
            {insight.description}
          </ThemedText>

          <View style={styles.wheelContainer}>
            {useLotusView ? (
              <LotusCycleWheel 
                phase={cycleData.phase}
                currentDay={cycleData.currentDay}
                cycleLength={cycleData.cycleLength}
                ovulationDay={14}
                periodLength={5}
              />
            ) : (
              <CycleWheel cycleData={cycleData} />
            )}
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <ThemedText style={[styles.heroStatValue, { color: theme.text }]}>
                {daysUntilPeriod > 0 ? daysUntilPeriod : "Today"}
              </ThemedText>
              <ThemedText style={[styles.heroStatLabel, { color: theme.textSecondary }]}>
                {daysUntilPeriod > 0 ? "days to period" : "period starts"}
              </ThemedText>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: theme.border }]} />
            <View style={styles.heroStat}>
              <ThemedText style={[styles.heroStatValue, { color: theme.text }]}>
                Day {cycleData.currentDay}
              </ThemedText>
              <ThemedText style={[styles.heroStatLabel, { color: theme.textSecondary }]}>
                of {cycleData.cycleLength}
              </ThemedText>
            </View>
          </View>
        </HeroCard>

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
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontFamily: "DMSans_300Light",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroCard: {
    marginBottom: Spacing["2xl"],
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  phaseTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  phaseSubtitle: {
    fontFamily: "DMSans_300Light",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  wheelContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    fontFamily: "DMSans_500Medium",
    fontSize: 18,
  },
  heroStatLabel: {
    fontFamily: "DMSans_300Light",
    fontSize: 12,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: "DMSans_400Regular",
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
    fontFamily: "DMSans_500Medium",
    fontSize: 20,
    lineHeight: 28,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  pullQuoteText: {
    fontFamily: "DMSans_300Light",
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
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
  },
  actionDescription: {
    fontFamily: "DMSans_300Light",
    fontSize: 13,
  },
});
