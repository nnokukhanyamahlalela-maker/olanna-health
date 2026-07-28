/**
 * LannaInsightBadge
 *
 * Small card shown on the home screen when a nudge is pending.
 * Tapping navigates to LannaCheckInScreen.
 * Three visual tones: gentle (tier 1), amber (tier 2), clear (tier 3).
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { LannaMascot } from "@/components/LannaMascot";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { ActiveNudge } from "@/hooks/useLannaCheckIn";
import { LANNA_CONDITION_CONTENT } from "@/data/lannaContent";
import type { NudgeTier } from "@/data/lannaContent";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TIER_COLORS: Record<NudgeTier, { bg: string; border: string; text: string }> = {
  1: { bg: "#F5EDF3", border: "#EDD8E7", text: "#8A6F80" },
  2: { bg: "#FFF6E8", border: "#F5D9A0", text: "#8A6228" },
  3: { bg: "#FFF0F0", border: "#F5B8B8", text: "#8A2828" },
};

interface Props {
  nudge: ActiveNudge;
  currentPhase?: string;
}

export function LannaInsightBadge({ nudge, currentPhase }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { pattern, isFollowUp } = nudge;
  const content = LANNA_CONDITION_CONTENT[pattern.conditionId];
  const tierContent = content.tiers[pattern.tier];
  const colors = TIER_COLORS[pattern.tier];

  const handlePress = () => {
    navigation.navigate("LannaCheckIn", { conditionId: pattern.conditionId });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <View style={styles.mascotCol}>
        <LannaMascot phase={(currentPhase as any) || "follicular"} size={44} />
      </View>
      <View style={styles.textCol}>
        {isFollowUp && (
          <View style={[styles.followUpPill, { backgroundColor: colors.border }]}>
            <Text style={[styles.followUpText, { color: colors.text }]}>
              Following up
            </Text>
          </View>
        )}
        <Text style={styles.headline} numberOfLines={2}>
          {tierContent.headline}
        </Text>
        <Text style={[styles.cta, { color: colors.text }]}>
          {tierContent.ctaLabel} →
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  mascotCol: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
  },
  textCol: {
    flex: 1,
    gap: 4,
  },
  followUpPill: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 2,
  },
  followUpText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D1F2B",
    lineHeight: 18,
  },
  cta: {
    fontSize: 12,
    fontWeight: "600",
  },
});
