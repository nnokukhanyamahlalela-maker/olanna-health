import React, { useCallback, useRef } from "react";
import { View, Text, Image as RNImage, StyleSheet, Dimensions, Platform } from "react-native";
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { getPhaseForDay, phaseConfig, Phase } from "@/constants/phaseConfig";
import { Fonts } from "@/constants/theme";
import { neutral, getPhaseColors } from "@/constants/colors";
import { getPhaseGradient, toPhaseName } from "@/constants/phase";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LotusCycleWheelProps {
  cycleLength?: number;
  periodLength?: number;
  currentDay?: number;
  selectedDay: number;
  onDaySelect: (day: number) => void;
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

type LotusVariant = "bud" | "rising" | "bloom" | "closing";

const LOTUS_PHASE_IMAGES: Record<LotusVariant, any> = {
  bud: require("@/assets/images/lotus-menstrual.png"),
  rising: require("@/assets/images/lotus-follicular.png"),
  bloom: require("@/assets/images/lotus-ovulation.png"),
  closing: require("@/assets/images/lotus-luteal.png"),
};

export function LotusCycleWheel({
  cycleLength = 28,
  periodLength = 5,
  currentDay = 22,
  selectedDay,
  onDaySelect,
}: LotusCycleWheelProps) {
  const size = Math.min(SCREEN_WIDTH - 48, 320);
  const strokeWidth = 22;
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

  const selectedPhase = getPhaseForDay(selectedDay, cycleLength, periodLength);
  const config = phaseConfig[selectedPhase];
  const phaseWashColor = getPhaseColors(selectedPhase).softBg;
  const lotusSize = (outerRadius - strokeWidth) * 1.4;

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

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
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

          <View style={[styles.lotusOverlay, { top: cy - lotusSize / 2 - 15, left: cx - lotusSize / 2 }]}>
            <RNImage
              source={LOTUS_PHASE_IMAGES[config.lotusVariant as LotusVariant]}
              style={{ width: lotusSize, height: lotusSize, borderRadius: lotusSize / 2 }}
              resizeMode="contain"
            />
          </View>

          <View style={styles.centerHub}>
            <View style={styles.centerTextContainer}>
              <Text style={styles.hubDayText}>
                Day {selectedDay} of {cycleLength}
              </Text>
              <Text style={[styles.hubPhase, { color: config.labelColor }]}>
                {config.label} Phase
              </Text>
              <Text style={styles.hubTagline}>{config.tagline}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  lotusOverlay: {
    position: "absolute",
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
  centerTextContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  hubDayText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: neutral.textPrimary,
    marginBottom: 4,
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
});
