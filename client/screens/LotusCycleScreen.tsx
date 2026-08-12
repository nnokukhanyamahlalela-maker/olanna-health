import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
} from "react-native-reanimated";
import Svg, { Circle, G, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import {
  Phase,
  getPhaseForDay,
  getPhaseBoundaries,
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

// ─── Bento layout metrics ─────────────────────────────────────────────────────
const TILE_GAP    = 10;
const CONTENT_W   = SCREEN_WIDTH - 40; // 20 px padding each side
const WHEEL_TILE_W = Math.floor(CONTENT_W * 0.55);
const PHASE_TILE_W = CONTENT_W - WHEEL_TILE_W - TILE_GAP;
const HALF_TILE_W  = Math.floor((CONTENT_W - TILE_GAP) / 2);

// ─── Phase dot colors ─────────────────────────────────────────────────────────
const PHASE_DOT_COLORS: Record<Phase, string> = {
  menstrual:  "#D85A30",
  follicular: "#E8A070",
  ovulation:  "#0F6E56",
  luteal:     "#7ABFB0",
  late:       "#7ABFB0",
};

// ─── Lanna companion messages (phase-keyed) ───────────────────────────────────
const LANNA_COMPANION_MESSAGES: Record<Phase, string> = {
  menstrual:  "Low energy is valid right now — your body is doing a lot. Be gentle with yourself today.",
  follicular: "Your energy is quietly rebuilding. A good window to start something new or revisit an idea.",
  ovulation:  "Peak energy and peak vibes. You might feel extra sharp or social today — lean into it.",
  luteal:     "Things can feel heavier as your cycle winds down. That's hormones, not you.",
  late:       "You're in the in-between space right now. Rest where you can — your next cycle is close.",
};

// ─── Mood display helpers ─────────────────────────────────────────────────────
const MOOD_EMOJIS: Record<string, string> = {
  happy:     "😊",
  calm:      "😌",
  anxious:   "😰",
  sad:       "😢",
  irritable: "😤",
  energised: "⚡️",
  tired:     "😴",
};

// ─── Fertile window ───────────────────────────────────────────────────────────
function getFertileStatus(
  currentDay: number,
  cycleLength: number
): { label: string; sub: string; accent: string } {
  const ovDay      = Math.max(cycleLength - 14, 10);
  const fertStart  = Math.max(ovDay - 4, 1);
  const fertEnd    = ovDay + 1;

  if (currentDay >= fertStart && currentDay <= fertEnd) {
    return { label: "Fertile window", sub: "open now 🌿", accent: "#0F6E56" };
  }
  if (currentDay < fertStart) {
    const d = fertStart - currentDay;
    return { label: `In ${d} day${d === 1 ? "" : "s"}`, sub: "fertile window", accent: "#26215C" };
  }
  const toNext = cycleLength - currentDay + fertStart;
  return { label: `~${toNext} days`, sub: "next fertile window", accent: "#6B6591" };
}

// ─── Cycle Wheel ──────────────────────────────────────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Clockwise SVG arc path from startDeg to endDeg (0 = 12 o'clock). */
function describeArc(
  cx: number, cy: number, r: number,
  startDeg: number, endDeg: number,
): string {
  const s    = polarToCartesian(cx, cy, r, startDeg);
  const e    = polarToCartesian(cx, cy, r, endDeg);
  const span = ((endDeg - startDeg) + 360) % 360;
  const large = span > 180 ? 1 : 0;
  return (
    `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} ` +
    `A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
  );
}

function CycleWheel({
  cycleLength,
  periodLength,
  currentDay,
  size: sizeProp,
}: {
  cycleLength: number;
  periodLength: number;
  currentDay: number;
  size?: number;
}) {
  const wheelSize  = sizeProp ?? Math.min(SCREEN_WIDTH - 48, 300);
  const cx         = wheelSize / 2;
  const cy         = wheelSize / 2;
  const dotRingR   = wheelSize * 0.42;
  const dotR       = wheelSize * 0.033;
  const todayDotR  = wheelSize * 0.048;
  const mascotSize = wheelSize * 0.50;
  const arcSW      = wheelSize * 0.011; // phase arc stroke width
  const dayArc     = 360 / cycleLength; // degrees per day

  const currentPhase = getPhaseForDay(currentDay, cycleLength, periodLength);
  const { menstrualEnd, follicularEnd, ovulationEnd } =
    getPhaseBoundaries(cycleLength, periodLength);

  // ── Selected-day state ────────────────────────────────────────────────────
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (dismissRef.current) clearTimeout(dismissRef.current); }, []);

  // ── Ambient drift ─────────────────────────────────────────────────────────
  // One full revolution every ~200 s. Phase arcs and dots are in the same
  // rotating layer so they stay aligned. Mascot stays outside — always upright.
  const reducedMotion = useReducedMotion();
  const driftDeg      = useSharedValue(0);

  useEffect(() => {
    if (!reducedMotion) {
      driftDeg.value = withRepeat(
        withTiming(360, { duration: 200_000, easing: Easing.linear }),
        -1, false,
      );
    } else {
      driftDeg.value = 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${driftDeg.value}deg` }],
  }));

  // ── Touch handler — compensates for current drift ─────────────────────────
  const handleResponderGrant = useCallback((evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    const dx   = locationX - cx;
    const dy   = locationY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Tapping the centre dismisses any active selection
    if (dist < dotRingR * 0.55) {
      setSelectedDay(null);
      if (dismissRef.current) clearTimeout(dismissRef.current);
      return;
    }

    // Only register taps near the dot ring (±13% of wheel size)
    if (Math.abs(dist - dotRingR) > wheelSize * 0.13) return;

    // Angle from 12 o'clock, clockwise
    const touchAngle    = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360;
    // Subtract current drift offset so we hit the correct logical dot
    const adjustedAngle = (touchAngle - driftDeg.value + 720) % 360;
    const rawDay        = Math.round((adjustedAngle / 360) * cycleLength);
    const day           = rawDay === 0 ? cycleLength : rawDay;

    setSelectedDay((prev) => (prev === day ? null : day));
    if (dismissRef.current) clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(() => setSelectedDay(null), 3500);
  }, [cx, cy, dotRingR, wheelSize, cycleLength, driftDeg]);

  // ── SVG content (inside rotating layer) ───────────────────────────────────
  function dayToAngle(d: number) { return ((d - 1) / cycleLength) * 360; }

  // Phase arc segments — thin coloured strokes that match their dot runs
  const phaseArcDefs = [
    { phase: "menstrual"  as Phase, s: 1,                   e: menstrualEnd   },
    { phase: "follicular" as Phase, s: menstrualEnd  + 1,   e: follicularEnd  },
    { phase: "ovulation"  as Phase, s: follicularEnd + 1,   e: ovulationEnd   },
    { phase: "luteal"     as Phase, s: ovulationEnd  + 1,   e: cycleLength    },
  ];

  const arcElements = phaseArcDefs.map(({ phase, s, e }) => (
    <Path
      key={phase}
      d={describeArc(cx, cy, dotRingR, dayToAngle(s) - dayArc * 0.3, dayToAngle(e) + dayArc * 0.5)}
      fill="none"
      stroke={PHASE_DOT_COLORS[phase]}
      strokeWidth={arcSW}
      strokeLinecap="round"
      opacity={0.25}
    />
  ));

  // Day dots
  const dotElements: React.ReactNode[] = [];
  for (let d = 1; d <= cycleLength; d++) {
    const pos      = polarToCartesian(cx, cy, dotRingR, dayToAngle(d));
    const dayPhase = getPhaseForDay(d, cycleLength, periodLength);
    const color    = PHASE_DOT_COLORS[dayPhase];
    const isToday  = d === currentDay;
    const isSel    = d === selectedDay;

    if (isToday) {
      // 3-layer: wide glow → solid → white pip
      dotElements.push(
        <G key={d}>
          <Circle cx={pos.x} cy={pos.y} r={todayDotR * 1.75} fill={color} opacity={0.14} />
          <Circle cx={pos.x} cy={pos.y} r={todayDotR}        fill={color} />
          <Circle cx={pos.x} cy={pos.y} r={todayDotR * 0.38} fill="#FFFFFF" opacity={0.92} />
        </G>
      );
    } else if (isSel) {
      // Selected: smaller glow, solid, white pip
      dotElements.push(
        <G key={d}>
          <Circle cx={pos.x} cy={pos.y} r={todayDotR * 1.45} fill={color} opacity={0.18} />
          <Circle cx={pos.x} cy={pos.y} r={dotR * 1.28}      fill={color} />
          <Circle cx={pos.x} cy={pos.y} r={dotR * 0.44}      fill="#FFFFFF" opacity={0.88} />
        </G>
      );
    } else {
      dotElements.push(
        <Circle key={d} cx={pos.x} cy={pos.y} r={dotR} fill={color} opacity={0.80} />
      );
    }
  }

  // ── Selected-day derived values ────────────────────────────────────────────
  const selPhase  = selectedDay != null ? getPhaseForDay(selectedDay, cycleLength, periodLength) : null;
  const selColor  = selPhase ? PHASE_DOT_COLORS[selPhase] : "#26215C";
  const selLabel  = selPhase ? phaseConfig[selPhase].label : "";

  return (
    <View
      style={{ width: wheelSize, height: wheelSize, alignItems: "center", justifyContent: "center" }}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleResponderGrant}
    >
      {/* Static orbit rings — never rotate, give depth to the field */}
      <Svg
        width={wheelSize} height={wheelSize}
        style={{ position: "absolute" }}
        pointerEvents="none"
      >
        <Circle cx={cx} cy={cy} r={dotRingR}        fill="none" stroke="#26215C" strokeWidth={1.2} opacity={0.09} />
        <Circle cx={cx} cy={cy} r={dotRingR * 0.60} fill="none" stroke="#26215C" strokeWidth={0.8} opacity={0.05} />
      </Svg>

      {/* Rotating layer: phase arcs + dots (always aligned with each other) */}
      <Animated.View
        style={[{ position: "absolute", width: wheelSize, height: wheelSize }, driftStyle]}
        pointerEvents="none"
      >
        <Svg width={wheelSize} height={wheelSize}>
          {arcElements}
          {dotElements}
        </Svg>
      </Animated.View>

      {/* Centre: mascot normally; selected-day callout on tap */}
      <View style={{ width: mascotSize, height: mascotSize, alignItems: "center", justifyContent: "center" }}>
        {selectedDay != null ? (
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={{
              fontSize: 28, fontWeight: "800", color: selColor,
              letterSpacing: -0.5, lineHeight: 32,
            }}>
              Day {selectedDay}
            </Text>
            <Text style={{
              fontSize: 10, fontWeight: "700", color: "#26215C",
              opacity: 0.5, letterSpacing: 1.4, textTransform: "uppercase",
            }}>
              {selLabel}
            </Text>
          </View>
        ) : (
          <LannaMascot phase={currentPhase} size={mascotSize} />
        )}
      </View>
    </View>
  );
}

