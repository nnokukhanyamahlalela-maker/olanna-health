import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LotusIcon } from "@/components/Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { storage, DailyLog, UserProfile, calculateCycleData } from "@/lib/storage";

const { width: screenWidth } = Dimensions.get("window");
const DAY_SIZE = Math.floor((screenWidth - Spacing.lg * 2 - 6) / 7);
const BRAND_PINK = "#F6A9D2";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  hasLog: boolean;
  log?: DailyLog;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);

  const loadData = useCallback(async () => {
    const [userProfile, logs] = await Promise.all([
      storage.getUserProfile(),
      storage.getDailyLogs(),
    ]);
    setProfile(userProfile);
    setDailyLogs(logs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    if (!profile) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const lastPeriodStart = new Date(profile.lastPeriodStart);
    const cycleLength = profile.cycleLength;
    const periodLength = profile.periodLength;

    const logMap = new Map<string, DailyLog>();
    dailyLogs.forEach((log) => {
      logMap.set(log.date, log);
    });

    const isPeriodDay = (date: Date): boolean => {
      const diffTime = date.getTime() - lastPeriodStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return false;
      const dayInCycle = (diffDays % cycleLength) + 1;
      return dayInCycle <= periodLength;
    };

    const isFertileDay = (date: Date): boolean => {
      const diffTime = date.getTime() - lastPeriodStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return false;
      const dayInCycle = (diffDays % cycleLength) + 1;
      const ovulationDay = cycleLength - 14;
      return dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 1;
    };

    const isOvulationDay = (date: Date): boolean => {
      const diffTime = date.getTime() - lastPeriodStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return false;
      const dayInCycle = (diffDays % cycleLength) + 1;
      const ovulationDay = cycleLength - 14;
      return dayInCycle === ovulationDay;
    };

    const days: DayInfo[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      const dateKey = formatDateKey(date);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isPeriod: isPeriodDay(date),
        isFertile: isFertileDay(date),
        isOvulation: isOvulationDay(date),
        hasLog: logMap.has(dateKey),
        log: logMap.get(dateKey),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isPeriod: isPeriodDay(date),
        isFertile: isFertileDay(date),
        isOvulation: isOvulationDay(date),
        hasLog: logMap.has(dateKey),
        log: logMap.get(dateKey),
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateKey = formatDateKey(date);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isPeriod: isPeriodDay(date),
        isFertile: isFertileDay(date),
        isOvulation: isOvulationDay(date),
        hasLog: logMap.has(dateKey),
        log: logMap.get(dateKey),
      });
    }

    setCalendarDays(days);
  }, [currentDate, profile, dailyLogs]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getDayStyle = (day: DayInfo) => {
    const baseStyle: any = {
      width: DAY_SIZE,
      height: DAY_SIZE,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: DAY_SIZE / 2,
    };

    if (day.isToday) {
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = BRAND_PINK;
    }

    if (selectedDate && isSameDay(day.date, selectedDate)) {
      baseStyle.backgroundColor = BRAND_PINK;
    } else if (day.isPeriod) {
      baseStyle.backgroundColor = BRAND_PINK + "40";
    } else if (day.isOvulation) {
      baseStyle.backgroundColor = "#C9A24D40";
    } else if (day.isFertile) {
      baseStyle.backgroundColor = "#A8BFA530";
    }

    return baseStyle;
  };

  const getDayTextColor = (day: DayInfo) => {
    if (selectedDate && isSameDay(day.date, selectedDate)) {
      return "#FFFFFF";
    }
    if (!day.isCurrentMonth) {
      return theme.textSecondary + "60";
    }
    return theme.text;
  };

  const selectedLog = selectedDate
    ? dailyLogs.find((log) => log.date === formatDateKey(selectedDate))
    : null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
            <Feather name="chevron-left" size={24} color={theme.text} />
          </Pressable>

          <Pressable onPress={goToToday}>
            <ThemedText type="h2" style={styles.monthTitle}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </ThemedText>
          </Pressable>

          <Pressable onPress={goToNextMonth} style={styles.navButton}>
            <Feather name="chevron-right" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {day}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <Pressable
              key={index}
              style={getDayStyle(day)}
              onPress={() => setSelectedDate(day.date)}
            >
              <ThemedText
                style={[
                  styles.dayText,
                  { color: getDayTextColor(day) },
                  !day.isCurrentMonth && styles.otherMonthDay,
                ]}
              >
                {day.date.getDate()}
              </ThemedText>
              {day.hasLog ? (
                <View style={[styles.logDot, { backgroundColor: BRAND_PINK }]} />
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <LotusIcon phase="menstrual" size={18} color={BRAND_PINK} />
            <ThemedText type="caption">Period</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <LotusIcon phase="follicular" size={18} color="#A8BFA5" />
            <ThemedText type="caption">Fertile</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <LotusIcon phase="ovulation" size={18} color="#C9A24D" />
            <ThemedText type="caption">Ovulation</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <LotusIcon phase="luteal" size={18} color="#C8BFD6" />
            <ThemedText type="caption">Luteal</ThemedText>
          </View>
        </View>

        {selectedDate ? (
          <View style={[styles.selectedDayCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h3">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </ThemedText>

            {selectedLog ? (
              <View style={styles.logDetails}>
                {selectedLog.flow ? (
                  <View style={styles.logItem}>
                    <Feather name="droplet" size={16} color={BRAND_PINK} />
                    <ThemedText type="body" style={{ textTransform: "capitalize" }}>
                      {selectedLog.flow} flow
                    </ThemedText>
                  </View>
                ) : null}

                {selectedLog.mood ? (
                  <View style={styles.logItem}>
                    <Feather name="smile" size={16} color={theme.phaseOvulation} />
                    <ThemedText type="body" style={{ textTransform: "capitalize" }}>
                      {selectedLog.mood}
                    </ThemedText>
                  </View>
                ) : null}

                {selectedLog.energy ? (
                  <View style={styles.logItem}>
                    <Feather name="zap" size={16} color={theme.phaseFollicular} />
                    <ThemedText type="body">Energy: {selectedLog.energy}/5</ThemedText>
                  </View>
                ) : null}

                {selectedLog.symptoms.length > 0 ? (
                  <View style={styles.symptomsContainer}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      Symptoms:
                    </ThemedText>
                    <View style={styles.symptomTags}>
                      {selectedLog.symptoms.slice(0, 5).map((symptom, i) => (
                        <View
                          key={i}
                          style={[styles.symptomTag, { backgroundColor: BRAND_PINK + "20" }]}
                        >
                          <ThemedText type="caption">{symptom}</ThemedText>
                        </View>
                      ))}
                      {selectedLog.symptoms.length > 5 ? (
                        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                          +{selectedLog.symptoms.length - 5} more
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {selectedLog.notes ? (
                  <View style={styles.notesContainer}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      Notes:
                    </ThemedText>
                    <ThemedText type="body">{selectedLog.notes}</ThemedText>
                  </View>
                ) : null}
              </View>
            ) : (
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                No log for this day
              </ThemedText>
            )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  navButton: {
    padding: Spacing.sm,
  },
  monthTitle: {
    textAlign: "center",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    width: DAY_SIZE,
    alignItems: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayText: {
    fontSize: 16,
    fontFamily: Fonts.numeric,
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  logDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectedDayCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  logDetails: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  symptomsContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  symptomTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  symptomTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
});
