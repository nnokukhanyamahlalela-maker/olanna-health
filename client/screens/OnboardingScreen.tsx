import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, TextInput, Platform, Pressable, Dimensions } from "react-native";
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
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SymptomChip } from "@/components/SymptomChip";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserProfile, generateId } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Exact brand gradient colors from spec
const BRAND_COLORS = {
  hotPink: "#FF4FB8",
  sunsetOrange: "#F7A37A",
  softLavender: "#C9B8E8",
  lightBlush: "#FDF1F6",
  white: "#FFFFFF",
  text: "#2D2A32",
};

const CHARCOAL = "#2D2A32";

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

function MiniLotus({ color, size = 80 }: { color: string; size?: number }) {
  const center = size / 2;
  const petalLength = size * 0.35;

  const createPetal = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    const tipX = center + Math.cos(rad) * petalLength;
    const tipY = center + Math.sin(rad) * petalLength;
    const leftRad = ((angle - 90) * Math.PI) / 180;
    const rightRad = ((angle + 90) * Math.PI) / 180;
    const baseOffset = size * 0.08;
    const leftX = center + Math.cos(leftRad) * baseOffset;
    const leftY = center + Math.sin(leftRad) * baseOffset;
    const rightX = center + Math.cos(rightRad) * baseOffset;
    const rightY = center + Math.sin(rightRad) * baseOffset;
    const ctrl1X = center + Math.cos(rad) * (petalLength * 0.5) + Math.cos(leftRad) * (size * 0.1);
    const ctrl1Y = center + Math.sin(rad) * (petalLength * 0.5) + Math.sin(leftRad) * (size * 0.1);
    const ctrl2X = center + Math.cos(rad) * (petalLength * 0.5) + Math.cos(rightRad) * (size * 0.1);
    const ctrl2Y = center + Math.sin(rad) * (petalLength * 0.5) + Math.sin(rightRad) * (size * 0.1);
    return `M ${leftX} ${leftY} Q ${ctrl1X} ${ctrl1Y} ${tipX} ${tipY} Q ${ctrl2X} ${ctrl2Y} ${rightX} ${rightY} Z`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0, 90, 180, 270].map((angle) => (
        <Path key={angle} d={createPetal(angle)} fill={color} opacity={0.7} />
      ))}
      {[45, 135, 225, 315].map((angle) => (
        <Path key={angle} d={createPetal(angle)} fill={color} opacity={0.4} />
      ))}
      <Circle cx={center} cy={center} r={size * 0.08} fill={color} />
    </Svg>
  );
}

