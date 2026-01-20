import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SeveritySliderProps {
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  labels?: string[];
  color?: string;
}

export function SeveritySlider({ 
  value, 
  onChange, 
  maxValue = 5,
  labels = ['None', 'Mild', 'Moderate', 'Significant', 'Severe', 'Extreme'],
  color,
}: SeveritySliderProps) {
  const { theme } = useTheme();
  const activeColor = color || theme.primary;

  const renderPetal = (index: number) => {
    const isActive = index <= value;
    const petalStyle = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(isActive ? 1.1 : 1, { damping: 15 }) }],
      opacity: withSpring(isActive ? 1 : 0.3, { damping: 15 }),
    }));

    return (
      <Pressable
        key={index}
        onPress={() => onChange(index)}
        style={styles.petalContainer}
        testID={`severity-petal-${index}`}
      >
        <Animated.View
          style={[
            styles.petal,
            {
              backgroundColor: isActive ? activeColor : theme.border,
              width: 24 + index * 4,
              height: 24 + index * 4,
            },
            petalStyle,
          ]}
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderRow}>
        {Array.from({ length: maxValue + 1 }, (_, i) => renderPetal(i))}
      </View>
      <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
        {labels[value] || `Level ${value}`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  petalContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  petal: {
    borderRadius: BorderRadius.full,
  },
  label: {
    marginTop: Spacing.sm,
    textTransform: 'capitalize',
  },
});
