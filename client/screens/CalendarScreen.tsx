import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { LotusIcon } from "@/components/LotusIcon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";
import { brand, neutral, phase as phaseTokens } from "@/constants/colors";
import { storage, DailyLog, UserProfile, getEffectiveLastPeriodStart } from "@/lib/storage";
import { getPhaseForDay, phaseConfig, Phase } from "@/constants/phaseConfig";
import { PeriodLogSheet } from "@/components/PeriodLogSheet";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - 80) / 7);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type FilterType = "all" | "period" | "fertile" | "pms";

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

interface DayCellInfo {
  day: number;
  dateKey: string;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPMS: boolean;
  isToday: boolean;
  phase: Phase;
  dayInCycle: number;
  hasFlowLog: boolean;
}

const PHASE_DECODE: Record<Phase, { title: string; body: string; tip: string }> = {
  menstrual: {
    title: "Menstrual Phase",
    body: "Your body is shedding the uterine lining. Hormone levels are at their lowest. You may feel tired or experience cramping. This is a time for rest and gentle self-care.",
    tip: "Warm drinks, light stretching, and extra sleep can ease discomfort.",
  },
  follicular: {
    title: "Follicular Phase",
    body: "Oestrogen is rising as your body prepares a new egg. Energy levels climb and mood tends to lift. Skin often looks clearer and you may feel more sociable and creative.",
    tip: "Great time for trying new activities, planning, and social events.",
  },
  ovulation: {
    title: "Ovulatory Phase",
    body: "An egg is released from the ovary. Oestrogen peaks and you may feel your most confident and energetic. This is your fertile window if you are trying to conceive.",
    tip: "Channel your peak energy into workouts, presentations, or big conversations.",
  },
  luteal: {
    title: "Luteal Phase",
    body: "Progesterone rises to prepare for possible pregnancy. You may notice PMS symptoms like bloating, mood shifts, or cravings as the phase progresses.",
    tip: "Prioritise comfort foods, journalling, and winding down routines.",
  },
};

