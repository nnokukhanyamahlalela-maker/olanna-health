import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BRAND_PINK = "#E83E8C";
const BRAND_PEACH = "#FF6A4D";
const BRAND_LAVENDER = "#D633A6";

type Severity = "none" | "mild" | "moderate" | "severe";

interface Symptom {
  id: string;
  label: string;
}

interface SymptomCategory {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  symptoms: Symptom[];
}

const CATEGORIES: SymptomCategory[] = [
  {
    id: "physical",
    title: "Physical Symptoms",
    icon: "activity",
    color: BRAND_PINK,
    symptoms: [
      { id: "cramps", label: "Cramps" },
      { id: "bloating", label: "Bloating" },
      { id: "breast_tenderness", label: "Breast tenderness" },
      { id: "headaches", label: "Headaches" },
      { id: "fatigue", label: "Fatigue" },
      { id: "acne", label: "Acne or skin breakouts" },
      { id: "back_pain", label: "Lower back pain" },
    ],
  },
  {
    id: "emotional",
    title: "Emotional Symptoms",
    icon: "heart",
    color: BRAND_LAVENDER,
    symptoms: [
      { id: "irritability", label: "Irritability" },
      { id: "mood_swings", label: "Mood swings" },
      { id: "anxiety", label: "Anxiety or tension" },
      { id: "sadness", label: "Sadness or low mood" },
      { id: "crying", label: "Crying spells" },
    ],
  },
  {
    id: "behavioral",
    title: "Behavioral Symptoms",
    icon: "zap",
    color: BRAND_PEACH,
    symptoms: [
      { id: "sleep_changes", label: "Difficulty sleeping" },
      { id: "appetite_changes", label: "Appetite or cravings changes" },
      { id: "concentration", label: "Difficulty concentrating" },
      { id: "social_withdrawal", label: "Wanting to be alone" },
    ],
  },
];

const SEVERITY_OPTIONS: { value: Severity; label: string; score: number; color: string }[] = [
  { value: "none", label: "None", score: 0, color: "#C8D6C5" },
  { value: "mild", label: "Mild", score: 1, color: "#F5D0A9" },
  { value: "moderate", label: "Moderate", score: 2, color: "#F5A9C0" },
  { value: "severe", label: "Severe", score: 3, color: BRAND_PINK },
];

const ALL_SYMPTOM_IDS = CATEGORIES.flatMap((c) => c.symptoms.map((s) => s.id));

interface ResultData {
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: "minimal" | "mild" | "moderate" | "severe";
  topSymptoms: { label: string; severity: Severity }[];
  tips: { icon: keyof typeof Feather.glyphMap; title: string; description: string }[];
}

function getSeverityLevel(percentage: number): ResultData["level"] {
  if (percentage < 15) return "minimal";
  if (percentage < 40) return "mild";
  if (percentage < 65) return "moderate";
  return "severe";
}

function getLevelInfo(level: ResultData["level"]) {
  switch (level) {
    case "minimal":
      return {
        title: "Minimal PMS",
        color: "#6BAF6B",
        description: "Your PMS symptoms are very light. Keep up your healthy habits and continue monitoring any changes.",
      };
    case "mild":
      return {
        title: "Mild PMS",
        color: "#E6A847",
        description: "You are experiencing mild PMS symptoms. Small lifestyle adjustments can help manage them effectively.",
      };
    case "moderate":
      return {
        title: "Moderate PMS",
        color: "#E87D5A",
        description: "Your PMS symptoms are noticeable and may be affecting your daily routine. Targeted self-care can make a real difference.",
      };
    case "severe":
      return {
        title: "Severe PMS",
        color: BRAND_PINK,
        description: "Your symptoms are significant. Consider speaking with a healthcare provider, especially if they impact your daily life. You deserve support.",
      };
  }
}

