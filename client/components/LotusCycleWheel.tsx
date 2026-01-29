import React, { useCallback, useMemo } from "react";
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
// DESIGN TOKENS - New gradient brand colors
// ============================================================================
const PHASE_COLORS = {
  menstrual: "#F7A37A",      // Sunset Orange
  follicular: "#E85A9C",     // Hot Pink
  ovulation: "#D070A0",      // Soft Pink
  luteal: "#B088C8",         // Purple/Lavender
};

const COLORS = {
  background: "#FFF7FA",     // Soft off-white pink
  white: "#FFFFFF",
  text: "#3A2F35",           // Charcoal
  textMuted: "#7A6A73",      // Warm gray
  ringTrack: "#F5E8ED",      // Very light pink for track background
};

// Phase configuration with emotional cues
const PHASE_CONFIG = {
  menstrual: {
    color: PHASE_COLORS.menstrual,
    name: "MENSTRUAL",
    cue: "Rest & Release",
    petals: 3,  // Small, closed
  },
  follicular: {
    color: PHASE_COLORS.follicular,
    name: "FOLLICULAR", 
    cue: "Rising Energy",
    petals: 5,  // Opening
  },
  ovulation: {
    color: PHASE_COLORS.ovulation,
    name: "OVULATORY",
    cue: "Full Radiance",
    petals: 7,  // Full bloom
  },
  luteal: {
    color: PHASE_COLORS.luteal,
    name: "LUTEAL",
    cue: "Inner Reflection",
    petals: 5,  // Softening
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
// FILLED LOTUS FLOWER COMPONENT
// Simple white filled lotus that grows with each phase
// ============================================================================
const FilledLotusFlower = ({ 
  phase, 
  size = 80 
}: { 
  phase: CyclePhase; 
  size?: number 
}) => {
  const config = PHASE_CONFIG[phase];
  const petalCount = config.petals;
  const cx = size / 2;
  const cy = size / 2;
  
  // Lotus grows based on phase
  const sizeMultiplier = {
    menstrual: 0.6,   // Small, closed bud
    follicular: 0.75, // Opening up
    ovulation: 1.0,   // Full bloom
    luteal: 0.85,     // Slightly closing
  };
  
  const scale = sizeMultiplier[phase];
  const petalLength = size * 0.38 * scale;
  const petalWidth = size * 0.18 * scale;
  
  // Generate petals
  const petals = useMemo(() => {
    const paths = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 360 / petalCount) - 90; // Start from top
      const rad = (angle * Math.PI) / 180;
      
      // Tip of petal
      const tipX = cx + Math.cos(rad) * petalLength;
      const tipY = cy + Math.sin(rad) * petalLength;
      
      // Base points of petal
      const leftRad = ((angle - 90) * Math.PI) / 180;
      const rightRad = ((angle + 90) * Math.PI) / 180;
      const baseOffset = size * 0.05;
      
      const leftBaseX = cx + Math.cos(leftRad) * baseOffset;
      const leftBaseY = cy + Math.sin(leftRad) * baseOffset;
      const rightBaseX = cx + Math.cos(rightRad) * baseOffset;
      const rightBaseY = cy + Math.sin(rightRad) * baseOffset;
      
      // Control points for curves
      const ctrlDist = petalLength * 0.65;
      const ctrlWidthOffset = petalWidth * 0.8;
      
      const ctrlLeftX = cx + Math.cos(rad) * ctrlDist + Math.cos(leftRad) * ctrlWidthOffset;
      const ctrlLeftY = cy + Math.sin(rad) * ctrlDist + Math.sin(leftRad) * ctrlWidthOffset;
      const ctrlRightX = cx + Math.cos(rad) * ctrlDist + Math.cos(rightRad) * ctrlWidthOffset;
      const ctrlRightY = cy + Math.sin(rad) * ctrlDist + Math.sin(rightRad) * ctrlWidthOffset;
      
      // Create filled petal path
      const path = `
        M ${leftBaseX} ${leftBaseY}
        Q ${ctrlLeftX} ${ctrlLeftY} ${tipX} ${tipY}
        Q ${ctrlRightX} ${ctrlRightY} ${rightBaseX} ${rightBaseY}
        Q ${cx} ${cy + baseOffset * 0.5} ${leftBaseX} ${leftBaseY}
        Z
      `;
      
      paths.push(
        <Path
          key={i}
          d={path}
          fill={COLORS.white}
          stroke={COLORS.white}
          strokeWidth={0.5}
        />
      );
    }
    return paths;
  }, [petalCount, cx, cy, petalLength, petalWidth, size, phase]);
  
  // Center circle (stigma)
  const centerRadius = size * 0.08 * scale;
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {petals}
      <Circle 
        cx={cx} 
        cy={cy} 
        r={centerRadius} 
        fill={COLORS.white}
      />
    </Svg>
  );
};

// ============================================================================
// CURRENT DAY MARKER
// Small dot to indicate current position on the ring
// ============================================================================
const DayMarker = ({ 
  cx, 
  cy, 
  color,
  size = 12,
}: { 
  cx: number; 
  cy: number; 
  color: string; 
  size?: number;
}) => {
  return (
    <G>
      {/* Glow effect */}
      <Circle
        cx={cx}
        cy={cy}
        r={size * 1.5}
        fill={`${color}40`}
      />
      {/* Main dot */}
      <Circle
        cx={cx}
        cy={cy}
        r={size}
        fill={color}
        stroke={COLORS.white}
        strokeWidth={3}
      />
    </G>
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
  const outerRadius = size / 2 - 20;
  const arcRadius = outerRadius - 12;
  const innerRadius = outerRadius - 36;
  const arcStrokeWidth = 20;
  
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
  // Each phase is a colored segment on the ring
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
              opacity={0.3}
            />
          ) : null}
          {/* Main arc */}
          <Path
            d={arcPath}
            fill="none"
            stroke={config.color}
            strokeWidth={arcStrokeWidth}
            strokeLinecap="round"
            opacity={isActive ? 1 : 0.6}
          />
        </G>
      );
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Wheel with gesture handling */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.wheelContainer, { width: size, height: size }]}>
          <Animated.View style={animatedWheelStyle}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Background ring track */}
              <Circle
                cx={center}
                cy={center}
                r={arcRadius}
                fill="none"
                stroke={COLORS.ringTrack}
                strokeWidth={arcStrokeWidth + 4}
              />
              
              {/* Phase arcs */}
              {renderPhaseArcs()}
              
              {/* Day marker on the ring */}
              <DayMarker
                cx={markerX}
                cy={markerY}
                color={phaseConfig.color}
                size={10}
              />
            </Svg>
          </Animated.View>
          
          {/* Center content - fixed position, doesn't rotate */}
          <View style={[styles.centerContent, { width: innerRadius * 1.8, height: innerRadius * 1.8 }]}>
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
            
            {/* White filled lotus flower - grows with phase */}
            <View style={styles.lotusContainer}>
              <FilledLotusFlower phase={phase} size={70} />
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
// ============================================================================
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: 24,
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
    paddingTop: 4,
  },
  phaseName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 0,
  },
  dayNumber: {
    fontFamily: "DMSans_700Bold",
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1,
  },
  emotionalCue: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 0,
    marginBottom: 4,
  },
  lotusContainer: {
    marginTop: 4,
  },
  infoContainer: {
    marginTop: Spacing.sm,
    alignItems: "center",
  },
  cycleInfo: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