// ─── Bento tile icons ─────────────────────────────────────────────────────────
// Stroke-based line art — always 28×28, inherits a `color` prop so they work
// on both cream tiles (#26215C) and the coral accent tile (#FAECE7).

function MoodTileIcon({ color = "#26215C" }: { color?: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Circle cx={14} cy={14} r={9}    fill="none" stroke={color} strokeWidth={1.9} />
      <Circle cx={11} cy={12.5} r={1.3} fill={color} />
      <Circle cx={17} cy={12.5} r={1.3} fill={color} />
      <Path
        d="M 10.5 16.5 Q 14 20 17.5 16.5"
        fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round"
      />
    </Svg>
  );
}

function FertilityTileIcon({ color = "#26215C" }: { color?: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      {/* Stem */}
      <Path d="M 14 23 L 14 13" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      {/* Left leaf */}
      <Path
        d="M 14 16 C 9 15 7 10 9 7 C 12 7 14 11 14 16"
        fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* Right leaf */}
      <Path
        d="M 14 13 C 14 9 17 7 20 8 C 20 12 17 15 14 16"
        fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogTileIcon({ color = "#26215C" }: { color?: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      {/* Pencil body */}
      <Path
        d="M 8 20 L 18 8 L 21 11 L 11 23 Z"
        fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* Eraser band */}
      <Path d="M 17 9 L 20 12" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      {/* Tip */}
      <Path d="M 9 21 L 11 23 L 7 24 Z" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

function LearnTileIcon({ color = "#26215C" }: { color?: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      {/* Left page */}
      <Path
        d="M 14 8 Q 8 8 7 10 L 7 21 Q 8 20 14 21"
        fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Right page */}
      <Path
        d="M 14 8 Q 20 8 21 10 L 21 21 Q 20 20 14 21"
        fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Spine */}
      <Path d="M 14 8 L 14 21" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      {/* Page lines — left */}
      <Path d="M 9 13 L 13 13" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
      <Path d="M 9 16 L 13 16" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
      {/* Page lines — right */}
      <Path d="M 15 13 L 19 13" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
      <Path d="M 15 16 L 19 16" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
    </Svg>
  );
}

