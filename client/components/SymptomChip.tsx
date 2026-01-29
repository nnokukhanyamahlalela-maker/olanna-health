import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const CHIP_THEME = {
  background: '#FFFFFF',
  backgroundSelected: '#FBE3EC',
  border: '#F5E8ED',
  borderSelected: '#E85A9C',
  text: '#3A2F35',
  textSelected: '#E85A9C',
  icon: '#E85A9C',
};

interface SymptomChipProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  severity?: number;
  color?: string;
  isFavorite?: boolean;
  variant?: 'pill' | 'card';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SymptomChip({
  label,
  icon,
  selected = false,
  onPress,
  onLongPress,
  severity,
  color,
  isFavorite,
  variant = 'pill',
}: SymptomChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const chipColor = color || theme.primary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  if (variant === 'card') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.cardContainer,
          {
            backgroundColor: selected ? `${chipColor}15` : theme.cardBackground,
            borderColor: selected ? chipColor : theme.border,
          },
          animatedStyle,
        ]}
        testID={`symptom-chip-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: selected ? chipColor : theme.border }]}>
            {icon ? (
              <Feather
                name={icon}
                size={14}
                color={selected ? '#FFFFFF' : theme.textSecondary}
              />
            ) : null}
          </View>
          <ThemedText
            type="small"
            style={[
              styles.cardLabel,
              { color: selected ? chipColor : theme.text },
            ]}
            numberOfLines={2}
          >
            {label}
          </ThemedText>
          {isFavorite ? (
            <Feather name="star" size={12} color={theme.tertiary} style={styles.favoriteIcon} />
          ) : null}
        </View>
        {severity !== undefined && severity > 0 ? (
          <View style={styles.severityIndicator}>
            {Array.from({ length: severity }, (_, i) => (
              <View
                key={i}
                style={[styles.severityDot, { backgroundColor: chipColor }]}
              />
            ))}
          </View>
        ) : null}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: selected ? CHIP_THEME.backgroundSelected : CHIP_THEME.background,
          borderColor: selected ? CHIP_THEME.borderSelected : CHIP_THEME.border,
        },
        animatedStyle,
      ]}
      testID={`symptom-chip-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {icon ? (
        <Feather
          name={icon}
          size={16}
          color={selected ? CHIP_THEME.textSelected : CHIP_THEME.icon}
        />
      ) : null}
      <ThemedText
        type="small"
        style={[
          styles.label,
          { color: selected ? CHIP_THEME.textSelected : CHIP_THEME.text },
        ]}
      >
        {label}
      </ThemedText>
      {isFavorite ? (
        <Feather name="star" size={10} color={selected ? CHIP_THEME.textSelected : theme.tertiary} />
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  label: {
    fontWeight: "500",
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minWidth: 100,
    maxWidth: 140,
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    textAlign: 'center',
    fontWeight: '500',
  },
  favoriteIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  severityIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
    marginTop: Spacing.xs,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
