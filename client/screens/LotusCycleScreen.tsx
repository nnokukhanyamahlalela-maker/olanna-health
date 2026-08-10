import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import {
  Phase,
  getPhaseForDay,
  phaseConfig,
} from "@/constants/phaseConfig";
import { neutral } from "@/constants/colors";
import { storage, UserProfile, DailyLog } from "@/lib/storage";
import {
  getTodayQuickLog,
  localDateString,
  TodayQuickLog,
  ENERGY_LABELS,
} from "@/lib/quickLogHelpers";
import { useLotusCycle } from "@/hooks/useLotusCycle";
import { LannaMascot } from "@/components/LannaMascot";
import { LannaInsightBadge } from "@/components/LannaInsightBadge";
import { LannaThresholdCard } from "@/components/LannaThresholdCard";
import { useLannaCheckIn } from "@/hooks/useLannaCheckIn";
import {
  shouldShowThresholdCard,
  dismissThresholdCard,
} from "@/lib/lannaNudgeStorage";
import { detectConsecutiveHighPain } from "@/lib/painStreakDetector";
import { QUICK_LOG_MASCOTS } from "@/components/QuickLogMascot";
import { TAB_BAR_HEIGHT } from "@/components/CustomTabBar";
import { HealthSummarySheet } from "@/components/HealthSummarySheet";
import { QuickLogSheet, QuickLogDomain, QuickLogPrefill } from "@/components/QuickLogSheet";
import { LannaReactionCard } from "@/components/LannaReactionCard";
import { buildLannaReaction } from "@/lib/lannaQuickReaction";
import {
  maybeSchedulePhaseReminder,
  maybeScheduleLapsedUserNudge,
  maybeScheduleHealthSummaryReminder,
  maybeFireMilestoneNudge,
  milestoneKeyFromLabel,
} from "@/lib/notificationScheduler";
import { countLoggedCycles } from "@/services/cycleCalculator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_CURRENT_DAY = 1;

// Phase dot colors — new brand palette
const PHASE_DOT_COLORS: Record<Phase, string> = {
  menstrual:  "#D85A30",  // coral (period days)
  follicular: "#E8A070",  // soft coral
  ovulation:  "#0F6E56",  // teal (fertile/ovulation)
  luteal:     "#7ABFB0",  // soft teal
  late:       "#7ABFB0",
};

// ─── Cycle Wheel ────────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function CycleWheel({
  cycleLength,
  periodLength,
  currentDay,
}: {
  cycleLength: number;
  periodLength: number;
  currentDay: number;
}) {
  const wheelSize = Math.min(SCREEN_WIDTH - 48, 300);
  const cx = wheelSize / 2;
  const cy = wheelSize / 2;
  const dotRingR = wheelSize * 0.44;
  const dotR = wheelSize * 0.028;
  const todayDotR = wheelSize * 0.04;
  const mascotSize = wheelSize * 0.52;

  const currentPhase = getPhaseForDay(currentDay, cycleLength, periodLength);

  const dayDots: React.ReactNode[] = [];
  for (let d = 1; d <= cycleLength; d++) {
    const angleDeg = ((d - 1) / cycleLength) * 360;
    const pos = polarToCartesian(cx, cy, dotRingR, angleDeg);
    const dayPhase = getPhaseForDay(d, cycleLength, periodLength);
    const color = PHASE_DOT_COLORS[dayPhase];
    const isToday = d === currentDay;

    if (isToday) {
      dayDots.push(
        <G key={d}>
          {/* Halo */}
          <Circle cx={pos.x} cy={pos.y} r={todayDotR + wheelSize * 0.022} fill={color} opacity={0.25} />
          <Circle cx={pos.x} cy={pos.y} r={todayDotR} fill={color} />
        </G>
      );
    } else {
      dayDots.push(
        <Circle key={d} cx={pos.x} cy={pos.y} r={dotR} fill={color} opacity={0.45} />
      );
    }
  }

  return (
    <View style={{ width: wheelSize, height: wheelSize, alignItems: "center", justifyContent: "center" }}>
      <Svg width={wheelSize} height={wheelSize} style={{ position: "absolute" }}>
        {dayDots}
      </Svg>
      {/* Mascot fills center */}
      <View style={{ width: mascotSize, height: mascotSize, alignItems: "center", justifyContent: "center" }}>
        <LannaMascot phase={currentPhase} size={mascotSize} />
      </View>
    </View>
  );
}

