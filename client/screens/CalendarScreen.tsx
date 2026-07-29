import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { LannaMascot } from "@/components/LannaMascot";
import { phase as phaseTokens } from "@/constants/colors";
import { storage, DailyLog, UserProfile } from "@/lib/storage";
import { Phase, getPhaseForDay, phaseConfig } from "@/constants/phaseConfig";
import type { CyclePhase, CycleProfile } from "@/types/cycle";
import {
  generateCalendarMarkers,
  computeCycleDay,
  computePhase,
  computeRawDaysSince,
  getEffectiveLastPeriodStart,
  detectLatePhase,
} from "@/utils/cycleUtils";
import { PeriodLogSheet } from "@/components/PeriodLogSheet";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = 20;
const DAY_GAP = 4;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - H_PAD * 2 - DAY_GAP * 6) / 7);

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS = ["S","M","T","W","T","F","S"];

const BG = "#FDF5F8";
const TEXT_DARK = "#2D1F2B";
const TEXT_SOFT = "#8A6F80";

// Phase dot colors
const PHASE_COLORS: Record<string, string> = {
  Menstrual: "#F06B9A",
  Follicular: "#D178B3",
  Ovulatory: "#DE73DE",
  "Ovulation": "#DE73DE",
  Luteal: "#C9A0DC",
  "Late Luteal": "#C9A0DC",
};

// Phase legend
const LEGEND = [
  { label: "Menstrual", color: "#F06B9A" },
  { label: "Follicular", color: "#D178B3" },
  { label: "Ovulatory", color: "#DE73DE" },
  { label: "Luteal", color: "#C9A0DC" },
];

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toCycleProfile(p: UserProfile): CycleProfile {
  return {
    userId: p.id,
    lastPeriodStartDate: p.lastPeriodStart,
    averageCycleLength: p.cycleLength,
    averagePeriodLength: p.periodLength,
    updatedAt: p.createdAt,
  };
}

// Phase text color for the selected day card label
function phaseDisplayName(phase: CyclePhase): string {
  if (phase === "Ovulatory" || (phase as string) === "Ovulation") return "Ovulatory";
  return phase as string;
}

