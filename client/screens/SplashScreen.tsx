import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Circle, Ellipse } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";

const { width: screenWidth } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PINK = "#FEC8EE";
const DUSTY_ROSE = "#F8B4D9";

interface AnimatedLetterProps {
  letter: string;
  delay: number;
  style?: object;
  isO?: boolean;
}

function AnimatedLetter({ letter, delay, style, isO }: AnimatedLetterProps) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 8,
        stiffness: 150,
        mass: 0.8,
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 200 })
    );
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 6,
        stiffness: 200,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (isO) {
    return (
      <Animated.View style={[styles.oContainer, animatedStyle]}>
        <Svg width={56} height={56} viewBox="0 0 56 56">
          <Ellipse cx={28} cy={28} rx={26} ry={26} fill={PINK} />
          <Ellipse cx={28} cy={28} rx={10} ry={10} fill="#FAF6F3" />
        </Svg>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={[styles.olannaLetter, style]}>
        {letter}
      </ThemedText>
    </Animated.View>
  );
}

function AnimatedHealthLetter({ letter, delay }: { letter: string; delay: number }) {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 10,
        stiffness: 180,
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 150 })
    );
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 8,
        stiffness: 200,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.healthLetter}>
        {letter}
      </ThemedText>
    </Animated.View>
  );
}

function AnimatedTaglineLetter({ letter, delay }: { letter: string; delay: number }) {
  const translateY = useSharedValue(15);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 12,
        stiffness: 150,
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.taglineLetter}>
        {letter === " " ? "  " : letter}
      </ThemedText>
    </Animated.View>
  );
}

export default function SplashScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const containerOpacity = useSharedValue(1);

  const olannaLetters = ["O", "L", "A", "N", "N", "A"];
  const healthLetters = ["H", "E", "A", "L", "T", "H"];
  const taglineText = "YOUR CYCLE COMPANION";
  const taglineLetters = taglineText.split("");

  const baseDelay = 300;
  const letterDelay = 80;
  const healthStartDelay = baseDelay + olannaLetters.length * letterDelay + 200;
  const taglineStartDelay = healthStartDelay + healthLetters.length * letterDelay + 300;

  useEffect(() => {
    const totalAnimationTime = taglineStartDelay + taglineLetters.length * 40 + 2500;

    containerOpacity.value = withDelay(
      totalAnimationTime,
      withTiming(0, { duration: 600 })
    );

    const navigateAway = async () => {
      const profile = await storage.getUserProfile();
      if (profile) {
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
      }
    };

    const timer = setTimeout(() => {
      runOnJS(navigateAway)();
    }, totalAnimationTime + 600);

    return () => clearTimeout(timer);
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View style={[styles.logoContainer, containerAnimatedStyle]}>
        <View style={styles.olannaRow}>
          {olannaLetters.map((letter, index) => (
            <AnimatedLetter
              key={`olanna-${index}`}
              letter={letter}
              delay={baseDelay + index * letterDelay}
              isO={index === 0}
            />
          ))}
        </View>

        <View style={styles.healthRow}>
          {healthLetters.map((letter, index) => (
            <AnimatedHealthLetter
              key={`health-${index}`}
              letter={letter}
              delay={healthStartDelay + index * letterDelay}
            />
          ))}
        </View>

        <View style={styles.taglineRow}>
          {taglineLetters.map((letter, index) => (
            <AnimatedTaglineLetter
              key={`tagline-${index}`}
              letter={letter}
              delay={taglineStartDelay + index * 40}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  olannaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  oContainer: {
    marginRight: -2,
  },
  olannaLetter: {
    fontFamily: "Poppins_700Bold",
    fontSize: 48,
    color: PINK,
    letterSpacing: 2,
    lineHeight: 56,
  },
  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  healthLetter: {
    fontFamily: "Poppins_400Regular",
    fontSize: 18,
    color: DUSTY_ROSE,
    letterSpacing: 8,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  taglineLetter: {
    fontFamily: "Poppins_300Light",
    fontSize: 12,
    color: "#9A8A80",
    letterSpacing: 3,
  },
});
