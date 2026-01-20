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
      {upcomingScreenings.length > 0 ? (
        <View style={styles.alertSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Upcoming Screenings
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

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Health Modules
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

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          General Health
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
  alertSection: {
    marginBottom: Spacing["2xl"],
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
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  modulesList: {
    gap: Spacing.md,
  },
  healthChecksList: {
    gap: Spacing.md,
  },
});
