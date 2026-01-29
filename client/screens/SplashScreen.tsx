import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, ImageBackground } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AnimatedLetterProps {
  letter: string;
  delay: number;
  style?: object;
}

function AnimatedLetter({ letter, delay, style }: AnimatedLetterProps) {
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

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();

  const containerOpacity = useSharedValue(1);

  const olannaLetters = ["O", "L", "A", "N", "N", "A"];
  const healthLetters = ["H", "E", "A", "L", "T", "H"];

  const baseDelay = 300;
  const letterDelay = 80;
  const healthStartDelay = baseDelay + olannaLetters.length * letterDelay + 200;

  useEffect(() => {
    const totalAnimationTime = healthStartDelay + healthLetters.length * letterDelay + 2000;

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
    <LinearGradient
      colors={["#F7A37A", "#E85A9C", "#D070A0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, containerAnimatedStyle]}>
        <View style={styles.olannaRow}>
          {olannaLetters.map((letter, index) => (
            <AnimatedLetter
              key={`olanna-${index}`}
              letter={letter}
              delay={baseDelay + index * letterDelay}
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
      </Animated.View>
    </LinearGradient>
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
  olannaLetter: {
    fontFamily: "DMSans_700Bold",
    fontSize: 48,
    color: "#FFFFFF",
    letterSpacing: 2,
    lineHeight: 56,
  },
  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  healthLetter: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 12,
  },
});
