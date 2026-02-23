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

  const petalOpacity = 0.06;
  const petalRadius = outerRadius - strokeWidth - 8;
  const lotusPetals = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180;
    const tipX = cx + petalRadius * Math.sin(angle);
    const tipY = cy - petalRadius * Math.cos(angle);
    const cp1X = cx + petalRadius * 0.35 * Math.sin(angle - 0.4);
    const cp1Y = cy - petalRadius * 0.35 * Math.cos(angle - 0.4);
    const cp2X = cx + petalRadius * 0.35 * Math.sin(angle + 0.4);
    const cp2Y = cy - petalRadius * 0.35 * Math.cos(angle + 0.4);
    lotusPetals.push(
      <Path
        key={`petal-${i}`}
        d={`M ${cx} ${cy} C ${cp1X} ${cp1Y} ${cp1X + (tipX - cx) * 0.5} ${cp1Y + (tipY - cy) * 0.5} ${tipX} ${tipY} C ${cp2X + (tipX - cx) * 0.5} ${cp2Y + (tipY - cy) * 0.5} ${cp2X} ${cp2Y} ${cx} ${cy} Z`}
        fill="#D0C0E8"
        opacity={petalOpacity}
      />
    );
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
                <Stop offset="80%" stopColor="#FAF5FF" stopOpacity={0.95} />
                <Stop offset="100%" stopColor="#F0E8F5" stopOpacity={0.9} />
              </RadialGradient>
            </Defs>

            {lotusPetals}
            {daySegments}

            <Circle cx={cx} cy={cy} r={outerRadius - strokeWidth - 12} fill="url(#centerGlow)" />
          </Svg>

          <View style={styles.centerHub}>
            <Text style={styles.hubDayText}>
              Day {selectedDay} of {cycleLength}
            </Text>
            <Text style={[styles.hubPhase, { color: config.labelColor }]}>
              {config.label} Phase
            </Text>
            <Text style={styles.hubTagline}>{config.tagline}</Text>
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
  hubDayText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: "#3A2F35",
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
    color: "#7A6A73",
    fontStyle: "italic",
  },
});
