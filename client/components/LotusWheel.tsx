import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Svg, { Path, Circle, Defs, RadialGradient, Stop, G, Ellipse } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CycleData } from "@/lib/storage";

const { width: screenWidth } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(screenWidth - 64, 300);

interface LotusWheelProps {
  cycleData: CycleData;
  showReminders?: boolean;
}

const AnimatedG = Animated.createAnimatedComponent(G);

export function LotusWheel({ cycleData, showReminders }: LotusWheelProps) {
  const { theme } = useTheme();

  const breatheValue = useSharedValue(0);
  const glowValue = useSharedValue(0);
  const rippleValue = useSharedValue(0);

  useEffect(() => {
    breatheValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    glowValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    rippleValue.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const breatheStyle = useAnimatedStyle(() => {
    const scale = interpolate(breatheValue.value, [0, 1], [0.95, 1.02]);
    return {
      transform: [{ scale }],
    };
  });

  const getPhaseLabel = (phase: CycleData["phase"]) => {
    switch (phase) {
      case "menstrual":
        return "Menstrual Phase";
      case "follicular":
        return "Follicular Phase";
      case "ovulation":
        return "Ovulation";
      case "luteal":
        return "Luteal Phase";
    }
  };

  const getPhaseColor = (phase: CycleData["phase"]) => {
    switch (phase) {
      case "menstrual":
        return theme.phaseMenstrual;
      case "follicular":
        return theme.phaseFollicular;
      case "ovulation":
        return theme.phaseOvulation;
      case "luteal":
        return theme.phaseLuteal;
    }
  };

  const getPetalOpacity = (petalPhase: CycleData["phase"]) => {
    return cycleData.phase === petalPhase ? 1 : 0.4;
  };

  const centerX = WHEEL_SIZE / 2;
  const centerY = WHEEL_SIZE / 2;
  const petalLength = WHEEL_SIZE * 0.35;
  const petalWidth = WHEEL_SIZE * 0.15;

  const createPetalPath = (angle: number, length: number, width: number) => {
    const rad = (angle * Math.PI) / 180;
    const tipX = centerX + Math.cos(rad) * length;
    const tipY = centerY + Math.sin(rad) * length;
    const leftRad = ((angle - 90) * Math.PI) / 180;
    const rightRad = ((angle + 90) * Math.PI) / 180;
    const baseOffset = width * 0.3;
    const leftX = centerX + Math.cos(leftRad) * baseOffset;
    const leftY = centerY + Math.sin(leftRad) * baseOffset;
    const rightX = centerX + Math.cos(rightRad) * baseOffset;
    const rightY = centerY + Math.sin(rightRad) * baseOffset;
    const ctrl1X = centerX + Math.cos(rad) * (length * 0.5) + Math.cos(leftRad) * (width * 0.6);
    const ctrl1Y = centerY + Math.sin(rad) * (length * 0.5) + Math.sin(leftRad) * (width * 0.6);
    const ctrl2X = centerX + Math.cos(rad) * (length * 0.5) + Math.cos(rightRad) * (width * 0.6);
    const ctrl2Y = centerY + Math.sin(rad) * (length * 0.5) + Math.sin(rightRad) * (width * 0.6);

    return `M ${leftX} ${leftY} Q ${ctrl1X} ${ctrl1Y} ${tipX} ${tipY} Q ${ctrl2X} ${ctrl2Y} ${rightX} ${rightY} Z`;
  };

  const petals = useMemo(() => {
    const phases: { phase: CycleData["phase"]; angle: number }[] = [
      { phase: "menstrual", angle: -90 },
      { phase: "follicular", angle: 0 },
      { phase: "ovulation", angle: 90 },
      { phase: "luteal", angle: 180 },
    ];

    return phases.map(({ phase, angle }) => ({
      phase,
      path: createPetalPath(angle, petalLength, petalWidth),
      color: getPhaseColor(phase),
      opacity: getPetalOpacity(phase),
    }));
  }, [cycleData.phase, theme]);

  const secondaryPetals = useMemo(() => {
    const angles = [45, 135, 225, 315];
    return angles.map((angle) => ({
      path: createPetalPath(angle, petalLength * 0.7, petalWidth * 0.7),
      color: theme.lotusPetal,
    }));
  }, [theme]);

  return (
    <View style={styles.container}>
      <View style={[styles.waterBackground, { backgroundColor: theme.waterRipple }]}>
        <Animated.View style={[styles.ripple, { borderColor: theme.primary + "20" }]} />
      </View>

      <Animated.View style={[styles.lotusContainer, breatheStyle]}>
        <View style={[styles.glowRing, { backgroundColor: theme.lotusGlow }]} />

        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          <Defs>
            <RadialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={theme.lotusCenter} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.tertiary} stopOpacity="0.8" />
            </RadialGradient>
          </Defs>

          {secondaryPetals.map((petal, index) => (
            <Path
              key={`secondary-${index}`}
              d={petal.path}
              fill={petal.color}
              opacity={0.3}
            />
          ))}

          {petals.map((petal) => (
            <Path
              key={petal.phase}
              d={petal.path}
              fill={petal.color}
              opacity={petal.opacity}
            />
          ))}

          <Circle
            cx={centerX}
            cy={centerY}
            r={WHEEL_SIZE * 0.12}
            fill="url(#centerGradient)"
          />

          <Circle
            cx={centerX}
            cy={centerY}
            r={WHEEL_SIZE * 0.06}
            fill={theme.lotusCenter}
          />
        </Svg>

        <View style={styles.centerContent}>
          <ThemedText type="h1" style={[styles.dayNumber, { color: theme.text }]}>
            {cycleData.currentDay}
          </ThemedText>
          <ThemedText type="caption" style={[styles.dayLabel, { color: theme.textSecondary }]}>
            Day of Cycle
          </ThemedText>
        </View>
      </Animated.View>

      <View style={[styles.phaseLabel, { backgroundColor: getPhaseColor(cycleData.phase) + "20" }]}>
        <View style={[styles.phaseDot, { backgroundColor: getPhaseColor(cycleData.phase) }]} />
        <ThemedText type="body" style={[styles.phaseText, { color: getPhaseColor(cycleData.phase) }]}>
          {getPhaseLabel(cycleData.phase)}
        </ThemedText>
      </View>

      <View style={styles.symbolismHint}>
        <ThemedText type="caption" style={[styles.symbolismText, { color: theme.textSecondary }]}>
          The lotus rises through muddy water to bloom beautifully—symbolizing resilience and renewal in your cycle
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  waterBackground: {
    position: "absolute",
    width: WHEEL_SIZE + 40,
    height: WHEEL_SIZE + 40,
    borderRadius: (WHEEL_SIZE + 40) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: WHEEL_SIZE + 60,
    height: WHEEL_SIZE + 60,
    borderRadius: (WHEEL_SIZE + 60) / 2,
    borderWidth: 2,
  },
  lotusContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: WHEEL_SIZE * 0.7,
    height: WHEEL_SIZE * 0.7,
    borderRadius: WHEEL_SIZE * 0.35,
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 42,
  },
  dayLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  phaseLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    fontWeight: "600",
  },
  symbolismHint: {
    paddingHorizontal: Spacing.xl,
    maxWidth: 280,
  },
  symbolismText: {
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
