/**
 * IntroLogo — plays the branded intro video on native (iOS/Android),
 * or shows an animated blossom splash on web.
 *
 * Native:  expo-video plays olanna-intro.mp4; navigates when the video ends.
 *          Falls back to navigating after 15 s if the video never fires playToEnd.
 * Web:     Animated SVG blossom on the gradient background; navigates after 3 s.
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: W, height: H } = Dimensions.get("window");

// ─── Shared navigation helper ─────────────────────────────────────────────────

function useIntroNavigation() {
  const navigation   = useNavigation<NavigationProp>();
  const hasNavigated = useRef(false);

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

  return { doNavigate };
}

// ─── Native: full-screen video ────────────────────────────────────────────────

const VIDEO_SOURCE  = require("@/assets/videos/olanna-intro.mp4");
const FALLBACK_MS   = 15_000;

function NativeIntro() {
  const { doNavigate } = useIntroNavigation();
  const fallback        = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lazy-import expo-video so the module is only resolved on native.
  // On web, this branch is never rendered.
  const { useVideoPlayer, VideoView } = require("expo-video");

  const player = useVideoPlayer(VIDEO_SOURCE, (p: any) => {
    p.loop  = false;
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener("playToEnd", () => { doNavigate(); });
    fallback.current = setTimeout(doNavigate, FALLBACK_MS);
    return () => {
      sub.remove();
      if (fallback.current) clearTimeout(fallback.current);
    };
  }, [player, doNavigate]);

  return (
    <View style={nStyles.root}>
      <StatusBar hidden />
      <VideoView
        player={player}
        style={nStyles.video}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
}

const nStyles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#1A0A14", width: W, height: H },
  video: { width: W, height: H },
});

// ─── Web / fallback: animated blossom ────────────────────────────────────────

const PHASE_COLORS  = ["#F06B9A", "#D178B3", "#DE73DE", "#C9A0DC"];
const BLINK_MS      = 1_000;
const WEB_DURATION  = 3_000;
const FADE_OUT_MS   = 400;

function Blossom({ color, size }: { color: string; size: number }) {
  const cx = size / 2, cy = size / 2;
  const ringR  = size * 0.30;
  const petalR = size * 0.20;
  const inner  = size * 0.16;
  const back:  [number, number][] = [];
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
        {back.map(([px, py], i)  => <Circle key={`b${i}`} cx={px} cy={py} r={petalR} fill={color} />)}
        {front.map(([px, py], i) => <Circle key={`f${i}`} cx={px} cy={py} r={inner}  fill={color} opacity={0.7} />)}
        <Circle cx={cx} cy={cy} r={size * 0.09} fill="white" />
      </G>
    </Svg>
  );
}

function WebIntro() {
  const { doNavigate } = useIntroNavigation();
  const [colorIdx, setColorIdx] = useState(0);

  const containerOpacity = useSharedValue(1);
  const blossomScale     = useSharedValue(0.5);
  const blossomOpacity   = useSharedValue(0);
  const textOpacity      = useSharedValue(0);

  useEffect(() => {
    blossomOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
    blossomScale.value   = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) });
    textOpacity.value    = withDelay(350, withTiming(1, { duration: 400 }));
    blossomScale.value   = withDelay(550,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.90, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, false,
      ),
    );

    const colourTimer = setInterval(() => setColorIdx(i => (i + 1) % PHASE_COLORS.length), BLINK_MS);
    const navTimer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: FADE_OUT_MS, easing: Easing.in(Easing.ease) },
        (finished) => { if (finished) runOnJS(doNavigate)(); },
      );
    }, WEB_DURATION);

    return () => { clearInterval(colourTimer); clearTimeout(navTimer); };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const blossomStyle   = useAnimatedStyle(() => ({
    opacity: blossomOpacity.value,
    transform: [{ scale: blossomScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const color = PHASE_COLORS[colorIdx];

  return (
    <Animated.View style={[wStyles.root, containerStyle]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("@/assets/images/gradient-background.jpg")}
        style={[StyleSheet.absoluteFill, { width: W, height: H }]}
        resizeMode="cover"
      />
      <View style={[wStyles.colorOverlay, { backgroundColor: color + "30" }]} />
      <Animated.View style={[wStyles.blossomWrap, blossomStyle]}>
        <View style={[wStyles.glowRing, { borderColor: "rgba(255,255,255,0.28)", width: 280, height: 280, borderRadius: 140 }]} />
        <View style={[wStyles.glowRing, { borderColor: "rgba(255,255,255,0.15)", width: 330, height: 330, borderRadius: 165 }]} />
        <Blossom color="#FFFFFF" size={180} />
      </Animated.View>
      <Animated.View style={[wStyles.textWrap, textStyle]}>
        <Text style={wStyles.brandName}>OLANNA</Text>
        <Text style={wStyles.brandSub}>HEALTH</Text>
      </Animated.View>
    </Animated.View>
  );
}

const wStyles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: "#C060A0", alignItems: "center", justifyContent: "center" },
  colorOverlay: { ...StyleSheet.absoluteFillObject },
  blossomWrap:  { alignItems: "center", justifyContent: "center", marginBottom: 64 },
  glowRing:     { position: "absolute", borderWidth: 2 },
  textWrap:     { position: "absolute", bottom: H * 0.18, left: 0, right: 0, alignItems: "center" },
  brandName:    { fontSize: 42, fontWeight: "900", color: "#FFFFFF", letterSpacing: 4, textShadowColor: "rgba(80,30,60,0.25)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
  brandSub:     { fontSize: 15, fontWeight: "300", color: "rgba(255,255,255,0.85)", letterSpacing: 10, marginTop: 4 },
});

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function IntroLogo() {
  return Platform.OS === "web" ? <WebIntro /> : <NativeIntro />;
}
