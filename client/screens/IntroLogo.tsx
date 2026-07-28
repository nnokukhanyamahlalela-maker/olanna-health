/**
 * IntroLogo — animated blossom splash screen.
 * Shows the Olanna blossom "blinking" (pulsing scale + phase-colour cycling)
 * for 5 seconds on a gradient background, then navigates to Main or Onboarding.
 *
 * Replaces the previous gradient → brand → video three-phase flow.
 * No expo-video dependency.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: W, height: H } = Dimensions.get("window");

// ─── Phase colours (cycling order) ───────────────────────────────────────────
const PHASE_COLORS = [
  "#F06B9A", // menstrual
  "#D178B3", // follicular
  "#DE73DE", // ovulatory
  "#C9A0DC", // luteal
];

const BLINK_INTERVAL = 1_250; // ms per colour step
const TOTAL_DURATION = 5_000; // ms before navigating
const FADE_OUT_DURATION = 500;

// ─── Blossom SVG — filled 5-petal flower ─────────────────────────────────────
function Blossom({ color, size }: { color: string; size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const ringR  = size * 0.30;
  const petalR = size * 0.20;
  const inner  = size * 0.16;

  const back: [number, number][] = [];
  const front: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    back.push([cx + ringR * Math.cos(a), cy + ringR * Math.sin(a)]);
  }
  for (let i = 0; i < 5; i++) {
    const a = ((-90 + 36 + i * 72) * Math.PI) / 180;
    front.push([cx + ringR * 0.88 * Math.cos(a), cy + ringR * 0.88 * Math.sin(a)]);
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {back.map(([px, py], i) => (
          <Circle key={`b${i}`} cx={px} cy={py} r={petalR} fill={color} />
        ))}
        {front.map(([px, py], i) => (
          <Circle key={`f${i}`} cx={px} cy={py} r={inner} fill={color} opacity={0.7} />
        ))}
        {/* White center dot */}
        <Circle cx={cx} cy={cy} r={size * 0.09} fill="white" />
      </G>
    </Svg>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const hasNavigated = useRef(false);

  // Phase colour cycling
  const [colorIdx, setColorIdx] = useState(0);

  // Reanimated values
  const containerOpacity = useSharedValue(1);
  const blossomScale     = useSharedValue(0.5);
  const blossomOpacity   = useSharedValue(0);
  const textOpacity      = useSharedValue(0);

  const doNavigate = useCallback(async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    try {
      const [complete, profile] = await Promise.all([
        storage.isOnboardingComplete(),
        storage.getUserProfile(),
      ]);
      navigation.replace((complete && profile ? "Main" : "Onboarding") as any);
    } catch {
      navigation.replace("Onboarding" as any);
    }
  }, [navigation]);

  useEffect(() => {
    // 1. Bloom in — blossom fades + scales up from centre
    blossomOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    blossomScale.value   = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });

    // 2. Text fades in after blossom appears
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    // 3. Blossom pulse loop: gentle scale blink (open → close → open …)
    blossomScale.value = withDelay(
      650,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 550, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.88, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );

    // 4. Colour cycle
    const colourTimer = setInterval(() => {
      setColorIdx((i) => (i + 1) % PHASE_COLORS.length);
    }, BLINK_INTERVAL);

    // 5. Fade out + navigate after TOTAL_DURATION
    const navTimer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: FADE_OUT_DURATION, easing: Easing.in(Easing.ease) },
        (finished) => { if (finished) runOnJS(doNavigate)(); },
      );
    }, TOTAL_DURATION);

    return () => {
      clearInterval(colourTimer);
      clearTimeout(navTimer);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const blossomStyle   = useAnimatedStyle(() => ({
    opacity: blossomOpacity.value,
    transform: [{ scale: blossomScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  const color = PHASE_COLORS[colorIdx];

  return (
    <Animated.View style={[styles.root, containerStyle]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Rich gradient background image */}
      <ImageBackground
        source={require("@/assets/images/gradient-background.jpg")}
        style={[StyleSheet.absoluteFill, { width: W, height: H }]}
        resizeMode="cover"
      />

      {/* Phase-colour overlay that shifts with each blink */}
      <View style={[styles.colorOverlay, { backgroundColor: color + "30" }]} />

      {/* Blossom */}
      <Animated.View style={[styles.blossomWrap, blossomStyle]}>
        {/* Glow rings behind blossom */}
        <View style={[styles.glowRing, { borderColor: "rgba(255,255,255,0.28)", width: 280, height: 280, borderRadius: 140 }]} />
        <View style={[styles.glowRing, { borderColor: "rgba(255,255,255,0.15)", width: 330, height: 330, borderRadius: 165 }]} />
        <Blossom color="#FFFFFF" size={180} />
      </Animated.View>

      {/* Brand text */}
      <Animated.View style={[styles.textWrap, textStyle]}>
        <Text style={styles.brandName}>OLANNA</Text>
        <Text style={styles.brandSub}>HEALTH</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#C060A0",
    alignItems: "center",
    justifyContent: "center",
  },
  colorOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  blossomWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 64,
  },
  glowRing: {
    position: "absolute",
    borderWidth: 2,
  },
  textWrap: {
    position: "absolute",
    bottom: H * 0.18,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  brandName: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 4,
    // soft shadow so it reads on both light and dark phase tints
    textShadowColor: "rgba(80,30,60,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  brandSub: {
    fontSize: 15,
    fontWeight: "300",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 10,
    marginTop: 4,
  },
});
