import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import {
  Phase,
  getPhaseForDay,
  PHASE_ORDER,
  phaseConfig,
} from "@/constants/phaseConfig";
import { GlassSurface } from "@/components/GlassSurface";
import { Fonts, BorderRadius } from "@/constants/theme";
import { neutral, getPhaseColors } from "@/constants/colors";
import { getPhaseGradient, toPhaseName } from "@/constants/phase";
import { storage, UserProfile } from "@/lib/storage";
import { useLotusCycle } from "@/hooks/useLotusCycle";
import { PHASE_FOODS, PHASE_VIBES, PHASE_MOVEMENT, PHASE_SELFCARE, CyclePhase } from "@/lib/dailyDecode";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_CURRENT_DAY = 1;

const PHASE_CIRCLE_COLORS: Record<Phase, string> = {
  menstrual: "#F472B6",
  follicular: "#F9C8E0",
  ovulation: "#F59E0B",
  luteal: "#D8B4FE",
  late: "#D8B4FE",
};

const PHASE_LABEL_COLORS: Record<Phase, string> = {
  menstrual: "#C2185B",
  follicular: "#8E4470",
  ovulation: "#B8730A",
  luteal: "#7B1FA2",
  late: "#7B1FA2",
};

type LotusVariant = "bud" | "rising" | "bloom" | "closing" | "waiting";

const LOTUS_IMAGES: Record<LotusVariant, any> = {
  bud: require("@/assets/images/lotus-menstrual.png"),
  rising: require("@/assets/images/lotus-follicular.png"),
  bloom: require("@/assets/images/lotus-ovulation.png"),
  closing: require("@/assets/images/lotus-luteal.png"),
  waiting: require("@/assets/images/lotus-luteal.png"),
};

