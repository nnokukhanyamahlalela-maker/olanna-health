import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, Platform, View } from "react-native";
import { BlurView } from "expo-blur";
import { DS } from "@/constants/designSystem";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function GlassPill({ label, active = false, onPress, style }: Props) {
  const activeBg = "rgba(255,79,163,0.90)";
  const inactiveBg = "rgba(255,255,255,0.30)";

  if (Platform.OS === "web") {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, style]}>
        <View
          style={[
            styles.pill,
            {
              backgroundColor: active ? activeBg : inactiveBg,
              borderColor: active ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.55)",
            },
          ]}
        >
          <Text style={[styles.text, { color: active ? DS.colors.white : DS.colors.subtext }]}>
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, style]}>
      <BlurView
        intensity={18}
        tint="light"
        style={[
          styles.pill,
          {
            backgroundColor: active ? activeBg : inactiveBg,
            borderColor: active ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.55)",
          },
        ]}
      >
        <Text style={[styles.text, { color: active ? DS.colors.white : DS.colors.subtext }]}>
          {label}
        </Text>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: DS.radii.pill,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
