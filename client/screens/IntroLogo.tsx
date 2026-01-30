import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(
      200,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      200,
      withSpring(1, { damping: 15, stiffness: 80 })
    );

    const timer = setTimeout(() => {
      navigation.replace("Splash");
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={require("@/assets/images/olanna-brand-logo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F8",
  },
  imageContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
