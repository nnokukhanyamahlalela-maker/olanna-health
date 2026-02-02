/**
 * CycleScreen
 * 
 * Main cycle tracking screen featuring:
 * - Top header with month/year and profile button
 * - Mini week calendar row with gradient date pills
 * - Glass card with cycle wheel and lotus visualization
 * - Phase switcher for demo purposes
 * 
 * Designed for iPhone sizes (390x844 style) with iOS glassmorphism.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { CycleWheel } from "@/components/CycleWheel/CycleWheel";
import { PhaseLotus } from "@/components/CycleWheel/PhaseLotus";
import { Phase, phaseConfig, systemFontStack } from "@/constants/phaseConfig";
import { AppGradient } from "@/components/AppGradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PHASES: Phase[] = ["menstrual", "follicular", "ovulation", "luteal"];

interface CycleScreenProps {
  initialPhase?: Phase;
  currentDay?: number;
  cycleLength?: number;
}

export function CycleScreen({
  initialPhase = "follicular",
  currentDay: propDay,
  cycleLength = 28,
}: CycleScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [selectedPhase, setSelectedPhase] = useState<Phase>(initialPhase);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate current day based on phase for demo
  const currentDay = propDay || getDayForPhase(selectedPhase, cycleLength);
  const config = phaseConfig[selectedPhase];

  // Get current week dates
  const weekDates = getWeekDates(selectedDate);
  const today = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <AppGradient>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.monthYear}>
              {months[today.getMonth()]} {today.getFullYear()}
            </Text>
          </View>
          <Pressable
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile" as never)}
            accessibilityLabel="Go to profile"
          >
            <Feather name="user" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Mini Week Calendar */}
        <View style={styles.weekCalendar}>
          {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            return (
              <Pressable
                key={index}
                style={styles.dayColumn}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                  {days[index]}
                </Text>
                {isSelected ? (
                  <LinearGradient
                    colors={["#FF9EBC", "#FFAB7B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.selectedDatePill}
                  >
                    <Text style={styles.selectedDateText}>{date.getDate()}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.datePill}>
                    <Text style={[styles.dateText, isToday && styles.todayDate]}>
                      {date.getDate()}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Main Glass Card */}
        <View style={styles.cardWrapper}>
          <BlurView intensity={30} tint="light" style={styles.glassCard}>
            <View style={styles.cardInner}>
              {/* Cycle Wheel with Lotus */}
              <CycleWheel
                phase={selectedPhase}
                currentDay={currentDay}
                cycleLength={cycleLength}
              >
                <PhaseLotus phase={selectedPhase} size={70} />
              </CycleWheel>

              {/* Phase Info */}
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseLabel}>{config.label}</Text>
                <Text style={styles.dayNumber}>Day {currentDay}</Text>
                <Text style={styles.phaseSubtitle}>{config.subtitle}</Text>
                <Text style={styles.cycleProgress}>
                  Day {currentDay} of {cycleLength}
                </Text>
              </View>

              {/* Brand Footer */}
              <Text style={styles.brandFooter}>OLANNA HEALTH</Text>
            </View>
          </BlurView>
        </View>

        {/* Demo Phase Switcher */}
        <View style={styles.phaseSwitcher}>
          <Text style={styles.switcherLabel}>SWITCH PHASE (DEMO)</Text>
          <View style={styles.switcherPills}>
            {PHASES.map((phase) => (
              <Pressable
                key={phase}
                style={[
                  styles.phasePill,
                  selectedPhase === phase && styles.phasePillActive,
                  { backgroundColor: phaseConfig[phase].accentColor + (selectedPhase === phase ? "FF" : "40") }
                ]}
                onPress={() => setSelectedPhase(phase)}
              >
                <Text
                  style={[
                    styles.phasePillText,
                    selectedPhase === phase && styles.phasePillTextActive
                  ]}
                >
                  {phase.slice(0, 3).toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppGradient>
  );
}

// Helper functions
function getWeekDates(date: Date): Date[] {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getDayForPhase(phase: Phase, cycleLength: number): number {
  switch (phase) {
    case "menstrual":
      return 3;
    case "follicular":
      return 10;
    case "ovulation":
      return 14;
    case "luteal":
      return 21;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  monthYear: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  weekCalendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  todayLabel: {
    color: "#FFFFFF",
  },
  datePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDatePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  todayDate: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardWrapper: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
  },
  glassCard: {
    borderRadius: 28,
    overflow: "hidden",
  },
  cardInner: {
    padding: 28,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  phaseInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: "300",
    color: "#FFFFFF",
    marginVertical: 4,
  },
  phaseSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
    marginBottom: 8,
  },
  cycleProgress: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
  },
  brandFooter: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 3,
    marginTop: 24,
  },
  phaseSwitcher: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  switcherLabel: {
    fontSize: 11,
    fontWeight: "600",
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
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
  },
  phasePillTextActive: {
    color: "#FFFFFF",
  },
});

export default CycleScreen;
