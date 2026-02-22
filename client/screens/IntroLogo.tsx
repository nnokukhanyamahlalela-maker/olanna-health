import React, { useEffect } from "react";
import { StyleSheet, View, AccessibilityInfo, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const opacity = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
    } else {
      opacity.value = withDelay(
        300,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
    }

    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={["#FF8C42", "#FF5E8A", "#FF3F9E", "#F7A8C9", "#E8B4D9"]}
        locations={[0, 0.3, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[styles.logoContainer, animatedStyle]}
          accessibilityLabel="Olanna Health"
          accessibilityRole="header"
        >
          <Animated.Text style={styles.brandName}>OLANNA</Animated.Text>
          <Animated.Text style={styles.brandSub}>HEALTH</Animated.Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF5E8A",
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: "28%",
  },
  logoContainer: {
    alignItems: "center",
    gap: 2,
  },
  brandName: {
    fontFamily: "Poppins_900Black",
    fontSize: 52,
    color: "#FFFFFF",
    letterSpacing: 2,
    textAlign: "center",
    includeFontPadding: false,
  },
  brandSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: 8,
    textAlign: "center",
    marginTop: -4,
    includeFontPadding: false,
  },
});