export default function CalendarScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const today = new Date();
  const todayKey = formatDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [periodSheetVisible, setPeriodSheetVisible] = useState(false);

  const loadData = useCallback(async () => {
    const [userProfile, logs] = await Promise.all([
      storage.getUserProfile(),
      storage.getDailyLogs(),
    ]);
    console.log("[Calendar] Loaded", logs.length, "daily logs, flow logs:", logs.filter((l: DailyLog) => l.flow).map((l: DailyLog) => l.date));
    setProfile(userProfile);
    setDailyLogs(logs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const navigateMonth = (delta: number) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const effectiveStart = useMemo(() => {
    if (!profile) return null;
    return getEffectiveLastPeriodStart(profile, dailyLogs);
  }, [profile, dailyLogs]);

  const getDayInCycle = useCallback(
    (date: Date): number => {
      if (!profile || !effectiveStart) return -1;
      const lastPeriodStart = new Date(effectiveStart);
      const diffTime = date.getTime() - lastPeriodStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return -1;
      return (diffDays % profile.cycleLength) + 1;
    },
    [profile, effectiveStart]
  );

  const flowLogDates = useMemo(() => {
    const set = new Set<string>();
    dailyLogs.forEach((log) => {
      if (log.flow) set.add(log.date);
    });
    return set;
  }, [dailyLogs]);

  const calendarDays: (DayCellInfo | null)[] = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: (DayCellInfo | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    const cycleLength = profile?.cycleLength || 28;
    const periodLength = profile?.periodLength || 5;
    const ovulationDay = cycleLength - 14;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateKey = formatDateKey(date);
      const dayInCycle = getDayInCycle(date);
      const hasFlowLog = flowLogDates.has(dateKey);

      const isPeriod = hasFlowLog || (dayInCycle > 0 && dayInCycle <= periodLength);
      const isFertile =
        dayInCycle > 0 &&
        dayInCycle >= ovulationDay - 5 &&
        dayInCycle <= ovulationDay + 1;
      const isOvulation = dayInCycle > 0 && dayInCycle === ovulationDay;
      const isPMS =
        dayInCycle > 0 &&
        dayInCycle > cycleLength - 7 &&
        dayInCycle <= cycleLength;
      const isToday = dateKey === todayKey;
      const phase =
        hasFlowLog ? "menstrual" :
        dayInCycle > 0 ? getPhaseForDay(dayInCycle, cycleLength, periodLength) : "follicular";

      cells.push({
        day: d,
        dateKey,
        isPeriod,
        isFertile,
        isOvulation,
        isPMS,
        isToday,
        phase: phase as Phase,
        dayInCycle,
        hasFlowLog,
      });
    }

    return cells;
  }, [viewYear, viewMonth, profile, getDayInCycle, todayKey, flowLogDates]);

  const selectedDayInfo = useMemo(() => {
    if (!selectedDate) return null;
    const hasFlow = flowLogDates.has(selectedDate);
    if (!profile) {
      if (hasFlow) return { dayInCycle: 1, cycleLength: 28, phase: "menstrual" as Phase, hasProfile: false };
      return { dayInCycle: 0, cycleLength: 28, phase: "follicular" as Phase, hasProfile: false };
    }
    const date = new Date(selectedDate + "T12:00:00");
    const dayInCycle = getDayInCycle(date);
    if (dayInCycle <= 0) {
      if (hasFlow) return { dayInCycle: 1, cycleLength: profile.cycleLength, phase: "menstrual" as Phase, hasProfile: true };
      return { dayInCycle: 0, cycleLength: profile.cycleLength, phase: "follicular" as Phase, hasProfile: true };
    }
    const cycleLength = profile.cycleLength;
    const pLength = profile.periodLength || 5;
    const p = hasFlow ? "menstrual" : getPhaseForDay(dayInCycle, cycleLength, pLength);
    return { dayInCycle, cycleLength, phase: p as Phase, hasProfile: true };
  }, [selectedDate, profile, getDayInCycle, flowLogDates]);

  const selectedLog = selectedDate
    ? dailyLogs.find((log) => log.date === selectedDate)
    : null;

  const getDayBgColor = (info: DayCellInfo): string | undefined => {
    if (filter !== "all") {
      if (filter === "period" && info.isPeriod)
        return phaseTokens.menstrual.solid;
      if (filter === "fertile" && (info.isFertile || info.isOvulation))
        return phaseTokens.ovulatory.solid;
      if (filter === "pms" && info.isPMS) return phaseTokens.luteal.solid;
      return undefined;
    }
    if (info.isPeriod) return phaseTokens.menstrual.solid;
    if (info.isOvulation) return phaseTokens.ovulatory.solid;
    if (info.isFertile) return phaseTokens.ovulatory.softBg;
    if (info.isPMS) return phaseTokens.luteal.softBg;
    return undefined;
  };

  const getDayDotColor = (info: DayCellInfo): string | undefined => {
    if (filter !== "all") {
      if (filter === "period" && info.isPeriod) return phaseTokens.menstrual.solid;
      if (filter === "fertile" && info.isOvulation) return phaseTokens.ovulatory.solid;
      if (filter === "fertile" && info.isFertile) return phaseTokens.ovulatory.softBg;
      if (filter === "pms" && info.isPMS) return phaseTokens.luteal.solid;
      return undefined;
    }
    if (info.isPeriod) return phaseTokens.menstrual.solid;
    if (info.isOvulation) return phaseTokens.ovulatory.solid;
    if (info.isFertile) return phaseTokens.ovulatory.gradientStart;
    if (info.isPMS) return phaseTokens.luteal.solid;
    return undefined;
  };

  const shouldShow = (info: DayCellInfo): boolean => {
    if (filter === "all") return true;
    if (filter === "period") return info.isPeriod;
    if (filter === "fertile") return info.isFertile || info.isOvulation;
    if (filter === "pms") return info.isPMS;
    return true;
  };

  const filterChips: { key: FilterType; label: string; color: string; inactiveColor: string }[] = [
    { key: "period", label: "Period", color: phaseTokens.menstrual.solid, inactiveColor: isDark ? "#F472B6" : "#B8396E" },
    { key: "fertile", label: "Fertile", color: phaseTokens.ovulatory.solid, inactiveColor: isDark ? "#F59E0B" : "#B8730A" },
    { key: "pms", label: "PMS", color: phaseTokens.luteal.solid, inactiveColor: isDark ? "#D8B4FE" : "#7B1FA2" },
    { key: "all", label: "All", color: isDark ? "#FFFFFF" : neutral.textSecondary, inactiveColor: isDark ? "#FFFFFF" : neutral.textSecondary },
  ];

  const textColor = isDark ? "#FFFFFF" : neutral.textPrimary;
  const subtextColor = isDark ? "rgba(255,255,255,0.55)" : neutral.textTertiary;

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Month header */}
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => navigateMonth(-1)}
            style={styles.navButton}
            accessibilityLabel="Previous month"
            testID="calendar-prev-month"
          >
            <Feather name="chevron-left" size={22} color={textColor} />
          </Pressable>
          <ThemedText style={[styles.monthTitle, { color: textColor }]}>
            {MONTHS[viewMonth]} {viewYear}
          </ThemedText>
          <Pressable
            onPress={() => navigateMonth(1)}
            style={styles.navButton}
            accessibilityLabel="Next month"
            testID="calendar-next-month"
          >
            <Feather name="chevron-right" size={22} color={textColor} />
          </Pressable>
        </View>

        {/* Calendar glass card */}
        <GlassSurface style={styles.calendarCard} noPadding>
          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((wd) => (
              <View key={wd} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: subtextColor }]}>
                  {wd}
                </Text>
              </View>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.dayGrid}>
            {calendarDays.map((info, idx) => {
              if (!info) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }

              const bgColor = getDayBgColor(info);
              const dotColor = getDayDotColor(info);
              const isSelected = selectedDate === info.dateKey;
              const show = shouldShow(info);
              const isDimmed = filter !== "all" && !show;
              const dayTextColor =
                isSelected
                  ? "#FFFFFF"
                  : info.isToday
                  ? brand.primary
                  : isDimmed
                  ? isDark
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(0,0,0,0.4)"
                  : show && bgColor
                  ? isDark
                    ? "#FFFFFF"
                    : neutral.textPrimary
                  : isDark
                  ? "rgba(255,255,255,0.8)"
                  : neutral.textPrimary;

              const bgOpacity = filter === "all" ? "B3" : "CC";

              return (
                <Pressable
                  key={info.dateKey}
                  style={styles.dayCell}
                  onPress={() => {
                    setSelectedDate(info.dateKey);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  testID={`calendar-day-${info.day}`}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      show && bgColor
                        ? { backgroundColor: bgColor + (isSelected ? "" : bgOpacity) }
                        : undefined,
                      isSelected
                        ? { backgroundColor: brand.primary }
                        : undefined,
                      info.isToday && !isSelected
                        ? {
                            borderWidth: 2,
                            borderColor: brand.primary,
                          }
                        : undefined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: dayTextColor,
                          fontWeight: info.isToday || isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {info.day}
                    </Text>
                  </View>
                  {info.hasFlowLog && !isSelected ? (
                    <View style={styles.petalIndicator}>
                      <LotusIcon size={12} color={phaseTokens.menstrual.solid} variant="mini" />
                    </View>
                  ) : dotColor && !isSelected ? (
                    <View style={[styles.phaseDot, { backgroundColor: dotColor }]} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </GlassSurface>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {filterChips.map((chip) => {
            const active = filter === chip.key;
            return (
              <Pressable
                key={chip.key}
                onPress={() => {
                  setFilter(chip.key);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? chip.color
                      : isDark
                      ? "rgba(42,23,48,0.35)"
                      : "rgba(255,255,255,0.25)",
                    borderColor: active
                      ? chip.color
                      : isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(255,255,255,0.40)",
                  },
                ]}
                testID={`filter-${chip.key}`}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: active ? "#FFFFFF" : chip.inactiveColor },
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Daily Cycle Decode */}
        {selectedDayInfo ? (
          <GlassSurface style={styles.decodeCard} noPadding>
            {selectedDayInfo.dayInCycle > 0 ? (
              <>
                <View style={styles.decodeHeader}>
                  <View
                    style={[
                      styles.decodeBadge,
                      {
                        backgroundColor:
                          phaseConfig[selectedDayInfo.phase].softBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.decodeBadgeText,
                        { color: phaseConfig[selectedDayInfo.phase].labelColor },
                      ]}
                    >
                      Day {selectedDayInfo.dayInCycle}
                    </Text>
                  </View>
                  <Text style={[styles.decodePhase, { color: phaseConfig[selectedDayInfo.phase].labelColor }]}>
                    {PHASE_DECODE[selectedDayInfo.phase].title}
                  </Text>
                </View>

                <Text style={[styles.decodeBody, { color: textColor }]}>
                  {PHASE_DECODE[selectedDayInfo.phase].body}
                </Text>

                <View
                  style={[
                    styles.decodeTipBox,
                    {
                      backgroundColor:
                        phaseConfig[selectedDayInfo.phase].softBg,
                    },
                  ]}
                >
                  <Feather
                    name="zap"
                    size={14}
                    color={phaseConfig[selectedDayInfo.phase].labelColor}
                  />
                  <Text
                    style={[
                      styles.decodeTipText,
                      {
                        color: isDark
                          ? "#FFFFFF"
                          : neutral.textPrimary,
                      },
                    ]}
                  >
                    {PHASE_DECODE[selectedDayInfo.phase].tip}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.decodePrompt}>
                <View style={styles.decodePromptRow}>
                  <View
                    style={[
                      styles.decodeBadge,
                      { backgroundColor: phaseTokens.menstrual.softBg, flexDirection: "row", alignItems: "center" },
                    ]}
                  >
                    <Feather name="calendar" size={12} color={phaseTokens.menstrual.solid} />
                    <Text
                      style={[
                        styles.decodeBadgeText,
                        { color: phaseTokens.menstrual.solid, marginLeft: 4 },
                      ]}
                    >
                      {new Date((selectedDate || todayKey) + "T12:00:00").toLocaleDateString("en-ZA", { day: "numeric", month: "long" })}
                    </Text>
                  </View>
                  <Text style={[styles.decodeBody, { color: subtextColor, flex: 1, marginBottom: 0 }]}>
                    Log your period to see cycle phase insights and personalised tips for this day.
                  </Text>
                </View>
              </View>
            )}

            {/* Day log details if available */}
            {selectedLog ? (
              <View style={styles.logSection}>
                <Text style={[styles.logSectionTitle, { color: subtextColor }]}>
                  Your log
                </Text>
                <View style={styles.logRow}>
                  {selectedLog.flow ? (
                    <View
                      style={[
                        styles.logPill,
                        { backgroundColor: phaseTokens.menstrual.softBg },
                      ]}
                    >
                      <Feather
                        name="droplet"
                        size={13}
                        color={phaseTokens.menstrual.solid}
                      />
                      <Text
                        style={[
                          styles.logPillText,
                          { color: textColor, textTransform: "capitalize" },
                        ]}
                      >
                        {selectedLog.flow}
                      </Text>
                    </View>
                  ) : null}
                  {selectedLog.mood ? (
                    <View
                      style={[
                        styles.logPill,
                        { backgroundColor: phaseTokens.ovulatory.softBg },
                      ]}
                    >
                      <Feather
                        name="smile"
                        size={13}
                        color={phaseTokens.ovulatory.solid}
                      />
                      <Text
                        style={[
                          styles.logPillText,
                          { color: textColor, textTransform: "capitalize" },
                        ]}
                      >
                        {selectedLog.mood}
                      </Text>
                    </View>
                  ) : null}
                  {selectedLog.energy ? (
                    <View
                      style={[
                        styles.logPill,
                        { backgroundColor: phaseTokens.follicular.softBg },
                      ]}
                    >
                      <Feather
                        name="zap"
                        size={13}
                        color={phaseTokens.follicular.solid}
                      />
                      <Text style={[styles.logPillText, { color: textColor }]}>
                        Energy {selectedLog.energy}/5
                      </Text>
                    </View>
                  ) : null}
                </View>
                {selectedLog.symptoms.length > 0 ? (
                  <View style={styles.symptomRow}>
                    {selectedLog.symptoms.slice(0, 4).map((s, i) => (
                      <View
                        key={i}
                        style={[
                          styles.symptomPill,
                          { backgroundColor: phaseTokens.luteal.softBg },
                        ]}
                      >
                        <Text
                          style={[styles.symptomPillText, { color: textColor }]}
                        >
                          {s}
                        </Text>
                      </View>
                    ))}
                    {selectedLog.symptoms.length > 4 ? (
                      <Text style={[styles.symptomMore, { color: subtextColor }]}>
                        +{selectedLog.symptoms.length - 4}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}

            <Pressable
              testID="button-log-period"
              onPress={() => setPeriodSheetVisible(true)}
              style={({ pressed }) => [
                styles.logPeriodButton,
                {
                  backgroundColor: pressed
                    ? phaseTokens.menstrual.solid + "20"
                    : phaseTokens.menstrual.solid + "12",
                },
              ]}
            >
              <Feather
                name="droplet"
                size={16}
                color={phaseTokens.menstrual.solid}
              />
              <Text
                style={[
                  styles.logPeriodText,
                  { color: phaseTokens.menstrual.solid },
                ]}
              >
                {selectedLog?.flow ? "Edit period log" : "Log your period"}
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={phaseTokens.menstrual.solid}
              />
            </Pressable>
          </GlassSurface>
        ) : null}

        {/* About your cycle */}
        <GlassSurface style={styles.statsCard} noPadding>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            About your cycle
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather
                name="repeat"
                size={18}
                color={subtextColor}
                style={{ marginBottom: 4 }}
              />
              <Text style={[styles.statLabel, { color: subtextColor }]}>
                Average cycle{"\n"}length
              </Text>
              <Text style={[styles.statValue, { color: brand.primary }]}>
                {profile?.cycleLength || 28} days
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : neutral.border },
              ]}
            />
            <View style={styles.statItem}>
              <Feather
                name="droplet"
                size={18}
                color={phaseTokens.menstrual.solid}
                style={{ marginBottom: 4 }}
              />
              <Text style={[styles.statLabel, { color: subtextColor }]}>
                Average period{"\n"}length
              </Text>
              <Text style={[styles.statValue, { color: brand.primary }]}>
                {profile?.periodLength || 5}-
                {(profile?.periodLength || 5) + 1} days
              </Text>
            </View>
          </View>
        </GlassSurface>
      </ScrollView>

      <PeriodLogSheet
        visible={periodSheetVisible}
        date={selectedDate || todayKey}
        existingLog={selectedLog || null}
        onSave={() => {
          setPeriodSheetVisible(false);
          loadData();
        }}
        onDismiss={() => setPeriodSheetVisible(false)}
        onDelete={() => {
          setPeriodSheetVisible(false);
          loadData();
        }}
      />
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    letterSpacing: 0.2,
  },
  calendarCard: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginBottom: 16,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayCell: {
    width: DAY_SIZE,
    alignItems: "center",
  },
  weekdayText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  dayCircle: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    borderRadius: (DAY_SIZE - 8) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontFamily: Fonts.numeric,
    fontSize: 15,
  },
  phaseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  petalIndicator: {
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  decodeCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  decodePrompt: {
    marginBottom: 4,
  },
  decodePromptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  decodeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  decodeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  decodeBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 13,
  },
  decodePhase: {
    fontFamily: Fonts.heading,
    fontSize: 16,
  },
  decodeBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  decodeTipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  decodeTipText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  logSection: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 14,
  },
  logSectionTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  logRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  logPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  logPillText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 12,
  },
  symptomRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  symptomPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  symptomPillText: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  symptomMore: {
    fontFamily: Fonts.body,
    fontSize: 12,
    alignSelf: "center",
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 16,
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: 20,
  },
  statDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 12,
  },
  logPeriodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
    borderRadius: 14,
  },
  logPeriodText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 14,
    flex: 1,
  },
});