// ============================================================================
// ANIMATED INTRO COMPONENT
// Starts white, fades in gradient and logo over 5 seconds
// ============================================================================
function AnimatedIntro({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const whiteOverlayOpacity = useSharedValue(1);
  const gradientOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  useEffect(() => {
    // Animation sequence (total ~5 seconds)
    
    // 1. Fade out white overlay, reveal gradient (0-1.5s)
    whiteOverlayOpacity.value = withTiming(0, { 
      duration: 1500, 
      easing: Easing.out(Easing.cubic) 
    });
    gradientOpacity.value = withTiming(1, { 
      duration: 1500, 
      easing: Easing.out(Easing.cubic) 
    });
    
    // 2. Fade in logo with scale (0.8-2.3s)
    logoOpacity.value = withDelay(800, withTiming(1, { 
      duration: 1200, 
      easing: Easing.out(Easing.cubic) 
    }));
    logoScale.value = withDelay(800, withTiming(1, { 
      duration: 1200, 
      easing: Easing.out(Easing.back(1.2)) 
    }));
    
    // 3. Fade in "OLANNA" text (1.5-2.8s)
    textOpacity.value = withDelay(1500, withTiming(1, { 
      duration: 1000, 
      easing: Easing.out(Easing.cubic) 
    }));
    
    // 4. Fade in "HEALTH" subtitle (2.2-3.5s)
    subtitleOpacity.value = withDelay(2200, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    }));
    
    // 5. Fade in button with slide up (3.5-4.5s)
    buttonOpacity.value = withDelay(3500, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    }));
    buttonTranslateY.value = withDelay(3500, withTiming(0, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.1)) 
    }));
  }, []);

  // Animated styles
  const whiteOverlayStyle = useAnimatedStyle(() => ({
    opacity: whiteOverlayOpacity.value,
  }));

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  return (
    <View style={styles.introContainer}>
      {/* Gradient background */}
      <AnimatedLinearGradient
        colors={[
          BRAND_COLORS.sunsetOrange,
          BRAND_COLORS.hotPink,
          BRAND_COLORS.softLavender,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.introGradient, gradientStyle]}
      />
      
      {/* White overlay that fades out */}
      <Animated.View style={[styles.whiteOverlay, whiteOverlayStyle]} />
      
      {/* Content */}
      <View style={[styles.introContent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Logo "O" icon */}
        <Animated.View style={[styles.logoIconContainer, logoStyle]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner} />
          </View>
        </Animated.View>
        
        {/* "OLANNA" text */}
        <Animated.View style={textStyle}>
          <ThemedText style={styles.olannaText}>OLANNA</ThemedText>
        </Animated.View>
        
        {/* "HEALTH" subtitle */}
        <Animated.View style={subtitleStyle}>
          <ThemedText style={styles.healthText}>HEALTH</ThemedText>
        </Animated.View>
        
        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, subtitleStyle]}>
          <ThemedText style={styles.taglineText}>
            Keep track of{'\n'}your period
          </ThemedText>
          <ThemedText style={styles.taglineSubtext}>
            Easily and accurately track each{'\n'}phase of your menstrual cycle
          </ThemedText>
        </Animated.View>
        
        {/* Get Started button */}
        <Animated.View style={[styles.introButtonContainer, buttonStyle]}>
          <Pressable style={styles.getStartedBtn} onPress={handleGetStarted}>
            <ThemedText style={styles.getStartedBtnText}>Get started</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ============================================================================
