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
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { storage } from "@/lib/storage";

const { width: screenWidth } = Dimensions.get("window");
const LOGO_WIDTH = Math.min(screenWidth * 0.85, 320);

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function OlannaLogo({ size = 280 }: { size?: number }) {
  const letterHeight = size * 0.18;
  const oSize = letterHeight * 1.1;
  const spacing = size * 0.01;
  
  const renderLotusO = () => {
    const s = oSize;
    const cx = s / 2;
    const cy = s / 2;
    
    const petals = [];
    const petalAngles = [-90, -50, -130, -20, -160];
    
    for (let i = 0; i < petalAngles.length; i++) {
      const angle = petalAngles[i];
      const rad = (angle * Math.PI) / 180;
      const petalLength = s * 0.38;
      const tipX = cx + Math.cos(rad) * petalLength;
      const tipY = cy + Math.sin(rad) * petalLength * 0.9;
      const baseWidth = s * 0.12;
      const opacity = i === 0 ? 1 : i < 3 ? 0.8 : 0.55;
      
      const leftRad = rad - Math.PI / 2;
      const rightRad = rad + Math.PI / 2;
      const baseY = cy + s * 0.08;
      
      petals.push(
        <Path
          key={i}
          d={`M${cx + Math.cos(leftRad) * baseWidth * 0.5} ${baseY}
              Q${cx + Math.cos(rad) * petalLength * 0.4 + Math.cos(leftRad) * baseWidth * 0.3} ${cy + Math.sin(rad) * petalLength * 0.5}
              ${tipX} ${tipY}
              Q${cx + Math.cos(rad) * petalLength * 0.4 + Math.cos(rightRad) * baseWidth * 0.3} ${cy + Math.sin(rad) * petalLength * 0.5}
              ${cx + Math.cos(rightRad) * baseWidth * 0.5} ${baseY} Z`}
          fill="#F6A9D2"
          fillOpacity={opacity}
        />
      );
    }
    
    return (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {petals}
        <Circle cx={cx} cy={cy + s * 0.05} r={s * 0.06} fill="#F6A9D2" fillOpacity={0.9} />
      </Svg>
    );
  };

  return (
    <View style={styles.logoWrapper}>
      <View style={styles.olannaRow}>
        <View style={[styles.letterO, { width: oSize, height: oSize }]}>
          {renderLotusO()}
        </View>
        <Svg width={size - oSize + spacing} height={letterHeight} viewBox="0 0 230 50">
          <SvgText
            x="0"
            y="40"
            fill="#FEC8EE"
            fontFamily="Inter"
            fontSize="46"
            fontWeight="800"
            letterSpacing="3"
          >
            LANNA
          </SvgText>
        </Svg>
      </View>
      <Svg width={size * 0.45} height={letterHeight * 0.5} viewBox="0 0 100 25" style={styles.healthText}>
        <SvgText
          x="50"
          y="18"
          fill="#F8B4D9"
          fontFamily="Inter"
          fontSize="16"
          fontWeight="400"
          textAnchor="middle"
          letterSpacing="6"
        >
          HEALTH
        </SvgText>
      </Svg>
    </View>
  );
}

export default function SplashScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View style={[styles.logoContainer, animatedContainerStyle]}>
        <OlannaLogo size={LOGO_WIDTH} />
        <Svg width={LOGO_WIDTH * 0.7} height={30} viewBox="0 0 200 30" style={styles.tagline}>
          <SvgText
            x="100"
            y="20"
            fill={theme.textSecondary}
            fontFamily="Inter"
            fontSize="12"
            textAnchor="middle"
            letterSpacing="3"
          >
            YOUR CYCLE COMPANION
          </SvgText>
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
  logoWrapper: {
    alignItems: "center",
  },
  olannaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  letterO: {
    marginRight: -4,
  },
  healthText: {
    marginTop: 4,
  },
  tagline: {
    marginTop: 20,
    opacity: 0.6,
  },
});