function SummaryTileIcon({ color = "#26215C", size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {/* Document outline with folded corner */}
      <Path
        d="M 6 4 L 6 24 Q 6 25 7 25 L 21 25 Q 22 25 22 24 L 22 8 L 18 4 Z"
        fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* Folded corner crease */}
      <Path d="M 18 4 L 18 8 L 22 8" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Activity / heartbeat line */}
      <Path
        d="M 8 16 L 10 16 L 12 12 L 14 20 L 16 16 L 18 16"
        fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Header rule */}
      <Path d="M 8 8 L 16 8" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={0.55} />
    </Svg>
  );
}

// ─── Phase legend ─────────────────────────────────────────────────────────────
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

// ─── Milestone / streak helpers ───────────────────────────────────────────────
interface MilestoneData { label: string; emoji: string; }

function calcStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;
  const logDates = new Set(logs.map((l) => l.date.slice(0, 10)));
  const d = new Date();
  const fmt = (date: Date) => {
    const y   = date.getFullYear();
    const mo  = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  };
  if (!logDates.has(fmt(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (logDates.has(fmt(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

function calcMilestone(logs: DailyLog[], cycleCount: number): MilestoneData | null {
  const uniqueDays = new Set(logs.map((l) => l.date.slice(0, 10))).size;
  if (cycleCount >= 3)  return { emoji: "🌺", label: "3 cycles logged" };
  if (cycleCount >= 2)  return { emoji: "💜", label: "2 cycles logged" };
  if (uniqueDays >= 90) return { emoji: "🌙", label: "90 days of data" };
  if (uniqueDays >= 60) return { emoji: "💫", label: "60 days of data" };
  if (cycleCount >= 1)  return { emoji: "✨", label: "1 cycle logged" };
  if (uniqueDays >= 28) return { emoji: "🌸", label: "28 days tracked" };
  if (uniqueDays >= 14) return { emoji: "🌿", label: "14 days tracked" };
  if (uniqueDays >= 7)  return { emoji: "🌱", label: "7 days tracked" };
  if (uniqueDays >= 1)  return { emoji: "🌱", label: "First log!" };
  return null;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function LotusCycleScreen() {
  const insets      = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation  = useNavigation();

  const [profile,            setProfile]            = useState<UserProfile | null>(null);
  const [dailyLogs,          setDailyLogs]          = useState<DailyLog[]>([]);
  const [summaryVisible,     setSummaryVisible]     = useState(false);
  const [quickLogVisible,    setQuickLogVisible]    = useState(false);
  const [quickLogDomain,     setQuickLogDomain]     = useState<QuickLogDomain>("flow");
  const [reactionVisible,    setReactionVisible]    = useState(false);
  const [reactionMessage,    setReactionMessage]    = useState("");
  const [thresholdCardVisible, setThresholdCardVisible] = useState(false);
  const [thresholdEventDate, setThresholdEventDate] = useState<string | null>(null);

  const { data, loading } = useLotusCycle(profile?.id || "");
  const { activeNudge }   = useLannaCheckIn();

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

  const hasCycleDate  = !!(profile?.lastPeriodStart);
  const cycleLength   = profile?.cycleLength  || DEFAULT_CYCLE_LENGTH;
  const periodLength  = profile?.periodLength || 5;
  const isLate        = data?.isLate          || false;
  const currentDay    = isLate
    ? (data?.rawCycleDay     || DEFAULT_CURRENT_DAY)
    : (data?.currentCycleDay || DEFAULT_CURRENT_DAY);
  const clampedDay    = Math.min(currentDay, cycleLength);

  const currentPhase: Phase = getPhaseForDay(clampedDay, cycleLength, periodLength);
  const config              = phaseConfig[currentPhase];

  const userName = profile?.name || "";
  const greeting = userName ? `Hey ${userName}` : "Hey";

  const todayRawLog = useMemo(() => {
    const today = localDateString();
    return dailyLogs.find((l) => l.date.slice(0, 10) === today) ?? null;
  }, [dailyLogs]);

  const quickLogPrefill: QuickLogPrefill | undefined = todayRawLog
    ? {
        flow:     todayRawLog.flow,
        mood:     todayRawLog.mood     ?? undefined,
        energy:   todayRawLog.energy   ?? undefined,
        symptoms: todayRawLog.symptoms,
      }
    : undefined;

  const cycleCount = countLoggedCycles(dailyLogs);
  const milestone  = calcMilestone(dailyLogs, cycleCount);
  const streak     = calcStreak(dailyLogs);

  useEffect(() => {
    if (!profile) return;
    const cycleData   = data ?? null;
    const lastLogDate = dailyLogs.length > 0
      ? [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date))[0].date
      : null;
    maybeSchedulePhaseReminder(profile, cycleData as any, dailyLogs).catch(() => {});
    maybeScheduleLapsedUserNudge(lastLogDate).catch(() => {});
    maybeScheduleHealthSummaryReminder(dailyLogs).catch(() => {});
  }, [profile?.id, dailyLogs.length, data?.currentPhase]);

  useEffect(() => {
    if (!milestone?.label) return;
    const key = milestoneKeyFromLabel(milestone.label);
    if (key) maybeFireMilestoneNudge(key, milestone.label).catch(() => {});
  }, [milestone?.label]);

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
      .catch(()   => setThresholdCardVisible(false));
  }, [dailyLogs]);

  const handleThresholdDismiss = () => {
    setThresholdCardVisible(false);
    if (thresholdEventDate) dismissThresholdCard(thresholdEventDate).catch(() => {});
  };

  const handleQuickLog = (id: string) => {
    setQuickLogDomain(id as QuickLogDomain);
    setQuickLogVisible(true);
  };

  // Derived display values
  const todayQuickLog    = getTodayQuickLog(dailyLogs);
  const todayMood        = todayQuickLog.mood;
  const moodEmoji        = todayMood ? (MOOD_EMOJIS[todayMood] ?? "💭") : null;
  const fertileStatus    = getFertileStatus(clampedDay, cycleLength);

  const companionMessage = LANNA_COMPANION_MESSAGES[currentPhase];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:    insets.top + 16,
            paddingBottom: tabBarHeight + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.headerRight}>
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
            <Pressable
              onPress={() => (navigation as any).navigate("ProfileTab")}
              style={({ pressed }) => [styles.profileBtn, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityLabel="Profile"
              accessibilityRole="button"
            >
              <Svg width={22} height={22} viewBox="0 0 22 22">
                {/* Head */}
                <Circle cx={11} cy={7.5} r={3.8} fill="#26215C" />
                {/* Shoulders */}
                <Path
                  d="M 2.5 19.5 Q 11 13 19.5 19.5"
                  stroke="#26215C"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </Pressable>
          </View>
        </View>

        {/* ── No cycle date state ────────────────────────────────────── */}
        {!hasCycleDate ? (
          <View style={styles.noCycleDateSection}>
            <LannaMascot phase="follicular" size={120} expression="bright" />
            <Text style={styles.noCycleDateTitle}>Let's set your cycle</Text>
            <Text style={styles.noCycleDateBody}>
              Add the date your last period started so I can track where you are in your cycle.
            </Text>
            <Pressable
              onPress={() => (navigation as any).navigate("EditProfile")}
              style={({ pressed }) => [styles.noCycleDateBtn, { opacity: pressed ? 0.82 : 1 }]}
            >
              <Text style={styles.noCycleDateBtnText}>Set period date →</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* ── Bento Row 1: Cycle wheel + Phase info ─────────────── */}
            <View style={styles.bentoRow}>

              {/* Wheel tile */}
              <View style={[styles.wheelTile, { width: WHEEL_TILE_W }]}>
                <CycleWheel
                  cycleLength={cycleLength}
                  periodLength={periodLength}
                  currentDay={clampedDay}
                  size={WHEEL_TILE_W - 16}
                />
              </View>

              {/* Phase info tile */}
              <View style={[styles.phaseTile, { width: PHASE_TILE_W }]}>
                <View style={styles.phasePill}>
                  <Text style={styles.phasePillText}>{config.label}</Text>
                </View>
                <Text style={styles.bentoDayNum}>{clampedDay}</Text>
                <Text style={styles.bentoDayOf}>of {cycleLength} days</Text>
                <View style={styles.phaseTileDivider} />
                <Text style={styles.bentoTagline}>{config.tagline}</Text>
              </View>
            </View>

            {/* ── Lanna companion tile (full-width) ─────────────────── */}
            <View style={styles.companionTile}>
              <LannaMascot phase={currentPhase} size={46} expression="bright" />
              <View style={styles.companionBody}>
                <Text style={styles.companionLabel}>Lanna</Text>
                <Text style={styles.companionMessage}>{companionMessage}</Text>
              </View>
            </View>

            {/* ── Bento Row 2: Mood + Fertile window ────────────────── */}
            <View style={styles.bentoRow}>

              {/* Mood tile */}
              <Pressable
                onPress={() => handleQuickLog("mood")}
                style={({ pressed }) => [
                  styles.halfTile,
                  { width: HALF_TILE_W, opacity: pressed ? 0.88 : 1 },
                ]}
                accessibilityLabel={todayMood ? `Mood logged: ${todayMood}` : "Log your mood"}
                accessibilityRole="button"
              >
                <View style={{ marginBottom: 4 }}>
                  <MoodTileIcon />
                </View>
                <Text style={styles.halfTileLabel}>Mood</Text>
                {todayMood ? (
                  <Text style={styles.halfTileValue}>{todayMood} ✓</Text>
                ) : (
                  <Text style={styles.halfTilePrompt}>How are you feeling?</Text>
                )}
              </Pressable>

              {/* Fertile window tile */}
              <View style={[styles.halfTile, { width: HALF_TILE_W }]}>
                <View style={{ marginBottom: 4 }}>
                  <FertilityTileIcon />
                </View>
                <Text style={styles.halfTileLabel}>Fertility</Text>
                <Text style={[styles.halfTileValue, { color: fertileStatus.accent }]}>
                  {fertileStatus.label}
                </Text>
                <Text style={styles.halfTilePrompt}>{fertileStatus.sub}</Text>
              </View>
            </View>

            {/* ── Bento Row 3: Log symptoms + Learn this phase ──────── */}
            <View style={styles.bentoRow}>

              {/* Log symptoms tile */}
              <Pressable
                onPress={() => handleQuickLog("flow")}
                style={({ pressed }) => [
                  styles.halfTile,
                  styles.halfTileAccent,
                  { width: HALF_TILE_W, opacity: pressed ? 0.88 : 1 },
                ]}
                accessibilityLabel="Log today's symptoms"
                accessibilityRole="button"
              >
                <View style={{ marginBottom: 4 }}>
                  <LogTileIcon color="#FAECE7" />
                </View>
                <Text style={[styles.halfTileLabel, { color: "#FAECE7" }]}>Log today</Text>
                <Text style={[styles.halfTilePrompt, { color: "#F5C4B2" }]}>
                  flow · mood · pain · energy
                </Text>
              </Pressable>

              {/* Learn this phase tile */}
              <Pressable
                onPress={() => {
                  const parent = (navigation as any).getParent?.();
                  (parent ?? navigation).navigate("LearnTab");
                }}
                style={({ pressed }) => [
                  styles.halfTile,
                  { width: HALF_TILE_W, opacity: pressed ? 0.88 : 1 },
                ]}
                accessibilityLabel="Learn about this phase"
                accessibilityRole="button"
              >
                <View style={{ marginBottom: 4 }}>
                  <LearnTileIcon />
                </View>
                <Text style={styles.halfTileLabel}>Learn</Text>
                <Text style={styles.halfTilePrompt}>{config.label} phase →</Text>
              </Pressable>
            </View>

            {/* ── Threshold nudge card ───────────────────────────────── */}
            {thresholdCardVisible && (
              <LannaThresholdCard
                currentPhase={currentPhase}
                onDismiss={handleThresholdDismiss}
                conditionId={activeNudge?.pattern.conditionId ?? "endometriosis"}
              />
            )}

            {/* ── Endo tracker card ──────────────────────────────────── */}
            {profile?.hasEndometriosis && (
              <Pressable
                onPress={() => (navigation as any).navigate("EndoTracker")}
                style={({ pressed }) => [styles.endoCard, { opacity: pressed ? 0.88 : 1 }]}
                accessibilityLabel="Track your endometriosis symptoms today"
                accessibilityRole="button"
              >
                <View style={styles.endoCardLeft}>
                  <Text style={styles.endoCardTitle}>Track your endo symptoms</Text>
                  <Text style={styles.endoCardSub}>Pain, bleeding, and more · ~2 min</Text>
                </View>
                <Text style={styles.endoCardArrow}>→</Text>
              </Pressable>
            )}

            {/* ── Phase legend ───────────────────────────────────────── */}
            <PhaseLegend />
          </>
        )}

        {/* ── Health Summary CTA (always visible) ───────────────────── */}
        <Pressable
          onPress={() => setSummaryVisible(true)}
          style={({ pressed }) => [styles.summaryCta, { opacity: pressed ? 0.82 : 1 }]}
        >
          <View style={styles.summaryCtaInner}>
            <SummaryTileIcon color="#26215C" size={22} />
            <View style={styles.summaryCtaText}>
              <Text style={styles.summaryCtaTitle}>My Health Summary</Text>
              <Text style={styles.summaryCtaSub}>Share your cycle data with your provider</Text>
            </View>
            <Text style={styles.summaryCtaArrow}>→</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* ── Sheets / overlays ─────────────────────────────────────────── */}
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
          const today             = localDateString();
          const hadExistingTodayLog = dailyLogs.some(
            (l) => l.date.slice(0, 10) === today
          );
          storage.getDailyLogs().then((fresh) => {
            setDailyLogs(fresh);
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEEDFE",
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "flex-start",   // bento tiles are left-anchored
  },

  // Header
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(38,33,92,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: -0.3,
  },
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
  milestoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(148,144,200,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  milestoneEmoji: { fontSize: 13 },
  milestoneText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A4580",
  },

  // ── Bento shared ──────────────────────────────────────────────────────────
  bentoRow: {
    width: "100%",
    flexDirection: "row",
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },

  // ── Row 1: Wheel tile ─────────────────────────────────────────────────────
  wheelTile: {
    borderRadius: 24,
    backgroundColor: "#FAF8F3",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    // subtle shadow for tactile depth
    shadowColor: "#26215C",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // ── Row 1: Phase info tile ────────────────────────────────────────────────
  phaseTile: {
    borderRadius: 24,
    backgroundColor: "#FAF8F3",
    padding: 16,
    justifyContent: "center",
    gap: 4,
    shadowColor: "#26215C",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  phasePill: {
    alignSelf: "flex-start",
    backgroundColor: "#0F6E56",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FAF8F3",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  bentoDayNum: {
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 38,
    fontWeight: "800",
    color: "#26215C",
    lineHeight: 42,
    letterSpacing: -1,
  },
  bentoDayOf: {
    fontSize: 11,
    color: "#6B6591",
    fontWeight: "500",
  },
  phaseTileDivider: {
    height: 1,
    backgroundColor: "rgba(74,69,128,0.10)",
    marginVertical: 8,
  },
  bentoTagline: {
    fontSize: 12,
    color: "#4A4580",
    lineHeight: 16,
    fontStyle: "italic",
  },

  // ── Lanna companion tile ──────────────────────────────────────────────────
  companionTile: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#FAF8F3",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    marginBottom: TILE_GAP,
    shadowColor: "#26215C",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  companionBody: {
    flex: 1,
    gap: 4,
  },
  companionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F6E56",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  companionMessage: {
    fontSize: 14,
    color: "#26215C",
    lineHeight: 20,
    fontWeight: "500",
  },

  // ── Half tiles (rows 2 + 3) ───────────────────────────────────────────────
  halfTile: {
    borderRadius: 20,
    backgroundColor: "#FAF8F3",
    padding: 16,
    minHeight: 110,
    justifyContent: "center",
    gap: 4,
    shadowColor: "#26215C",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  halfTileAccent: {
    backgroundColor: "#D85A30",
  },
  halfTileEmoji: {
    marginBottom: 4,
  },
  halfTileLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#26215C",
  },
  halfTileValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#26215C",
  },
  halfTilePrompt: {
    fontSize: 11,
    color: "#6B6591",
    lineHeight: 15,
  },

  // ── Endo tracker card ─────────────────────────────────────────────────────
  endoCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: TILE_GAP,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAF8F3",
    borderWidth: 1.5,
    borderColor: "#D85A3044",
  },
  endoCardLeft: {
    gap: 3,
    flex: 1,
  },
  endoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#26215C",
  },
  endoCardSub: {
    fontSize: 12,
    color: "#4A4580",
  },
  endoCardArrow: {
    fontSize: 18,
    color: "#D85A30",
    fontWeight: "600",
    marginLeft: 8,
  },

  // ── Phase legend ──────────────────────────────────────────────────────────
  legendRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 20,
    marginTop: 4,
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

  // ── Health summary CTA ────────────────────────────────────────────────────
  summaryCta: {
    width: "100%",
    marginTop: 4,
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
  summaryCtaIcon: { fontSize: 22 },
  summaryCtaText: { flex: 1, gap: 2 },
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

  // ── No cycle date state ───────────────────────────────────────────────────
  noCycleDateSection: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  noCycleDateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#26215C",
    textAlign: "center",
    letterSpacing: 0.1,
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
