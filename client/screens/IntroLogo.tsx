import React, { useEffect } from "react";
import { StyleSheet, AccessibilityInfo, Dimensions, Platform, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useVideoPlayer, VideoView } from "expo-video";
import { AppGradient } from "@/components/AppGradient";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const introVideoSource = require("@/assets/videos/olanna-intro.mp4");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  const player = useVideoPlayer(introVideoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
    } else {
      opacity.value = withDelay(
        100,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      scale.value = withDelay(
        100,
        withSpring(1, { damping: 12, stiffness: 100 })
      );
    }

    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (Platform.OS === "web") {
    return (
      <AppGradient style={styles.container}>
        <Animated.View style={[styles.logoWrap, animatedStyle]}>
          <Image
            source={require("@/assets/images/olanna-brand-logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Olanna Health logo"
          />
        </Animated.View>
      </AppGradient>
    );
  }

  return (
    <Animated.View style={[styles.videoContainer, animatedStyle]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  logoWrap: {
    width: 240,
    height: 240,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
