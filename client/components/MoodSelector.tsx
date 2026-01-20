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

type Mood = "happy" | "calm" | "anxious" | "sad" | "irritable" | null;

interface MoodSelectorProps {
  value: Mood;
  onChange: (value: Mood) => void;
}

const moodOptions: {
  value: Mood;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}[] = [
  { value: "happy", label: "Happy", icon: "sun", color: "#FBBF24" },
  { value: "calm", label: "Calm", icon: "cloud", color: "#60A5FA" },
  { value: "anxious", label: "Anxious", icon: "zap", color: "#F97316" },
  { value: "sad", label: "Sad", icon: "cloud-rain", color: "#6366F1" },
  { value: "irritable", label: "Irritable", icon: "cloud-lightning", color: "#EF4444" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MoodOption({
  option,
  selected,
  onPress,
}: {
  option: (typeof moodOptions)[0];
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
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
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
          backgroundColor: selected ? option.color + "20" : theme.backgroundSecondary,
          borderColor: selected ? option.color : "transparent",
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: selected ? option.color + "30" : "transparent" },
        ]}
      >
        <Feather
          name={option.icon}
          size={24}
          color={selected ? option.color : theme.textSecondary}
        />
      </View>
      <ThemedText
        type="caption"
        style={[styles.label, { color: selected ? option.color : theme.text }]}
      >
        {option.label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {moodOptions.map((option) => (
        <MoodOption
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
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.xs,
    minWidth: 70,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "500",
    textAlign: "center",
  },
});