// MAIN ONBOARDING SCREEN
// ============================================================================
export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // Start with animated intro (step 0), then proceed to form steps
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [lastPeriodStart, setLastPeriodStart] = useState(new Date());
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [useLotusView, setUseLotusView] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleIntroComplete = () => {
    setStep(1);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
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
      await storage.setPreference("useLotusView", useLotusView ? "true" : "false");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Show animated intro for step 0
  if (step === 0) {
    return <AnimatedIntro onComplete={handleIntroComplete} />;
  }

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        What should we call you?
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="Your name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <ThemedText type="h4" style={styles.fieldLabel}>
        Date of Birth
      </ThemedText>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[
          styles.dateButton,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <ThemedText type="body">{formatDate(dateOfBirth)}</ThemedText>
        <Feather name="calendar" size={20} color={theme.textSecondary} />
      </Pressable>
      {showDatePicker ? (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === "ios");
            if (date) setDateOfBirth(date);
          }}
          maximumDate={new Date()}
        />
      ) : null}
      <PrivacyBadge message="Your personal data is encrypted and stored locally" />
      <Button onPress={handleNext} disabled={!name.trim()} style={styles.button}>
        Continue
      </Button>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        Tell us about your cycle
      </ThemedText>
      <ThemedText type="h4" style={styles.fieldLabel}>
        Average cycle length (days)
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="28"
        placeholderTextColor={theme.textSecondary}
        value={cycleLength}
        onChangeText={setCycleLength}
        keyboardType="number-pad"
        maxLength={2}
      />
      <ThemedText type="h4" style={styles.fieldLabel}>
        Average period length (days)
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="5"
        placeholderTextColor={theme.textSecondary}
        value={periodLength}
        onChangeText={setPeriodLength}
        keyboardType="number-pad"
        maxLength={2}
      />
      <ThemedText type="h4" style={styles.fieldLabel}>
        When did your last period start?
      </ThemedText>
      <Pressable
        onPress={() => setShowLastPeriodPicker(true)}
        style={[
          styles.dateButton,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <ThemedText type="body">{formatDate(lastPeriodStart)}</ThemedText>
        <Feather name="calendar" size={20} color={theme.textSecondary} />
      </Pressable>
      {showLastPeriodPicker ? (
        <DateTimePicker
          value={lastPeriodStart}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowLastPeriodPicker(Platform.OS === "ios");
            if (date) setLastPeriodStart(date);
          }}
          maximumDate={new Date()}
        />
      ) : null}
      <Button onPress={handleNext} style={styles.button}>
        Continue
      </Button>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        What are your health goals?
      </ThemedText>
      <ThemedText type="body" style={styles.subtitle}>
        Select all that apply. You can change these later.
      </ThemedText>
      <View style={styles.goalsGrid}>
        {healthGoals.map((goal) => (
          <SymptomChip
            key={goal.id}
            label={goal.label}
            selected={selectedGoals.includes(goal.id)}
            onPress={() => toggleGoal(goal.id)}
          />
        ))}
      </View>
      <Button
        onPress={handleNext}
        disabled={selectedGoals.length === 0}
        style={styles.button}
      >
        Continue
      </Button>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        Choose Your View
      </ThemedText>
      <ThemedText type="body" style={styles.subtitle}>
        How would you like to visualize your cycle?
      </ThemedText>

      <View style={styles.viewOptions}>
        <Pressable
          onPress={() => setUseLotusView(true)}
          style={[
            styles.viewOption,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: useLotusView ? theme.primary : theme.border,
              borderWidth: useLotusView ? 2 : 1,
            },
          ]}
        >
          <MiniLotus color={theme.primary} size={60} />
          <ThemedText type="h4">Lotus View</ThemedText>
          <ThemedText type="caption" style={styles.viewDescription}>
            A blooming lotus represents your cycle phases
          </ThemedText>
          {useLotusView ? (
            <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
              <Feather name="check" size={14} color="#FFF" />
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => setUseLotusView(false)}
          style={[
            styles.viewOption,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: !useLotusView ? theme.primary : theme.border,
              borderWidth: !useLotusView ? 2 : 1,
            },
          ]}
        >
          <View style={[styles.wheelPreview, { borderColor: theme.primary }]}>
            <Feather name="circle" size={40} color={theme.primary} />
          </View>
          <ThemedText type="h4">Cycle Wheel</ThemedText>
          <ThemedText type="caption" style={styles.viewDescription}>
            A traditional circular view
          </ThemedText>
          {!useLotusView ? (
            <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
              <Feather name="check" size={14} color="#FFF" />
            </View>
          ) : null}
        </Pressable>
      </View>

      <Button
        onPress={handleComplete}
        disabled={isSaving}
        style={styles.button}
      >
        {isSaving ? "Setting up..." : "Complete Setup"}
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                { backgroundColor: s <= step ? theme.primary : theme.backgroundSecondary },
              ]}
            />
          ))}
        </View>
        <View style={styles.backButton} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing["2xl"],
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Animated Intro styles
  introContainer: {
    flex: 1,
    position: "relative",
  },
  introGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  introContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  logoIconContainer: {
    marginBottom: Spacing.xl,
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  logoInner: {
    width: 40,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#E869A5",
  },
  olannaText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 48,
    color: "#FFFFFF",
    letterSpacing: 2,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  healthText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: 12,
    textAlign: "center",
    marginTop: 4,
    opacity: 0.95,
  },
  taglineContainer: {
    marginTop: SCREEN_HEIGHT * 0.08,
    alignItems: "center",
  },
  taglineText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 28,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 36,
  },
  taglineSubtext: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.85,
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  introButtonContainer: {
    position: "absolute",
    bottom: 60,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  getStartedBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  getStartedBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  
  // Form step styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  stepTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  fieldLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  dateButton: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  viewOptions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  viewOption: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  viewDescription: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 18,
  },
  wheelPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: Spacing.xl,
  },
});
