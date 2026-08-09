/**
 * Lanna's Check-In Screen
 *
 * Mascot-driven health-seeking behavior UI.
 * Tone, copy, and CTA adapt to the detected tier and condition.
 *
 * Spec rules enforced here:
 *  - Tier 1: casual, Lanna in curious/bright expression
 *  - Tier 2: warm + informative, soft nudge, Lanna in calm expression
 *  - Tier 3: clear and direct (no playful register), Lanna in wince expression
 *  - Never: diagnostic claims, fear language, paywall on tier 3
 *  - "Not now" always present, resurfaces at longer interval (see lannaNudgeStorage)
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";

import { LannaMascot } from "@/components/LannaMascot";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  LANNA_CONDITION_CONTENT,
  LANNA_REFLECTION_PROMPTS,
  type ConditionId,
  type NudgeTier,
} from "@/data/lannaContent";
import {
  getProvidersForCondition,
  type CareProvider,
} from "@/data/careDirectory";
import { runPatternEngine, type DetectedPattern } from "@/lib/lannaPatternEngine";
import {
  recordNudgeShown,
  postponeNudge,
  markNudgeActioned,
} from "@/lib/lannaNudgeStorage";
import { storage } from "@/lib/storage";
import { getSymptomLogs } from "@/lib/symptomStorage";
import { useLannaCheckIn } from "@/hooks/useLannaCheckIn";
import { phaseConfig } from "@/constants/phaseConfig";
import type { Phase } from "@/constants/phaseConfig";

type Props = NativeStackScreenProps<RootStackParamList, "LannaCheckIn">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BG = "#EEEDFE";
const TEXT_DARK = "#26215C";
const TEXT_MID = "#4A4580";
const TEXT_SOFT = "#6B6591";

// ─── Tier visual config ────────────────────────────────────────────────────────

const TIER_CONFIG: Record<
  NudgeTier,
  { mascotPhase: Phase; cardBg: string; accentColor: string; ctaBg: string }
> = {
  1: {
    mascotPhase: "follicular",
    cardBg: "#FAF8F3",
    accentColor: "#E8A070",
    ctaBg: "#E8A070",
  },
  2: {
    mascotPhase: "luteal",
    cardBg: "#FFF6E8",
    accentColor: "#C9842A",
    ctaBg: "#C9842A",
  },
  3: {
    mascotPhase: "menstrual",
    cardBg: "#FFF0F0",
    accentColor: "#C04040",
    ctaBg: "#C04040",
  },
};

// ─── Care provider card ────────────────────────────────────────────────────────

function CareCard({
  provider,
  accentColor,
}: {
  provider: CareProvider;
  accentColor: string;
}) {
  const handlePress = async () => {
    const url = provider.bookingUrl || (provider.whatsapp ? provider.whatsapp : null);
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) Linking.openURL(url);
    } else if (provider.phoneNumber) {
      Linking.openURL(`tel:${provider.phoneNumber.replace(/\s/g, "")}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.careCard, { borderColor: accentColor + "44" }]}
    >
      <View style={styles.careCardTop}>
        <View style={[styles.careTypePill, { backgroundColor: accentColor + "22" }]}>
          <Text style={[styles.careTypePillText, { color: accentColor }]}>
            {provider.badge ?? provider.type.replace("_", " ")}
          </Text>
        </View>
        {provider.isFreeOrLowCost && (
          <View style={[styles.freePill, { backgroundColor: "#2A8A4C22" }]}>
            <Text style={[styles.freePillText, { color: "#2A8A4C" }]}>Free</Text>
          </View>
        )}
      </View>
      <Text style={styles.careCardName}>{provider.name}</Text>
      <Text style={styles.careCardDesc} numberOfLines={2}>{provider.description}</Text>
      <Text style={[styles.careCardCost, { color: TEXT_SOFT }]}>{provider.costNote}</Text>
    </Pressable>
  );
}

// ─── Reflection prompt ─────────────────────────────────────────────────────────

function ReflectionPrompt({
  conditionId,
  accentColor,
}: {
  conditionId: ConditionId;
  accentColor: string;
}) {
  const prompts = LANNA_REFLECTION_PROMPTS[conditionId];
  if (!prompts || prompts.length === 0) return null;
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  return (
    <View style={[styles.reflectionCard, { backgroundColor: accentColor + "11" }]}>
      <Text style={[styles.reflectionLabel, { color: accentColor }]}>
        Something to reflect on
      </Text>
      <Text style={styles.reflectionText}>{prompt}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LannaCheckInScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { conditionId } = route.params;

  const content = LANNA_CONDITION_CONTENT[conditionId];
  const { allPatterns, onNudgeOpened, onPostpone, onActioned, isLoading } =
    useLannaCheckIn();

  const [actionConfirmed, setActionConfirmed] = useState(false);
  const [showAllProviders, setShowAllProviders] = useState(false);

  // Find the pattern for this specific condition
  const pattern = allPatterns.find((p) => p.conditionId === conditionId);
  const tier: NudgeTier = pattern?.tier ?? 1;
  const tierContent = content.tiers[tier];
  const tierVisual = TIER_CONFIG[tier];
  const providers = getProvidersForCondition(conditionId);
  const visibleProviders = showAllProviders ? providers : providers.slice(0, 3);

  useEffect(() => {
    onNudgeOpened(conditionId);
  }, [conditionId]);

  const handlePostpone = async () => {
    await onPostpone(conditionId);
    navigation.goBack();
  };

  const handleActioned = async () => {
    await onActioned(conditionId);
    setActionConfirmed(true);
  };

  if (actionConfirmed) {
    return (
      <View style={[styles.root, { backgroundColor: BG, paddingTop: insets.top + 24 }]}>
        <View style={styles.confirmedState}>
          <LannaMascot phase="follicular" size={80} />
          <Text style={styles.confirmedTitle}>Good on you</Text>
          <Text style={styles.confirmedBody}>
            Taking that step matters. I'll check back in a few months to see how you're going.
          </Text>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: "#D85A30" }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Back to home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row with close */}
        <View style={styles.headerRow}>
          <Text style={styles.screenLabel}>Lanna's Check-In</Text>
          <Pressable onPress={handlePostpone} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Not now</Text>
          </Pressable>
        </View>

        {/* Mascot + speech bubble */}
        <View style={styles.mascotSection}>
          <LannaMascot phase={tierVisual.mascotPhase} size={80} />
          <View
            style={[
              styles.speechBubble,
              { backgroundColor: tierVisual.cardBg, borderColor: tierVisual.accentColor + "44" },
            ]}
          >
            <Text style={styles.speechText}>{tierContent.lannaMessage}</Text>
          </View>
        </View>

        {/* Condition label */}
        <View style={styles.conditionRow}>
          <View
            style={[
              styles.conditionPill,
              { backgroundColor: tierVisual.accentColor + "22" },
            ]}
          >
            <Text style={[styles.conditionPillText, { color: tierVisual.accentColor }]}>
              {content.shortLabel}
            </Text>
          </View>
          <View style={[styles.tierPill, { backgroundColor: tierVisual.accentColor + "18" }]}>
            <Text style={[styles.tierPillText, { color: tierVisual.accentColor }]}>
              {tier === 1 ? "Worth knowing" : tier === 2 ? "Worth acting on" : "Worth prioritising"}
            </Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>{tierContent.headline}</Text>

        {/* Explainer card */}
        <View style={[styles.explainerCard, { backgroundColor: tierVisual.cardBg }]}>
          <Text style={styles.explainerText}>{tierContent.explainer}</Text>
        </View>

        {/* Evidence (what triggered this) */}
        {pattern && pattern.evidence.length > 0 && (
          <View style={styles.evidenceBlock}>
            <Text style={styles.evidenceLabel}>What I noticed</Text>
            {pattern.evidence.map((e, i) => (
              <View key={i} style={styles.evidenceRow}>
                <Text style={[styles.evidenceDot, { color: tierVisual.accentColor }]}>•</Text>
                <Text style={styles.evidenceText}>{e.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reflection prompt (tier 1 only — more conversational) */}
        {tier === 1 && (
          <ReflectionPrompt
            conditionId={conditionId}
            accentColor={tierVisual.accentColor}
          />
        )}

        {/* Care providers (tier 2+) */}
        {tier >= 2 && (
          <View style={styles.careSection}>
            <Text style={styles.careSectionTitle}>
              {tier === 3
                ? "Find care near you"
                : "When you're ready, here are some options"}
            </Text>
            {visibleProviders.map((p) => (
              <CareCard key={p.id} provider={p} accentColor={tierVisual.accentColor} />
            ))}
            {providers.length > 3 && !showAllProviders && (
              <Pressable
                onPress={() => setShowAllProviders(true)}
                style={styles.showMoreBtn}
              >
                <Text style={[styles.showMoreText, { color: tierVisual.accentColor }]}>
                  Show {providers.length - 3} more options
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Lanna notices patterns — she doesn't diagnose. Everything above is a suggestion, not a medical opinion. Always speak to a qualified healthcare provider for medical advice.
        </Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {tier >= 2 ? (
            <>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: tierVisual.ctaBg }]}
                onPress={handleActioned}
              >
                <Text style={styles.primaryBtnText}>
                  {tier === 3 ? "I've booked / I'm on it" : "I've taken a step"}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={handlePostpone}>
                <Text style={styles.secondaryBtnText}>
                  {tierContent.secondaryCtaLabel ?? "Not now"}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: tierVisual.ctaBg }]}
                onPress={() => navigation.navigate("Main", { screen: "LearnTab" } as any)}
              >
                <Text style={styles.primaryBtnText}>{tierContent.ctaLabel}</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={handlePostpone}>
                <Text style={styles.secondaryBtnText}>
                  {tierContent.secondaryCtaLabel ?? "Got it"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  screenLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SOFT,
    letterSpacing: 0.3,
  },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 14, color: TEXT_SOFT },
  mascotSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  speechBubble: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  speechText: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 21,
    fontStyle: "italic",
  },
  conditionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  conditionPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  conditionPillText: { fontSize: 12, fontWeight: "700" },
  tierPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tierPillText: { fontSize: 12, fontWeight: "500" },
  headline: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_DARK,
    lineHeight: 27,
  },
  explainerCard: {
    borderRadius: 14,
    padding: 16,
  },
  explainerText: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 22,
  },
  evidenceBlock: {
    gap: 6,
  },
  evidenceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_SOFT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  evidenceRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  evidenceDot: { fontSize: 16, lineHeight: 20 },
  evidenceText: { flex: 1, fontSize: 13, color: TEXT_MID, lineHeight: 19 },
  reflectionCard: {
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  reflectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reflectionText: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 21,
  },
  careSection: { gap: 10 },
  careSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  careCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  careCardTop: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  careTypePill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  careTypePillText: { fontSize: 11, fontWeight: "600" },
  freePill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  freePillText: { fontSize: 11, fontWeight: "600" },
  careCardName: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  careCardDesc: { fontSize: 13, color: TEXT_MID, lineHeight: 19 },
  careCardCost: { fontSize: 12 },
  showMoreBtn: { paddingVertical: 8, alignItems: "center" },
  showMoreText: { fontSize: 14, fontWeight: "600" },
  disclaimer: {
    fontSize: 11,
    color: TEXT_SOFT,
    lineHeight: 16,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  actionRow: { gap: 10 },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0E4EB",
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "500", color: TEXT_MID },
  confirmedState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  confirmedTitle: { fontSize: 22, fontWeight: "700", color: TEXT_DARK },
  confirmedBody: { fontSize: 15, color: TEXT_MID, lineHeight: 23, textAlign: "center" },
});
