import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Lotus } from "@/components/Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { storage } from "@/lib/storage";

const BRAND_PINK = "#F6A9D2";

interface CalculationResult {
  nextPeriod: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CycleCalculatorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const [lastPeriodDate, setLastPeriodDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [result, setResult] = useState<CalculationResult | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const profile = await storage.getUserProfile();
        if (profile) {
          setLastPeriodDate(new Date(profile.lastPeriodStart));
          setCycleLength(String(profile.cycleLength));
          setPeriodLength(String(profile.periodLength));
        }
      };
      loadProfile();
    }, [])
  );

  const calculate = () => {
    const cycleDays = parseInt(cycleLength) || 28;
    const ovulationDay = cycleDays - 14;
    
    const nextPeriod = addDays(lastPeriodDate, cycleDays);
    const ovulationDate = addDays(lastPeriodDate, ovulationDay);
    const fertileWindowStart = addDays(ovulationDate, -5);
    const fertileWindowEnd = addDays(ovulationDate, 1);

    setResult({
      nextPeriod,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      daysUntilPeriod: getDaysUntil(nextPeriod),
      daysUntilOvulation: getDaysUntil(ovulationDate),
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setLastPeriodDate(selectedDate);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.lotusHeader}>
            <Lotus phase="ovulation" size={60} color={BRAND_PINK} />
          </View>
          <ThemedText type="h2" style={styles.title}>
            Cycle Calculator
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Predict your next period and fertile window based on your cycle
          </ThemedText>
        </View>

        <View style={[styles.inputCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.inputRow}>
            <ThemedText type="body" style={styles.inputLabel}>Last Period Start</ThemedText>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[styles.dateButton, { backgroundColor: theme.background }]}
            >
              <Feather name="calendar" size={18} color={theme.text} />
              <ThemedText type="body">
                {lastPeriodDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </ThemedText>
            </Pressable>
          </View>

          {showDatePicker ? (
            <DateTimePicker
              value={lastPeriodDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          ) : null}

          <View style={styles.inputRow}>
            <ThemedText type="body" style={styles.inputLabel}>Average Cycle Length</ThemedText>
            <View style={styles.numberInputRow}>
              <TextInput
                value={cycleLength}
                onChangeText={setCycleLength}
                keyboardType="number-pad"
                style={[
                  styles.numberInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                maxLength={2}
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>days</ThemedText>
            </View>
          </View>

          <View style={styles.inputRow}>
            <ThemedText type="body" style={styles.inputLabel}>Period Length</ThemedText>
            <View style={styles.numberInputRow}>
              <TextInput
                value={periodLength}
                onChangeText={setPeriodLength}
                keyboardType="number-pad"
                style={[
                  styles.numberInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                maxLength={2}
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>days</ThemedText>
            </View>
          </View>

          <Button onPress={calculate} style={styles.calculateButton}>
            Calculate
          </Button>
        </View>

        {result ? (
          <View style={styles.resultsSection}>
            <ThemedText type="h3" style={styles.resultsTitle}>Your Predictions</ThemedText>
            
            <View style={[styles.resultCard, { backgroundColor: BRAND_PINK + "20" }]}>
              <View style={styles.resultIcon}>
                <Lotus phase="menstrual" size={36} color={BRAND_PINK} />
              </View>
              <View style={styles.resultContent}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Next Period
                </ThemedText>
                <ThemedText type="h3">{formatDate(result.nextPeriod)}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {result.daysUntilPeriod > 0
                    ? `In ${result.daysUntilPeriod} days`
                    : result.daysUntilPeriod === 0
                    ? "Today"
                    : "Passed"}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.resultCard, { backgroundColor: "#C9A24D20" }]}>
              <View style={styles.resultIcon}>
                <Lotus phase="ovulation" size={36} color="#C9A24D" />
              </View>
              <View style={styles.resultContent}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Ovulation Day
                </ThemedText>
                <ThemedText type="h3">{formatDate(result.ovulationDate)}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {result.daysUntilOvulation > 0
                    ? `In ${result.daysUntilOvulation} days`
                    : result.daysUntilOvulation === 0
                    ? "Today"
                    : "Passed"}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.resultCard, { backgroundColor: "#A8BFA520" }]}>
              <View style={styles.resultIcon}>
                <Lotus phase="follicular" size={36} color="#A8BFA5" />
              </View>
              <View style={styles.resultContent}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Fertile Window
                </ThemedText>
                <ThemedText type="h3">
                  {formatDate(result.fertileWindowStart)} - {formatDate(result.fertileWindowEnd)}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  6 days of peak fertility
                </ThemedText>
              </View>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="info" size={18} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }}>
                These predictions are based on the calendar method and assume regular cycles. 
                For more accurate tracking, log your symptoms daily.
              </ThemedText>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  lotusHeader: {
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 280,
  },
  inputCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputRow: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  numberInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  numberInput: {
    width: 60,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: Fonts.body,
    textAlign: "center",
  },
  calculateButton: {
    marginTop: Spacing.md,
  },
  resultsSection: {
    gap: Spacing.md,
  },
  resultsTitle: {
    marginBottom: Spacing.sm,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  resultIcon: {
    width: 50,
    alignItems: "center",
  },
  resultContent: {
    flex: 1,
    gap: 2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
});
