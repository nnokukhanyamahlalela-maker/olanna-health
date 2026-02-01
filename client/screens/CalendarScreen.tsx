import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassCard } from "@/components/GlassCard";
import { Lotus, CyclePhase, PHASE_INFO, PHASE_COLORS, PHASE_BG_COLORS } from "@/components/Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";
import { storage, DailyLog, UserProfile } from "@/lib/storage";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type FilterType = "all" | "period" | "fertile" | "pms";

interface TimelineEvent {
  date: Date;
  endDate?: Date;
  type: "period" | "fertile" | "pms";
  label: string;
  sublabel: string;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function CalendarScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [currentMonth, setCurrentMonth] = useState(formatDateKey(new Date()).slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
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

  const markedDates = useMemo(() => {
    if (!profile) return {};

    const marks: { [key: string]: any } = {};
    const lastPeriodStart = new Date(profile.lastPeriodStart);
    const cycleLength = profile.cycleLength;
    const periodLength = profile.periodLength;

    const getDayInCycle = (date: Date): number => {
      const diffTime = date.getTime() - lastPeriodStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return -1;
      return (diffDays % cycleLength) + 1;
    };

    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 3);
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 3);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = formatDateKey(d);
      const dayInCycle = getDayInCycle(d);
      
      if (dayInCycle < 0) continue;

      const isPeriod = dayInCycle <= periodLength;
      const ovulationDay = cycleLength - 14;
      const isFertile = dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 1;
      const isOvulation = dayInCycle === ovulationDay;
      const isPMS = dayInCycle > cycleLength - 7 && dayInCycle <= cycleLength;

      if (filter !== "all") {
        if (filter === "period" && !isPeriod) continue;
        if (filter === "fertile" && !isFertile && !isOvulation) continue;
        if (filter === "pms" && !isPMS) continue;
      }

      const dots: { key: string; color: string }[] = [];
      
      if (isPeriod) {
        dots.push({ key: "period", color: "#F472B6" });
      }
      if (isFertile || isOvulation) {
        dots.push({ key: "fertile", color: "#FB923C" });
      }
      if (isPMS) {
        dots.push({ key: "pms", color: "#A78BFA" });
      }

      if (dots.length > 0) {
        marks[dateKey] = {
          dots,
          marked: true,
        };
      }
    }

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: "#FF3F9E",
      };
    }

    return marks;
  }, [profile, filter, selectedDate]);

  useEffect(() => {
    if (!profile) {
      setTimeline([]);
      return;
    }

    const lastPeriodStart = new Date(profile.lastPeriodStart);
    const cycleLength = profile.cycleLength;
    const periodLength = profile.periodLength;

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
  }, [profile]);

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
    ? dailyLogs.find((log) => log.date === selectedDate)
    : null;

  const filterChips: { key: FilterType; label: string; color: string }[] = [
    { key: "period", label: "Period", color: theme.periodPink },
    { key: "fertile", label: "Fertile", color: theme.fertileCoral },
    { key: "pms", label: "PMS", color: theme.pmsLavender },
    { key: "all", label: "All", color: theme.textSecondary },
  ];

  const calendarTheme = {
    backgroundColor: "transparent",
    calendarBackground: "transparent",
    monthTextColor: isDark ? "#FFFFFF" : "#2B2B2B",
    textMonthFontWeight: "700" as const,
    textMonthFontSize: 18,
    textSectionTitleColor: isDark ? "rgba(255,255,255,0.55)" : "rgba(43,43,43,0.55)",
    textSectionTitleDisabledColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(43,43,43,0.25)",
    dayTextColor: isDark ? "#FFFFFF" : "#2B2B2B",
    textDayFontWeight: "600" as const,
    textDayFontSize: 15,
    textDisabledColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(43,43,43,0.25)",
    todayTextColor: "#FF3F9E",
    selectedDayTextColor: "#FFFFFF",
    selectedDayBackgroundColor: "#FF3F9E",
    dotColor: "#FF3F9E",
    selectedDotColor: "#FFFFFF",
    arrowColor: "#FF3F9E",
    separatorColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(43,43,43,0.08)",
  };

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Title: Calendar */}
        <ThemedText type="h2" style={styles.screenTitle}>
          Calendar
        </ThemedText>

        {/* 2. Filter chips */}
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

        {/* 3. Calendar GlassCard (month grid) */}
        <GlassCard style={styles.calendarCard}>
          <Calendar
            current={currentMonth}
            onMonthChange={(month: DateData) => setCurrentMonth(month.dateString.slice(0, 7))}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markingType="multi-dot"
            markedDates={markedDates}
            hideExtraDays={true}
            enableSwipeMonths={true}
            theme={calendarTheme}
            style={styles.calendar}
          />
        </GlassCard>

        {/* 4. About your cycle card */}
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

        {/* 5. The Lotus Cycle card */}
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
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
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
  screenTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: "center",
  },
  calendarCard: {
    padding: 16,
    minHeight: 360,
    marginBottom: Spacing.lg,
  },
  calendar: {
    backgroundColor: "transparent",
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
  phaseLegend: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  phaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  phaseItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  phaseLotusContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  phaseLabel: {
    fontSize: 13,
    fontFamily: Fonts.bodySemibold,
    marginBottom: 2,
  },
  phaseDesc: {
    fontSize: 11,
    textAlign: "center",
  },
  timelineSection: {
    marginBottom: Spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  timelineDateCol: {
    width: 50,
    marginRight: Spacing.sm,
  },
  timelineDate: {
    fontSize: 13,
    fontFamily: Fonts.bodySemibold,
  },
  timelineDateSub: {
    fontSize: 11,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: Spacing.sm,
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
    marginBottom: Spacing.lg,
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
  },
  symptomTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  symptomTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
});