function PhaseLotus({ variant, size }: { variant: LotusVariant; size: number }) {
  const scaled = size * 1.18;
  const offset = (scaled - size) / 2;
  return (
    <View style={{ width: size, height: size, overflow: "hidden" }}>
      <Image
        source={LOTUS_IMAGES[variant]}
        style={{
          width: scaled,
          height: scaled,
          position: "absolute",
          top: -offset,
          left: -offset,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

const PHASE_CIRCLE_SIZE = 52;

function PhaseGridCard({ phase, isActive }: { phase: Phase; isActive: boolean }) {
  const config = phaseConfig[phase];
  const labelColor = PHASE_LABEL_COLORS[phase];

  return (
    <View style={[styles.phaseCardItem, isActive ? styles.phaseCardActive : null]}>
      <View
        style={[
          styles.phaseCircle,
          {
            width: PHASE_CIRCLE_SIZE,
            height: PHASE_CIRCLE_SIZE,
            borderRadius: PHASE_CIRCLE_SIZE / 2,
            overflow: "hidden",
            backgroundColor: PHASE_CIRCLE_COLORS[phase] + "30",
          },
          isActive ? styles.phaseCircleActive : null,
        ]}
      >
        <PhaseLotus variant={config.lotusVariant} size={PHASE_CIRCLE_SIZE} />
      </View>
      <Text style={[styles.phaseLabel, { color: labelColor }]}>{config.label}</Text>
      <Text style={styles.phaseSubtitle}>{config.subtitle}</Text>
    </View>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
  ].join(" ");
}

function cartesianToAngle(x: number, y: number, cx: number, cy: number): number {
  const dx = x - cx;
  const dy = y - cy;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  angle = angle + 90;
  if (angle < 0) angle += 360;
  return angle;
}

function angleToDayNumber(angle: number, cycleLength: number): number {
  const day = Math.round((angle / 360) * cycleLength) + 1;
  return Math.max(1, Math.min(cycleLength, day));
}

function CenterLotusInWheel({
  variant,
  size,
}: {
  variant: LotusVariant;
  size: number;
  bgColor: string;
}) {
  return (
    <View
      style={[
        styles.centerLotusCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        },
      ]}
    >
      <PhaseLotus variant={variant} size={size} />
    </View>
  );
}

function InteractiveCycleWheel({
  cycleLength,
  periodLength,
  currentDay,
  selectedDay,
  onDaySelect,
  isLate = false,
  daysLate = 0,
  rawCycleDay,
}: {
  cycleLength: number;
  periodLength: number;
  currentDay: number;
  selectedDay: number;
  onDaySelect: (day: number) => void;
  isLate?: boolean;
  daysLate?: number;
  rawCycleDay?: number;
}) {
  const size = Math.min(SCREEN_WIDTH - 40, 340);
  const strokeWidth = 24;
  const outerRadius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const gapDeg = 1.2;
  const segmentAngle = (360 - gapDeg * cycleLength) / cycleLength;

  const lastDayRef = useRef(selectedDay);
  const scale = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
  }, []);

  const handleDayChange = useCallback(
    (day: number) => {
      if (day !== lastDayRef.current) {
        lastDayRef.current = day;
        triggerHaptic();
        onDaySelect(day);
      }
    },
    [onDaySelect, triggerHaptic]
  );

  const handleGestureEvent = useCallback(
    (x: number, y: number) => {
      const angle = cartesianToAngle(x, y, cx, cy);
      const day = angleToDayNumber(angle, cycleLength);
      handleDayChange(day);
    },
    [cx, cy, cycleLength, handleDayChange]
  );

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
      runOnJS(handleGestureEvent)(event.x, event.y);
    })
    .onUpdate((event) => {
      runOnJS(handleGestureEvent)(event.x, event.y);
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });

  const tapGesture = Gesture.Tap().onEnd((event) => {
    runOnJS(handleGestureEvent)(event.x, event.y);
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const selectedPhase: Phase = (isLate && selectedDay === currentDay)
    ? "late"
    : getPhaseForDay(selectedDay, cycleLength, periodLength);
  const config = phaseConfig[selectedPhase];
  const phaseWashColor = getPhaseColors(selectedPhase).softBg;
  const lotusCircleColor = PHASE_CIRCLE_COLORS[selectedPhase];

  const phaseGradientDefs: React.ReactNode[] = [];
  const addedGradients = new Set<string>();
  const daySegments: React.ReactNode[] = [];

  for (let d = 1; d <= cycleLength; d++) {
    const startAngle = ((d - 1) / cycleLength) * 360 + gapDeg / 2;
    const endAngle = startAngle + segmentAngle;
    const dayPhase = getPhaseForDay(d, cycleLength, periodLength);
    const pName = toPhaseName(dayPhase);
    const gradId = `grad-${pName}`;

    if (!addedGradients.has(gradId)) {
      addedGradients.add(gradId);
      const [gStart, gMid, gEnd] = getPhaseGradient(pName);
      phaseGradientDefs.push(
        <SvgLinearGradient key={gradId} id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gStart} />
          <Stop offset="50%" stopColor={gMid} />
          <Stop offset="100%" stopColor={gEnd} />
        </SvgLinearGradient>
      );
    }

    const isPast = d <= currentDay;
    const isSelected = d === selectedDay;
    const isCurrent = d === currentDay;
    const opacity = isPast ? 1 : 0.25;

    daySegments.push(
      <Path
        key={d}
        d={describeArc(cx, cy, outerRadius, startAngle, endAngle)}
        stroke={`url(#${gradId})`}
        strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={isSelected ? 1 : opacity}
      />
    );

    if (isCurrent) {
      const midAngle = (startAngle + endAngle) / 2;
      const pos = polarToCartesian(cx, cy, outerRadius, midAngle);
      daySegments.push(
        <G key={`current-${d}`}>
          <Circle cx={pos.x} cy={pos.y} r={strokeWidth / 2 + 3} fill={neutral.bgSecondary} opacity={0.9} />
          <Circle cx={pos.x} cy={pos.y} r={4} fill={phaseConfig[dayPhase].color} />
        </G>
      );
    }
  }

  const lotusDisplaySize = (outerRadius - strokeWidth) * 1.0;

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.wheelContainer, animatedStyle]}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={neutral.bgSecondary} stopOpacity={1} />
                <Stop offset="80%" stopColor={neutral.bgPrimary} stopOpacity={0.95} />
                <Stop offset="100%" stopColor={neutral.bgSubtle} stopOpacity={0.9} />
              </RadialGradient>
              <RadialGradient id="phaseWash" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={phaseWashColor} stopOpacity={0.1} />
                <Stop offset="100%" stopColor={phaseWashColor} stopOpacity={0} />
              </RadialGradient>
              {phaseGradientDefs}
            </Defs>

            <Circle cx={cx} cy={cy} r={outerRadius + strokeWidth / 2 + 8} fill="url(#phaseWash)" />

            {daySegments}

            <Circle cx={cx} cy={cy} r={outerRadius - strokeWidth - 8} fill="url(#centerGlow)" />
          </Svg>

          <View style={styles.centerHub}>
            <CenterLotusInWheel
              variant={config.lotusVariant}
              size={lotusDisplaySize}
              bgColor={lotusCircleColor}
            />
            <Text style={[styles.hubPhase, { color: config.labelColor }]}>
              {config.label}
            </Text>
            <Text style={styles.hubTagline}>{config.tagline}</Text>
          </View>
        </View>

        <Text style={styles.dayText}>
          {isLate && selectedDay === currentDay
            ? `Day ${rawCycleDay || cycleLength} \u2022 ${daysLate} day${daysLate === 1 ? "" : "s"} late`
            : `Day ${selectedDay} of ${cycleLength}`
          }
        </Text>

        {selectedDay !== currentDay ? (
          <Pressable
            style={styles.returnButton}
            onPress={() => onDaySelect(currentDay)}
          >
            <Feather name="rotate-ccw" size={14} color={neutral.textSecondary} />
            <Text style={styles.returnButtonText}>Return to Today</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const LOTUS_SYNOPSIS = [
  {
    stage: "The Bud",
    phase: "Menstrual Phase",
    days: "Days 1–5",
    icon: "droplet" as const,
    color: "#C2185B",
    softBg: "#C2185B20",
    body: "Your lotus is a tightly closed bud — your body is shedding its lining and turning inward. This is a time for deep rest, gentle warmth, and honouring the release. Energy is at its lowest; let the bud sleep.",
  },
  {
    stage: "The Rising Lotus",
    phase: "Follicular Phase",
    days: "Days 6–13",
    icon: "trending-up" as const,
    color: "#8E4470",
    softBg: "#8E447020",
    body: "Petals begin to unfurl as oestrogen rises and a new follicle matures. Creativity and energy build steadily. This is your spring — plan, explore, and let new ideas take root.",
  },
  {
    stage: "Full Bloom",
    phase: "Ovulatory Phase",
    days: "Days 14–16",
    icon: "sun" as const,
    color: "#B8730A",
    softBg: "#B8730A20",
    body: "The lotus opens completely — you're at peak radiance. An egg is released, fertility peaks, and so does confidence and social energy. Shine, connect, and express yourself fully.",
  },
  {
    stage: "The Closing Lotus",
    phase: "Luteal Phase",
    days: "Days 17–28",
    icon: "moon" as const,
    color: "#7B1FA2",
    softBg: "#7B1FA220",
    body: "Petals draw gently inward as progesterone rises. Your body prepares to either nurture or release. It's a time for boundaries, reflection, and nesting. Honour the slowdown — the bud will return.",
  },
];

function LotusSynopsis({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <GlassSurface style={styles.synopsisCard} borderRadius={BorderRadius.lg} padding={16}>
      <Pressable onPress={onToggle} style={styles.synopsisHeader}>
        <View style={styles.synopsisHeaderLeft}>
          <Feather name="info" size={16} color={neutral.textSecondary} />
          <Text style={styles.synopsisHeaderText}>How the Lotus Cycle Works</Text>
        </View>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={neutral.textSecondary}
        />
      </Pressable>

      {isExpanded ? (
        <View style={styles.synopsisContent}>
          <Text style={styles.synopsisIntro}>
            The Lotus Cycle mirrors your menstrual journey through four stages of a lotus flower — from closed bud to full bloom and back again. Each stage reflects what's happening in your body and guides you toward what it needs most.
          </Text>

          {LOTUS_SYNOPSIS.map((item, index) => (
            <View key={index} style={styles.synopsisItem}>
              <View style={styles.synopsisItemHeader}>
                <View style={[styles.synopsisIconCircle, { backgroundColor: item.softBg }]}>
                  <Feather name={item.icon} size={14} color={item.color} />
                </View>
                <View style={styles.synopsisItemTitles}>
                  <Text style={[styles.synopsisStage, { color: item.color }]}>{item.stage}</Text>
                  <Text style={styles.synopsisPhaseDays}>{item.phase} · {item.days}</Text>
                </View>
              </View>
              <Text style={styles.synopsisBody}>{item.body}</Text>
            </View>
          ))}

          <Text style={styles.synopsisFooter}>
            Swipe around the wheel above to explore each day of your cycle. The lotus at the centre transforms as you move through your phases.
          </Text>
        </View>
      ) : null}
    </GlassSurface>
  );
}

export function LotusCycleScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const { data, loading } = useLotusCycle(profile?.id || "");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const userProfile = await storage.getUserProfile();
          if (!active) return;
          setProfile(userProfile);
        } catch (e) {
          console.error("[LotusCycleScreen] load error:", e);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const cycleLength = profile?.cycleLength || DEFAULT_CYCLE_LENGTH;
  const periodLength = profile?.periodLength || 5;
  const currentDay = data?.currentCycleDay || DEFAULT_CURRENT_DAY;
  const isLate = data?.isLate || false;
  const daysLate = data?.daysLate || 0;

  const [selectedDay, setSelectedDay] = useState(DEFAULT_CURRENT_DAY);
  const prevCurrentDayRef = useRef(DEFAULT_CURRENT_DAY);

  useEffect(() => {
    if (currentDay !== prevCurrentDayRef.current) {
      prevCurrentDayRef.current = currentDay;
      setSelectedDay(currentDay);
    }
  }, [currentDay]);

  const clampedSelectedDay = Math.min(selectedDay, cycleLength);
  const clampedCurrentDay = Math.min(currentDay, cycleLength);
  const isViewingToday = clampedSelectedDay === clampedCurrentDay;
  const currentPhase: Phase = (isLate && isViewingToday)
    ? "late"
    : getPhaseForDay(clampedSelectedDay, cycleLength, periodLength);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: tabBarHeight + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>The Lotus Cycle</Text>
          <Pressable
            style={styles.profileButton}
            onPress={() => (navigation as any).navigate("Profile")}
            accessibilityLabel="Profile"
          >
            <Feather name="user" size={20} color={neutral.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.phaseGrid}>
          {PHASE_ORDER.map((phase) => (
            <PhaseGridCard
              key={phase}
              phase={phase}
              isActive={phase === currentPhase}
            />
          ))}
        </View>

        <LotusSynopsis
          isExpanded={synopsisExpanded}
          onToggle={() => setSynopsisExpanded((v) => !v)}
        />

        <InteractiveCycleWheel
          cycleLength={cycleLength}
          periodLength={periodLength}
          currentDay={clampedCurrentDay}
          selectedDay={clampedSelectedDay}
          onDaySelect={setSelectedDay}
          isLate={isLate}
          daysLate={daysLate}
          rawCycleDay={data?.rawCycleDay}
        />

        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>Phase Insights</Text>

          <GlassSurface style={styles.insightCard} borderRadius={BorderRadius.lg} padding={16}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { backgroundColor: phaseConfig[currentPhase].softBg }]}>
                <Feather name="heart" size={16} color={phaseConfig[currentPhase].labelColor} />
              </View>
              <Text style={[styles.insightLabel, { color: phaseConfig[currentPhase].labelColor }]}>Vibes</Text>
            </View>
            <Text style={styles.insightBody}>{PHASE_VIBES[currentPhase as CyclePhase]}</Text>
          </GlassSurface>

          <GlassSurface style={styles.insightCard} borderRadius={BorderRadius.lg} padding={16}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { backgroundColor: phaseConfig[currentPhase].softBg }]}>
                <Feather name="activity" size={16} color={phaseConfig[currentPhase].labelColor} />
              </View>
              <Text style={[styles.insightLabel, { color: phaseConfig[currentPhase].labelColor }]}>
                {PHASE_MOVEMENT[currentPhase as CyclePhase].title}
              </Text>
            </View>
            <Text style={styles.insightBody}>{PHASE_MOVEMENT[currentPhase as CyclePhase].body}</Text>
          </GlassSurface>

          <GlassSurface style={styles.insightCard} borderRadius={BorderRadius.lg} padding={16}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { backgroundColor: phaseConfig[currentPhase].softBg }]}>
                <Feather name="coffee" size={16} color={phaseConfig[currentPhase].labelColor} />
              </View>
              <Text style={[styles.insightLabel, { color: phaseConfig[currentPhase].labelColor }]}>Foods for You</Text>
            </View>
            <View style={styles.foodChips}>
              {PHASE_FOODS[currentPhase as CyclePhase].map((food, i) => (
                <View key={i} style={[styles.foodChip, { backgroundColor: phaseConfig[currentPhase].softBg }]}>
                  <Text style={[styles.foodChipText, { color: phaseConfig[currentPhase].labelColor }]}>{food}</Text>
                </View>
              ))}
            </View>
          </GlassSurface>

          <GlassSurface style={styles.insightCard} borderRadius={BorderRadius.lg} padding={16}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { backgroundColor: phaseConfig[currentPhase].softBg }]}>
                <Feather name="sun" size={16} color={phaseConfig[currentPhase].labelColor} />
              </View>
              <Text style={[styles.insightLabel, { color: phaseConfig[currentPhase].labelColor }]}>Self-Care</Text>
            </View>
            <Text style={styles.insightBody}>{PHASE_SELFCARE[currentPhase as CyclePhase]}</Text>
          </GlassSurface>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: neutral.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: neutral.textPrimary,
    letterSpacing: 0.2,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  phaseCardItem: {
    alignItems: "center",
    opacity: 0.6,
    flex: 1,
  },
  phaseCardActive: {
    opacity: 1,
  },
  phaseCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  phaseCircleActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  phaseLabel: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    letterSpacing: 0.2,
    marginBottom: 1,
  },
  phaseSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: neutral.textSecondary,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerHub: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLotusCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hubPhase: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hubTagline: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: neutral.textSecondary,
    fontStyle: "italic",
  },
  dayText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: neutral.textPrimary,
    textAlign: "center",
    letterSpacing: 0.3,
    marginTop: 12,
  },
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignSelf: "center",
  },
  returnButtonText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: neutral.textSecondary,
  },
  insightsSection: {
    marginTop: 28,
    gap: 12,
  },
  insightsTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: neutral.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  insightCard: {
    gap: 10,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  insightIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  insightLabel: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  insightBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: neutral.textSecondary,
    lineHeight: 21,
  },
  foodChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  foodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  foodChipText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: "500",
  },
  synopsisCard: {
    marginBottom: 16,
  },
  synopsisHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  synopsisHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  synopsisHeaderText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: neutral.textPrimary,
    letterSpacing: 0.2,
  },
  synopsisContent: {
    marginTop: 14,
    gap: 16,
  },
  synopsisIntro: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: neutral.textSecondary,
    lineHeight: 20,
  },
  synopsisItem: {
    gap: 6,
  },
  synopsisItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  synopsisIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  synopsisItemTitles: {
    flex: 1,
  },
  synopsisStage: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  synopsisPhaseDays: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: neutral.textSecondary,
  },
  synopsisBody: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: neutral.textSecondary,
    lineHeight: 20,
    paddingLeft: 38,
  },
  synopsisFooter: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: neutral.textSecondary,
    fontStyle: "italic" as const,
    lineHeight: 18,
    marginTop: 4,
  },
});

export default LotusCycleScreen;