function phaseToInternal(phase: CyclePhase): Phase {
  const map: Record<string, Phase> = {
    Menstrual: "menstrual",
    Follicular: "follicular",
    Ovulatory: "ovulation",
    Ovulation: "ovulation",
    Luteal: "luteal",
    "Late Luteal": "late",
  };
  return map[phase as string] ?? "follicular";
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const today = new Date();
  const todayKey = formatDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [periodSheetVisible, setPeriodSheetVisible] = useState(false);

  const selectedLog = useMemo(
    () => dailyLogs.find((l) => l.date === selectedDate) ?? null,
    [dailyLogs, selectedDate]
  );

  const loadData = useCallback(async () => {
    try {
      const [userProfile, logs] = await Promise.all([
        storage.getUserProfile(),
        storage.getDailyLogs(),
      ]);
      setProfile(userProfile);
      setDailyLogs(logs);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const calendarMarkers = useMemo(() => {
    if (!profile) return [];
    return generateCalendarMarkers(viewYear, viewMonth, toCycleProfile(profile), dailyLogs);
  }, [viewYear, viewMonth, profile, dailyLogs]);

  // Build a map of dateKey -> phase color
  const phaseDotMap = useMemo(() => {
    const map: Record<string, string> = {};
    calendarMarkers.forEach((m) => {
      map[m.dateKey] = PHASE_COLORS[m.phase as string] ?? "#D178B3";
    });
    return map;
  }, [calendarMarkers]);

  const selectedDayInfo = useMemo(() => {
    if (!selectedDate || !profile) return null;
    const cp = toCycleProfile(profile);
    const effectiveStart = getEffectiveLastPeriodStart(cp, dailyLogs);
    const date = new Date(selectedDate + "T12:00:00");
    const dayInCycle = computeCycleDay(date, effectiveStart, profile.cycleLength);
    if (dayInCycle <= 0) return null;

    const rawDays = computeRawDaysSince(date, effectiveStart);
    const late = detectLatePhase(cp, dailyLogs);
    const isLate = rawDays > profile.cycleLength && selectedDate === todayKey && late.isLate;

    const marker = calendarMarkers.find((m) => m.dateKey === selectedDate);
    const phase = marker?.phase ?? "Follicular";

    return { dayInCycle, cycleLength: profile.cycleLength, phase: phase as CyclePhase, isLate };
  }, [selectedDate, profile, dailyLogs, calendarMarkers]);

  const navigateMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedInternalPhase = selectedDayInfo
    ? phaseToInternal(selectedDayInfo.phase)
    : "follicular";
  const selectedConfig = phaseConfig[selectedInternalPhase];
  const selectedPhaseColor = selectedConfig.front;

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: tabBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable onPress={() => navigateMonth(-1)} style={styles.navBtn}>
            <Text style={styles.navArrow}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          <Pressable onPress={() => navigateMonth(1)} style={styles.navBtn}>
            <Text style={styles.navArrow}>›</Text>
          </Pressable>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d, i) => (
            <View key={i} style={styles.weekdayCell}>
              <Text style={styles.weekdayLabel}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Day grid */}
        <View style={styles.dayGrid}>
          {cells.map((d, i) => {
            if (!d) return <View key={`empty-${i}`} style={styles.dayCell} />;
            const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate;
            const phaseColor = phaseDotMap[dateKey];

            return (
              <Pressable
                key={dateKey}
                style={styles.dayCell}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDate(dateKey);
                }}
              >
                <View
                  style={[
                    styles.dayCellInner,
                    phaseColor && { backgroundColor: phaseColor + "33" },
                    isSelected && phaseColor && { backgroundColor: phaseColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isToday && !isSelected && { color: "#F06B9A", fontWeight: "700" },
                      isSelected && { color: "#FFFFFF", fontWeight: "700" },
                    ]}
                  >
                    {d}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {LEGEND.map((p) => (
            <View key={p.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: p.color }]} />
              <Text style={styles.legendLabel}>{p.label}</Text>
            </View>
          ))}
        </View>

        {/* Selected day card */}
        {selectedDate && selectedDayInfo && (
          <View style={[styles.selectedCard, { backgroundColor: selectedConfig.bg + "CC" }]}>
            <View style={styles.selectedCardLeft}>
              <LannaMascot phase={selectedInternalPhase} size={56} />
            </View>
            <View style={styles.selectedCardRight}>
              <Text style={styles.selectedDateLabel}>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
              <Text style={[styles.selectedPhaseLabel, { color: selectedPhaseColor }]}>
                {phaseDisplayName(selectedDayInfo.phase)} phase
              </Text>
              <Text style={styles.selectedCycleDay}>
                Cycle day {selectedDayInfo.dayInCycle} of {selectedDayInfo.cycleLength}
              </Text>
              <Pressable
                style={[styles.logDayBtn, { backgroundColor: selectedPhaseColor }]}
                onPress={() => setPeriodSheetVisible(true)}
              >
                <Text style={styles.logDayBtnText}>Log this day</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <PeriodLogSheet
        visible={periodSheetVisible}
        date={selectedDate ?? todayKey}
        existingLog={selectedLog}
        onSave={() => { setPeriodSheetVisible(false); loadData(); }}
        onDismiss={() => { setPeriodSheetVisible(false); loadData(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: H_PAD, gap: 12 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, color: TEXT_DARK, lineHeight: 28 },
  monthTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayCell: {
    width: DAY_SIZE,
    alignItems: "center",
    marginHorizontal: DAY_GAP / 2,
  },
  weekdayLabel: { fontSize: 12, color: TEXT_SOFT, fontWeight: "500" },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    marginHorizontal: DAY_GAP / 2,
    marginVertical: DAY_GAP / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellInner: {
    width: DAY_SIZE - 4,
    height: DAY_SIZE - 4,
    borderRadius: (DAY_SIZE - 4) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: { fontSize: 13, color: TEXT_DARK },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: TEXT_SOFT },
  selectedCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginTop: 4,
  },
  selectedCardLeft: { alignItems: "center", justifyContent: "center" },
  selectedCardRight: { flex: 1, gap: 4 },
  selectedDateLabel: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  selectedPhaseLabel: { fontSize: 13, fontWeight: "600" },
  selectedCycleDay: { fontSize: 12, color: TEXT_SOFT },
  logDayBtn: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  logDayBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
