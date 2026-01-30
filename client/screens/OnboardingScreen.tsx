import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Platform, Pressable, Dimensions, ScrollView, Image, ImageBackground } from "react-native";
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
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SymptomChip } from "@/components/SymptomChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserProfile, generateId } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BRAND_COLORS = {
  sunsetOrange: "#F7A37A",
  hotPink: "#E85A9C",
  softPink: "#D070A0",
  white: "#FFFFFF",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const healthGoals = [
  { id: "track_period", label: "Track my period" },
  { id: "manage_pcos", label: "Manage PCOS" },
  { id: "manage_endo", label: "Manage Endometriosis" },
  { id: "fertility", label: "Track fertility" },
  { id: "sexual_health", label: "Sexual health" },
  { id: "wellness", label: "General wellness" },
];

function AnimatedBlobbingText({ 
  text, 
  delay = 0, 
  style,
  onComplete,
}: { 
  text: string; 
  delay?: number; 
  style?: object;
  onComplete?: () => void;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const blur = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
      )
    );

    if (onComplete) {
      const timer = setTimeout(() => {
        runOnJS(onComplete)();
      }, delay + 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={[styles.blobbingText, style]}>{text}</ThemedText>
    </Animated.View>
  );
}

function GradientSpillIntro({ onComplete }: { onComplete: () => void }) {
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);

  useEffect(() => {
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    contentScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 80 }));

    const timer = setTimeout(() => {
      runOnJS(onComplete)();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  return (
    <Animated.View style={[styles.splashFullScreen, contentStyle]}>
      <Image
        source={require("@/assets/images/olanna-brand-logo.png")}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

function IntroScreen({ 
  message, 
  onComplete,
  autoAdvance = true,
  duration = 5000,
}: { 
  message: string; 
  onComplete: () => void;
  autoAdvance?: boolean;
  duration?: number;
}) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (autoAdvance) {
      const timer = setTimeout(() => {
        runOnJS(onComplete)();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance, duration]);

  return (
    <ImageBackground
      source={require("@/assets/images/gradient-background.jpg")}
      style={styles.fullScreen}
      resizeMode="cover"
    >
      <View style={[styles.introMessageContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <AnimatedBlobbingText text={message} delay={300} />
      </View>
      {!autoAdvance && (
        <Pressable style={styles.tapToContinue} onPress={onComplete}>
          <ThemedText style={styles.tapText}>Tap to continue</ThemedText>
        </Pressable>
      )}
    </ImageBackground>
  );
}

function ProfileInputScreen({ 
  name, 
  setName, 
  dateOfBirth, 
  setDateOfBirth,
  showDatePicker,
  setShowDatePicker,
  onComplete,
}: { 
  name: string;
  setName: (name: string) => void;
  dateOfBirth: Date;
  setDateOfBirth: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  onComplete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const textOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 1000 });
    formOpacity.value = withDelay(4500, withTiming(1, { duration: 800 }));
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <ImageBackground
      source={require("@/assets/images/gradient-background.jpg")}
      style={styles.fullScreen}
      resizeMode="cover"
    >
      <KeyboardAwareScrollViewCompat
        style={styles.flex1}
        contentContainerStyle={[
          styles.profileContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <Animated.View style={[styles.questionContainer, textStyle]}>
          <AnimatedBlobbingText 
            text="What shall I call you?" 
            delay={300}
            style={styles.questionText}
          />
        </Animated.View>

        <Animated.View style={[styles.formContainer, formStyle]}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Name</ThemedText>
            <TextInput
              style={styles.glassInput}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Date of Birth</ThemedText>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.glassDateButton}
            >
              <ThemedText style={styles.dateText}>{formatDate(dateOfBirth)}</ThemedText>
              <Feather name="calendar" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (date) setDateOfBirth(date);
                }}
                maximumDate={new Date()}
                textColor="#FFFFFF"
              />
            )}
          </View>

          {name.trim() && (
            <Pressable 
              style={styles.continueButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onComplete();
              }}
            >
              <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ImageBackground>
  );
}

function CycleInputScreen({
  cycleLength,
  setCycleLength,
  periodLength,
  setPeriodLength,
  lastPeriodStart,
  setLastPeriodStart,
  showLastPeriodPicker,
  setShowLastPeriodPicker,
  onComplete,
}: {
  cycleLength: string;
  setCycleLength: (val: string) => void;
  periodLength: string;
  setPeriodLength: (val: string) => void;
  lastPeriodStart: Date;
  setLastPeriodStart: (date: Date) => void;
  showLastPeriodPicker: boolean;
  setShowLastPeriodPicker: (show: boolean) => void;
  onComplete: () => void;
}) {
  const insets = useSafeAreaInsets();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ImageBackground
      source={require("@/assets/images/gradient-background.jpg")}
      style={styles.fullScreen}
      resizeMode="cover"
    >
      <KeyboardAwareScrollViewCompat
        style={styles.flex1}
        contentContainerStyle={[
          styles.profileContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <View style={styles.questionContainer}>
          <ThemedText style={styles.sectionTitle}>Tell me about your cycle</ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Average cycle length (days)</ThemedText>
            <TextInput
              style={styles.glassInput}
              placeholder="28"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={cycleLength}
              onChangeText={setCycleLength}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Average period length (days)</ThemedText>
            <TextInput
              style={styles.glassInput}
              placeholder="5"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={periodLength}
              onChangeText={setPeriodLength}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>When did your last period start?</ThemedText>
            <Pressable
              onPress={() => setShowLastPeriodPicker(true)}
              style={styles.glassDateButton}
            >
              <ThemedText style={styles.dateText}>{formatDate(lastPeriodStart)}</ThemedText>
              <Feather name="calendar" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
            {showLastPeriodPicker && (
              <DateTimePicker
                value={lastPeriodStart}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowLastPeriodPicker(Platform.OS === "ios");
                  if (date) setLastPeriodStart(date);
                }}
                maximumDate={new Date()}
                textColor="#FFFFFF"
              />
            )}
          </View>

          <Pressable 
            style={styles.continueButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onComplete();
            }}
          >
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ImageBackground>
  );
}

