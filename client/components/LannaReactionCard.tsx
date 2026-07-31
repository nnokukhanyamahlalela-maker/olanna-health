/**
 * LannaReactionCard
 *
 * Post-quick-log overlay that slides up from the bottom, shows Lanna
 * with a pattern-aware reaction message, then auto-dismisses after 3.5 s.
 * The user can also tap anywhere on the card to dismiss early.
 *
 * Animation: slide-up + fade-in on mount, fade-out on dismiss.
 * Uses Reanimated 2 (react-native-reanimated).
 */

import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LannaMascot } from "@/components/LannaMascot";
import type { Phase } from "@/constants/phaseConfig";

const AUTO_DISMISS_MS = 3500;

interface Props {
  visible: boolean;
  message: string;
  /** Current cycle phase — drives Lanna's expression */
  phase?: Phase;
  onDismiss: () => void;
}

export function LannaReactionCard({ visible, message, phase = "follicular", onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const animateOut = (callback: () => void) => {
    "worklet";
    translateY.value = withSpring(120, { damping: 22, stiffness: 200 });
    opacity.value = withTiming(0, { duration: 260 }, (finished) => {
      if (finished) runOnJS(callback)();
    });
  };

  useEffect(() => {
    if (visible) {
      // Slide in
      translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 220 });

      // Auto-dismiss after 3.5 s
      clearTimer();
      timerRef.current = setTimeout(() => {
        animateOut(onDismiss);
      }, AUTO_DISMISS_MS);
    } else {
      clearTimer();
      translateY.value = 120;
      opacity.value = 0;
    }

    return clearTimer;
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const handleTap = () => {
    clearTimer();
    animateOut(onDismiss);
  };

  return (
    <Pressable
      style={[styles.overlay, { paddingBottom: insets.bottom + 24 }]}
      onPress={handleTap}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.mascotCol}>
          <LannaMascot phase={phase} size={52} expression="calm" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.hint}>Tap to dismiss</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF5F8",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(240,107,154,0.28)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    width: "100%",
    // Soft shadow
    shadowColor: "#C06090",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  mascotCol: {
    alignItems: "center",
    justifyContent: "center",
    width: 54,
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    gap: 3,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D1F2B",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  hint: {
    fontSize: 11,
    color: "#A88A9A",
  },
});

export default LannaReactionCard;
