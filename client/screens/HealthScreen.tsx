import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Rect, Path, Circle } from "react-native-svg";

import { LannaMascot } from "@/components/LannaMascot";
import { storage, UserProfile } from "@/lib/storage";
import { Phase, getPhaseForDay, phaseConfig } from "@/constants/phaseConfig";
import { phase as phaseTokens } from "@/constants/colors";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useLotusCycle } from "@/hooks/useLotusCycle";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BG = "#FDF5F8";
const TEXT_DARK = "#2D1F2B";
const TEXT_MID = "#5A4252";
const TEXT_SOFT = "#8A6F80";
const PINK = "#F06B9A";

// ─── Sleep bar chart ──────────────────────────────────────────────────────────

const SLEEP_DATA = [
  { day: "M", hours: 6.5 },
  { day: "T", hours: 7.2 },
  { day: "W", hours: 6.0 },
  { day: "T", hours: 7.8 },
  { day: "F", hours: 6.3 },
  { day: "S", hours: 8.1 },
  { day: "S", hours: 7.4 },
];

const SLEEP_GOAL = 7.5;

function SleepChart({ phaseColor }: { phaseColor: string }) {
  const chartW = 280;
  const chartH = 100;
  const barW = 24;
  const maxH = 80;
  const maxVal = 9;
  const avg = SLEEP_DATA.reduce((a, b) => a + b.hours, 0) / SLEEP_DATA.length;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Sleep this week</Text>
      <Text style={styles.chartSubtitle}>
        Avg {avg.toFixed(1)} hrs, a little {avg < SLEEP_GOAL ? "under" : "over"} your {SLEEP_GOAL} hr goal
      </Text>
      <Svg width={chartW} height={chartH + 20}>
        {SLEEP_DATA.map((d, i) => {
          const x = i * (barW + 16) + 8;
          const h = (d.hours / maxVal) * maxH;
          const y = maxH - h;
          const isGoal = d.hours >= SLEEP_GOAL;
          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={6}
                fill={isGoal ? phaseColor : phaseColor + "44"}
              />
            </React.Fragment>
          );
        })}
        {SLEEP_DATA.map((d, i) => {
          const x = i * (barW + 16) + 8 + barW / 2;
          return (
            <Path
              key={`label-${i}`}
              d={`M${x},${maxH + 8}`}
            />
          );
        })}
      </Svg>
      {/* Day labels below */}
      <View style={styles.sleepDayRow}>
        {SLEEP_DATA.map((d, i) => (
          <Text key={i} style={styles.sleepDayLabel}>{d.day}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Mood across cycle chart ──────────────────────────────────────────────────

function MoodChart({ phaseColor }: { phaseColor: string }) {
  // Placeholder curve: mood score across 4 phases
  const points = [
    { x: 30, y: 70 },
    { x: 90, y: 55 },
    { x: 150, y: 40 },
    { x: 210, y: 48 },
    { x: 270, y: 75 },
  ];
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, "");

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Mood across your cycle</Text>
      <Svg width={300} height={100}>
        <Path d={pathD} stroke={phaseColor} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={phaseColor} />
        ))}
      </Svg>
      <View style={styles.moodPhaseRow}>
        {["Menstrual", "Follicular", "Ovulatory", "Luteal"].map((ph) => (
          <Text key={ph} style={styles.moodPhaseLabel}>{ph}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HealthScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data: cycleData } = useLotusCycle(profile?.id ?? "");

  const loadData = async () => {
    try {
      const p = await storage.getUserProfile();
      setProfile(p);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Determine current phase
  const cycleLength = profile?.cycleLength ?? 28;
  const periodLength = profile?.periodLength ?? 5;
  const currentDay = cycleData?.currentCycleDay ?? 1;
  const currentPhase: Phase = getPhaseForDay(currentDay, cycleLength, periodLength);
  const config = phaseConfig[currentPhase];
  const phaseKey = currentPhase === "ovulation" ? "ovulatory" : currentPhase === "late" ? "luteal" : currentPhase;
  const phaseColor = (phaseTokens as any)[phaseKey]?.front ?? "#F06B9A";

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: tabBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={phaseColor} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <LannaMascot phase={currentPhase} size={42} />
          <View>
            <Text style={styles.pageTitle}>Health</Text>
            <Text style={styles.pageSubtitle}>Your patterns over time</Text>
          </View>
        </View>

        {/* Quarterly health check */}
        <View style={[styles.quarterlyCard, { backgroundColor: phaseColor + "22" }]}>
          <View style={[styles.quarterlyIcon, { backgroundColor: phaseColor }]}>
            <Text style={styles.quarterlyIconText}>+</Text>
          </View>
          <View style={styles.quarterlyText}>
            <Text style={[styles.quarterlyTitle, { color: phaseColor }]}>Quarterly health check</Text>
            <Text style={styles.quarterlyBody}>Blood pressure and waist circumference</Text>
            <Text style={styles.quarterlyMeta}>Last logged 4 months ago, due for a check</Text>
          </View>
        </View>

        {/* Patterns this month */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Patterns this month</Text>
          <View style={[styles.patternCard, { backgroundColor: phaseColor + "1A" }]}>
            <Text style={[styles.patternTitle, { color: phaseColor }]}>Fatigue and cravings cluster</Text>
            <Text style={styles.patternBody}>
              Shown up together 4 times this month.{"\n"}Worth mentioning at your next check-up.
            </Text>
          </View>
        </View>

        {/* Sleep chart */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Sleep this week</Text>
          <SleepChart phaseColor={phaseColor} />
        </View>

        {/* Mood chart */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Mood across your cycle</Text>
          <MoodChart phaseColor={phaseColor} />
        </View>

        {/* Navigate to other trackers */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>More trackers</Text>
          {[
            { label: "Supplements", route: "Supplements" },
            { label: "Medications", route: "Medications" },
            { label: "Gut Health", route: "GutHealth" },
          ].map((item) => (
            <Pressable
              key={item.route}
              onPress={() => (navigation as any).navigate(item.route)}
              style={[styles.trackerRow, { borderColor: phaseColor + "44" }]}
            >
              <Text style={styles.trackerRowLabel}>{item.label}</Text>
              <Text style={styles.trackerRowArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pageTitle: { fontSize: 22, fontWeight: "700", color: TEXT_DARK },
  pageSubtitle: { fontSize: 13, color: TEXT_SOFT },
  quarterlyCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  quarterlyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quarterlyIconText: { fontSize: 22, color: "#FFFFFF", fontWeight: "700" },
  quarterlyText: { flex: 1, gap: 2 },
  quarterlyTitle: { fontSize: 14, fontWeight: "700" },
  quarterlyBody: { fontSize: 13, color: TEXT_MID },
  quarterlyMeta: { fontSize: 12, color: TEXT_SOFT },
  sectionBlock: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  patternCard: { borderRadius: 14, padding: 14, gap: 4 },
  patternTitle: { fontSize: 14, fontWeight: "700" },
  patternBody: { fontSize: 13, color: TEXT_DARK, lineHeight: 19 },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  chartTitle: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  chartSubtitle: { fontSize: 12, color: TEXT_SOFT, marginBottom: 4 },
  sleepDayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: -8,
  },
  sleepDayLabel: { fontSize: 11, color: TEXT_SOFT, width: 24, textAlign: "center" },
  moodPhaseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  moodPhaseLabel: { fontSize: 10, color: TEXT_SOFT },
  trackerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
  },
  trackerRowLabel: { fontSize: 15, color: TEXT_DARK, fontWeight: "500" },
  trackerRowArrow: { fontSize: 22, color: TEXT_SOFT },
});