function HealthGoalsScreen({
  selectedGoals,
  toggleGoal,
  onComplete,
  isSaving,
}: {
  selectedGoals: string[];
  toggleGoal: (id: string) => void;
  onComplete: () => void;
  isSaving: boolean;
}) {
  const insets = useSafeAreaInsets();
  const textOpacity = useSharedValue(0);
  const goalsOpacity = useSharedValue(0);

  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 1000 });
    goalsOpacity.value = withDelay(4500, withTiming(1, { duration: 800 }));
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const goalsStyle = useAnimatedStyle(() => ({
    opacity: goalsOpacity.value,
  }));

  return (
    <ImageBackground
      source={require("@/assets/images/gradient-background.jpg")}
      style={styles.fullScreen}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={[
          styles.profileContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <Animated.View style={[styles.questionContainer, textStyle]}>
          <AnimatedBlobbingText 
            text="And to what do I owe this pleasure?" 
            delay={300}
            style={styles.questionText}
          />
        </Animated.View>

        <Animated.View style={[styles.goalsContainer, goalsStyle]}>
          <ThemedText style={styles.goalsSubtitle}>
            Select all that apply
          </ThemedText>
          <View style={styles.goalsGrid}>
            {healthGoals.map((goal) => (
              <Pressable
                key={goal.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleGoal(goal.id);
                }}
                style={[
                  styles.goalChip,
                  selectedGoals.includes(goal.id) && styles.goalChipSelected,
                ]}
              >
                <ThemedText style={[
                  styles.goalChipText,
                  selectedGoals.includes(goal.id) && styles.goalChipTextSelected,
                ]}>
                  {goal.label}
                </ThemedText>
                {selectedGoals.includes(goal.id) && (
                  <Feather name="check" size={16} color={BRAND_COLORS.hotPink} />
                )}
              </Pressable>
            ))}
          </View>

          {selectedGoals.length > 0 && (
            <Pressable 
              style={styles.completeButton}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onComplete();
              }}
              disabled={isSaving}
            >
              <ThemedText style={styles.completeButtonText}>
                {isSaving ? "Setting up..." : "Let's begin"}
              </ThemedText>
              <Feather name="heart" size={20} color={BRAND_COLORS.hotPink} />
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [lastPeriodStart, setLastPeriodStart] = useState(new Date());
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const profile: UserProfile = {
        id: generateId(),
        name: name.trim(),
        dateOfBirth: dateOfBirth.toISOString().split("T")[0],
        cycleLength: parseInt(cycleLength) || 28,
        periodLength: parseInt(periodLength) || 5,
        lastPeriodStart: lastPeriodStart.toISOString().split("T")[0],
        healthGoals: selectedGoals,
        hasPCOS: selectedGoals.includes("manage_pcos"),
        hasEndometriosis: selectedGoals.includes("manage_endo"),
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

  switch (step) {
    case 0:
      return <GradientSpillIntro onComplete={() => setStep(1)} />;
    case 1:
      return (
        <IntroScreen 
          message="Girl, hi! My name is Olanna." 
          onComplete={() => setStep(2)}
          duration={5000}
        />
      );
    case 2:
      return (
        <ProfileInputScreen
          name={name}
          setName={setName}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          onComplete={() => setStep(3)}
        />
      );
    case 3:
      return (
        <IntroScreen 
          message="And to what do I owe this pleasure?" 
          onComplete={() => setStep(4)}
          duration={5000}
        />
      );
    case 4:
      return (
        <HealthGoalsScreen
          selectedGoals={selectedGoals}
          toggleGoal={toggleGoal}
          onComplete={() => setStep(5)}
          isSaving={false}
        />
      );
    case 5:
      return (
        <CycleInputScreen
          cycleLength={cycleLength}
          setCycleLength={setCycleLength}
          periodLength={periodLength}
          setPeriodLength={setPeriodLength}
          lastPeriodStart={lastPeriodStart}
          setLastPeriodStart={setLastPeriodStart}
          showLastPeriodPicker={showLastPeriodPicker}
          setShowLastPeriodPicker={setShowLastPeriodPicker}
          onComplete={handleComplete}
        />
      );
    default:
      return <GradientSpillIntro onComplete={() => setStep(1)} />;
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
  },
  
  spillContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  splashFullScreen: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  splashImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  spillBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  spillGradient: {
    position: "absolute",
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    borderRadius: SCREEN_WIDTH,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
  },
  
  introMessageContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  blobbingText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 42,
    color: "#FFFFFF",
    lineHeight: 54,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tapToContinue: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
  },
  tapText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  
  questionContainer: {
    marginBottom: Spacing.xl,
  },
  questionText: {
    fontSize: 38,
    lineHeight: 50,
  },
  sectionTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 42,
  },
  
  profileContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  formContainer: {
    marginTop: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  glassInput: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "DMSans_500Medium",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  glassDateButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  dateText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#FFFFFF",
  },
  
  continueButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    gap: 8,
  },
  continueButtonText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: BRAND_COLORS.hotPink,
  },
  
  goalsContainer: {
    marginTop: Spacing.lg,
  },
  goalsSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: Spacing.lg,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  goalChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  goalChipSelected: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "rgba(255,255,255,1)",
  },
  goalChipText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: "#FFFFFF",
  },
  goalChipTextSelected: {
    color: BRAND_COLORS.hotPink,
  },
  
  completeButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["2xl"],
    gap: 8,
  },
  completeButtonText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: BRAND_COLORS.hotPink,
  },
});
