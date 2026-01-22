import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
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
import Svg, { Path, G, Defs, LinearGradient, Stop, Text, TSpan } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const LOGO_WIDTH = Math.min(screenWidth * 0.8, 360);

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedG = Animated.createAnimatedComponent(G);

export default function SplashScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const waveOffset = useSharedValue(0);
  const floatY = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withSequence(
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) }),
      withDelay(4800, withTiming(0, { duration: 800 }))
    );

    logoScale.value = withSequence(
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.1)) }),
      withDelay(4800, withTiming(1.02, { duration: 800 }))
    );

    waveOffset.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    floatY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
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

  const animatedContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatY.value, [0, 1], [0, -10]);
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        { translateY },
      ],
    };
  });

  const animatedWaveStyle = useAnimatedStyle(() => {
    const rotation = interpolate(waveOffset.value, [0, 1], [-2, 2]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const renderLotusO = () => {
    const size = 70;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    
    const petals = [];
    const angles = [-90, -60, -120, -30, -150, 0, 180];
    
    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const rad = (angle * Math.PI) / 180;
      const tipX = cx + Math.cos(rad) * r;
      const tipY = cy + Math.sin(rad) * r * 0.85;
      const opacity = i === 0 ? 1 : i < 3 ? 0.85 : i < 5 ? 0.65 : 0.45;
      
      petals.push(
        <Path
          key={i}
          d={`M${cx} ${cy + size * 0.1} Q${cx + Math.cos(rad) * r * 0.35} ${cy + Math.sin(rad) * r * 0.55} ${tipX} ${tipY} 
              Q${cx - Math.cos(rad) * r * 0.35} ${cy + Math.sin(rad) * r * 0.55} ${cx} ${cy + size * 0.1}`}
          fill="#F6A9D2"
          fillOpacity={opacity}
        />
      );
    }
    
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {petals}
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View style={[styles.logoContainer, animatedContainerStyle]}>
        <Animated.View style={[styles.logoRow, animatedWaveStyle]}>
          <View style={styles.lotusContainer}>
            {renderLotusO()}
          </View>
          <Svg width={LOGO_WIDTH * 0.75} height={80} viewBox="0 0 280 80">
            <Defs>
              <LinearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#3A2F2A" />
                <Stop offset="100%" stopColor="#5A4F4A" />
              </LinearGradient>
            </Defs>
            <Text
              x="0"
              y="55"
              fill="url(#textGrad)"
              fontFamily="Playfair Display"
              fontSize="52"
              fontWeight="600"
              letterSpacing="3"
            >
              lanna
            </Text>
          </Svg>
        </Animated.View>
        
        <Svg width={LOGO_WIDTH * 0.5} height={30} viewBox="0 0 180 30" style={styles.tagline}>
          <Text
            x="90"
            y="20"
            fill={theme.textSecondary}
            fontFamily="Inter"
            fontSize="14"
            textAnchor="middle"
            letterSpacing="2"
          >
            YOUR CYCLE COMPANION
          </Text>
        </Svg>
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
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lotusContainer: {
    marginRight: -8,
    marginTop: 5,
  },
  tagline: {
    marginTop: 12,
    opacity: 0.7,
  },
});
