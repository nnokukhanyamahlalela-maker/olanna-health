import React, { useCallback } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "./ThemedText";
import { CyclePhase, PHASE_INFO } from "./Lotus";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

// ============================================================================
// DESIGN TOKENS
// Premium, feminine color palette with soft, muted tones
// ============================================================================
const COLORS = {
  // Phase colors - soft and elegant
  menstrual: "#D4A5A5",      // Dusty rose - gentle, nurturing
  follicular: "#B5C4B1",     // Soft sage - growth, renewal  
  ovulation: "#E8D5B7",      // Warm champagne - radiance, peak
  luteal: "#C4B7D6",         // Muted lavender - calm, reflection
  
  // UI colors
  background: "#FFFBFC",     // Very light blush white
  text: "#3A2F35",           // Warm charcoal
  textMuted: "#7A6A73",      // Warm gray
  ring: "#F6BFD3",           // Soft pink ring
  ringLight: "#FBE3EC",      // Lighter pink
};

// Phase arc definitions with emotional cues
const PHASE_CONFIG = {
  menstrual: {
    color: COLORS.menstrual,
    name: "MENSTRUAL",
    cue: "Rest & Release",
    startPercent: 0,
  },
  follicular: {
    color: COLORS.follicular,
    name: "FOLLICULAR", 
    cue: "Rising Energy",
    startPercent: 0,
  },
  ovulation: {
    color: COLORS.ovulation,
    name: "OVULATORY",
    cue: "Full Radiance",
    startPercent: 0,
  },
  luteal: {
    color: COLORS.luteal,
    name: "LUTEAL",
    cue: "Inner Reflection",
    startPercent: 0,
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// TYPES
// ============================================================================
interface LotusCycleWheelProps {
  currentDay: number;
  cycleLength: number;
  phase: CyclePhase;
  ovulationDay?: number;
  periodLength?: number;
  size?: number;
  onDayChange?: (day: number) => void;
  showInfo?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const getPhaseForDay = (
  day: number,
  cycleLength: number,
  ovulationDay: number,
  periodLength: number
): CyclePhase => {
  if (day <= periodLength) return "menstrual";
  if (day < ovulationDay - 2) return "follicular";
  if (day <= ovulationDay + 1) return "ovulation";
  return "luteal";
};

// Calculate phase boundaries as percentages of cycle
const calculatePhaseBoundaries = (
  cycleLength: number,
  ovulationDay: number,
  periodLength: number
) => {
  const menstrualEnd = periodLength / cycleLength;
  const follicularEnd = (ovulationDay - 3) / cycleLength;
  const ovulationEnd = (ovulationDay + 1) / cycleLength;
  
  return {
    menstrual: { start: 0, end: menstrualEnd },
    follicular: { start: menstrualEnd, end: follicularEnd },
    ovulation: { start: follicularEnd, end: ovulationEnd },
    luteal: { start: ovulationEnd, end: 1 },
  };
};

// Create arc path for SVG
const createArcPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  strokeWidth: number
): string => {
  // Convert angles from percentage to radians (starting from top, -90 degrees)
  const startRad = (startAngle * 2 * Math.PI) - (Math.PI / 2);
  const endRad = (endAngle * 2 * Math.PI) - (Math.PI / 2);
  
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  
  const largeArcFlag = (endAngle - startAngle) > 0.5 ? 1 : 0;
  
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
};

// ============================================================================
// LOTUS BUD MARKER COMPONENT
// Minimalist lotus bud that indicates current day position
// ============================================================================
const LotusBudMarker = ({ 
  cx, 
  cy, 
  color, 
  size = 18,
  isToday = true 
}: { 
  cx: number; 
  cy: number; 
  color: string; 
  size?: number;
  isToday?: boolean;
}) => {
  const budScale = isToday ? 1.15 : 1;
  const adjustedSize = size * budScale;
  
  // Simple, elegant lotus bud shape
  const budPath = `
    M ${cx} ${cy - adjustedSize * 0.6}
    C ${cx - adjustedSize * 0.25} ${cy - adjustedSize * 0.3}
      ${cx - adjustedSize * 0.25} ${cy + adjustedSize * 0.2}
      ${cx} ${cy + adjustedSize * 0.5}
    C ${cx + adjustedSize * 0.25} ${cy + adjustedSize * 0.2}
      ${cx + adjustedSize * 0.25} ${cy - adjustedSize * 0.3}
      ${cx} ${cy - adjustedSize * 0.6}
    Z
  `;
  
  // Inner petal detail
  const innerPath = `
    M ${cx} ${cy - adjustedSize * 0.35}
    C ${cx - adjustedSize * 0.1} ${cy - adjustedSize * 0.15}
      ${cx - adjustedSize * 0.1} ${cy + adjustedSize * 0.1}
      ${cx} ${cy + adjustedSize * 0.3}
    C ${cx + adjustedSize * 0.1} ${cy + adjustedSize * 0.1}
      ${cx + adjustedSize * 0.1} ${cy - adjustedSize * 0.15}
      ${cx} ${cy - adjustedSize * 0.35}
    Z
  `;

  return (
    <G>
      {/* Soft glow for today */}
      {isToday ? (
        <Circle
          cx={cx}
          cy={cy}
          r={adjustedSize * 1.2}
          fill={`${color}30`}
        />
      ) : null}
      {/* Main bud shape */}
      <Path
        d={budPath}
        fill={color}
        stroke={COLORS.text}
        strokeWidth={0.8}
      />
      {/* Inner petal detail */}
      <Path
        d={innerPath}
        fill={`${color}60`}
        stroke={COLORS.text}
        strokeWidth={0.4}
      />
    </G>
  );
};

// ============================================================================
// CENTER LOTUS ICON
// Minimal line-art lotus that subtly changes per phase
// ============================================================================
const CenterLotus = ({ 
  phase, 
  size = 50 
}: { 
  phase: CyclePhase; 
  size?: number 
}) => {
  const color = PHASE_CONFIG[phase].color;
  const cx = size / 2;
  const cy = size / 2;
  
  // Number of petals varies by phase
  const petalCounts = {
    menstrual: 3,    // Closed, resting
    follicular: 5,   // Opening
    ovulation: 7,    // Full bloom
    luteal: 5,       // Softening
  };
  
  const petalCount = petalCounts[phase];
  const petalLength = size * 0.35;
  const baseOffset = size * 0.08;
  
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360 / petalCount) - 90;
    const rad = (angle * Math.PI) / 180;
    
    const tipX = cx + Math.cos(rad) * petalLength;
    const tipY = cy + Math.sin(rad) * petalLength;
    
    // Create curved petal
    const leftRad = ((angle - 90) * Math.PI) / 180;
    const rightRad = ((angle + 90) * Math.PI) / 180;
    
    const leftX = cx + Math.cos(leftRad) * baseOffset;
    const leftY = cy + Math.sin(leftRad) * baseOffset;
    const rightX = cx + Math.cos(rightRad) * baseOffset;
    const rightY = cy + Math.sin(rightRad) * baseOffset;
    
    const midDist = petalLength * 0.6;
    const ctrlLeftX = cx + Math.cos(rad) * midDist + Math.cos(leftRad) * (size * 0.08);
    const ctrlLeftY = cy + Math.sin(rad) * midDist + Math.sin(leftRad) * (size * 0.08);
    const ctrlRightX = cx + Math.cos(rad) * midDist + Math.cos(rightRad) * (size * 0.08);
    const ctrlRightY = cy + Math.sin(rad) * midDist + Math.sin(rightRad) * (size * 0.08);
    
    const path = `M ${leftX} ${leftY} Q ${ctrlLeftX} ${ctrlLeftY} ${tipX} ${tipY} Q ${ctrlRightX} ${ctrlRightY} ${rightX} ${rightY} Z`;
    
    petals.push(
      <Path
        key={i}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        opacity={0.8}
      />
    );
  }
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {petals}
      <Circle cx={cx} cy={cy} r={size * 0.06} fill={color} opacity={0.6} />
    </Svg>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function LotusCycleWheel({
  currentDay,
  cycleLength,
  phase,
  ovulationDay = 14,
  periodLength = 5,
  size = 280,
  onDayChange,
  showInfo = true,
}: LotusCycleWheelProps) {
  const { theme } = useTheme();
  
  // Layout calculations
  const center = size / 2;
  const outerRadius = size / 2 - 24;
  const arcRadius = outerRadius - 14;
  const innerRadius = outerRadius - 40;
  const arcStrokeWidth = 22;
  
  // Animation values for rotation interaction
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const markerScale = useSharedValue(1);
  
  // Calculate phase boundaries
  const phaseBoundaries = calculatePhaseBoundaries(cycleLength, ovulationDay, periodLength);
  
  // Calculate current day position on the wheel
  const dayAngle = ((currentDay - 1) / cycleLength) * 2 * Math.PI - Math.PI / 2;
  const markerRadius = arcRadius;
  const markerX = center + Math.cos(dayAngle) * markerRadius;
  const markerY = center + Math.sin(dayAngle) * markerRadius;
  
  // Get current phase config
  const phaseConfig = PHASE_CONFIG[phase];
  
  // Handle day change from rotation
  const handleRotationEnd = useCallback((totalRotation: number) => {
    if (onDayChange) {
      const anglePerDay = 360 / cycleLength;
      const normalizedRotation = ((totalRotation % 360) + 360) % 360;
      const dayOffset = Math.round(normalizedRotation / anglePerDay);
      let newDay = currentDay - dayOffset;
      while (newDay < 1) newDay += cycleLength;
      while (newDay > cycleLength) newDay -= cycleLength;
      
      if (newDay !== currentDay) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onDayChange(newDay);
      }
    }
    
    // Reset rotation
    rotation.value = withTiming(0, { duration: 200 });
    savedRotation.value = 0;
  }, [currentDay, cycleLength, onDayChange, rotation, savedRotation]);

  // Pan gesture for dragging the wheel
  const panGesture = Gesture.Pan()
    .onStart(() => {
      markerScale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      const centerX = size / 2;
      const centerY = size / 2;
      const startX = event.x - event.translationX - centerX;
      const startY = event.y - event.translationY - centerY;
      const currentX = event.x - centerX;
      const currentY = event.y - centerY;
      
      const startAngle = Math.atan2(startY, startX);
      const currentAngle = Math.atan2(currentY, currentX);
      let deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
      
      rotation.value = savedRotation.value + deltaAngle;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      markerScale.value = withSpring(1);
      runOnJS(handleRotationEnd)(rotation.value);
    });

  // Tap gesture for quick day selection
  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      if (onDayChange) {
        const dx = event.x - center;
        const dy = event.y - center;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only respond to taps on the arc ring area
        if (distance > innerRadius && distance < outerRadius + 10) {
          const angle = Math.atan2(dy, dx);
          const normalizedAngle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
          const newDay = Math.round((normalizedAngle / (2 * Math.PI)) * cycleLength) + 1;
          const clampedDay = Math.min(Math.max(newDay, 1), cycleLength);
          
          if (clampedDay !== currentDay) {
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            runOnJS(onDayChange)(clampedDay);
          }
        }
      }
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Animated styles
  const animatedWheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedMarkerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markerScale.value }],
  }));

  // ============================================================================
  // RENDER PHASE ARCS
  // Each phase is rendered as a subtle arc with opacity based on active state
  // ============================================================================
  const renderPhaseArcs = () => {
    const phases: CyclePhase[] = ["menstrual", "follicular", "ovulation", "luteal"];
    
    return phases.map((phaseKey) => {
      const boundaries = phaseBoundaries[phaseKey];
      const config = PHASE_CONFIG[phaseKey];
      const isActive = phaseKey === phase;
      
      // Skip if phase has no duration
      if (boundaries.end <= boundaries.start) return null;
      
      const arcPath = createArcPath(
        center,
        center,
        arcRadius,
        boundaries.start,
        boundaries.end,
        arcStrokeWidth
      );
      
      return (
        <G key={phaseKey}>
          {/* Glow effect for active phase */}
          {isActive ? (
            <Path
              d={arcPath}
              fill="none"
              stroke={config.color}
              strokeWidth={arcStrokeWidth + 8}
              strokeLinecap="round"
              opacity={0.25}
            />
          ) : null}
          {/* Main arc */}
          <Path
            d={arcPath}
            fill="none"
            stroke={config.color}
            strokeWidth={arcStrokeWidth}
            strokeLinecap="round"
            opacity={isActive ? 1 : 0.35}
          />
        </G>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Wheel with gesture handling */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.wheelContainer, { width: size, height: size }]}>
          <Animated.View style={animatedWheelStyle}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Defs>
                <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={phaseConfig.color} stopOpacity={0.15} />
                  <Stop offset="100%" stopColor={phaseConfig.color} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              
              {/* Subtle background ring */}
              <Circle
                cx={center}
                cy={center}
                r={arcRadius}
                fill="none"
                stroke={COLORS.ringLight}
                strokeWidth={arcStrokeWidth + 2}
                opacity={0.5}
              />
              
              {/* Phase arcs */}
              {renderPhaseArcs()}
              
              {/* Inner circle with gradient glow */}
              <Circle
                cx={center}
                cy={center}
                r={innerRadius}
                fill="url(#centerGlow)"
              />
              
              {/* Lotus bud marker for current day */}
              <LotusBudMarker
                cx={markerX}
                cy={markerY}
                color={phaseConfig.color}
                size={20}
                isToday={true}
              />
            </Svg>
          </Animated.View>
          
          {/* Center content - fixed position, doesn't rotate */}
          <View style={[styles.centerContent, { width: innerRadius * 1.6, height: innerRadius * 1.6 }]}>
            {/* Phase name - small, uppercase */}
            <ThemedText style={[styles.phaseName, { color: phaseConfig.color }]}>
              {phaseConfig.name}
            </ThemedText>
            
            {/* Large day number */}
            <ThemedText style={[styles.dayNumber, { color: COLORS.text }]}>
              {currentDay}
            </ThemedText>
            
            {/* Emotional cue */}
            <ThemedText style={[styles.emotionalCue, { color: COLORS.textMuted }]}>
              {phaseConfig.cue}
            </ThemedText>
            
            {/* Line-art lotus icon */}
            <View style={styles.lotusIcon}>
              <CenterLotus phase={phase} size={42} />
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
      
      {/* Info section below wheel */}
      {showInfo ? (
        <View style={styles.infoContainer}>
          <ThemedText style={[styles.cycleInfo, { color: COLORS.textMuted }]}>
            Day {currentDay} of {cycleLength}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

// ============================================================================
// STYLES
// Clean, minimal styling with careful spacing
// ============================================================================
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  wheelContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  phaseName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: "DMSans_700Bold",
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1,
  },
  emotionalCue: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 2,
    marginBottom: 8,
  },
  lotusIcon: {
    marginTop: 4,
    opacity: 0.9,
  },
  infoContainer: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  cycleInfo: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