// ─── Quick Log mascots ───────────────────────────────────────────────────────

const QUICK_LOG_ITEMS: Array<{
  id: "flow" | "mood" | "pain" | "energy";
  label: string;
  bg: string;
}> = [
  { id: "flow",   label: "Flow",   bg: "#FAF8F3" },
  { id: "mood",   label: "Mood",   bg: "#F0EFF8" },
  { id: "pain",   label: "Pain",   bg: "#FAF8F3" },
  { id: "energy", label: "Energy", bg: "#F0EFF8" },
];

// ─── Today quick-log summary ─────────────────────────────────────────────────
// getTodayQuickLog, TodayQuickLog, ENERGY_LABELS are imported from
// @/lib/quickLogHelpers — see that file for timezone-safety notes.

function QuickLogRow({
  onPress,
  todayLog,
}: {
  onPress: (id: string) => void;
  todayLog: TodayQuickLog;
}) {
  return (
    <View style={styles.quickLogRow}>
      {QUICK_LOG_ITEMS.map((item) => {
        const MascotComponent = QUICK_LOG_MASCOTS[item.id];
        const loggedValue = todayLog[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => onPress(item.id)}
            style={styles.quickLogItem}
          >
            <View style={[styles.quickLogCard, { backgroundColor: item.bg }]}>
              <MascotComponent size={52} />
              {loggedValue && <View style={styles.quickLogLoggedDot} />}
            </View>
            <Text style={styles.quickLogLabel}>{item.label}</Text>
            {loggedValue ? (
              <Text style={styles.quickLogLoggedValue}>{loggedValue}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Phase legend ────────────────────────────────────────────────────────────

const PHASE_LEGEND = [
  { label: "Menstrual",  color: "#D85A30" },
  { label: "Follicular", color: "#E8A070" },
  { label: "Ovulatory",  color: "#0F6E56" },
  { label: "Luteal",     color: "#7ABFB0" },
] as const;

function PhaseLegend() {
  return (
    <View style={styles.legendRow}>
      {PHASE_LEGEND.map((p) => (
        <View key={p.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: p.color }]} />
          <Text style={styles.legendLabel}>{p.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Milestone helper ─────────────────────────────────────────────────────────

/**
 * Data-collection milestones — tied only to how much has been logged,
 * never to symptom severity, "good" days, or health outcomes.
 * Returns the most recent milestone reached, or null if none yet.
 */
interface MilestoneData {
  label: string;
  emoji: string;
}

/**
 * Returns the current logging streak in consecutive calendar days.
 * If today has not been logged yet the streak is measured from yesterday,
 * so the badge persists throughout the day.
 */
function calcStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;
  const logDates = new Set(logs.map((l) => l.date.slice(0, 10)));
  const d = new Date();
  const fmt = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  // If today isn't logged yet, slide window back one day
  if (!logDates.has(fmt(d))) {
    d.setDate(d.getDate() - 1);
  }
  let streak = 0;
  while (logDates.has(fmt(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function calcMilestone(logs: DailyLog[], cycleCount: number): MilestoneData | null {
  const uniqueDays = new Set(logs.map((l) => l.date.slice(0, 10))).size;

  if (cycleCount >= 3)    return { emoji: "🌺", label: "3 cycles logged" };
  if (cycleCount >= 2)    return { emoji: "💜", label: "2 cycles logged" };
  if (uniqueDays >= 90)   return { emoji: "🌙", label: "90 days of data" };
  if (uniqueDays >= 60)   return { emoji: "💫", label: "60 days of data" };
  if (cycleCount >= 1)    return { emoji: "✨", label: "1 cycle logged" };
  if (uniqueDays >= 28)   return { emoji: "🌸", label: "28 days tracked" };
  if (uniqueDays >= 14)   return { emoji: "🌿", label: "14 days tracked" };
  if (uniqueDays >= 7)    return { emoji: "🌱", label: "7 days tracked" };
  if (uniqueDays >= 1)    return { emoji: "🌱", label: "First log!" };
  return null;
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function LotusCycleScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [quickLogDomain, setQuickLogDomain] = useState<QuickLogDomain>("flow");
  const [reactionVisible, setReactionVisible] = useState(false);
  const [reactionMessage, setReactionMessage] = useState("");
  const [thresholdCardVisible, setThresholdCardVisible] = useState(false);
  const [thresholdEventDate, setThresholdEventDate] = useState<string | null>(null);

  const { data, loading } = useLotusCycle(profile?.id || "");
  const { activeNudge } = useLannaCheckIn();

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
          setDailyLogs(logs);
        } catch (e) {
          console.error("[LotusCycleScreen] load error:", e);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const hasCycleDate = !!(profile?.lastPeriodStart);
  const cycleLength = profile?.cycleLength || DEFAULT_CYCLE_LENGTH;
  const periodLength = profile?.periodLength || 5;
  const isLate = data?.isLate || false;
  const currentDay = isLate
    ? (data?.rawCycleDay || DEFAULT_CURRENT_DAY)
    : (data?.currentCycleDay || DEFAULT_CURRENT_DAY);
  const clampedDay = Math.min(currentDay, cycleLength);

  const currentPhase: Phase = getPhaseForDay(clampedDay, cycleLength, periodLength);
  const config = phaseConfig[currentPhase];

  const userName = profile?.name || "";
  const greeting = userName ? `Hey ${userName}` : "Hey";

  // Today's raw log — used to pre-fill the QuickLogSheet with the user's earlier selection.
  // Uses localDateString() to avoid UTC-vs-local midnight mismatch (see quickLogHelpers.ts).
  const todayRawLog = useMemo(() => {
    const today = localDateString();
    return dailyLogs.find((l) => l.date.slice(0, 10) === today) ?? null;
  }, [dailyLogs]);

  const quickLogPrefill: QuickLogPrefill | undefined = todayRawLog
    ? {
        flow: todayRawLog.flow,
        mood: todayRawLog.mood ?? undefined,
        energy: todayRawLog.energy ?? undefined,
        symptoms: todayRawLog.symptoms,
      }
    : undefined;

  // Count cycles from actual logged period start events (flow days) in dailyLogs.
  const cycleCount = countLoggedCycles(dailyLogs);
  const milestone = calcMilestone(dailyLogs, cycleCount);
  const streak    = calcStreak(dailyLogs);

  // Schedule background notifications whenever profile or logs are freshly loaded.
  // Each scheduler function is idempotent — safe to call on every focus.
  useEffect(() => {
    if (!profile) return;
    const cycleData = data ?? null;
    const lastLogDate = dailyLogs.length > 0
      ? [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date))[0].date
      : null;

    maybeSchedulePhaseReminder(profile, cycleData as any, dailyLogs).catch(() => {});
    maybeScheduleLapsedUserNudge(lastLogDate).catch(() => {});
    maybeScheduleHealthSummaryReminder(dailyLogs).catch(() => {});
  }, [profile?.id, dailyLogs.length, data?.currentPhase]);

  // Fire a one-time milestone nudge when a new milestone is reached.
  useEffect(() => {
    if (!milestone?.label) return;
    const key = milestoneKeyFromLabel(milestone.label);
    if (key) maybeFireMilestoneNudge(key, milestone.label).catch(() => {});
  }, [milestone?.label]);

  // Threshold card: detect ≥3 consecutive high-severity pain days and check
  // dismissed state so we only show the card for new threshold events.
  useEffect(() => {
    const eventDate = detectConsecutiveHighPain(dailyLogs);
    if (!eventDate) {
      setThresholdCardVisible(false);
      setThresholdEventDate(null);
      return;
    }
    setThresholdEventDate(eventDate);
    shouldShowThresholdCard(eventDate)
      .then((show) => setThresholdCardVisible(show))
      .catch(() => setThresholdCardVisible(false));
  }, [dailyLogs]);

  const handleThresholdDismiss = () => {
    setThresholdCardVisible(false);
    if (thresholdEventDate) {
      dismissThresholdCard(thresholdEventDate).catch(() => {});
    }
  };

  const handleQuickLog = (id: string) => {
    setQuickLogDomain(id as QuickLogDomain);
    setQuickLogVisible(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: "#EEEDFE" }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 20,
            paddingBottom: tabBarHeight + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>{greeting}</Text>
          {streak >= 2 ? (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak} day streak</Text>
            </View>
          ) : milestone && hasCycleDate ? (
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
              <Text style={styles.milestoneText}>{milestone.label}</Text>
            </View>
          ) : null}
        </View>

        {/* Lanna insight badge — shown when a nudge is active and the
            threshold card is NOT also visible (they share the same CTA) */}
        {activeNudge && hasCycleDate && !thresholdCardVisible && (
          <View style={styles.badgeWrapper}>
            <LannaInsightBadge nudge={activeNudge} currentPhase={currentPhase} />
          </View>
        )}

        {!hasCycleDate ? (
          /* ── No cycle date: friendly setup prompt ── */
          <View style={styles.noCycleDateSection}>
            <View style={styles.noCycleDateWheel}>
              <LannaMascot phase="follicular" size={120} expression="bright" />
            </View>
            <Text style={styles.noCycleDateTitle}>Let's set your cycle</Text>
            <Text style={styles.noCycleDateBody}>
              Add the date your last period started so I can track where you are in your cycle.
            </Text>
            <Pressable
              onPress={() => (navigation as any).navigate("EditProfile")}
              style={({ pressed }) => [
                styles.noCycleDateBtn,
                { opacity: pressed ? 0.82 : 1 },
              ]}
            >
              <Text style={styles.noCycleDateBtnText}>Set period date →</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Cycle wheel */}
            <View style={styles.wheelSection}>
              <CycleWheel
                cycleLength={cycleLength}
                periodLength={periodLength}
                currentDay={clampedDay}
              />
            </View>

            {/* Threshold nudge card — lighter-touch entry point to Check-In.
                Only visible when ≥3 consecutive high-severity pain days are
                detected and the user has not yet dismissed this event. */}
            {thresholdCardVisible && (
              <LannaThresholdCard
                currentPhase={currentPhase}
                onDismiss={handleThresholdDismiss}
                conditionId={activeNudge?.pattern.conditionId ?? "endometriosis"}
              />
            )}

            {/* Day + phase label */}
            <View style={styles.phaseInfo}>
              {/* Teal phase status pill */}
              <View style={styles.phasePill}>
                <Text style={styles.phasePillText}>{config.label} phase</Text>
              </View>
              <Text style={styles.dayText}>Day {clampedDay} of {cycleLength}</Text>
              <Text style={styles.phaseTagline}>{config.tagline}</Text>
            </View>

            {/* About this phase card — flat cream, always deep-plum text */}
            <View style={styles.aboutCard}>
              <Text style={styles.aboutCardTitle}>About this phase</Text>
              <Text style={styles.aboutCardBody}>
                {config.aboutText}
              </Text>
            </View>

            {/* Phase legend */}
            <PhaseLegend />
          </>
        )}

        {/* Quick Log */}
        <View style={styles.quickLogSection}>
          <Text style={styles.sectionTitle}>Quick log</Text>
          <QuickLogRow onPress={handleQuickLog} todayLog={getTodayQuickLog(dailyLogs)} />
        </View>

        {/* Log Today — single dominant coral CTA per screen */}
        <Pressable
          onPress={() => handleQuickLog("flow")}
          style={({ pressed }) => [
            styles.logTodayBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.logTodayBtnText}>Log Today</Text>
        </Pressable>

        {/* Health Summary CTA — secondary, no coral */}
        <Pressable
          onPress={() => setSummaryVisible(true)}
          style={({ pressed }) => [
            styles.summaryCta,
            { opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <View style={styles.summaryCtaInner}>
            <Text style={styles.summaryCtaIcon}>📋</Text>
            <View style={styles.summaryCtaText}>
              <Text style={styles.summaryCtaTitle}>My Health Summary</Text>
              <Text style={styles.summaryCtaSub}>
                Share your cycle data with your provider
              </Text>
            </View>
            <Text style={styles.summaryCtaArrow}>→</Text>
          </View>
        </Pressable>
      </ScrollView>

      <HealthSummarySheet
        visible={summaryVisible}
        onDismiss={() => setSummaryVisible(false)}
      />
      <QuickLogSheet
        visible={quickLogVisible}
        domain={quickLogDomain}
        prefill={quickLogPrefill}
        onDismiss={() => setQuickLogVisible(false)}
        onSaved={(domain, savedLog) => {
          // Capture whether today already had a log BEFORE the save refreshed state.
          // This must be read from pre-save dailyLogs so pattern logic is not
          // masked by the upserted single-log-per-date storage model.
          const today = localDateString();
          const hadExistingTodayLog = dailyLogs.some(
            (l) => l.date.slice(0, 10) === today
          );

          // Refresh logs for milestone badge, then build pattern-aware reaction
          storage.getDailyLogs().then((fresh) => {
            setDailyLogs(fresh);
            // Use up to 7 most-recent logs (already includes today's save)
            const recent = [...fresh]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7);
            const msg = buildLannaReaction(
              recent,
              { domain, log: savedLog },
              hadExistingTodayLog,
              currentPhase
            );
            setReactionMessage(msg);
            setReactionVisible(true);
          }).catch(() => {});
        }}
      />
      <LannaReactionCard
        visible={reactionVisible}
        message={reactionMessage}
        phase={currentPhase}
        onDismiss={() => setReactionVisible(false)}
        tabBarHeight={tabBarHeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEEDFE",
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: 0.1,
  },
  // Streak badge (shown when streak ≥ 2)
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(216,90,48,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D85A30",
  },
  // Milestone badge (fallback when no streak yet)
  milestoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(148,144,200,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  milestoneEmoji: {
    fontSize: 13,
  },
  milestoneText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A4580",
  },
  wheelSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  phaseInfo: {
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  // Teal phase status pill
  phasePill: {
    backgroundColor: "#0F6E56",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 2,
  },
  phasePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FAF8F3",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  dayText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: 0.2,
  },
  phaseName: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  phaseTagline: {
    fontSize: 13,
    color: "#6B6591",
    letterSpacing: 0.1,
  },
  // Flat cream card — no phase tinting
  aboutCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 6,
    backgroundColor: "#FAF8F3",
  },
  aboutCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: 0.2,
  },
  aboutCardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4A4580",
  },
  legendRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: "#6B6591",
  },
  badgeWrapper: {
    width: "100%",
    marginBottom: 8,
    marginHorizontal: -20,
  },
  quickLogSection: {
    width: "100%",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: 0.1,
  },
  quickLogRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  quickLogItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickLogCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLogEmoji: {
    fontSize: 28,
  },
  quickLogLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4A4580",
  },
  quickLogLoggedDot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0F6E56",
  },
  quickLogLoggedValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0F6E56",
    letterSpacing: 0.1,
  },
  // Single dominant coral CTA — one per screen
  logTodayBtn: {
    width: "100%",
    height: 54,
    borderRadius: 27,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  logTodayBtnText: {
    color: "#FAECE7",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // Health summary CTA — secondary surface, no coral
  summaryCta: {
    width: "100%",
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 16,
    backgroundColor: "rgba(148,144,200,0.10)",
    borderWidth: 1,
    borderColor: "rgba(148,144,200,0.22)",
  },
  summaryCtaInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  summaryCtaIcon: {
    fontSize: 22,
  },
  summaryCtaText: {
    flex: 1,
    gap: 2,
  },
  summaryCtaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: 0.1,
  },
  summaryCtaSub: {
    fontSize: 12,
    color: "#6B6591",
  },
  summaryCtaArrow: {
    fontSize: 16,
    color: "#26215C",
    fontWeight: "600",
  },
  noCycleDateSection: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  noCycleDateWheel: {
    marginBottom: 8,
  },
  noCycleDateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: 0.1,
    textAlign: "center",
  },
  noCycleDateBody: {
    fontSize: 15,
    color: "#4A4580",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  noCycleDateBtn: {
    marginTop: 8,
    backgroundColor: "#D85A30",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  noCycleDateBtnText: {
    color: "#FAECE7",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

export default LotusCycleScreen;
