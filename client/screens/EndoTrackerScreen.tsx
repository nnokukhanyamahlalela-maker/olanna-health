/**
 * EndoTrackerScreen
 *
 * Daily symptom-tracking flow for users who flagged Endometriosis during
 * onboarding. 6 core questions, completable in under 2 minutes.
 *
 * Tone: gentle check-in, not a medical intake form. Plain language throughout.
 * Navigation: slide_from_bottom modal; swipe-down or Back button to exit.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { LannaMascot } from "@/components/LannaMascot";
import { saveEndoLog, getEndoLog, type BleedingLevel } from "@/lib/endoStorage";
import { localDateString } from "@/lib/quickLogHelpers";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BG       = "#EEEDFE";
const CARD_BG  = "#FAF8F3";
const TEXT     = "#26215C";
const TEXT_MID = "#4A4580";
const TEXT_SOFT = "#7470A0";
const CORAL    = "#D85A30";
const BORDER   = "#D0CEF0";

// ─── Flow state ───────────────────────────────────────────────────────────────

interface FlowState {
  pelvisPain: number;
  bleeding: BleedingLevel | null;
  painOnBleedingDay: boolean | null;
  sexActivity: boolean | null;   // null = skipped
  sexPain: number | null;
  bowelPain: boolean | null;
  bowelPainScore: number | null;
  urinaryPain: boolean | null;
  urinaryPainScore: number | null;
}

const INITIAL_STATE: FlowState = {
  pelvisPain: 0,
  bleeding: null,
  painOnBleedingDay: null,
  sexActivity: null,
  sexPain: null,
  bowelPain: null,
  bowelPainScore: null,
  urinaryPain: null,
  urinaryPainScore: null,
};

type StepId =
  | "pelvisPain"
  | "bleeding"
  | "painOnBleedingDay"
  | "sexActivity"
  | "sexPain"
  | "bowelPain"
  | "bowelPainScore"
  | "urinaryPain"
  | "urinaryPainScore"
  | "done";

/** Build the ordered list of steps that should be shown given current answers. */
function buildSteps(s: FlowState): StepId[] {
  const steps: StepId[] = ["pelvisPain", "bleeding"];

  if (s.pelvisPain > 0 && s.bleeding !== null && s.bleeding !== "none") {
    steps.push("painOnBleedingDay");
  }

  steps.push("sexActivity");
  if (s.sexActivity === true) steps.push("sexPain");

  steps.push("bowelPain");
  if (s.bowelPain === true) steps.push("bowelPainScore");

  steps.push("urinaryPain");
  if (s.urinaryPain === true) steps.push("urinaryPainScore");

  steps.push("done");
  return steps;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** 0–10 numeric grid laid out in two rows (0-5, 6-10). */
function PainPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const renderRow = (start: number, end: number) => (
    <View style={pp.row}>
      {Array.from({ length: end - start + 1 }, (_, i) => {
        const n = start + i;
        const sel = n === value;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[pp.dot, sel && { backgroundColor: CORAL, borderColor: CORAL }]}
            accessibilityLabel={`Pain level ${n}`}
            accessibilityState={{ selected: sel }}
          >
            <Text style={[pp.dotText, sel && { color: "#fff" }]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={pp.wrap}>
      {renderRow(0, 5)}
      {renderRow(6, 10)}
      <View style={pp.labels}>
        <Text style={pp.labelText}>No pain</Text>
        <Text style={pp.labelText}>Worst imaginable</Text>
      </View>
    </View>
  );
}

const pp = StyleSheet.create({
  wrap: { gap: 10, alignItems: "center" },
  row: { flexDirection: "row", gap: 8 },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { fontSize: 15, fontWeight: "600", color: TEXT },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 2,
    marginTop: 4,
  },
  labelText: { fontSize: 11, color: TEXT_SOFT },
});

/** Horizontal chip row for bleeding status. */
const BLEEDING_OPTIONS: { value: BleedingLevel; label: string; color: string }[] = [
  { value: "none",     label: "None",     color: "#B0ADCF" },
  { value: "spotting", label: "Spotting", color: "#F5A9C0" },
  { value: "light",    label: "Light",    color: "#E87DA0" },
  { value: "normal",   label: "Normal",   color: "#D05080" },
  { value: "heavy",    label: "Heavy",    color: "#C22E60" },
];

function BleedingPicker({
  value,
  onChange,
}: {
  value: BleedingLevel | null;
  onChange: (v: BleedingLevel) => void;
}) {
  return (
    <View style={bleed.wrap}>
      {BLEEDING_OPTIONS.map((opt) => {
        const sel = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              bleed.chip,
              sel && { backgroundColor: opt.color + "22", borderColor: opt.color },
            ]}
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: sel }}
          >
            <View style={[bleed.dot, { backgroundColor: opt.color }]} />
            <Text style={[bleed.label, sel && { color: opt.color, fontWeight: "700" }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const bleed = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 14, fontWeight: "500", color: TEXT },
});

/** Large Yes / No chips. Optional third "skip" link below. */
function YesNoRow({
  value,
  onChange,
  skipLabel,
  onSkip,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  skipLabel?: string;
  onSkip?: () => void;
}) {
  return (
    <View style={yn.wrap}>
      <View style={yn.row}>
        {(["Yes", "No"] as const).map((label) => {
          const v = label === "Yes";
          const sel = value === v;
          return (
            <Pressable
              key={label}
              onPress={() => onChange(v)}
              style={[yn.btn, sel && { backgroundColor: CORAL, borderColor: CORAL }]}
              accessibilityLabel={label}
              accessibilityState={{ selected: sel }}
            >
              <Text style={[yn.label, sel && { color: "#fff" }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      {onSkip && (
        <Pressable onPress={onSkip} style={yn.skipBtn}>
          <Text style={yn.skipLabel}>{skipLabel ?? "Skip"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const yn = StyleSheet.create({
  wrap: { gap: 14, alignItems: "center" },
  row: { flexDirection: "row", gap: 16 },
  btn: {
    width: 120,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    alignItems: "center",
  },
  label: { fontSize: 16, fontWeight: "600", color: TEXT },
  skipBtn: { paddingVertical: 4 },
  skipLabel: { fontSize: 13, color: TEXT_SOFT, textDecorationLine: "underline" },
});

/** Thin progress bar at the top of the sheet. */
function ProgressBar({ index, total }: { index: number; total: number }) {
  const pct = total <= 1 ? 100 : Math.round(((index) / (total - 1)) * 100);
  return (
    <View style={prog.track}>
      <View style={[prog.fill, { width: `${pct}%` as any }]} />
    </View>
  );
}
const prog = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: BORDER, marginHorizontal: 24, marginBottom: 4 },
  fill:  { height: 4, borderRadius: 2, backgroundColor: CORAL },
});

// ─── Step cards ───────────────────────────────────────────────────────────────

/** Container wrapping each step's content with consistent spacing. */
function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={sc.card}>
      {children}
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    width: "100%",
  },
});

function StepTitle({ children }: { children: React.ReactNode }) {
  return <Text style={stT.t}>{children}</Text>;
}
const stT = StyleSheet.create({
  t: { fontSize: 20, fontWeight: "700", color: TEXT, lineHeight: 28, textAlign: "center" },
});

function StepSubtitle({ children }: { children: React.ReactNode }) {
  return <Text style={stS.s}>{children}</Text>;
}
const stS = StyleSheet.create({
  s: { fontSize: 14, color: TEXT_MID, lineHeight: 21, textAlign: "center" },
});

/** Coral continue button. */
function ContinueBtn({
  onPress,
  label = "Continue",
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cb.btn, { opacity: pressed ? 0.82 : 1 }]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Text style={cb.label}>{label}</Text>
    </Pressable>
  );
}
const cb = StyleSheet.create({
  btn: {
    backgroundColor: CORAL,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  label: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EndoTrackerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const today = localDateString(new Date());

  const [state, setState] = useState<FlowState>(INITIAL_STATE);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [existingLog, setExistingLog] = useState(false);

  // Fade animation for step transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load any existing log for today so we can pre-fill
  useEffect(() => {
    getEndoLog(today).then((log) => {
      if (!log) return;
      setExistingLog(true);
      setState({
        pelvisPain: log.pelvisPain,
        bleeding: log.bleeding,
        painOnBleedingDay: log.painOnBleedingDay,
        sexActivity: log.sexActivity,
        sexPain: log.sexPain,
        bowelPain: log.bowelPain,
        bowelPainScore: log.bowelPainScore,
        urinaryPain: log.urinaryPain,
        urinaryPainScore: log.urinaryPainScore,
      });
    });
  }, [today]);

  // Recompute visible steps whenever state changes
  const steps = buildSteps(state);
  const currentStep = steps[stepIndex] ?? "done";
  const isLast = currentStep === "done" || stepIndex >= steps.length - 1;

  const transitionToStep = useCallback(
    (nextIndex: number) => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      setStepIndex(nextIndex);
    },
    [fadeAnim],
  );

  const goNext = useCallback(() => {
    Haptics.selectionAsync();
    const nextSteps = buildSteps(state);
    const nextIndex = stepIndex + 1;
    if (nextIndex >= nextSteps.length - 1) {
      // Advance to done step → save
      setStepIndex(nextSteps.length - 1);
      handleSave(state);
    } else {
      transitionToStep(nextIndex);
    }
  }, [state, stepIndex, transitionToStep]);

  const goBack = useCallback(() => {
    if (stepIndex === 0) {
      navigation.goBack();
    } else {
      transitionToStep(stepIndex - 1);
    }
  }, [stepIndex, navigation, transitionToStep]);

  /** Auto-advance helper used by chip selections. */
  const autoAdvance = useCallback(
    (patch: Partial<FlowState>) => {
      Haptics.selectionAsync();
      const next = { ...state, ...patch };
      setState(next);
      const nextSteps = buildSteps(next);
      const nextIndex = stepIndex + 1;
      if (nextIndex >= nextSteps.length - 1) {
        setStepIndex(nextSteps.length - 1);
        handleSave(next);
      } else {
        // Small delay so the chip highlight is visible before transition
        setTimeout(() => transitionToStep(nextIndex), 160);
      }
    },
    [state, stepIndex, transitionToStep],
  );

  const handleSave = async (finalState: FlowState) => {
    if (saving) return;
    setSaving(true);
    try {
      await saveEndoLog({
        date: today,
        pelvisPain: finalState.pelvisPain,
        bleeding: finalState.bleeding ?? "none",
        painOnBleedingDay: finalState.painOnBleedingDay,
        sexActivity: finalState.sexActivity,
        sexPain: finalState.sexPain,
        bowelPain: finalState.bowelPain ?? false,
        bowelPainScore: finalState.bowelPainScore,
        urinaryPain: finalState.urinaryPain ?? false,
        urinaryPainScore: finalState.urinaryPainScore,
        completedAt: Date.now(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auto-dismiss after user sees the done screen
      setTimeout(() => {
        if (navigation.canGoBack()) navigation.goBack();
      }, 2000);
    } catch {
      setSaving(false);
      Alert.alert("Couldn't save", "Please try again.");
    }
  };

  // ── Step renderers ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {

      // ── 1. Pelvic pain ───────────────────────────────────────────────────
      case "pelvisPain":
        return (
          <StepCard>
            <View style={{ alignItems: "center", gap: 8 }}>
              <LannaMascot phase="menstrual" size={72} expression="wince" />
              <StepTitle>How bad was the pain in your belly or pelvis today?</StepTitle>
              <StepSubtitle>Rate your worst pain over the last 24 hours.</StepSubtitle>
            </View>
            <PainPicker
              value={state.pelvisPain}
              onChange={(v) => setState((s) => ({ ...s, pelvisPain: v }))}
            />
            <ContinueBtn onPress={goNext} />
            <Text style={s.disclaimer}>
              This log tracks patterns — it's not a diagnostic tool and won't replace medical advice.
            </Text>
          </StepCard>
        );

      // ── 2. Bleeding ──────────────────────────────────────────────────────
      case "bleeding":
        return (
          <StepCard>
            <StepTitle>Any bleeding today?</StepTitle>
            <BleedingPicker
              value={state.bleeding}
              onChange={(v) => autoAdvance({ bleeding: v })}
            />
          </StepCard>
        );

      // ── 3. Pain on bleeding day (conditional) ────────────────────────────
      case "painOnBleedingDay":
        return (
          <StepCard>
            <StepTitle>Did the pain happen when you were bleeding?</StepTitle>
            <YesNoRow
              value={state.painOnBleedingDay}
              onChange={(v) => autoAdvance({ painOnBleedingDay: v })}
            />
          </StepCard>
        );

      // ── 4. Sex activity ──────────────────────────────────────────────────
      case "sexActivity":
        return (
          <StepCard>
            <StepTitle>Did you have sex in the last 24 hours?</StepTitle>
            <StepSubtitle>This helps spot patterns. It's completely optional — skip if you'd rather not answer.</StepSubtitle>
            <YesNoRow
              value={state.sexActivity}
              onChange={(v) => autoAdvance({ sexActivity: v, sexPain: v ? 0 : null })}
              skipLabel="Skip this question"
              onSkip={() => autoAdvance({ sexActivity: null, sexPain: null })}
            />
          </StepCard>
        );

      // ── 4b. Sex pain (conditional) ───────────────────────────────────────
      case "sexPain":
        return (
          <StepCard>
            <StepTitle>Did you feel pain during or after?</StepTitle>
            <StepSubtitle>0 = no pain at all, 10 = worst imaginable</StepSubtitle>
            <PainPicker
              value={state.sexPain ?? 0}
              onChange={(v) => setState((s) => ({ ...s, sexPain: v }))}
            />
            <ContinueBtn onPress={goNext} />
          </StepCard>
        );

      // ── 5. Bowel pain ────────────────────────────────────────────────────
      case "bowelPain":
        return (
          <StepCard>
            <StepTitle>Any painful bowel movements today?</StepTitle>
            <YesNoRow
              value={state.bowelPain}
              onChange={(v) => autoAdvance({ bowelPain: v, bowelPainScore: v ? 0 : null })}
            />
          </StepCard>
        );

      // ── 5b. Bowel severity (conditional) ─────────────────────────────────
      case "bowelPainScore":
        return (
          <StepCard>
            <StepTitle>How painful?</StepTitle>
            <PainPicker
              value={state.bowelPainScore ?? 0}
              onChange={(v) => setState((s) => ({ ...s, bowelPainScore: v }))}
            />
            <ContinueBtn onPress={goNext} />
          </StepCard>
        );

      // ── 6. Urinary pain ──────────────────────────────────────────────────
      case "urinaryPain":
        return (
          <StepCard>
            <StepTitle>Any pain or discomfort when urinating today?</StepTitle>
            <StepSubtitle>Including any blood in urine.</StepSubtitle>
            <YesNoRow
              value={state.urinaryPain}
              onChange={(v) => autoAdvance({ urinaryPain: v, urinaryPainScore: v ? 0 : null })}
            />
          </StepCard>
        );

      // ── 6b. Urinary severity (conditional) ───────────────────────────────
      case "urinaryPainScore":
        return (
          <StepCard>
            <StepTitle>How bad was it?</StepTitle>
            <PainPicker
              value={state.urinaryPainScore ?? 0}
              onChange={(v) => setState((s) => ({ ...s, urinaryPainScore: v }))}
            />
            <ContinueBtn onPress={goNext} label="Save log" />
          </StepCard>
        );

      // ── Done ─────────────────────────────────────────────────────────────
      case "done":
        return (
          <StepCard>
            <View style={{ alignItems: "center", gap: 12 }}>
              <LannaMascot phase="follicular" size={80} expression="bright" />
              <StepTitle>{existingLog ? "Log updated ✓" : "Logged ✓"}</StepTitle>
              <StepSubtitle>
                Thanks for checking in. Tracking consistently helps you and your doctor spot patterns over time.
              </StepSubtitle>
            </View>
          </StepCard>
        );

      default:
        return null;
    }
  };

  // ── Visible step index for progress (exclude 'done' from total) ───────────
  const visibleSteps = steps.filter((id) => id !== "done");
  const progressIndex = Math.min(stepIndex, visibleSteps.length);
  const progressTotal = visibleSteps.length + 1; // +1 for done

  return (
    <View style={[s.root, { paddingTop: insets.top + 8 }]}>
      {/* Header: back button + title */}
      <View style={s.header}>
        {currentStep !== "done" ? (
          <Pressable onPress={goBack} style={s.backBtn} accessibilityLabel="Go back">
            <Text style={s.backArrow}>←</Text>
          </Pressable>
        ) : (
          <View style={s.backBtn} />
        )}
        <Text style={s.headerTitle}>
          {existingLog ? "Update today's log" : "Daily symptom check-in"}
        </Text>
        <View style={s.backBtn} />
      </View>

      {/* Progress bar */}
      <ProgressBar index={progressIndex} total={progressTotal} />

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
          {renderStep()}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 22,
    color: TEXT,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MID,
    letterSpacing: 0.1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
    gap: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: TEXT_SOFT,
    lineHeight: 18,
    textAlign: "center",
    fontStyle: "italic",
  },
});
