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
import { Fonts } from "@/constants/theme";
import { neutral, getPhaseColors } from "@/constants/colors";
import { getPhaseGradient, toPhaseName } from "@/constants/phase";
import { storage, calculateCycleData } from "@/lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_CURRENT_DAY = 12;

const PHASE_CIRCLE_COLORS: Record<Phase, string> = {
  menstrual: "#F472B6",
  follicular: "#F9C8E0",
  ovulation: "#F59E0B",
  luteal: "#D8B4FE",
};

const PHASE_LABEL_COLORS: Record<Phase, string> = {
  menstrual: "#E8588D",
  follicular: "#D98CB3",
  ovulation: "#D97706",
  luteal: "#9333EA",
};

type LotusVariant = "bud" | "rising" | "bloom" | "closing";

const LOTUS_IMAGES: Record<LotusVariant, any> = {
  bud: require("@/assets/images/lotus-menstrual.png"),
  rising: require("@/assets/images/lotus-follicular.png"),
  bloom: require("@/assets/images/lotus-ovulation.png"),
  closing: require("@/assets/images/lotus-luteal.png"),
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

function PhaseGridCard({ phase, isActive }: { phase: Phase; isActive: boolean }) {
  const config = phaseConfig[phase];
  const circleColor = PHASE_CIRCLE_COLORS[phase];
  const labelColor = PHASE_LABEL_COLORS[phase];
  const circleSize = (SCREEN_WIDTH - 80) / 2 - 16;

  return (
    <View style={[styles.phaseCardItem, isActive ? styles.phaseCardActive : null]}>
      <View
        style={[
          styles.phaseCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            overflow: "hidden",
          },
          isActive ? styles.phaseCircleActive : null,
        ]}
      >
        <PhaseLotus variant={config.lotusVariant} size={circleSize} />
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
  currentDay,
  selectedDay,
  onDaySelect,
}: {
  cycleLength: number;
  currentDay: number;
  selectedDay: number;
  onDaySelect: (day: number) => void;
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

  const selectedPhase = getPhaseForDay(selectedDay, cycleLength);
  const config = phaseConfig[selectedPhase];
  const phaseWashColor = getPhaseColors(selectedPhase).softBg;
  const lotusCircleColor = PHASE_CIRCLE_COLORS[selectedPhase];

  const phaseGradientDefs: React.ReactNode[] = [];
  const addedGradients = new Set<string>();
  const daySegments: React.ReactNode[] = [];

  for (let d = 1; d <= cycleLength; d++) {
    const startAngle = ((d - 1) / cycleLength) * 360 + gapDeg / 2;
    const endAngle = startAngle + segmentAngle;
    const dayPhase = getPhaseForDay(d, cycleLength);
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
          Day {selectedDay} of {cycleLength}
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

export function CycleScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();

  const [cycleLength, setCycleLength] = useState(DEFAULT_CYCLE_LENGTH);
  const [currentDay, setCurrentDay] = useState(DEFAULT_CURRENT_DAY);
  const [selectedDay, setSelectedDay] = useState(DEFAULT_CURRENT_DAY);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const profile = await storage.getUserProfile();
          if (!profile || !active) return;
          const cycleData = calculateCycleData(profile);
          setCycleLength(profile.cycleLength || DEFAULT_CYCLE_LENGTH);
          const day = cycleData.currentDay || DEFAULT_CURRENT_DAY;
          setCurrentDay(day);
          setSelectedDay(day);
        } catch {}
      })();
      return () => { active = false; };
    }, [])
  );

  const currentPhase = getPhaseForDay(selectedDay, cycleLength);

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

        <InteractiveCycleWheel
          cycleLength={cycleLength}
          currentDay={currentDay}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
        />
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  phaseCardItem: {
    width: (SCREEN_WIDTH - 80) / 2,
    alignItems: "center",
    marginBottom: 20,
    opacity: 0.7,
  },
  phaseCardActive: {
    opacity: 1,
  },
  phaseCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  phaseCircleActive: {
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  phaseLabel: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  phaseSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: neutral.textSecondary,
    letterSpacing: 0.1,
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
});

export default CycleScreen;
