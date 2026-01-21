import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, PhaseColors } from "@/constants/theme";
import { CycleData } from "@/lib/storage";

const lotusImage = require("../assets/images/lotus-icon.png");

const { width: screenWidth } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(screenWidth - 64, 280);
const LOTUS_SIZE = Math.min(96, WHEEL_SIZE * 0.4);

interface LotusWheelProps {
  cycleData: CycleData;
  showReminders?: boolean;
}

const PHASE_CONFIG = {
  menstrual: {
    color: PhaseColors.menstrual.primary,
    lightColor: PhaseColors.menstrual.light,
    label: "Rest & Release",
    phaseName: "Menstrual Phase",
    glowOpacity: 0.3,
  },
  follicular: {
    color: PhaseColors.follicular.primary,
    lightColor: PhaseColors.follicular.light,
    label: "Emergence & Renewal",
    phaseName: "Follicular Phase",
    glowOpacity: 0.25,
  },
  ovulation: {
    color: PhaseColors.ovulation.primary,
    lightColor: PhaseColors.ovulation.light,
    label: "Peak & Radiance",
    phaseName: "Ovulation",
    glowOpacity: 0.35,
  },
  luteal: {
    color: PhaseColors.luteal.primary,
    lightColor: PhaseColors.luteal.light,
    label: "Reflection",
    phaseName: "Luteal Phase",
    glowOpacity: 0.25,
  },
};

export function LotusWheel({ cycleData, showReminders }: LotusWheelProps) {
  const { theme } = useTheme();

  const breatheValue = useSharedValue(0);
  const glowValue = useSharedValue(0);

  useEffect(() => {
    breatheValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    if (cycleData.phase === "ovulation") {
      glowValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [cycleData.phase]);

  const breatheStyle = useAnimatedStyle(() => {
    const scale = interpolate(breatheValue.value, [0, 1], [0.98, 1.02]);
    return {
      transform: [{ scale }],
    };
  });

  const phaseConfig = PHASE_CONFIG[cycleData.phase];
  const phaseColor = phaseConfig.color;
  const centerX = WHEEL_SIZE / 2;
  const centerY = WHEEL_SIZE / 2;

  const progress = cycleData.currentDay / cycleData.cycleLength;
  const progressRadius = WHEEL_SIZE * 0.46;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.lotusContainer, breatheStyle]}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          <Defs>
            <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={phaseConfig.lightColor} stopOpacity={phaseConfig.glowOpacity} />
              <Stop offset="100%" stopColor={phaseConfig.lightColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <Circle
            cx={centerX}
            cy={centerY}
            r={WHEEL_SIZE * 0.42}
            fill="url(#centerGlow)"
          />

          <Circle
            cx={centerX}
            cy={centerY}
            r={progressRadius}
            fill="none"
            stroke={phaseColor}
            strokeOpacity={0.2}
            strokeWidth={6}
          />
          
          <Circle
            cx={centerX}
            cy={centerY}
            r={progressRadius}
            fill="none"
            stroke={phaseColor}
            strokeOpacity={0.8}
            strokeWidth={6}
            strokeDasharray={`${progress * 2 * Math.PI * progressRadius} ${2 * Math.PI * progressRadius}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />
        </Svg>

        <View style={styles.centerContent}>
          <View style={styles.lotusImageContainer}>
            <Image
              source={lotusImage}
              style={styles.lotusImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.textContent}>
            <ThemedText style={[styles.dayNumber, { color: theme.text }]}>
              {cycleData.currentDay}
            </ThemedText>
            <ThemedText style={[styles.dayLabel, { color: theme.textSecondary }]}>
              DAY OF CYCLE
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <View style={[styles.phaseLabel, { backgroundColor: phaseColor + "25" }]}>
        <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
        <ThemedText style={[styles.phaseText, { color: phaseColor }]}>
          {phaseConfig.phaseName}
        </ThemedText>
      </View>

      <ThemedText style={[styles.phaseMood, { color: theme.textSecondary }]}>
        {phaseConfig.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.md,
  },
  lotusContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: WHEEL_SIZE * 0.85,
    height: WHEEL_SIZE * 0.85,
    borderRadius: WHEEL_SIZE * 0.425,
    backgroundColor: "#FFFFFF",
  },
  lotusImageContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  lotusImage: {
    width: LOTUS_SIZE * 1.4,
    height: LOTUS_SIZE * 1.4,
    opacity: 1,
  },
  textContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 54,
    fontFamily: Fonts.numericBold,
  },
  dayLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: Fonts.body,
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
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
  },
  phaseMood: {
    fontSize: 14,
    fontFamily: Fonts.body,
    fontStyle: "italic",
  },
});