function getTips(level: ResultData["level"], topSymptomIds: string[]): ResultData["tips"] {
  const tips: ResultData["tips"] = [];

  const hasPhysical = topSymptomIds.some((id) =>
    ["cramps", "bloating", "breast_tenderness", "headaches", "back_pain"].includes(id)
  );
  const hasEmotional = topSymptomIds.some((id) =>
    ["irritability", "mood_swings", "anxiety", "sadness", "crying"].includes(id)
  );
  const hasFatigue = topSymptomIds.includes("fatigue");
  const hasCravings = topSymptomIds.includes("appetite_changes");

  if (hasPhysical) {
    tips.push({
      icon: "droplet",
      title: "Stay hydrated",
      description: "Drink plenty of water and herbal teas. Reduce salt intake to ease bloating and cramps.",
    });
  }

  if (hasEmotional) {
    tips.push({
      icon: "sun",
      title: "Prioritise rest",
      description: "Gentle movement like walking or yoga can boost your mood. Give yourself permission to slow down.",
    });
  }

  if (hasFatigue) {
    tips.push({
      icon: "moon",
      title: "Support your energy",
      description: "Focus on iron-rich foods like spinach and lentils. Aim for consistent sleep times.",
    });
  }

  if (hasCravings) {
    tips.push({
      icon: "coffee",
      title: "Nourish mindfully",
      description: "Choose complex carbs and magnesium-rich snacks like dark chocolate and nuts to manage cravings.",
    });
  }

  tips.push({
    icon: "edit-3",
    title: "Track your patterns",
    description: "Use the daily check-in to log symptoms throughout your cycle. Patterns become clearer over time.",
  });

  if (level === "moderate" || level === "severe") {
    tips.push({
      icon: "user",
      title: "Talk to a professional",
      description: "If symptoms significantly impact your life, consider speaking with a healthcare provider about management options.",
    });
  }

  return tips;
}

