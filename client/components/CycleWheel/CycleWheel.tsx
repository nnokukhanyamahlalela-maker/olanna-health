/**
 * CycleWheel Component
 * 
 * A circular donut-style wheel showing the 4 menstrual cycle phases
 * with curved phase labels, gradient segments, and transition dots.
 * Matches the reference design with phase names curved along the ring.
 */

import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
  Text as SvgText,
  TextPath,
  Path,
} from "react-native-svg";
import { Phase, phaseConfig } from "@/constants/phaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CycleWheelProps {
  phase: Phase;
  currentDay: number;
  cycleLength: number;
  size?: number;
  children?: React.ReactNode;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function CycleWheel({
  phase,
  currentDay,
  cycleLength,
  size: propSize,
  children,
}: CycleWheelProps) {
  const size = propSize || Math.min(SCREEN_WIDTH - 60, 300);
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const labelRadius = radius + 2;

  const todayAngle = ((currentDay - 1) / cycleLength) * 360;
  const todayPos = polarToCartesian(cx, cy, radius, todayAngle);

  const menstrualEnd = 0.18;
  const follicularEnd = 0.46;
  const ovulationEnd = 0.54;

  const transitionAngles = [
    menstrualEnd * 360,
    follicularEnd * 360,
    ovulationEnd * 360,
    360,
  ];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="menstrualGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#C8A8E0" />
            <Stop offset="100%" stopColor="#D8B8E8" />
          </LinearGradient>
          <LinearGradient id="follicularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E8C8E0" />
            <Stop offset="100%" stopColor="#D8B0C8" />
          </LinearGradient>
          <LinearGradient id="ovulationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F8D0A8" />
            <Stop offset="100%" stopColor="#F8A870" />
          </LinearGradient>
          <LinearGradient id="lutealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F8A0B8" />
            <Stop offset="100%" stopColor="#E880A8" />
          </LinearGradient>

          <Path
            id="menstrualPath"
            d={describeArc(cx, cy, labelRadius, 0, menstrualEnd * 360)}
          />
          <Path
            id="follicularPath"
            d={describeArc(cx, cy, labelRadius, menstrualEnd * 360, follicularEnd * 360)}
          />
          <Path
            id="ovulationPath"
            d={describeArc(cx, cy, labelRadius, follicularEnd * 360, ovulationEnd * 360)}
          />
          <Path
            id="lutealPath"
            d={describeArc(cx, cy, labelRadius, ovulationEnd * 360, 360)}
          />
        </Defs>

        {/* Menstrual segment */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#menstrualGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * menstrualEnd} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        {/* Follicular segment */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#follicularGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * (follicularEnd - menstrualEnd)} ${circumference}`}
          strokeDashoffset={-circumference * menstrualEnd}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        {/* Ovulation segment */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#ovulationGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * (ovulationEnd - follicularEnd)} ${circumference}`}
          strokeDashoffset={-circumference * follicularEnd}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        {/* Luteal segment */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#lutealGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * (1 - ovulationEnd)} ${circumference}`}
          strokeDashoffset={-circumference * ovulationEnd}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        {/* Curved phase labels */}
        <SvgText fill="rgba(160,130,180,0.5)" fontSize="9" fontWeight="500" letterSpacing={1}>
          <TextPath href="#menstrualPath" startOffset="25%">
            Menstrual
          </TextPath>
        </SvgText>
        <SvgText fill="rgba(180,140,170,0.5)" fontSize="9" fontWeight="500" letterSpacing={1}>
          <TextPath href="#follicularPath" startOffset="25%">
            Follicular
          </TextPath>
        </SvgText>
        <SvgText fill="rgba(220,140,100,0.5)" fontSize="9" fontWeight="500" letterSpacing={1}>
          <TextPath href="#ovulationPath" startOffset="15%">
            Ovulation
          </TextPath>
        </SvgText>
        <SvgText fill="rgba(220,120,150,0.5)" fontSize="9" fontWeight="500" letterSpacing={1}>
          <TextPath href="#lutealPath" startOffset="35%">
            Luteal
          </TextPath>
        </SvgText>

        {/* Transition dots */}
        {transitionAngles.map((angle, i) => {
          const pos = polarToCartesian(cx, cy, radius, angle);
          const colors = ["#D8B8E8", "#E8C0D0", "#F8A870", "#E880A8"];
          return (
            <G key={i}>
              <Circle cx={pos.x} cy={pos.y} r={6} fill={colors[i]} />
            </G>
          );
        })}

        {/* Current day indicator */}
        <G>
          <Circle
            cx={todayPos.x}
            cy={todayPos.y}
            r={12}
            fill="white"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={1}
          />
          <Circle
            cx={todayPos.x}
            cy={todayPos.y}
            r={5}
            fill={phaseConfig[phase].accentColor}
          />
        </G>
      </Svg>

      {/* Center content (children slot) */}
      <View style={styles.centerContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CycleWheel;
