/**
 * SplashScreen — Gen Z rebrand
 * Flat lavender background (#EEEDFE), deep-plum wordmark.
 * No gradient — consistent with "flat fills only" brand rule.
 */
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";
import { LannaMascot } from "@/components/LannaMascot";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();

  const logoOpacity   = useSharedValue(0);
  const logoScale     = useSharedValue(0.88);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withDelay(400, withTiming(1,   { duration: 900 }));
    logoScale.value   = withDelay(400, withTiming(1,   { duration: 900 }));
    containerOpacity.value = withDelay(3200, withTiming(0, { duration: 500 }));

    const navigateAway = async () => {
      const profile = await storage.getUserProfile();
      if (profile) {
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
      }
    };

    const timer = setTimeout(() => { runOnJS(navigateAway)(); }, 3700);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        {/* Lanna mascot — ovulatory (most vibrant) for splash impact */}
        <LannaMascot phase="ovulation" size={96} />
        <Text style={styles.brandName}>OLANNA</Text>
        <Text style={styles.brandSubtitle}>HEALTH</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEEDFE",   // lavender base
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  brandName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#26215C",             // deep plum
    letterSpacing: 3,
    marginTop: 12,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: "300",
    color: "#6B6591",             // soft plum
    letterSpacing: 9,
  },
});
