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
import { Lotus, CyclePhase, PHASE_INFO, PHASE_COLORS, PHASE_BG_COLORS } from "@/components/Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding, CardSpacing, TabBarSpacing } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";
import { storage, DailyLog, UserProfile } from "@/lib/storage";

const { width: screenWidth } = Dimensions.get("window");
const DAY_SIZE = Math.floor((screenWidth - ScreenPadding.horizontal * 2 - 6) / 7);

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type FilterType = "all" | "period" | "fertile" | "pms";

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPMS: boolean;
  hasLog: boolean;
  log?: DailyLog;
}

interface TimelineEvent {
  date: Date;
  endDate?: Date;
  type: "period" | "fertile" | "pms";
  label: string;
  sublabel: string;
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
  const [filter, setFilter] = useState<FilterType>("all");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

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

    const getDayInCycle = (date: Date): number => {
      const diffTime = date.getTime() - lastPeriodStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return -1;
      return (diffDays % cycleLength) + 1;
    };

    const isPeriodDay = (date: Date): boolean => {
      const dayInCycle = getDayInCycle(date);
      if (dayInCycle < 0) return false;
      return dayInCycle <= periodLength;
    };

    const isFertileDay = (date: Date): boolean => {
      const dayInCycle = getDayInCycle(date);
      if (dayInCycle < 0) return false;
      const ovulationDay = cycleLength - 14;
      return dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 1;
    };

    const isOvulationDay = (date: Date): boolean => {
      const dayInCycle = getDayInCycle(date);
      if (dayInCycle < 0) return false;
      const ovulationDay = cycleLength - 14;
      return dayInCycle === ovulationDay;
    };

