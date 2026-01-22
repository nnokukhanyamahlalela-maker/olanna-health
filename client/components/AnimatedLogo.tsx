import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface AnimatedLogoProps {
  onAnimationComplete?: () => void;
}

const OLANNA_LETTERS = ['O', 'L', 'A', 'N', 'N', 'A'];
const HEALTH_LETTERS = ['H', 'E', 'A', 'L', 'T', 'H'];
const LETTER_DELAY = 120;
const HEALTH_DELAY = OLANNA_LETTERS.length * LETTER_DELAY + 200;

function TypedLetter({ 
  letter, 
  index, 
  color, 
  fontSize,
  fontWeight,
  letterSpacing,
}: { 
  letter: string; 
  index: number; 
  color: string;
  fontSize: number;
  fontWeight: '400' | '700' | '800' | '900';
  letterSpacing: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(
      index * LETTER_DELAY,
      withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) })
    );
    scale.value = withDelay(
      index * LETTER_DELAY,
      withSequence(
        withTiming(1.1, { duration: 100, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize,
          fontWeight,
          color,
          letterSpacing,
          fontFamily: 'Inter_700Bold',
        },
        animatedStyle,
      ]}
    >
      {letter}
    </Animated.Text>
  );
}

function RisingText({ 
  letters, 
  delay, 
  color, 
  fontSize,
  letterSpacing,
}: { 
  letters: string[]; 
  delay: number; 
  color: string;
  fontSize: number;
  letterSpacing: number;
}) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.healthRow, animatedStyle]}>
      {letters.map((letter, index) => (
        <Animated.Text
          key={index}
          style={{
            fontSize,
            fontWeight: '400',
            color,
            letterSpacing,
            fontFamily: 'Inter_400Regular',
          }}
        >
          {letter}
        </Animated.Text>
      ))}
    </Animated.View>
  );
}

export function AnimatedLogo({ onAnimationComplete }: AnimatedLogoProps) {
  const { theme } = useTheme();
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    const totalDuration = HEALTH_DELAY + 600;
    const timer = setTimeout(() => {
      setAnimationDone(true);
      onAnimationComplete?.();
    }, totalDuration);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const olannaColor = '#FEC8EE';
  const healthColor = '#F8B4D9';

  return (
    <View style={styles.container}>
      <View style={styles.olannaRow}>
        {OLANNA_LETTERS.map((letter, index) => (
          <TypedLetter
            key={index}
            letter={letter}
            index={index}
            color={olannaColor}
            fontSize={52}
            fontWeight="800"
            letterSpacing={4}
          />
        ))}
      </View>
      <RisingText
        letters={HEALTH_LETTERS}
        delay={HEALTH_DELAY}
        color={healthColor}
        fontSize={20}
        letterSpacing={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  olannaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
