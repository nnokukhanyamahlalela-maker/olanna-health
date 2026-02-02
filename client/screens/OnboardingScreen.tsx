import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Platform, 
  Pressable, 
  Dimensions, 
  ScrollView,
  AccessibilityInfo,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSpring,
  Easing,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInRight,
} from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { 
  ProgressDots, 
  OnboardingGlassCard, 
  PrimaryButton, 
  PillSelect,
  AnimatedHeading,
  AnimatedSubtext,
} from "@/components/onboarding";
import { Spacing, BorderRadius } from "@/constants/theme";
import { 
  OnboardingData, 
  Goal, 
  CycleRegularity,
  HEALTH_GOALS, 
  CYCLE_REGULARITY_OPTIONS,
  ONBOARDING_GRADIENT,
  BRAND_COLORS,
  CAROUSEL_SCREENS,
} from "@/constants/onboardingTokens";
import { storage, UserProfile, generateId } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type OnboardingStep = 
  | "splash"
  | "intro"
  | "name"
  | "greeting"
  | "profile"
  | "goals"
  | "confirmation"
  | "carousel";

const introVideoSource = require("@/assets/videos/olanna-intro.mp4");

function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={["#FFDAB3", "#FFB5C5", "#E8C4E8", "#D4B8E8"]}
      locations={[0, 0.35, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBg}
    >
      {children}
    </LinearGradient>
  );
}

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);

  const player = useVideoPlayer(introVideoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      contentOpacity.value = withTiming(1, { duration: 200 });
      contentScale.value = 1;
    } else {
      contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
      contentScale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 80 }));
    }

    const timer = setTimeout(() => {
      runOnJS(onComplete)();
    }, 900);

    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: reduceMotion ? [] : [{ scale: contentScale.value }],
  }));

  return (
    <Animated.View style={[styles.splashFullScreen, contentStyle]}>
      <VideoView
        player={player}
        style={styles.splashVideo}
        contentFit="cover"
        nativeControls={false}
      />
    </Animated.View>
  );
}

function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <View style={[styles.screenContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.introContent}>
          <AnimatedHeading text="Go hi." delay={200} />
          <AnimatedHeading text="My name is Olanna." delay={600} />
        </View>
        <View style={styles.bottomActions}>
          <PrimaryButton 
            label="Continue" 
            onPress={onComplete} 
            icon="arrow-right"
          />
        </View>
      </View>
    </GradientBackground>
  );
}

function NameScreen({ 
  name, 
  setName, 
  onComplete,
  onBack,
}: { 
  name: string;
  setName: (name: string) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const inputOpacity = useSharedValue(0);

  useEffect(() => {
    inputOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
  }));

  return (
    <GradientBackground>
      <KeyboardAwareScrollViewCompat
        style={styles.flex1}
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: insets.top + Spacing["2xl"], paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <Pressable onPress={onBack} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={BRAND_COLORS.white} />
        </Pressable>
        
        <View style={styles.progressContainer}>
          <ProgressDots currentStep={0} totalSteps={3} />
        </View>

        <View style={styles.questionSection}>
          <AnimatedHeading text="And what shall I call you?" delay={200} />
        </View>

        <Animated.View style={[styles.formSection, inputStyle]}>
          <OnboardingGlassCard>
            <TextInput
              style={styles.glassInput}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => name.trim() && onComplete()}
              accessibilityLabel="Enter your name"
            />
          </OnboardingGlassCard>
        </Animated.View>

        <View style={styles.bottomActions}>
          {name.trim().length > 0 ? (
            <PrimaryButton 
              label="Continue" 
              onPress={onComplete} 
              icon="arrow-right"
            />
          ) : null}
        </View>
      </KeyboardAwareScrollViewCompat>
    </GradientBackground>
  );
}

function GreetingScreen({ name, onComplete }: { name: string; onComplete: () => void }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GradientBackground>
      <View style={[styles.screenContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.introContent}>
          <AnimatedHeading text={`Nice to meet you,`} delay={200} />
          <AnimatedHeading text={name} delay={600} style={styles.nameHighlight} />
        </View>
      </View>
    </GradientBackground>
  );
}