function SeverityPill({
  option,
  selected,
  onPress,
}: {
  option: (typeof SEVERITY_OPTIONS)[0];
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scale.value = withSpring(0.92, { damping: 12 }, () => {
            scale.value = withSpring(1);
          });
          onPress();
        }}
        style={[
          styles.severityPill,
          {
            backgroundColor: selected ? option.color : theme.backgroundSecondary + "60",
            borderColor: selected ? option.color : theme.border,
            borderWidth: selected ? 2 : 1,
          },
        ]}
        testID={`severity-${option.value}`}
      >
        <ThemedText
          style={[
            styles.severityPillText,
            { color: selected ? "#FFFFFF" : theme.textSecondary },
          ]}
        >
          {option.label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

function SymptomRow({
  symptom,
  value,
  onChange,
  index,
}: {
  symptom: Symptom;
  value: Severity;
  onChange: (severity: Severity) => void;
  index: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(200).delay(index * 40)}>
      <View style={styles.symptomRow}>
        <ThemedText style={[styles.symptomLabel, { color: theme.text }]}>
          {symptom.label}
        </ThemedText>
        <View style={styles.severityOptions}>
          {SEVERITY_OPTIONS.map((option) => (
            <SeverityPill
              key={option.value}
              option={option}
              selected={value === option.value}
              onPress={() => onChange(option.value)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function ResultsView({ result, onRetake }: { result: ResultData; onRetake: () => void }) {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const levelInfo = getLevelInfo(result.level);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <GlassSurface style={styles.resultHero} tint="prominent">
          <View style={[styles.scoreCircle, { borderColor: levelInfo.color }]}>
            <ThemedText style={[styles.scoreNumber, { color: levelInfo.color }]}>
              {result.totalScore}
            </ThemedText>
            <ThemedText style={[styles.scoreMax, { color: theme.textSecondary }]}>
              /{result.maxScore}
            </ThemedText>
          </View>
          <ThemedText style={[styles.resultLevel, { color: levelInfo.color }]}>
            {levelInfo.title}
          </ThemedText>
          <ThemedText style={[styles.resultDesc, { color: theme.textSecondary }]}>
            {levelInfo.description}
          </ThemedText>
        </GlassSurface>
      </Animated.View>

      {result.topSymptoms.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(300).delay(150)}>
          <ThemedText style={[styles.resultSectionTitle, { color: theme.text }]}>
            Your Top Symptoms
          </ThemedText>
          <GlassSurface style={styles.topSymptomsCard}>
            {result.topSymptoms.map((s, i) => {
              const severityOption = SEVERITY_OPTIONS.find((o) => o.value === s.severity);
              return (
                <View key={i} style={styles.topSymptomRow}>
                  <View style={[styles.topSymptomDot, { backgroundColor: severityOption?.color || theme.primary }]} />
                  <ThemedText style={[styles.topSymptomLabel, { color: theme.text }]}>
                    {s.label}
                  </ThemedText>
                  <ThemedText style={[styles.topSymptomSeverity, { color: severityOption?.color || theme.textSecondary }]}>
                    {s.severity}
                  </ThemedText>
                </View>
              );
            })}
          </GlassSurface>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.duration(300).delay(300)}>
        <ThemedText style={[styles.resultSectionTitle, { color: theme.text }]}>
          Recommendations
        </ThemedText>
        {result.tips.map((tip, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(200).delay(350 + i * 80)}>
            <GlassSurface style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: BRAND_PINK + "15" }]}>
                <Feather name={tip.icon} size={18} color={BRAND_PINK} />
              </View>
              <View style={styles.tipContent}>
                <ThemedText style={[styles.tipTitle, { color: theme.text }]}>
                  {tip.title}
                </ThemedText>
                <ThemedText style={[styles.tipDesc, { color: theme.textSecondary }]}>
                  {tip.description}
                </ThemedText>
              </View>
            </GlassSurface>
          </Animated.View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(300).delay(600)}>
        <GlassSurface style={styles.disclaimerCard}>
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            This assessment is for informational purposes only and does not replace professional medical advice. If you experience severe or worsening symptoms, please consult a healthcare provider.
          </ThemedText>
        </GlassSurface>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(300).delay(700)}>
        <Pressable
          onPress={onRetake}
          style={({ pressed }) => [styles.retakeButton, { opacity: pressed ? 0.8 : 1 }]}
          testID="button-retake-pms"
        >
          <Feather name="refresh-cw" size={18} color={BRAND_PINK} />
          <ThemedText style={[styles.retakeText, { color: BRAND_PINK }]}>
            Retake Assessment
          </ThemedText>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

export default function PMSCheckerScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [ratings, setRatings] = useState<Record<string, Severity>>(() => {
    const initial: Record<string, Severity> = {};
    ALL_SYMPTOM_IDS.forEach((id) => (initial[id] = "none"));
    return initial;
  });
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [result, setResult] = useState<ResultData | null>(null);

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const isLastCategory = currentCategoryIndex === CATEGORIES.length - 1;
  const allRated = currentCategory.symptoms.every((s) => ratings[s.id] !== undefined);

  const handleRate = (symptomId: string, severity: Severity) => {
    setRatings((prev) => ({ ...prev, [symptomId]: severity }));
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLastCategory) {
      calculateResults();
    } else {
      setCurrentCategoryIndex((prev) => prev + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleBack = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    const maxScore = ALL_SYMPTOM_IDS.length * 3;
    const symptomScores: { id: string; label: string; severity: Severity; score: number }[] = [];

    CATEGORIES.forEach((cat) => {
      cat.symptoms.forEach((s) => {
        const severity = ratings[s.id] || "none";
        const score = SEVERITY_OPTIONS.find((o) => o.value === severity)?.score || 0;
        totalScore += score;
        if (score > 0) {
          symptomScores.push({ id: s.id, label: s.label, severity, score });
        }
      });
    });

    const percentage = (totalScore / maxScore) * 100;
    const level = getSeverityLevel(percentage);

    symptomScores.sort((a, b) => b.score - a.score);
    const topSymptoms = symptomScores.slice(0, 5).map((s) => ({
      label: s.label,
      severity: s.severity,
    }));

    const topIds = symptomScores.slice(0, 5).map((s) => s.id);
    const tips = getTips(level, topIds);

    setResult({ totalScore, maxScore, percentage, level, topSymptoms, tips });
  };

  const handleRetake = () => {
    const initial: Record<string, Severity> = {};
    ALL_SYMPTOM_IDS.forEach((id) => (initial[id] = "none"));
    setRatings(initial);
    setCurrentCategoryIndex(0);
    setResult(null);
  };

  if (result) {
    return (
      <AppGradient style={styles.container}>
        <ResultsView result={result} onRetake={handleRetake} />
      </AppGradient>
    );
  }

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)} key={`header-${currentCategoryIndex}`}>
          <View style={styles.progressBar}>
            {CATEGORIES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: i <= currentCategoryIndex ? BRAND_PINK : theme.border,
                    flex: 1,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconWrap, { backgroundColor: currentCategory.color + "18" }]}>
              <Feather name={currentCategory.icon} size={24} color={currentCategory.color} />
            </View>
            <ThemedText type="h3" style={styles.categoryTitle}>
              {currentCategory.title}
            </ThemedText>
            <ThemedText style={[styles.categorySubtitle, { color: theme.textSecondary }]}>
              Rate each symptom based on your experience during your premenstrual days
            </ThemedText>
          </View>
        </Animated.View>

        <View style={styles.symptomsList}>
          {currentCategory.symptoms.map((symptom, index) => (
            <SymptomRow
              key={symptom.id}
              symptom={symptom}
              value={ratings[symptom.id]}
              onChange={(severity) => handleRate(symptom.id, severity)}
              index={index}
            />
          ))}
        </View>

        <View style={styles.navRow}>
          {currentCategoryIndex > 0 ? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1, borderColor: theme.border }]}
              testID="button-pms-back"
            >
              <Feather name="chevron-left" size={18} color={theme.textSecondary} />
              <ThemedText style={[styles.backBtnText, { color: theme.textSecondary }]}>
                Back
              </ThemedText>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.9 : 1 }]}
            testID="button-pms-next"
          >
            <ThemedText style={styles.nextBtnText}>
              {isLastCategory ? "See Results" : "Next"}
            </ThemedText>
            <Feather name={isLastCategory ? "check" : "chevron-right"} size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBar: {
    flexDirection: "row",
    gap: 6,
    marginBottom: Spacing.xl,
  },
  progressSegment: {
    height: 4,
    borderRadius: 2,
  },
  categoryHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  categoryTitle: {
    textAlign: "center",
  },
  categorySubtitle: {
    textAlign: "center",
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  symptomsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  symptomRow: {
    gap: Spacing.sm,
  },
  symptomLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  severityOptions: {
    flexDirection: "row",
    gap: 8,
  },
  severityPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  severityPillText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 12,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  backBtnText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 14,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: BorderRadius.pill,
    backgroundColor: BRAND_PINK,
  },
  nextBtnText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  resultHero: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontFamily: Fonts.heading,
    fontSize: 32,
  },
  scoreMax: {
    fontFamily: Fonts.body,
    fontSize: 14,
    marginTop: -4,
  },
  resultLevel: {
    fontFamily: Fonts.heading,
    fontSize: 22,
  },
  resultDesc: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: Spacing.sm,
  },
  resultSectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  topSymptomsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  topSymptomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  topSymptomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topSymptomLabel: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  topSymptomSeverity: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 13,
    textTransform: "capitalize",
  },
  tipCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  tipTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  tipDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    alignItems: "flex-start",
    marginTop: Spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  retakeText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
});
