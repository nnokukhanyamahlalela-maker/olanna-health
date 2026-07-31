/**
 * LannaThresholdCard
 *
 * A calm, dismissible nudge card shown on Home when the threshold detector
 * fires (e.g. ≥3 consecutive high-severity pain days). This is a lighter-touch
 * entry point than the full LannaInsightBadge — no mascot image, no alarm
 * colours. The background is the current phase colour at low opacity.
 *
 * Once dismissed, the card does not reappear until a new threshold event occurs.
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Phase } from "@/constants/phaseConfig";
import { phaseConfig } from "@/constants/phaseConfig";
import type { ConditionId } from "@/data/lannaContent";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  currentPhase: Phase;
  onDismiss: () => void;
  /** The conditionId to surface in LannaCheckIn. Defaults to endometriosis
   *  since the threshold trigger is pain-based. Pass activeNudge conditionId
   *  when the pattern engine has already identified a specific condition. */
  conditionId?: ConditionId;
}

export function LannaThresholdCard({ currentPhase, onDismiss, conditionId = "endometriosis" }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const config = phaseConfig[currentPhase];

  // Use phase front colour at very low opacity for the card background
  const cardBg = config.front + "18"; // ~10% opacity
  const cardBorder = config.front + "30"; // ~19% opacity
  const ctaColor = config.front;

  const handleCta = () => {
    // Dismiss before navigating so it doesn't flash on return
    onDismiss();
    navigation.navigate("LannaCheckIn", { conditionId });
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {/* Dismiss (×) button */}
      <Pressable
        onPress={onDismiss}
        hitSlop={12}
        style={styles.dismissBtn}
        accessibilityLabel="Dismiss Lanna notice"
      >
        <Text style={styles.dismissIcon}>×</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.headline}>Lanna noticed something</Text>
        <Text style={styles.body}>
          You've logged high pain a few days in a row. It might be worth a
          closer look — no pressure, just here when you're ready.
        </Text>
        <Pressable onPress={handleCta} hitSlop={6}>
          <Text style={[styles.cta, { color: ctaColor }]}>
            See what Lanna noticed →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  dismissBtn: {
    position: "absolute",
    top: 10,
    right: 14,
    zIndex: 1,
  },
  dismissIcon: {
    fontSize: 20,
    color: "#8A6F80",
    lineHeight: 22,
  },
  content: {
    paddingRight: 28, // leave room for dismiss button
    gap: 6,
  },
  headline: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D1F2B",
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 13,
    color: "#5A4252",
    lineHeight: 19,
  },
  cta: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
});
