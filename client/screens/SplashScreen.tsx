import React, { useEffect } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";

const { width: screenWidth } = Dimensions.get("window");
const LOGO_WIDTH = Math.min(screenWidth * 0.7, 300);

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const floatValue = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withSequence(
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) }),
      withDelay(5000, withTiming(0, { duration: 800 }))
    );

    logoScale.value = withSequence(
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.2)) }),
      withDelay(5000, withTiming(1.05, { duration: 800 }))
    );

    floatValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
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
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatValue.value, [0, 1], [0, -12]);
    
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        { translateY },
      ],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <Image
          source={require("../assets/images/olanna-splash-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
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
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_WIDTH * 0.5,
  },
});