function ProfileScreen({ 
  data,
  setData,
  onComplete,
  onBack,
}: { 
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date());
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, []);

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const handleRegularityChange = (id: CycleRegularity) => {
    setData({ ...data, cycleRegularity: id });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: insets.top + Spacing["2xl"], paddingBottom: insets.bottom + Spacing.xl }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={onBack} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={BRAND_COLORS.white} />
        </Pressable>

        <View style={styles.progressContainer}>
          <ProgressDots currentStep={1} totalSteps={3} />
        </View>

        <View style={styles.questionSection}>
          <AnimatedHeading text="Tell me about your cycle" delay={200} style={styles.smallerHeading} />
        </View>

        <Animated.View style={[styles.formSection, formStyle]}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>How regular is your cycle?</ThemedText>
            <PillSelect
              options={CYCLE_REGULARITY_OPTIONS}
              selected={data.cycleRegularity ? [data.cycleRegularity] : []}
              onToggle={(id) => handleRegularityChange(id as CycleRegularity)}
              multiSelect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>When did your last period start?</ThemedText>
            <Pressable
              onPress={() => setShowPeriodPicker(true)}
              style={styles.dateButton}
              accessibilityRole="button"
              accessibilityLabel="Select last period date"
            >
              <ThemedText style={styles.dateText}>{formatDate(lastPeriodDate)}</ThemedText>
              <Feather name="calendar" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
            {showPeriodPicker ? (
              <DateTimePicker
                value={lastPeriodDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowPeriodPicker(Platform.OS === "ios");
                  if (date) {
                    setLastPeriodDate(date);
                    setData({ ...data, lastPeriodStart: date.toISOString().split("T")[0] });
                  }
                }}
                maximumDate={new Date()}
                textColor="#FFFFFF"
              />
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Average cycle length (days)</ThemedText>
            <OnboardingGlassCard>
              <TextInput
                style={styles.glassInputSmall}
                placeholder="28"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={data.avgCycleLength?.toString() || ""}
                onChangeText={(text) => setData({ ...data, avgCycleLength: parseInt(text) || undefined })}
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="Enter average cycle length"
              />
            </OnboardingGlassCard>
          </View>
        </Animated.View>

        <View style={styles.bottomActionsScrollable}>
          <PrimaryButton 
            label="Continue" 
            onPress={onComplete} 
            icon="arrow-right"
          />
          <PrimaryButton 
            label="Skip for now" 
            onPress={onComplete} 
            variant="secondary"
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

function GoalsScreen({ 
  selectedGoals, 
  toggleGoal, 
  onComplete,
  onBack,
}: { 
  selectedGoals: Goal[];
  toggleGoal: (id: Goal) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const goalsOpacity = useSharedValue(0);

  useEffect(() => {
    goalsOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
  }, []);

  const goalsStyle = useAnimatedStyle(() => ({
    opacity: goalsOpacity.value,
  }));

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: insets.top + Spacing["2xl"], paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <Pressable onPress={onBack} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={BRAND_COLORS.white} />
        </Pressable>

        <View style={styles.progressContainer}>
          <ProgressDots currentStep={2} totalSteps={3} />
        </View>

        <View style={styles.questionSection}>
          <AnimatedHeading 
            text="And to what do I owe this pleasure?" 
            delay={200} 
            style={styles.smallerHeading}
          />
          <AnimatedSubtext text="Select all that apply" delay={500} />
        </View>

        <Animated.View style={[styles.goalsSection, goalsStyle]}>
          <PillSelect
            options={HEALTH_GOALS}
            selected={selectedGoals}
            onToggle={(id) => toggleGoal(id as Goal)}
            multiSelect={true}
          />
        </Animated.View>

        <View style={styles.bottomActionsScrollable}>
          {selectedGoals.length > 0 ? (
            <PrimaryButton 
              label="Continue" 
              onPress={onComplete} 
              icon="heart"
            />
          ) : null}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

function ConfirmationScreen({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();
  const lotusOpacity = useSharedValue(0);
  const lotusScale = useSharedValue(0.8);

  useEffect(() => {
    lotusOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    lotusScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 100 }));

    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, []);

  const lotusStyle = useAnimatedStyle(() => ({
    opacity: lotusOpacity.value,
    transform: [{ scale: lotusScale.value }],
  }));

  return (
    <GradientBackground>
      <View style={[styles.screenContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.introContent}>
          <AnimatedHeading text="Perfect." delay={200} />
          <AnimatedHeading text="Let's get started." delay={600} />
        </View>
        <Animated.View style={[styles.lotusContainer, lotusStyle]}>
          <Feather name="heart" size={60} color={BRAND_COLORS.white} />
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

function CarouselScreen({ 
  onComplete,
  isSaving,
}: { 
  onComplete: () => void;
  isSaving: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < CAROUSEL_SCREENS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  const renderItem = ({ item, index }: { item: typeof CAROUSEL_SCREENS[0]; index: number }) => (
    <View style={[styles.carouselSlide, { width: SCREEN_WIDTH }]}>
      <View style={styles.carouselIconContainer}>
        <View style={styles.carouselIconCircle}>
          <Feather name={item.icon as any} size={48} color={BRAND_COLORS.hotPink} />
        </View>
      </View>
      <ThemedText style={styles.carouselTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.carouselSubtitle}>{item.subtitle}</ThemedText>
    </View>
  );

  const isLastSlide = currentIndex === CAROUSEL_SCREENS.length - 1;

  return (
    <GradientBackground>
      <View style={[styles.carouselContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <FlatList
          ref={flatListRef}
          data={CAROUSEL_SCREENS}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(newIndex);
          }}
          keyExtractor={(item) => item.id.toString()}
        />
        
        <View style={styles.carouselDots}>
          {CAROUSEL_SCREENS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.carouselDot,
                index === currentIndex && styles.carouselDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.carouselActions}>
          <PrimaryButton 
            label={isLastSlide ? "Get Started" : "Next"}
            onPress={handleNext}
            loading={isSaving && isLastSlide}
            icon={isLastSlide ? "heart" : "arrow-right"}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState<OnboardingStep>("splash");
  const [isSaving, setIsSaving] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: "",
    goals: [],
    avgCycleLength: 28,
  });

  const toggleGoal = (goalId: Goal) => {
    setOnboardingData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId) 
        ? prev.goals.filter((id) => id !== goalId) 
        : [...prev.goals, goalId],
    }));
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const profile: UserProfile = {
        id: generateId(),
        name: onboardingData.name.trim(),
        dateOfBirth: onboardingData.dob || new Date(2000, 0, 1).toISOString().split("T")[0],
        cycleLength: onboardingData.avgCycleLength || 28,
        periodLength: 5,
        lastPeriodStart: onboardingData.lastPeriodStart || new Date().toISOString().split("T")[0],
        healthGoals: onboardingData.goals,
        hasPCOS: onboardingData.goals.includes("manage_pcos"),
        hasEndometriosis: onboardingData.goals.includes("manage_endometriosis"),
        createdAt: new Date().toISOString(),
      };
      await storage.setUserProfile(profile);
      await storage.setOnboardingComplete(true);
      await storage.setPreference("useLotusView", "true");
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    switch (step) {
      case "name":
        setStep("intro");
        break;
      case "greeting":
        setStep("name");
        break;
      case "profile":
        setStep("greeting");
        break;
      case "goals":
        setStep("profile");
        break;
      default:
        break;
    }
  };

  switch (step) {
    case "splash":
      return <SplashScreen onComplete={() => setStep("intro")} />;
    
    case "intro":
      return <IntroScreen onComplete={() => setStep("name")} />;
    
    case "name":
      return (
        <NameScreen
          name={onboardingData.name}
          setName={(name) => setOnboardingData({ ...onboardingData, name })}
          onComplete={() => setStep("greeting")}
          onBack={goBack}
        />
      );
    
    case "greeting":
      return (
        <GreetingScreen
          name={onboardingData.name}
          onComplete={() => setStep("profile")}
        />
      );
    
    case "profile":
      return (
        <ProfileScreen
          data={onboardingData}
          setData={setOnboardingData}
          onComplete={() => setStep("goals")}
          onBack={goBack}
        />
      );
    
    case "goals":
      return (
        <GoalsScreen
          selectedGoals={onboardingData.goals}
          toggleGoal={toggleGoal}
          onComplete={() => setStep("confirmation")}
          onBack={goBack}
        />
      );
    
    case "confirmation":
      return <ConfirmationScreen onComplete={() => setStep("carousel")} />;
    
    case "carousel":
      return (
        <CarouselScreen
          onComplete={handleComplete}
          isSaving={isSaving}
        />
      );
    
    default:
      return <SplashScreen onComplete={() => setStep("intro")} />;
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },
  splashFullScreen: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  splashVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  screenContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  introContent: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: Spacing.lg,
    zIndex: 10,
    padding: 8,
  },
  progressContainer: {
    marginTop: Spacing["4xl"],
    marginBottom: Spacing.xl,
  },
  questionSection: {
    marginBottom: Spacing["2xl"],
    gap: 12,
  },
  smallerHeading: {
    fontSize: 32,
    lineHeight: 42,
  },
  nameHighlight: {
    color: BRAND_COLORS.white,
  },
  formSection: {
    gap: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  inputLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  glassInput: {
    fontSize: 20,
    color: BRAND_COLORS.white,
    fontFamily: "Poppins_500Medium",
    padding: 0,
  },
  glassInputSmall: {
    fontSize: 18,
    color: BRAND_COLORS.white,
    fontFamily: "Poppins_500Medium",
    padding: 0,
  },
  dateButton: {
    backgroundColor: BRAND_COLORS.glassWhite,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: BRAND_COLORS.glassBorder,
  },
  dateText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: BRAND_COLORS.white,
  },
  bottomActions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["2xl"],
    gap: 12,
  },
  bottomActionsScrollable: {
    marginTop: "auto",
    paddingTop: Spacing["2xl"],
    gap: 12,
  },
  goalsSection: {
    marginBottom: Spacing.xl,
  },
  lotusContainer: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
  },
  carouselContainer: {
    flex: 1,
  },
  carouselSlide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  carouselIconContainer: {
    marginBottom: Spacing["2xl"],
  },
  carouselIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_COLORS.hotPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  carouselTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    color: BRAND_COLORS.white,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  carouselSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  carouselDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Spacing.lg,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  carouselDotActive: {
    width: 24,
    backgroundColor: BRAND_COLORS.white,
  },
  carouselActions: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
  },
});
