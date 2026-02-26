import React, { useEffect } from "react";
import { Text, StyleSheet, ImageBackground } from "react-native";
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withDelay(500, withTiming(1, { duration: 1200 }));
    logoScale.value = withDelay(500, withTiming(1, { duration: 1200 }));

    containerOpacity.value = withDelay(3500, withTiming(0, { duration: 600 }));

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
    }, 4100);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <ImageBackground
        source={require("@/assets/images/gradient-background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.brandName}>OLANNA</Text>
          <Text style={styles.brandSubtitle}>HEALTH</Text>
        </Animated.View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: "Poppins_900Black",
    fontSize: 52,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontFamily: "Poppins_300Light",
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 10,
    marginTop: 4,
  },
});
