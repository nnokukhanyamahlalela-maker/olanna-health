import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { CycleHeroWheel } from "@/components/CycleHeroWheel";
import { PhaseGuidanceCard } from "@/components/PhaseGuidanceCard";
import { AppGradient } from "@/components/AppGradient";
import { HeroText } from "@/components/HeroText";
import { CyclePhase } from "@/components/Lotus";
import { Spacing, ScreenPadding, CardSpacing, PillSpacing } from "@/constants/spacing";
import { storage, CycleData, UserProfile, calculateCycleData } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PHASE_PHRASES: Record<CyclePhase, string> = {
  menstrual: "Rest & release.",
  follicular: "Begin again.",
  ovulation: "Rise & shine.",
  luteal: "Turn inward.",
};

const PHASE_GUIDANCE: Record<CyclePhase, Array<{ title: string; body: string }>> = {
  menstrual: [
    { title: "Gentle movement", body: "A short walk or light stretching can ease discomfort without draining your energy." },
    { title: "Nourish yourself", body: "Warm foods and iron-rich meals support your body during this time." },
    { title: "Rest deeply", body: "Your body is doing important work. Extra sleep is a gift, not a luxury." },
  ],
  follicular: [
    { title: "Fresh starts", body: "Energy is building. This is a wonderful time to begin new projects or habits." },
    { title: "Move with joy", body: "Your body responds well to exercise now. Try something that makes you smile." },
    { title: "Plan ahead", body: "Mental clarity peaks. Use it to organize and dream." },
  ],
  ovulation: [
    { title: "Express yourself", body: "Communication flows easily. Share your ideas and connect with others." },
    { title: "Embrace energy", body: "You may feel more vibrant. Channel this into activities you love." },
    { title: "Be present", body: "Your senses are heightened. Notice the beauty around you." },
  ],
  luteal: [
    { title: "Slow down gently", body: "Energy begins to soften. Honor your body's need for quiet." },
    { title: "Comfort matters", body: "Create cozy spaces. Warm baths and soft textures feel especially good now." },
    { title: "Be kind to yourself", body: "Emotions may feel bigger. That's okay. Let them flow." },
  ],
};

export default function HomeScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
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

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  if (isLoading) {
    return (
      <AppGradient style={styles.fullScreen}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </AppGradient>
    );
  }

  if (!profile || !cycleData) {
    return (
      <AppGradient style={styles.fullScreen}>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + Spacing.xl }]}>
          <EmptyState
            image={require("../../assets/images/empty-cycle.png")}
            title="Begin Your Wellness Journey"
            description="Set up your profile to track your cycle and receive personalized insights."
            actionLabel="Get Started"
            onAction={() => navigation.navigate("Onboarding")}
          />
        </View>
      </AppGradient>
    );
  }

  const TAP_TARGET_SIZE = PillSpacing.minTapTarget;

  const phasePhrase = PHASE_PHRASES[cycleData.phase];
  const phaseGuidance = PHASE_GUIDANCE[cycleData.phase];

  return (
    <AppGradient style={styles.fullScreen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: tabBarHeight + ScreenPadding.bottomScroll,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.navigate("Profile")}
          style={[styles.profileButton, { top: insets.top + Spacing.md }]}
          testID="profile-button"
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Feather name="user" size={20} color="rgba(255,255,255,0.9)" />
        </Pressable>

        <View style={styles.heroSection}>
          <HeroText size="medium" style={styles.phasePhrase}>
            {phasePhrase}
          </HeroText>

          <View style={styles.dayIndicator}>
            <ThemedText style={styles.dayLabel}>Day</ThemedText>
            <HeroText style={styles.dayNumber}>{cycleData.currentDay}</HeroText>
            <ThemedText style={styles.cycleInfo}>of {cycleData.cycleLength}</ThemedText>
          </View>

          <View style={styles.wheelContainer}>
            <CycleHeroWheel
              phase={cycleData.phase}
              currentDay={cycleData.currentDay}
              cycleLength={cycleData.cycleLength}
            />
          </View>
        </View>

        <View style={styles.guidanceSection}>
          <HeroText size="small" style={styles.guidanceTitle}>
            For you today
          </HeroText>
          {phaseGuidance.map((item, index) => (
            <PhaseGuidanceCard
              key={index}
              phase={cycleData.phase}
              title={item.title}
              body={item.body}
            />
          ))}
        </View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
  },
  profileButton: {
    position: "absolute",
    right: ScreenPadding.horizontal,
    width: PillSpacing.minTapTarget,
    height: PillSpacing.minTapTarget,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroSection: {
    alignItems: "center",
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["2xl"],
  },
  phasePhrase: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  dayIndicator: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  dayLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  dayNumber: {
    fontSize: 72,
    lineHeight: 80,
  },
  cycleInfo: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  guidanceSection: {
    paddingTop: Spacing.lg,
    gap: CardSpacing.gap,
  },
  guidanceTitle: {
    marginBottom: Spacing.md,
  },
});
