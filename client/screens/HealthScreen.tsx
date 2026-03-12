import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";
import { storage, UserProfile } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useLotusCycle } from "@/hooks/useLotusCycle";
import { PHASE_SELFCARE } from "@/lib/dailyDecode";
import { phase as phaseColors } from "@/constants/colors";
import type { CyclePhase } from "@/types/cycle";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PHASE_DOT_COLOR: Record<string, string> = {
  Menstrual: phaseColors.menstrual.solid,
  Follicular: phaseColors.follicular.solid,
  Ovulatory: phaseColors.ovulatory.solid,
  Luteal: phaseColors.luteal.solid,
  "Late Luteal": phaseColors.luteal.solid,
};

const PHASE_KEY_MAP: Record<string, keyof typeof PHASE_SELFCARE> = {
  Menstrual: "menstrual",
  Follicular: "follicular",
  Ovulatory: "ovulation",
  Luteal: "luteal",
  "Late Luteal": "late",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TrackerCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  route?: keyof RootStackParamList;
  comingSoon?: boolean;
}

function TrackerCard({
  item,
  onPress,
}: {
  item: TrackerCardData;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      testID={`tracker-card-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={item.title + ". " + item.subtitle}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.trackerCard,
        animatedStyle,
      ]}
    >
      <GlassSurface style={styles.trackerCardGlass} borderRadius={BorderRadius.lg} padding={Spacing.lg}>
        <View style={[styles.trackerIconWrap, { backgroundColor: item.color + "40" }]}>
          <Feather name={item.icon} size={22} color={item.color} />
        </View>
        <ThemedText style={[styles.trackerTitle, { color: theme.text }]}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.trackerSubtitle, { color: theme.textSecondary }]}>
          {item.comingSoon ? "Coming soon" : item.subtitle}
        </ThemedText>
      </GlassSurface>
    </AnimatedPressable>
  );
}

function InsightPlaceholderCard({
  title,
  icon,
  color,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title + ". Coming soon"}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.insightCard,
        animatedStyle,
      ]}
    >
      <GlassSurface style={styles.insightCardGlass} borderRadius={BorderRadius.lg} padding={Spacing.lg}>
        <View style={styles.insightCardRow}>
          <View style={[styles.insightIconWrap, { backgroundColor: color + "40" }]}>
            <Feather name={icon} size={20} color={color} />
          </View>
          <View style={styles.insightContent}>
            <ThemedText style={[styles.insightTitle, { color: theme.text }]}>
              {title}
            </ThemedText>
            <ThemedText style={[styles.insightSub, { color: theme.textSecondary }]}>
              Coming soon
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>
      </GlassSurface>
    </AnimatedPressable>
  );
}

export default function HealthScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: cyclePrediction } = useLotusCycle(profile?.id || "");

  const loadData = async () => {
    try {
      const userProfile = await storage.getUserProfile();
      setProfile(userProfile);
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

  const trackers: TrackerCardData[] = [
    {
      id: "symptoms",
      title: "Symptoms",
      subtitle: "Log and track daily symptoms",
      icon: "thermometer",
      color: "#C2185B",
      route: "CheckIn",
    },
    {
      id: "supplements",
      title: "Supplements",
      subtitle: "Track your daily supplements",
      icon: "sun",
      color: "#5A8A3E",
      route: "Supplements",
    },
    {
      id: "medications",
      title: "Medications",
      subtitle: "Manage your medications",
      icon: "package",
      color: "#7B5EA7",
      route: "Medications",
    },
    {
      id: "gut-health",
      title: "Gut Health",
      subtitle: "Educational digestive wellness insights",
      icon: "heart",
      color: "#B8860B",
      route: "GutHealth",
    },
    {
      id: "sexual-health",
      title: "Sexual Health",
      subtitle: "STI screening and resources",
      icon: "shield",
      color: "#C2185B",
      route: "SexualHealthModule",
    },
    {
      id: "product-safety",
      title: "Menstrual Product Safety",
      subtitle: "Understand what your period products may contain.",
      icon: "info",
      color: "#7A6B63",
      route: "ProductSafety",
    },
  ];

  const handleTrackerPress = (item: TrackerCardData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.comingSoon) {
      return;
    }
    if (item.route) {
      navigation.navigate(item.route as any);
    }
  };

  if (isLoading) {
    return (
      <AppGradient style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body">Loading...</ThemedText>
        </View>
      </AppGradient>
    );
  }

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F6BFD3"
            accessibilityLabel="Pull to refresh health data"
          />
        }
      >
        <ThemedText style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
          Your hormonal intelligence
        </ThemedText>

        <GlassSurface style={styles.phaseCard} borderRadius={BorderRadius.lg} padding={Spacing.lg}>
          <View style={styles.phaseRow}>
            <View
              style={[
                styles.phaseDot,
                {
                  backgroundColor: cyclePrediction
                    ? PHASE_DOT_COLOR[cyclePrediction.currentPhase] ?? "#F6BFD3"
                    : "#F6BFD3",
                },
              ]}
            />
            <ThemedText style={[styles.phaseLabel, { color: theme.text }]}>
              {cyclePrediction ? cyclePrediction.currentPhase : "Current Phase"}
            </ThemedText>
            {cyclePrediction && (
              <ThemedText style={[styles.phaseDayLabel, { color: theme.textSecondary }]}>
                Day {cyclePrediction.rawCycleDay}
              </ThemedText>
            )}
          </View>
          <ThemedText style={[styles.phaseInsight, { color: theme.textSecondary }]}>
            {cyclePrediction
              ? PHASE_SELFCARE[PHASE_KEY_MAP[cyclePrediction.currentPhase] ?? "follicular"]
              : "Your hormones shift throughout each cycle, influencing mood, energy, and well-being."}
          </ThemedText>
        </GlassSurface>

        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          TRACKERS
        </ThemedText>

        <View style={styles.trackerGrid}>
          {trackers.map((item) => (
            <TrackerCard
              key={item.id}
              item={item}
              onPress={() => handleTrackerPress(item)}
            />
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          TOOLS
        </ThemedText>

        <View style={styles.insightsList}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("PMSChecker");
            }}
            testID="tool-pms-checker"
          >
            <GlassSurface style={styles.insightCardGlass} borderRadius={BorderRadius.lg} padding={Spacing.lg}>
              <View style={styles.insightCardRow}>
                <View style={[styles.insightIconWrap, { backgroundColor: "#E83E8C40" }]}>
                  <Feather name="clipboard" size={20} color="#C2185B" />
                </View>
                <View style={styles.insightContent}>
                  <ThemedText style={[styles.insightTitle, { color: theme.text }]}>
                    PMS Symptom Checker
                  </ThemedText>
                  <ThemedText style={[styles.insightSub, { color: theme.textSecondary }]}>
                    Assess your symptoms and get personalised tips
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} />
              </View>
            </GlassSurface>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("CycleCalculator");
            }}
            testID="tool-cycle-calculator"
          >
            <GlassSurface style={styles.insightCardGlass} borderRadius={BorderRadius.lg} padding={Spacing.lg}>
              <View style={styles.insightCardRow}>
                <View style={[styles.insightIconWrap, { backgroundColor: "#D4502040" }]}>
                  <Feather name="calendar" size={20} color="#D45020" />
                </View>
                <View style={styles.insightContent}>
                  <ThemedText style={[styles.insightTitle, { color: theme.text }]}>
                    Cycle Length Calculator
                  </ThemedText>
                  <ThemedText style={[styles.insightSub, { color: theme.textSecondary }]}>
                    Predict your next period, ovulation and fertile window
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} />
              </View>
            </GlassSurface>
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          INSIGHTS
        </ThemedText>

        <View style={styles.insightsList}>
          <InsightPlaceholderCard
            title="Hormone Patterns"
            icon="trending-up"
            color="#B8860B"
          />
          <InsightPlaceholderCard
            title="PMS Trends"
            icon="bar-chart-2"
            color="#7B5EA7"
          />
        </View>

        <PrivacyBadge message="Your health data is encrypted and stored locally on your device" />
      </ScrollView>
    </AppGradient>
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
  pageSubtitle: {
    fontFamily: Fonts.bodyLight,
    fontSize: 14,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  phaseCard: {
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  phaseLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    flex: 1,
  },
  phaseDayLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  phaseInsight: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  trackerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  trackerCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
  },
  trackerCardGlass: {
    flex: 1,
    gap: 6,
  },
  trackerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  trackerTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 14,
  },
  trackerSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    minHeight: 52,
  },
  insightCardGlass: {
    flex: 1,
  },
  insightCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  insightIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
    gap: 2,
  },
  insightTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  insightSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
});
