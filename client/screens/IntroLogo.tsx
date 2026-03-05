import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, View, StatusBar, Image, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVideoPlayer, VideoView } from "expo-video";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { RootStackParamList } from "@/navigation/RootStackNavigator";

const splashGradient = require("@/assets/images/splash-gradient.png");
const splashBrand = require("@/assets/images/splash-brand.png");
const splashVideo = require("@/assets/videos/olanna-splash.mp4");

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PHASE_DURATION = 2000;
const FADE_DURATION = 600;

type SplashPhase = "gradient" | "brand" | "video";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const hasNavigated = useRef(false);
  const [phase, setPhase] = useState<SplashPhase>("gradient");

  const gradientOpacity = useSharedValue(1);
  const brandOpacity = useSharedValue(0);
  const videoOpacity = useSharedValue(0);

  const navigate = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    navigation.replace("Onboarding");
  }, [navigation]);

  const player = useVideoPlayer(splashVideo, (p) => {
    p.loop = false;
    p.muted = true;
  });

  useEffect(() => {
    const phaseOneTimer = setTimeout(() => {
      gradientOpacity.value = withTiming(0, { duration: FADE_DURATION, easing: Easing.inOut(Easing.ease) });
      brandOpacity.value = withTiming(1, { duration: FADE_DURATION, easing: Easing.inOut(Easing.ease) });
      setPhase("brand");
    }, PHASE_DURATION);

    const phaseTwoTimer = setTimeout(() => {
      brandOpacity.value = withTiming(0, { duration: FADE_DURATION, easing: Easing.inOut(Easing.ease) });
      videoOpacity.value = withDelay(200, withTiming(1, { duration: FADE_DURATION, easing: Easing.inOut(Easing.ease) }));
      setPhase("video");
    }, PHASE_DURATION * 2);

    return () => {
      clearTimeout(phaseOneTimer);
      clearTimeout(phaseTwoTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "video") return;

    const endSub = player.addListener("playToEnd", () => {
      navigate();
    });

    const statusSub = player.addListener("statusChange", (newStatus) => {
      if (newStatus.status === "readyToPlay") {
        player.play();
      }
      if (newStatus.status === "error") {
        navigate();
      }
    });

    if (player.status === "readyToPlay") {
      player.play();
    }

    const fallback = setTimeout(navigate, 30000);

    return () => {
      endSub.remove();
      statusSub.remove();
      clearTimeout(fallback);
    };
  }, [phase, navigate, player]);

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
  }));

  const videoStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
        <Image source={splashGradient} style={styles.fullImage} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, brandStyle]}>
        <Image source={splashBrand} style={styles.fullImage} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, videoStyle]}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
