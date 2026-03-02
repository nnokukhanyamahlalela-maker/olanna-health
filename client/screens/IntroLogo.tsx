import React, { useEffect } from "react";
import { StyleSheet, View, Image, AccessibilityInfo, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { RootStackParamList } from "@/navigation/RootStackNavigator";

import introBackground from "../assets/images/intro-background.png";
import introLogo from "../assets/images/intro-logo.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const logoOpacity = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      logoOpacity.value = 1;
    } else {
      logoOpacity.value = withDelay(
        1200,
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) })
      );
    }

    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation, reduceMotion]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Image
        source={introBackground}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Animated.View
        style={[StyleSheet.absoluteFill, logoAnimatedStyle]}
        accessibilityLabel="Olanna Health"
        accessibilityRole="header"
      >
        <Image
          source={introLogo}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF5E8A",
  },
});
