import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { BRAND_COLORS } from "@/constants/onboardingTokens";
import { BorderRadius, Spacing } from "@/constants/theme";

interface PillSelectProps<T extends string> {
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (id: T) => void;
  multiSelect?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Pill<T extends string>({ 
  id, 
  label, 
  isSelected, 
  onPress,
}: { 
  id: T; 
  label: string; 
  isSelected: boolean; 
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: withTiming(
      isSelected ? BRAND_COLORS.glassSelected : BRAND_COLORS.glassWhite,
      { duration: 200 }
    ),
    borderColor: withTiming(
      isSelected ? BRAND_COLORS.white : BRAND_COLORS.glassBorder,
      { duration: 200 }
    ),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.pill, animatedStyle]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
    >
      <ThemedText style={[
        styles.pillText,
        isSelected && styles.pillTextSelected,
      ]}>
        {label}
      </ThemedText>
      {isSelected ? (
        <Feather name="check" size={16} color={BRAND_COLORS.hotPink} />
      ) : null}
    </AnimatedPressable>
  );
}

export function PillSelect<T extends string>({ 
  options, 
  selected, 
  onToggle,
  multiSelect = true,
}: PillSelectProps<T>) {
  const handleToggle = (id: T) => {
    onToggle(id);
  };

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <Pill
          key={option.id}
          id={option.id}
          label={option.label}
          isSelected={selected.includes(option.id)}
          onPress={() => handleToggle(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pill: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: BRAND_COLORS.textPrimary,
  },
  pillTextSelected: {
    color: BRAND_COLORS.hotPink,
  },
});
