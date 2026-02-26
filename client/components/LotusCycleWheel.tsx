import React, { useCallback, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  RadialGradient,
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
import { getPhaseForDay, phaseConfig, Phase } from "@/constants/phaseConfig";
import { Fonts } from "@/constants/theme";
import { neutral } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LotusCycleWheelProps {
  cycleLength?: number;
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

function CenterLotus({ variant, size, color }: { variant: string; size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  if (variant === "bud") {
    return (
      <G>
        <Path
          d={`M ${cx} ${cy + r * 0.5} Q ${cx - r * 0.3} ${cy - r * 0.15} ${cx} ${cy - r * 0.75} Q ${cx + r * 0.3} ${cy - r * 0.15} ${cx} ${cy + r * 0.5} Z`}
          fill={color}
          opacity={0.12}
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.35}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.5} L ${cx} ${cy + r * 0.85}`}
          stroke={color}
          strokeWidth={1.2}
          strokeOpacity={0.3}
        />
      </G>
    );
  }

  if (variant === "rising") {
    return (
      <G>
        <Path
          d={`M ${cx} ${cy + r * 0.35} Q ${cx - r * 0.3} ${cy - r * 0.1} ${cx} ${cy - r * 0.65} Q ${cx + r * 0.3} ${cy - r * 0.1} ${cx} ${cy + r * 0.35} Z`}
          fill={color}
          opacity={0.12}
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.35}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.25} Q ${cx - r * 0.55} ${cy - r * 0.05} ${cx - r * 0.45} ${cy - r * 0.5} Q ${cx - r * 0.12} ${cy - r * 0.25} ${cx} ${cy + r * 0.25} Z`}
          fill={color}
          opacity={0.08}
          stroke={color}
          strokeWidth={1.2}
          strokeOpacity={0.25}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.25} Q ${cx + r * 0.55} ${cy - r * 0.05} ${cx + r * 0.45} ${cy - r * 0.5} Q ${cx + r * 0.12} ${cy - r * 0.25} ${cx} ${cy + r * 0.25} Z`}
          fill={color}
          opacity={0.08}
          stroke={color}
          strokeWidth={1.2}
          strokeOpacity={0.25}
        />
        <Path
          d={`M ${cx} ${cy + r * 0.35} L ${cx} ${cy + r * 0.85}`}
          stroke={color}
          strokeWidth={1.2}
          strokeOpacity={0.25}
        />
      </G>
    );
  }

  if (variant === "bloom") {
    const petalCount = 6;
    const petals = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 360) / petalCount - 90;
      const rad = (angle * Math.PI) / 180;
      const tipX = cx + r * 0.75 * Math.cos(rad);
      const tipY = cy + r * 0.75 * Math.sin(rad);
      const cp1Angle = rad - 0.4;
      const cp2Angle = rad + 0.4;
      const cp1X = cx + r * 0.4 * Math.cos(cp1Angle);
      const cp1Y = cy + r * 0.4 * Math.sin(cp1Angle);
      const cp2X = cx + r * 0.4 * Math.cos(cp2Angle);
      const cp2Y = cy + r * 0.4 * Math.sin(cp2Angle);
      petals.push(
        <Path
          key={`bloom-${i}`}
          d={`M ${cx} ${cy} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${cx} ${cy} Z`}
          fill={color}
          opacity={0.1}
          stroke={color}
          strokeWidth={1.3}
          strokeOpacity={0.3}
        />
      );
    }
    return (
      <G>
        {petals}
        <Circle cx={cx} cy={cy} r={r * 0.12} fill={color} opacity={0.2} />
      </G>
    );
  }

  const petalCount = 8;
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360) / petalCount - 90;
    const rad = (angle * Math.PI) / 180;
    const tipX = cx + r * 0.85 * Math.cos(rad);
    const tipY = cy + r * 0.85 * Math.sin(rad);
    const cp1Angle = rad - 0.32;
    const cp2Angle = rad + 0.32;
    const cp1X = cx + r * 0.48 * Math.cos(cp1Angle);
    const cp1Y = cy + r * 0.48 * Math.sin(cp1Angle);
    const cp2X = cx + r * 0.48 * Math.cos(cp2Angle);
    const cp2Y = cy + r * 0.48 * Math.sin(cp2Angle);
    petals.push(
      <Path
        key={`closing-${i}`}
        d={`M ${cx} ${cy} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${cx} ${cy} Z`}
        fill={color}
        opacity={i % 2 === 0 ? 0.1 : 0.06}
        stroke={color}
        strokeWidth={1.2}
        strokeOpacity={i % 2 === 0 ? 0.3 : 0.18}
      />
    );
  }
  return (
    <G>
      {petals}
      <Circle cx={cx} cy={cy} r={r * 0.1} fill={color} opacity={0.15} />
    </G>
  );
}

export function LotusCycleWheel({
  cycleLength = 28,
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

  const selectedPhase = getPhaseForDay(selectedDay, cycleLength);
  const config = phaseConfig[selectedPhase];
  const lotusSize = (outerRadius - strokeWidth) * 1.4;

  const daySegments = [];
  for (let d = 1; d <= cycleLength; d++) {
    const startAngle = ((d - 1) / cycleLength) * 360 + gapDeg / 2;
    const endAngle = startAngle + segmentAngle;
    const phase = getPhaseForDay(d, cycleLength);
    const phaseColor = phaseConfig[phase].color;
    const isPast = d <= currentDay;
    const isSelected = d === selectedDay;
    const isCurrent = d === currentDay;
    const opacity = isPast ? 1 : 0.25;

    daySegments.push(
      <Path
        key={d}
        d={describeArc(cx, cy, outerRadius, startAngle, endAngle)}
        stroke={phaseColor}
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
          <Circle cx={pos.x} cy={pos.y} r={strokeWidth / 2 + 3} fill="white" opacity={0.9} />
          <Circle cx={pos.x} cy={pos.y} r={4} fill={phaseColor} />
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
            </Defs>

            {daySegments}

            <Circle cx={cx} cy={cy} r={outerRadius - strokeWidth - 8} fill="url(#centerGlow)" />

            <G transform={`translate(${cx - lotusSize / 2}, ${cy - lotusSize / 2 - 15})`}>
              <CenterLotus
                variant={config.lotusVariant}
                size={lotusSize}
                color={config.labelColor}
              />
            </G>
          </Svg>

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
