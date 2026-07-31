import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { useLotusCycle } from "@/hooks/useLotusCycle";
import { LannaMascot } from "@/components/LannaMascot";
import { LannaInsightBadge } from "@/components/LannaInsightBadge";
import { useLannaCheckIn } from "@/hooks/useLannaCheckIn";
import { QUICK_LOG_MASCOTS } from "@/components/QuickLogMascot";
import { TAB_BAR_HEIGHT } from "@/components/CustomTabBar";
import { HealthSummarySheet } from "@/components/HealthSummarySheet";
import { QuickLogSheet, QuickLogDomain } from "@/components/QuickLogSheet";
import {
  maybeSchedulePhaseReminder,
  maybeScheduleLapsedUserNudge,
  maybeScheduleHealthSummaryReminder,
  maybeFireMilestoneNudge,
  milestoneKeyFromLabel,
} from "@/lib/notificationScheduler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_CURRENT_DAY = 1;

// Phase dot colors (front color per phase)
const PHASE_DOT_COLORS: Record<Phase, string> = {
  menstrual: "#F06B9A",
  follicular: "#D178B3",
  ovulation: "#DE73DE",
  luteal: "#C9A0DC",
  late: "#C9A0DC",
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
  { id: "flow",   label: "Flow",   bg: "#DAEEF8" },
  { id: "mood",   label: "Mood",   bg: "#FAE3E8" },
  { id: "pain",   label: "Pain",   bg: "#F4EDE0" },
  { id: "energy", label: "Energy", bg: "#FBF4D6" },
];

function QuickLogRow({ onPress }: { onPress: (id: string) => void }) {
  return (
    <View style={styles.quickLogRow}>
      {QUICK_LOG_ITEMS.map((item) => {
        const MascotComponent = QUICK_LOG_MASCOTS[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => onPress(item.id)}
            style={styles.quickLogItem}
          >
            <View style={[styles.quickLogCard, { backgroundColor: item.bg }]}>
              <MascotComponent size={52} />
            </View>
            <Text style={styles.quickLogLabel}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Phase legend ────────────────────────────────────────────────────────────

const PHASE_LEGEND = [
  { label: "Menstrual", color: "#F06B9A" },
  { label: "Follicular", color: "#D178B3" },
  { label: "Ovulatory", color: "#DE73DE" },
  { label: "Luteal", color: "#C9A0DC" },
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

  // Estimate cycles completed since the user's first period start.
  const cycleCount = profile?.lastPeriodStart && profile?.createdAt
    ? Math.max(0, Math.floor(
        (Date.now() - new Date(profile.createdAt).getTime()) /
        (1000 * 60 * 60 * 24 * (profile.cycleLength || 28))
      ))
    : 0;
  const milestone = calcMilestone(dailyLogs, cycleCount);

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

  const handleQuickLog = (id: string) => {
    setQuickLogDomain(id as QuickLogDomain);
    setQuickLogVisible(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: "#FDF5F8" }]}>
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
          {milestone && hasCycleDate && (
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
              <Text style={styles.milestoneText}>{milestone.label}</Text>
            </View>
          )}
        </View>

        {/* Lanna insight badge — shown when a nudge is active */}
        {activeNudge && hasCycleDate && (
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

            {/* Day + phase label */}
            <View style={styles.phaseInfo}>
              <Text style={styles.dayText}>Day {clampedDay} of {cycleLength}</Text>
              <Text style={[styles.phaseName, { color: config.front }]}>{config.label} phase</Text>
              <Text style={styles.phaseTagline}>{config.tagline}</Text>
            </View>

            {/* About this phase card */}
            <View style={[styles.aboutCard, { backgroundColor: config.bg + "CC" }]}>
              <Text style={[styles.aboutCardTitle, { color: config.ink }]}>About this phase</Text>
              <Text style={[styles.aboutCardBody, { color: config.ink + "CC" }]}>
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
          <QuickLogRow onPress={handleQuickLog} />
        </View>

        {/* Health Summary CTA */}
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
        onDismiss={() => setQuickLogVisible(false)}
        onSaved={() => {
          // Refresh so the milestone badge reflects the new log immediately
          storage.getDailyLogs().then(setDailyLogs).catch(() => {});
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
    color: "#2D1F2B",
    letterSpacing: 0.1,
  },
  milestoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(180,154,204,0.18)",
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
    color: "#6A5B7B",
  },
  wheelSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  phaseInfo: {
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
  },
  dayText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D1F2B",
    letterSpacing: 0.2,
  },
  phaseName: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  phaseTagline: {
    fontSize: 13,
    color: "#8A6F80",
    letterSpacing: 0.1,
  },
  aboutCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 6,
  },
  aboutCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  aboutCardBody: {
    fontSize: 14,
    lineHeight: 21,
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
    color: "#8A6F80",
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
    color: "#2D1F2B",
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
    color: "#5A4252",
  },
  summaryCta: {
    width: "100%",
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 16,
    backgroundColor: "rgba(240,107,154,0.10)",
    borderWidth: 1,
    borderColor: "rgba(240,107,154,0.22)",
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
    color: "#2D1F2B",
    letterSpacing: 0.1,
  },
  summaryCtaSub: {
    fontSize: 12,
    color: "#8A6F80",
  },
  summaryCtaArrow: {
    fontSize: 16,
    color: "#F06B9A",
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
    color: "#2D1F2B",
    letterSpacing: 0.1,
    textAlign: "center",
  },
  noCycleDateBody: {
    fontSize: 15,
    color: "#5A4252",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  noCycleDateBtn: {
    marginTop: 8,
    backgroundColor: "#F06B9A",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  noCycleDateBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

export default LotusCycleScreen;
