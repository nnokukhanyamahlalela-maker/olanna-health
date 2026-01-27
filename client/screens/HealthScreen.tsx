import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { HealthModuleCard } from "@/components/HealthModuleCard";
import { InsightCard } from "@/components/InsightCard";
import { EmptyState } from "@/components/EmptyState";
import { AfricanPattern } from "@/components/AfricanPattern";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserProfile, Screening } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HealthScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [userProfile, userScreenings] = await Promise.all([
        storage.getUserProfile(),
        storage.getScreenings(),
      ]);
      setProfile(userProfile);
      setScreenings(userScreenings);
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

  const upcomingScreenings = screenings.filter((s) => {
    const days = getDaysUntil(s.nextDueDate);
    return days >= 0 && days <= 30;
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body">Loading...</ThemedText>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
          <EmptyState
            image={require("../../assets/images/empty-health.png")}
            title="Set Up Your Health Profile"
            description="Complete your profile to get personalized health recommendations and screening reminders."
            actionLabel="Get Started"
            onAction={() => navigation.navigate("Onboarding")}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <AfricanPattern opacity={0.02} variant="triangles" />
      <ScrollView
        style={styles.scrollView}
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
        <ThemedText style={[styles.pageTitle, { color: theme.text }]}>
          Health
        </ThemedText>
        <ThemedText style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
          Your personalized wellness hub
        </ThemedText>

      {upcomingScreenings.length > 0 ? (
        <View style={styles.alertSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            UPCOMING SCREENINGS
          </ThemedText>
          {upcomingScreenings.map((screening) => (
            <View
              key={screening.id}
              style={[styles.alertCard, { backgroundColor: theme.warning + "15" }]}
            >
              <View style={[styles.alertDot, { backgroundColor: theme.warning }]} />
              <View style={styles.alertContent}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {screening.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </ThemedText>
                <ThemedText type="small" style={styles.alertSubtext}>
                  Due in {getDaysUntil(screening.nextDueDate)} days
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          TRACKING & INSIGHTS
        </ThemedText>

        <View style={styles.modulesList}>
          <HealthModuleCard
            title="Cycle Calculator"
            description="Predict your next period and ovulation based on your cycle length."
            icon="calendar"
            color={theme.primary}
            onPress={() => navigation.navigate("CycleCalculator")}
          />

          <HealthModuleCard
            title="Fertility Tracking"
            description="Log BBT, cervical mucus, and LH tests for accurate ovulation prediction."
            icon="thermometer"
            color={theme.accent}
            onPress={() => navigation.navigate("FertilityTracking")}
          />

          <HealthModuleCard
            title="Your Insights"
            description="View patterns, trends, and personalized wellness recommendations."
            icon="bar-chart-2"
            color={theme.secondary}
            onPress={() => navigation.navigate("Insights")}
          />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          HEALTH MODULES
        </ThemedText>

        <View style={styles.modulesList}>
          <HealthModuleCard
            title="PCOS Management"
            description="Track symptoms, lifestyle factors, and receive personalized insights for PCOS."
            icon="activity"
            color={theme.primary}
            status={profile.hasPCOS ? "Active" : undefined}
            onPress={() => navigation.navigate("PCOSModule")}
          />

          <HealthModuleCard
            title="Endometriosis Care"
            description="Log pain levels, track symptom patterns, and correlate with lifestyle factors."
            icon="heart"
            color={theme.secondary}
            status={profile.hasEndometriosis ? "Active" : undefined}
            onPress={() => navigation.navigate("EndometriosisModule")}
          />

          <HealthModuleCard
            title="Sexual Health"
            description="STI screening reminders, risk assessments, and educational resources."
            icon="shield"
            color={theme.tertiary}
            onPress={() => navigation.navigate("SexualHealthModule")}
          />

          <HealthModuleCard
            title="Cervical Screening"
            description="Pap smear and HPV test scheduling based on South African guidelines."
            icon="clipboard"
            color={theme.info}
            onPress={() => navigation.navigate("CervicalScreeningModule")}
          />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          GENERAL HEALTH
        </ThemedText>

        <View style={styles.healthChecksList}>
          <InsightCard
            title="Annual Check-up"
            description="Blood pressure, cholesterol, and general health screening"
            icon="check-circle"
            color={theme.success}
          />
          <InsightCard
            title="Mental Wellness"
            description="Self-care tips and mental health resources"
            icon="smile"
            color={theme.primary}
          />
        </View>
      </View>

      <PrivacyBadge message="Your health data is encrypted and stored locally on your device" />
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
  pageTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: "Poppins_300Light",
    fontSize: 14,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  alertSection: {
    marginBottom: Spacing.lg,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertContent: {
    flex: 1,
    gap: 2,
  },
  alertSubtext: {
    opacity: 0.7,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  modulesList: {
    gap: Spacing.md,
  },
  healthChecksList: {
    gap: Spacing.md,
  },
});