    const isPMSDay = (date: Date): boolean => {
      const dayInCycle = getDayInCycle(date);
      if (dayInCycle < 0) return false;
      return dayInCycle > cycleLength - 7 && dayInCycle <= cycleLength;
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
        isPMS: isPMSDay(date),
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
        isPMS: isPMSDay(date),
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
        isPMS: isPMSDay(date),
        hasLog: logMap.has(dateKey),
        log: logMap.get(dateKey),
      });
    }

    setCalendarDays(days);

    const events: TimelineEvent[] = [];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    let currentPeriodStart = new Date(lastPeriodStart);
    while (currentPeriodStart < new Date()) {
      if (currentPeriodStart >= threeMonthsAgo) {
        const periodEnd = new Date(currentPeriodStart);
        periodEnd.setDate(periodEnd.getDate() + periodLength - 1);
        events.push({
          date: new Date(currentPeriodStart),
          endDate: periodEnd,
          type: "period",
          label: "Period",
          sublabel: `${periodLength} days`,
        });

        const ovulationDate = new Date(currentPeriodStart);
        ovulationDate.setDate(ovulationDate.getDate() + cycleLength - 14);
        if (ovulationDate >= threeMonthsAgo && ovulationDate < new Date()) {
          const fertileStart = new Date(ovulationDate);
          fertileStart.setDate(fertileStart.getDate() - 5);
          events.push({
            date: fertileStart,
            endDate: ovulationDate,
            type: "fertile",
            label: "Fertility window",
            sublabel: `Ovulation ${ovulationDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          });
        }

        const pmsStart = new Date(currentPeriodStart);
        pmsStart.setDate(pmsStart.getDate() + cycleLength - 7);
        if (pmsStart >= threeMonthsAgo && pmsStart < new Date()) {
          events.push({
            date: pmsStart,
            type: "pms",
            label: "PMS",
            sublabel: pmsStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          });
        }
      }

      currentPeriodStart.setDate(currentPeriodStart.getDate() + cycleLength);
    }

    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    setTimeline(events.slice(0, 6));
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

  const shouldShowDay = (day: DayInfo): boolean => {
    if (filter === "all") return true;
    if (filter === "period") return day.isPeriod;
    if (filter === "fertile") return day.isFertile || day.isOvulation;
    if (filter === "pms") return day.isPMS;
    return true;
  };

  const getDayStyle = (day: DayInfo) => {
    const baseStyle: any = {
      width: DAY_SIZE,
      height: DAY_SIZE,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: DAY_SIZE / 2,
    };

    const isSelected = selectedDate && isSameDay(day.date, selectedDate);
    const showHighlight = shouldShowDay(day);

    if (day.isToday && !isSelected) {
      baseStyle.backgroundColor = "rgba(255, 79, 184, 0.1)";
    }

    if (isSelected) {
      baseStyle.backgroundColor = "#FF4FB8";
      baseStyle.shadowColor = "#FF4FB8";
      baseStyle.shadowOffset = { width: 0, height: 4 };
      baseStyle.shadowOpacity = 0.4;
      baseStyle.shadowRadius = 8;
      baseStyle.elevation = 6;
    } else if (showHighlight) {
      if (day.isPeriod) {
        baseStyle.backgroundColor = "rgba(244, 114, 182, 0.2)";
      } else if (day.isOvulation) {
        baseStyle.backgroundColor = "rgba(251, 146, 60, 0.25)";
      } else if (day.isFertile) {
        baseStyle.backgroundColor = "rgba(251, 146, 60, 0.12)";
      } else if (day.isPMS) {
        baseStyle.backgroundColor = "rgba(167, 139, 250, 0.2)";
      }
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
    if (day.isPeriod) {
      return theme.periodPink;
    }
    return theme.text;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "period":
        return theme.periodPink;
      case "fertile":
        return theme.fertileCoral;
      case "pms":
        return theme.pmsLavender;
      default:
        return theme.textSecondary;
    }
  };

  const selectedLog = selectedDate
    ? dailyLogs.find((log) => log.date === formatDateKey(selectedDate))
    : null;

  const filterChips: { key: FilterType; label: string; color: string }[] = [
    { key: "period", label: "Period", color: theme.periodPink },
    { key: "fertile", label: "Fertile", color: theme.fertileCoral },
    { key: "pms", label: "PMS", color: theme.pmsLavender },
    { key: "all", label: "All", color: theme.textSecondary },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + TabBarSpacing.totalHeight,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="h2" style={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()} {">"}
          </ThemedText>
          <View style={styles.navButtons}>
            <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
              <Feather name="chevron-left" size={20} color={theme.text} />
            </Pressable>
            <Pressable onPress={goToNextMonth} style={styles.navButton}>
              <Feather name="chevron-right" size={20} color={theme.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <ThemedText type="caption" style={[styles.weekdayText, { color: theme.textSecondary }]}>
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
            </Pressable>
          ))}
        </View>

        <View style={styles.filterRow}>
          {filterChips.map((chip) => (
            <Pressable
              key={chip.key}
              onPress={() => setFilter(chip.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === chip.key ? chip.color : "transparent",
                  borderColor: chip.color,
                },
              ]}
            >
              <ThemedText
                type="caption"
                style={{
                  color: filter === chip.key ? "#FFFFFF" : chip.color,
                  fontFamily: Fonts.bodySemibold,
                }}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            About your cycle
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="repeat" size={20} color={theme.textSecondary} />
              </View>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Average cycle{"\n"}length
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: theme.periodPink }]}>
                {profile?.cycleLength || 28} days
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="droplet" size={20} color={theme.periodPink} />
              </View>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Average period{"\n"}length
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: theme.periodPink }]}>
                {profile?.periodLength || 5}-{(profile?.periodLength || 5) + 1} days
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.phaseLegend, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            The Lotus Cycle
          </ThemedText>
          <View style={styles.phaseGrid}>
            {(["menstrual", "follicular", "ovulation", "luteal"] as CyclePhase[]).map((p) => (
              <View key={p} style={styles.phaseItem}>
                <View 
                  style={[
                    styles.phaseLotusContainer, 
                    { backgroundColor: PHASE_BG_COLORS[p] }
                  ]}
                >
                  <Lotus phase={p} size={40} strokeWidth={0.8} />
                </View>
                <ThemedText 
                  style={[
                    styles.phaseLabel, 
                    { color: PHASE_COLORS[p] }
                  ]}
                >
                  {p === "ovulation" ? "Ovulatory" : p.charAt(0).toUpperCase() + p.slice(1)}
                </ThemedText>
                <ThemedText 
                  style={[styles.phaseDesc, { color: theme.textSecondary }]}
                >
                  {PHASE_INFO[p].title}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {timeline.length > 0 ? (
          <View style={styles.timelineSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Timelines
            </ThemedText>
            {timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDateCol}>
                  <ThemedText style={[styles.timelineDate, { color: theme.text }]}>
                    {event.date.getDate()} {MONTHS[event.date.getMonth()].slice(0, 3).toLowerCase()}
                  </ThemedText>
                  {event.endDate ? (
                    <ThemedText style={[styles.timelineDateSub, { color: theme.textSecondary }]}>
                      {event.endDate.getDate()} {MONTHS[event.endDate.getMonth()].slice(0, 3).toLowerCase()}
                    </ThemedText>
                  ) : null}
                </View>
                <View style={[styles.timelineDot, { backgroundColor: getEventColor(event.type) }]} />
                <View style={styles.timelineContent}>
                  <ThemedText style={[styles.timelineLabel, { color: getEventColor(event.type) }]}>
                    {event.label}
                  </ThemedText>
                  <ThemedText style={[styles.timelineSublabel, { color: theme.textSecondary }]}>
                    {event.sublabel}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {selectedDate ? (
          <View style={[styles.selectedDayCard, { backgroundColor: theme.cardBackground }]}>
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
                    <Feather name="droplet" size={16} color={theme.periodPink} />
                    <ThemedText type="body" style={{ textTransform: "capitalize" }}>
                      {selectedLog.flow} flow
                    </ThemedText>
                  </View>
                ) : null}

                {selectedLog.mood ? (
                  <View style={styles.logItem}>
                    <Feather name="smile" size={16} color={theme.fertileCoral} />
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
                          style={[styles.symptomTag, { backgroundColor: theme.periodPinkLight }]}
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
  navButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  navButton: {
    padding: Spacing.xs,
  },
  monthTitle: {
    textAlign: "left",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    width: DAY_SIZE,
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayText: {
    fontSize: 15,
    fontFamily: Fonts.numeric,
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  statsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontFamily: Fonts.headingMedium,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.xs,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 20,
    fontFamily: Fonts.heading,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#E5E5E5",
    marginHorizontal: Spacing.md,
  },
  timelineSection: {
    marginBottom: Spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  timelineDateCol: {
    width: 50,
  },
  timelineDate: {
    fontSize: 13,
    fontFamily: Fonts.bodySemibold,
  },
  timelineDateSub: {
    fontSize: 11,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: Spacing.md,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    fontFamily: Fonts.bodySemibold,
  },
  timelineSublabel: {
    fontSize: 12,
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
  phaseLegend: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  phaseGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  phaseItem: {
    alignItems: "center",
    flex: 1,
  },
  phaseLotusContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  phaseLabel: {
    fontSize: 10,
    fontFamily: Fonts.bodySemibold,
    textAlign: "center",
  },
  phaseDesc: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
  },
});
