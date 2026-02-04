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

import React, { useState, useEffect, useMemo } from "react";
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
import { Phase, phaseConfig } from "@/constants/phaseConfig";
import { Spacing, ScreenPadding, PillSpacing } from "@/constants/spacing";
import { storage, CycleData, UserProfile, calculateCycleData } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const PHASES: Phase[] = ["menstrual", "follicular", "ovulation", "luteal"];

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
  }
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [demoPhase, setDemoPhase] = useState<Phase | null>(null);

  const currentMonth = useMemo(() => {
    return selectedDate.toLocaleString("default", { month: "long", year: "numeric" });
  }, [selectedDate]);

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

  const activePhase = demoPhase || (cycleData.phase as Phase);
  const currentDay = demoPhase 
    ? getDayForPhase(demoPhase, cycleData.cycleLength)
    : cycleData.currentDay;
  const config = phaseConfig[activePhase];

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
                Day {currentDay} of {cycleData.cycleLength}
              </ThemedText>
            </View>
          </BlurView>
        </View>

        {/* Phase Explainer */}
        <PhaseExplainerCard phaseId={activePhase === "ovulation" ? "ovulatory" : activePhase} />

        {/* Demo Phase Switcher */}
        <View style={styles.phaseSwitcher}>
          <ThemedText style={styles.switcherLabel}>SWITCH PHASE (DEMO)</ThemedText>
          <View style={styles.switcherPills}>
            {PHASES.map((phase) => {
              const isActive = activePhase === phase;
              return (
                <Pressable
                  key={phase}
                  style={[
                    styles.phasePill,
                    isActive && styles.phasePillActive,
                    { backgroundColor: phaseConfig[phase].accentColor + (isActive ? "FF" : "40") }
                  ]}
                  onPress={() => setDemoPhase(phase)}
                  accessibilityLabel={`Switch to ${phase} phase`}
                >
                  <ThemedText
                    style={[
                      styles.phasePillText,
                      isActive && styles.phasePillTextActive
                    ]}
                  >
                    {phase.slice(0, 3).toUpperCase()}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

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
  phaseSwitcher: {
    width: "100%",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  switcherLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  switcherPills: {
    flexDirection: "row",
    gap: 10,
  },
  phasePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  phasePillActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  phasePillText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
  },
  phasePillTextActive: {
    color: "#FFFFFF",
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
