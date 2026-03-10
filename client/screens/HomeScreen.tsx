/**
 * HomeScreen
 * 
 * Main cycle tracking screen featuring:
 * - Top header with month/year and profile button
 * - Mini week calendar row with gradient date pills
 * - Glass card with cycle wheel and lotus visualization
 * - Phase switcher for demo purposes
 * 
 * Designed for iPhone sizes (390x844 style) with iOS glassmorphism.
 */

import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { AppGradient } from "@/components/AppGradient";
import { CycleWheel } from "@/components/CycleWheel/CycleWheel";
import { PhaseLotus } from "@/components/CycleWheel/PhaseLotus";
import { PhaseExplainerCard } from "@/components/PhaseExplainerCard";
import { Phase, phaseConfig, getPhaseForDay } from "@/constants/phaseConfig";
import { Spacing, ScreenPadding, PillSpacing } from "@/constants/spacing";
import { storage, CycleData, UserProfile } from "@/lib/storage";
import { useLotusCycle } from "@/hooks/useLotusCycle";
import { getEffectiveLastPeriodStart, detectLatePhase } from "@/utils/cycleUtils";
import type { CycleProfile } from "@/types/cycle";
import { toInternalPhase } from "@/types/cycle";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

function toCycleProfile(p: UserProfile): CycleProfile {
  return {
    userId: p.id,
    lastPeriodStartDate: p.lastPeriodStart,
    averageCycleLength: p.cycleLength,
    averagePeriodLength: p.periodLength,
    updatedAt: p.createdAt,
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <View style={styles.weekCalendar}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, idx) => (
          <View key={day} style={styles.weekdayCell}>
            <ThemedText
              style={[
                styles.weekdayLabel,
                isSelected(weekDates[idx]) && styles.weekdayLabelSelected,
              ]}
            >
              {day}
            </ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.datesRow}>
        {weekDates.map((date, idx) => {
          const selected = isSelected(date);
          return (
            <Pressable
              key={idx}
              style={styles.dateCell}
              onPress={() => onSelectDate(date)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${date.toDateString()}`}
            >
              {selected ? (
                <LinearGradient
                  colors={["#FF9EBC", "#FFAB7B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.datePillGradient}
                >
                  <ThemedText style={styles.dateTextSelected}>
                    {date.getDate()}
                  </ThemedText>
                </LinearGradient>
              ) : (
                <View style={styles.datePill}>
                  <ThemedText style={styles.dateText}>
                    {date.getDate()}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getDayForPhase(phase: Phase, cycleLength: number): number {
  switch (phase) {
    case "menstrual": return 3;
    case "follicular": return 10;
    case "ovulation": return 14;
    case "luteal": return 21;
    case "late": return cycleLength;
  }
}


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLate, setIsLate] = useState(false);
  const [daysLate, setDaysLate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [wheelDay, setWheelDay] = useState<number | null>(null);

  const { data, loading: hookLoading } = useLotusCycle(profile?.id || "");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [userProfile, logs] = await Promise.all([
            storage.getUserProfile(),
            storage.getDailyLogs(),
          ]);
          if (!active) return;
          setProfile(userProfile);
          if (userProfile) {
            const cp = toCycleProfile(userProfile);
            const effectiveStart = getEffectiveLastPeriodStart(cp, logs);
            const effectiveProfile: CycleProfile = { ...cp, lastPeriodStartDate: effectiveStart };
            const late = detectLatePhase(effectiveProfile, logs);
            setIsLate(late.isLate);
            setDaysLate(late.daysLate);
          }
        } catch (e) {
          console.error("[HomeScreen] load error:", e);
        } finally {
          setIsLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const cycleData: CycleData | null = data && profile
    ? {
        currentDay: data.currentCycleDay,
        cycleLength: profile.cycleLength,
        periodLength: profile.periodLength,
        lastPeriodStart: profile.lastPeriodStart,
        nextPeriodStart: data.nextPeriodStartDate,
        ovulationDate: data.ovulationDate,
        fertileWindowStart: data.fertileWindowStart,
        fertileWindowEnd: data.fertileWindowEnd,
        phase: isLate ? "late" : toInternalPhase(data.currentPhase),
        cycles: [],
      }
    : null;

  const currentMonth = useMemo(() => {
    return selectedDate.toLocaleString("default", { month: "long", year: "numeric" });
  }, [selectedDate]);

  if (isLoading) {
    return (
      <AppGradient style={styles.fullScreen}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + Spacing.xl }]}>
          <View style={styles.loadingContent}>
            <ThemedText style={styles.loadingTitle}>Olanna Health</ThemedText>
            <ThemedText style={styles.loadingText}>Preparing your cycle...</ThemedText>
          </View>
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

  const rawCurrentDay = wheelDay ?? cycleData.currentDay;
  const currentDay = Math.min(rawCurrentDay, cycleData.cycleLength);
  const pLen = profile?.periodLength || 5;
  const activePhase: Phase = wheelDay 
    ? getPhaseForDay(wheelDay > cycleData.cycleLength ? cycleData.cycleLength : wheelDay, cycleData.cycleLength, pLen) 
    : (cycleData.phase as Phase);
  const config = phaseConfig[activePhase];

  const handleWheelDayChange = (day: number) => {
    setWheelDay(day);
  };

  return (
    <AppGradient style={styles.fullScreen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.monthTitle}>{currentMonth}</ThemedText>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileButton}
            testID="profile-button"
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Feather name="user" size={20} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>

        {/* Week Calendar */}
        <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Main Glass Card */}
        <View style={styles.mainCardWrapper}>
          <BlurView intensity={50} tint="light" style={styles.mainCard}>
            <View style={styles.cardInner}>
              {/* Cycle Wheel with centered content */}
              <CycleWheel
                phase={activePhase}
                currentDay={currentDay}
                cycleLength={cycleData.cycleLength}
                periodLength={pLen}
                onDayChange={handleWheelDayChange}
                interactive={true}
              >
                {/* Center content: Phase info + Lotus BELOW */}
                <View style={styles.centerContent}>
                  <ThemedText style={[styles.phaseTitle, { color: config.labelColor }]}>
                    {config.label}
                  </ThemedText>
                  <ThemedText style={styles.dayNumber}>{currentDay}</ThemedText>
                  <ThemedText style={styles.phaseSubtitle}>{config.subtitle}</ThemedText>
                  <View style={styles.lotusContainer}>
                    <PhaseLotus phase={activePhase} size={80} />
                  </View>
                </View>
              </CycleWheel>

              {/* Day Counter at bottom */}
              <ThemedText style={styles.dayCounterText}>
                {isLate && wheelDay === null
                  ? `Day ${cycleData.cycleLength} + ${daysLate} late`
                  : `Day ${currentDay} of ${cycleData.cycleLength}`
                }
              </ThemedText>
            </View>
          </BlurView>
        </View>

        {/* Phase Explainer */}
        <PhaseExplainerCard phaseId={activePhase === "ovulation" ? "ovulatory" : activePhase === "late" ? "luteal" : activePhase} />

        {/* Reset to Today Button - shown when exploring different days */}
        {wheelDay !== null && wheelDay !== cycleData.currentDay ? (
          <Pressable
            style={styles.resetButton}
            onPress={() => setWheelDay(null)}
            accessibilityLabel="Return to today"
          >
            <Feather name="refresh-cw" size={14} color="rgba(255,255,255,0.8)" />
            <ThemedText style={styles.resetButtonText}>Return to Today</ThemedText>
          </Pressable>
        ) : null}

        {/* Brand Footer */}
        <View style={styles.brandFooter}>
          <ThemedText style={styles.brandName}>OLANNA HEALTH</ThemedText>
        </View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  loadingTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#fff",
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: Spacing.lg,
  },
  monthTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.5,
  },
  profileButton: {
    width: PillSpacing.minTapTarget,
    height: PillSpacing.minTapTarget,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  weekCalendar: {
    width: "100%",
    marginBottom: Spacing.xl,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekdayLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.5,
  },
  weekdayLabelSelected: {
    color: "#FF9EBC",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dateCell: {
    flex: 1,
    alignItems: "center",
  },
  datePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  datePillGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },
  dateTextSelected: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  mainCardWrapper: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  mainCard: {
    borderRadius: 28,
    overflow: "hidden",
  },
  cardInner: {
    padding: Spacing.xl,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  lotusContainer: {
    marginTop: Spacing.sm,
  },
  phaseInfo: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  phaseTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: "Poppins_300Light",
    fontSize: 64,
    color: "rgba(60,50,70,0.9)",
    lineHeight: 72,
  },
  phaseSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(80,60,80,0.7)",
    marginBottom: 4,
  },
  dayCounter: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  dayCounterText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(80,60,80,0.7)",
    marginTop: Spacing.lg,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    marginTop: Spacing.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  resetButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  brandFooter: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  brandName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 3,
  },
});
