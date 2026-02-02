import React, { useEffect } from "react";
import { StyleSheet, AccessibilityInfo, Dimensions } from "react-native";
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
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const introVideoSource = require("@/assets/videos/olanna-intro.mov");

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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
