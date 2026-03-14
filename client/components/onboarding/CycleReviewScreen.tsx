import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { OnboardingGlassCard } from "@/components/onboarding/GlassCard";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { PillSelect } from "@/components/onboarding/PillSelect";
import { AnimatedHeading } from "@/components/onboarding/AnimatedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  CycleRegularity,
  CYCLE_REGULARITY_OPTIONS,
  BRAND_COLORS,
} from "@/constants/onboardingTokens";

import type { ExtractedCycleData } from "@/components/onboarding/ScreenshotImport";

interface ConfirmedData {
  regularity: CycleRegularity | undefined;
  lastPeriodStartDate: string;
  averageCycleLength: number | undefined;
  periodDuration: number | undefined;
  previousPeriodDatesCount: number;
  periodDays: string[];
  previousPeriodDates: string[];
}

interface CycleReviewScreenProps {
  data: ExtractedCycleData;
  onConfirm: (confirmedData: ConfirmedData) => void;
  onReupload: () => void;
}

const LOW_CONFIDENCE_THRESHOLD = 0.6;

function NeedsReviewBadge() {
  return (
    <View style={styles.badge}>
      <Feather name="alert-circle" size={12} color={BRAND_COLORS.hotPink} />
      <ThemedText style={styles.badgeText}>Needs review</ThemedText>
    </View>
  );
}

export function CycleReviewScreen({
  data,
  onConfirm,
  onReupload,
}: CycleReviewScreenProps) {
  const insets = useSafeAreaInsets();
  const formOpacity = useSharedValue(0);

  const [regularity, setRegularity] = useState<CycleRegularity | "">(
    data.regularity || ""
  );
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>(
    data.lastPeriodStartDate
      ? new Date(data.lastPeriodStartDate + "T00:00:00")
      : new Date()
  );
  const [hasSetDate, setHasSetDate] = useState(!!data.lastPeriodStartDate);
  const [avgCycleLength, setAvgCycleLength] = useState(
    data.averageCycleLength?.toString() || ""
  );
  const [periodDuration, setPeriodDuration] = useState(
    data.periodDuration?.toString() || ""
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, []);

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

  const handleConfirm = () => {
    onConfirm({
      regularity: regularity === "" ? undefined : (regularity as CycleRegularity),
      lastPeriodStartDate: hasSetDate
        ? `${lastPeriodDate.getFullYear()}-${String(lastPeriodDate.getMonth() + 1).padStart(2, "0")}-${String(lastPeriodDate.getDate()).padStart(2, "0")}`
        : "",
      averageCycleLength: avgCycleLength ? parseInt(avgCycleLength) : undefined,
      periodDuration: periodDuration ? parseInt(periodDuration) : undefined,
      previousPeriodDatesCount: data.previousPeriodDates.length,
      periodDays: data.periodDays || [],
      previousPeriodDates: data.previousPeriodDates || [],
    });
  };

  return (
    <ScrollView
      style={styles.flex1}
      contentContainerStyle={[
        styles.screenContent,
        {
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.questionSection}>
        <AnimatedHeading
          text="We found some cycle details"
          delay={200}
          style={styles.smallerHeading}
        />
        <ThemedText style={styles.subtitleText}>
          Please review them before continuing.
        </ThemedText>
      </View>

      <Animated.View style={[styles.formSection, formStyle]}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>
              How regular is your cycle?
            </ThemedText>
            {data.confidence.regularity < LOW_CONFIDENCE_THRESHOLD ? (
              <NeedsReviewBadge />
            ) : null}
          </View>
          <PillSelect
            options={CYCLE_REGULARITY_OPTIONS}
            selected={regularity ? [regularity] : []}
            onToggle={(id) => setRegularity(id as CycleRegularity)}
            multiSelect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>
              When did your last period start?
            </ThemedText>
            {data.confidence.lastPeriodStartDate < LOW_CONFIDENCE_THRESHOLD ? (
              <NeedsReviewBadge />
            ) : null}
          </View>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            accessibilityRole="button"
            accessibilityLabel="Select last period date"
          >
            <ThemedText style={styles.dateText}>
              {hasSetDate ? formatDate(lastPeriodDate) : "Select date"}
            </ThemedText>
            <Feather
              name="calendar"
              size={20}
              color={BRAND_COLORS.textSecondary}
            />
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={lastPeriodDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) {
                  setLastPeriodDate(date);
                  setHasSetDate(true);
                }
              }}
              maximumDate={new Date()}
              textColor={BRAND_COLORS.textPrimary}
            />
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>
              Average cycle length (days)
            </ThemedText>
            {data.confidence.averageCycleLength < LOW_CONFIDENCE_THRESHOLD ? (
              <NeedsReviewBadge />
            ) : null}
          </View>
          <OnboardingGlassCard>
            <TextInput
              style={styles.glassInputSmall}
              placeholder="28"
              placeholderTextColor="rgba(45,31,43,0.4)"
              value={avgCycleLength}
              onChangeText={setAvgCycleLength}
              keyboardType="number-pad"
              maxLength={2}
              accessibilityLabel="Enter average cycle length"
            />
          </OnboardingGlassCard>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>
            Period duration (days)
          </ThemedText>
          <OnboardingGlassCard>
            <TextInput
              style={styles.glassInputSmall}
              placeholder="5"
              placeholderTextColor="rgba(45,31,43,0.4)"
              value={periodDuration}
              onChangeText={setPeriodDuration}
              keyboardType="number-pad"
              maxLength={2}
              accessibilityLabel="Enter period duration"
            />
          </OnboardingGlassCard>
        </View>

        {data.previousPeriodDates.length > 0 ? (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Previous cycles detected
            </ThemedText>
            <OnboardingGlassCard>
              <ThemedText style={styles.readOnlyValue}>
                {data.previousPeriodDates.length} period
                {data.previousPeriodDates.length !== 1 ? "s" : ""} found
              </ThemedText>
            </OnboardingGlassCard>
          </View>
        ) : null}
      </Animated.View>

      <View style={styles.bottomActionsScrollable}>
        <PrimaryButton
          label="Confirm and continue"
          onPress={handleConfirm}
          icon="check"
        />
        <PrimaryButton
          label="Re-upload screenshot"
          onPress={onReupload}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  screenContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  questionSection: {
    marginBottom: Spacing.lg,
    gap: 8,
  },
  smallerHeading: {
    fontSize: 28,
    lineHeight: 36,
  },
  subtitleText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: BRAND_COLORS.textSecondary,
    lineHeight: 22,
  },
  formSection: {
    gap: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  inputLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: BRAND_COLORS.textSecondary,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(232,90,156,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: BRAND_COLORS.hotPink,
    letterSpacing: 0.2,
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
  readOnlyValue: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: BRAND_COLORS.textSecondary,
  },
  bottomActionsScrollable: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
    gap: 12,
  },
});
