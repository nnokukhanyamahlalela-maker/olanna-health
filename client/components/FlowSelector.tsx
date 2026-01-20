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

type FlowLevel = "spotting" | "light" | "medium" | "heavy" | null;

interface FlowSelectorProps {
  value: FlowLevel;
  onChange: (value: FlowLevel) => void;
}

const flowOptions: { value: FlowLevel; label: string; drops: number }[] = [
  { value: "spotting", label: "Spotting", drops: 1 },
  { value: "light", label: "Light", drops: 2 },
  { value: "medium", label: "Medium", drops: 3 },
  { value: "heavy", label: "Heavy", drops: 4 },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FlowOption({
  option,
  selected,
  onPress,
}: {
  option: (typeof flowOptions)[0];
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.option,
        {
          backgroundColor: selected
            ? theme.phaseMenstrual + "20"
            : theme.backgroundSecondary,
          borderColor: selected ? theme.phaseMenstrual : "transparent",
        },
        animatedStyle,
      ]}
    >
      <View style={styles.drops}>
        {Array.from({ length: option.drops }).map((_, i) => (
          <Feather
            key={i}
            name="droplet"
            size={16}
            color={selected ? theme.phaseMenstrual : theme.textSecondary}
          />
        ))}
      </View>
      <ThemedText
        type="caption"
        style={[
          styles.label,
          { color: selected ? theme.phaseMenstrual : theme.text },
        ]}
      >
        {option.label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export function FlowSelector({ value, onChange }: FlowSelectorProps) {
  return (
    <View style={styles.container}>
      {flowOptions.map((option) => (
        <FlowOption
          key={option.value}
          option={option}
          selected={value === option.value}
          onPress={() => onChange(value === option.value ? null : option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  drops: {
    flexDirection: "row",
    gap: 2,
  },
  label: {
    fontWeight: "500",
  },
});
