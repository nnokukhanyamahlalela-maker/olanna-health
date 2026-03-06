import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Platform, 
  Pressable, 
  Dimensions, 
  ScrollView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSpring,
  Easing,
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
  ScreenshotImport,
  CycleReviewScreen,
} from "@/components/onboarding";
import type { ExtractedCycleData } from "@/components/onboarding";
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
  | "intro"
  | "name"
  | "greeting"
  | "profile"
  | "goals"
  | "confirmation"
  | "carousel";

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

function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <View style={[styles.screenContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.introContent}>
          <AnimatedHeading text="Hi." delay={200} />
          <AnimatedHeading text="I'm Olanna." delay={600} />
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
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <View style={styles.topRow}>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Feather name="chevron-left" size={28} color={BRAND_COLORS.textPrimary} />
          </Pressable>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressDots currentStep={0} totalSteps={3} />
        </View>

        <View style={styles.questionSection}>
          <AnimatedHeading text="And what shall I call you?" delay={200} style={styles.smallerHeading} />
        </View>

        <Animated.View style={[styles.formSection, inputStyle]}>
          <OnboardingGlassCard>
            <TextInput
              style={styles.glassInput}
              placeholder="Your name"
              placeholderTextColor="rgba(45,31,43,0.4)"
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

        <View style={styles.bottomActionsScrollable}>
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

type ProfileMode = "manual" | "import" | "review";

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
  const [mode, setMode] = useState<ProfileMode>("manual");
  const [extractedData, setExtractedData] = useState<ExtractedCycleData | null>(null);
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

  const handleDataExtracted = (extracted: ExtractedCycleData) => {
    setExtractedData(extracted);
    setMode("review");
  };

  const handleReviewConfirm = (confirmed: {
    regularity: CycleRegularity | undefined;
    lastPeriodStartDate: string;
    averageCycleLength: number | undefined;
    periodDuration: number | undefined;
    previousPeriodDatesCount: number;
  }) => {
    setData({
      ...data,
      cycleRegularity: confirmed.regularity,
      lastPeriodStart: confirmed.lastPeriodStartDate || undefined,
      avgCycleLength: confirmed.averageCycleLength,
      periodLength: confirmed.periodDuration,
      dataSource: "screenshot_upload",
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  if (mode === "review" && extractedData) {
    return (
      <GradientBackground>
        <CycleReviewScreen
          data={extractedData}
          onConfirm={handleReviewConfirm}
          onReupload={() => {
            setExtractedData(null);
            setMode("import");
          }}
        />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Feather name="chevron-left" size={28} color={BRAND_COLORS.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          <ProgressDots currentStep={1} totalSteps={3} />
        </View>

        <View style={styles.questionSection}>
          <AnimatedHeading text="Tell me about your cycle" delay={200} style={styles.smallerHeading} />
        </View>

        <Animated.View style={[styles.formSection, formStyle]}>
          <View style={styles.modeToggle}>
            <Pressable
              onPress={() => setMode("manual")}
              style={[
                styles.modeTab,
                mode === "manual" ? styles.modeTabActive : undefined,
              ]}
              testID="mode-manual"
            >
              <Feather
                name="edit-3"
                size={16}
                color={mode === "manual" ? BRAND_COLORS.hotPink : BRAND_COLORS.textSecondary}
              />
              <ThemedText
                style={[
                  styles.modeTabText,
                  { color: mode === "manual" ? BRAND_COLORS.hotPink : BRAND_COLORS.textSecondary },
                ]}
              >
                Enter manually
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setMode("import")}
              style={[
                styles.modeTab,
                mode === "import" ? styles.modeTabActive : undefined,
              ]}
              testID="mode-import"
            >
              <Feather
                name="upload"
                size={16}
                color={mode === "import" ? BRAND_COLORS.hotPink : BRAND_COLORS.textSecondary}
              />
              <ThemedText
                style={[
                  styles.modeTabText,
                  { color: mode === "import" ? BRAND_COLORS.hotPink : BRAND_COLORS.textSecondary },
                ]}
              >
                Import from app
              </ThemedText>
            </Pressable>
          </View>

          {mode === "manual" ? (
            <>
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
                  <Feather name="calendar" size={20} color={BRAND_COLORS.textSecondary} />
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
                    textColor={BRAND_COLORS.textPrimary}
                  />
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Average cycle length (days)</ThemedText>
                <OnboardingGlassCard>
                  <TextInput
                    style={styles.glassInputSmall}
                    placeholder="28"
                    placeholderTextColor="rgba(45,31,43,0.4)"
                    value={data.avgCycleLength?.toString() || ""}
                    onChangeText={(text) => setData({ ...data, avgCycleLength: parseInt(text) || undefined })}
                    keyboardType="number-pad"
                    maxLength={2}
                    accessibilityLabel="Enter average cycle length"
                  />
                </OnboardingGlassCard>
              </View>
            </>
          ) : (
            <ScreenshotImport
              onDataExtracted={handleDataExtracted}
              onManualEntry={() => setMode("manual")}
            />
          )}
        </Animated.View>

        <View style={styles.bottomActionsScrollable}>
          {mode === "manual" ? (
            <>
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
            </>
          ) : (
            <PrimaryButton 
              label="Skip for now" 
              onPress={onComplete} 
              variant="secondary"
            />
          )}
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
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <View style={styles.topRow}>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Feather name="chevron-left" size={28} color={BRAND_COLORS.textPrimary} />
          </Pressable>
        </View>

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

        <View style={styles.privacyNotice}>
          <Feather name="shield" size={14} color={BRAND_COLORS.textSecondary} />
          <ThemedText style={styles.privacyNoticeText}>
            Your data stays on your device.
          </ThemedText>
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
      <View style={styles.carouselTextContainer}>
        <ThemedText style={styles.carouselTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.carouselSubtitle}>{item.subtitle}</ThemedText>
      </View>
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
  const [step, setStep] = useState<OnboardingStep>("intro");
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
        periodLength: onboardingData.periodLength || 5,
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
      return <IntroScreen onComplete={() => setStep("name")} />;
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  backButton: {
    padding: 4,
    width: 36,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  questionSection: {
    marginBottom: Spacing.lg,
    gap: 8,
  },
  smallerHeading: {
    fontSize: 28,
    lineHeight: 36,
  },
  nameHighlight: {
    color: BRAND_COLORS.textPrimary,
  },
  formSection: {
    gap: Spacing.lg,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: BRAND_COLORS.glassWhite,
    borderRadius: BorderRadius.xl,
    padding: 4,
    borderWidth: 1,
    borderColor: BRAND_COLORS.glassBorder,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  modeTabActive: {
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  modeTabText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  inputGroup: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  inputLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: BRAND_COLORS.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  glassInput: {
    fontSize: 20,
    color: BRAND_COLORS.textPrimary,
    fontFamily: "Poppins_500Medium",
    padding: 0,
  },
  glassInputSmall: {
    fontSize: 18,
    color: BRAND_COLORS.textPrimary,
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
    color: BRAND_COLORS.textPrimary,
  },
  bottomActions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["2xl"],
    gap: 12,
  },
  bottomActionsScrollable: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
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
  carouselTextContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    width: "100%",
  },
  carouselTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    lineHeight: 38,
    color: BRAND_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.md,
    letterSpacing: 0.3,
  },
  carouselSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: BRAND_COLORS.textSecondary,
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
  privacyNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  privacyNoticeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Poppins_400Regular",
  },
});
