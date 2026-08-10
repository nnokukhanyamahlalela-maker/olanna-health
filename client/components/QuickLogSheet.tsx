/**
 * QuickLogSheet
 *
 * Fast, domain-scoped 2-tap logging triggered from the Home quick-log row.
 * Each domain (flow / mood / pain / energy) shows its own focused option set.
 * Selecting a value and tapping "Log it" merges that field into today's
 * DailyLog without wiping any other fields already saved for today.
 *
 * Pain maps to real symptom IDs in DailyLog.symptoms so the pattern engine
 * can read it. Previous pain quick-log symptoms are replaced on each save.
 */

import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Path, Ellipse, Polygon, Rect } from "react-native-svg";
import { storage, DailyLog } from "@/lib/storage";
import { generateId } from "@/lib/storage";

// ─── Domain types ─────────────────────────────────────────────────────────────

export type QuickLogDomain = "flow" | "mood" | "pain" | "energy";

// Symptom IDs written for pain quick-logs. Cleared on each pain save so the
// previous selection is always replaced rather than accumulated.
const PAIN_SYMPTOM_IDS = ["cramps", "pelvic-heaviness", "deep-pelvic-pain"];

// ─── Option definitions ───────────────────────────────────────────────────────

const FLOW_OPTIONS = [
  { id: "spotting", label: "Spotting", emoji: "🩸", tint: "#F9C4D7" },
  { id: "light",    label: "Light",    emoji: "🩸", tint: "#F4A0BF" },
  { id: "medium",   label: "Medium",   emoji: "🩸", tint: "#E8739E" },
  { id: "heavy",    label: "Heavy",    emoji: "🩸", tint: "#C2185B" },
] as const;

const MOOD_OPTIONS = [
  { id: "happy",     label: "Happy",     emoji: "😊" },
  { id: "calm",      label: "Calm",      emoji: "😌" },
  { id: "anxious",   label: "Anxious",   emoji: "😟" },
  { id: "sad",       label: "Sad",       emoji: "😢" },
  { id: "irritable", label: "Irritable", emoji: "😤" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
] as const;

const PAIN_OPTIONS = [
  { id: "none",     label: "None",     emoji: "✅", symptoms: [] as string[] },
  { id: "mild",     label: "Mild",     emoji: "😕", symptoms: ["cramps"] },
  { id: "moderate", label: "Moderate", emoji: "😣", symptoms: ["cramps", "pelvic-heaviness"] },
  { id: "severe",   label: "Severe",   emoji: "😖", symptoms: ["cramps", "pelvic-heaviness", "deep-pelvic-pain"] },
] as const;

const ENERGY_OPTIONS = [
  { id: 1, label: "Very Low",  emoji: "😴" },
  { id: 2, label: "Low",       emoji: "🥱" },
  { id: 3, label: "Medium",    emoji: "🙂" },
  { id: 4, label: "High",      emoji: "😄" },
  { id: 5, label: "Very High", emoji: "🚀" },
] as const;

// ─── Chip icon components (SVG, drawn in the same flat style as SymptomCharacter)

function FlowIcon({ level }: { level: string }) {
  const fills: Record<string, string> = {
    spotting: "#FDDEE8", light: "#F4A0BF", medium: "#E8739E", heavy: "#C2185B",
  };
  const strokes: Record<string, string> = {
    spotting: "#F0A8C0", light: "#E07090", medium: "#C25080", heavy: "#8B1040",
  };
  const fill   = fills[level]   ?? "#F4A0BF";
  const stroke = strokes[level] ?? "#E07090";
  const D = "M 12 2 C 18 8 21 14 21 18 C 21 23 17 27 12 27 C 7 27 3 23 3 18 C 3 14 6 8 12 2 Z";
  return (
    <Svg width={18} height={22} viewBox="0 0 24 28">
      <Path d={D} fill={fill} stroke={stroke} strokeWidth={1.2} />
      {level === "spotting" && <Ellipse cx={12} cy={13} rx={6} ry={8} fill="white" opacity={0.55} />}
      {level === "light"    && <Ellipse cx={12} cy={12} rx={6} ry={6} fill="white" opacity={0.42} />}
    </Svg>
  );
}

function MoodIcon({ mood }: { mood: string }) {
  const bgs: Record<string, string> = {
    happy: "#F5D060", calm: "#A8C8E0", anxious: "#C4B8D8",
    sad: "#8EB8D8", irritable: "#E89060", energetic: "#F0D040",
  };
  const bg  = bgs[mood] ?? "#C8C0D8";
  const ink = "#26215C";
  if (mood === "energetic") {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M 15 2 L 8 11 L 12 11 L 7 20 L 18 10 L 13 10 Z"
          fill="#F0D040" stroke="#A08000" strokeWidth={0.8} strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Circle cx={11} cy={11} r={9} fill={bg} />
      {/* eyes */}
      {mood === "calm" ? (
        <>
          <Path d="M 7 9.5 Q 8.5 8 10 9.5" stroke={ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <Path d="M 12 9.5 Q 13.5 8 15 9.5" stroke={ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx={8}  cy={10} r={1.3} fill={ink} />
          <Circle cx={14} cy={10} r={1.3} fill={ink} />
        </>
      )}
      {/* brows */}
      {mood === "irritable" && (
        <>
          <Path d="M 6 8 Q 7.5 6.8 9 7.8"   stroke={ink} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <Path d="M 13 7.8 Q 14.5 6.8 16 8" stroke={ink} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "anxious" && (
        <>
          <Path d="M 6.5 8 Q 8 7 9 8.5"    stroke={ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <Path d="M 13 8.5 Q 14 7 15.5 8" stroke={ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </>
      )}
      {/* mouth */}
      {(mood === "happy" || mood === "calm") && (
        <Path d="M 7.5 13 Q 11 16.5 14.5 13" stroke={ink} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      )}
      {(mood === "sad" || mood === "irritable") && (
        <Path d="M 7.5 14.5 Q 11 12 14.5 14.5" stroke={ink} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      )}
      {mood === "anxious" && (
        <Path d="M 8 13.5 Q 9.5 12.5 11 13.5 Q 12.5 14.5 14 13.5"
          stroke={ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      )}
      {/* tear */}
      {mood === "sad" && (
        <Path d="M 8 11 L 7.5 13 Q 7 14 8 14 Q 9 14 8.5 13 Z" fill="#8EB8D8" opacity={0.8} />
      )}
      {/* steam */}
      {mood === "irritable" && (
        <>
          <Path d="M 17 7 Q 18 5.5 17 4"   stroke={ink} strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.5} />
          <Path d="M 19 8.5 Q 20 7 19 5.5" stroke={ink} strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.5} />
        </>
      )}
    </Svg>
  );
}

function PainIcon({ level }: { level: string }) {
  if (level === "none") {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Circle cx={11} cy={11} r={9} fill="#0F6E56" />
        <Path d="M 7 11 L 10 14 L 16 8" stroke="white" strokeWidth={2}
          fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (level === "mild") {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Circle cx={11} cy={11} r={6}   fill="#F9C4D7" />
        <Circle cx={11} cy={11} r={9.5} fill="none" stroke="#F9C4D7" strokeWidth={1.5} opacity={0.55} />
      </Svg>
    );
  }
  if (level === "moderate") {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Circle cx={11} cy={11} r={5.5}  fill="#F07090" />
        <Circle cx={11} cy={11} r={8}    fill="none" stroke="#F07090" strokeWidth={1.5} opacity={0.6} />
        <Circle cx={11} cy={11} r={10.5} fill="none" stroke="#F07090" strokeWidth={1}   opacity={0.3} />
      </Svg>
    );
  }
  // severe: spiky starburst
  const spikes = 8, cx = 11, cy = 11, r1 = 6, r2 = 10;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? r2 : r1;
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Polygon points={pts.join(" ")} fill="#D85A30" />
      <Circle cx={11} cy={11} r={4.5} fill="#F07060" />
    </Svg>
  );
}

function EnergyIcon({ level }: { level: number }) {
  const pct    = level / 5;
  const barW   = Math.max(2, Math.round(13 * pct));
  const colors = ["#D85A30", "#E89040", "#D4B800", "#0F9E6A", "#0F6E56"];
  const fillColor = colors[level - 1] ?? "#D4B800";
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Rect x={1}    y={7} width={17}  height={8} rx={2}   fill="none" stroke="#26215C" strokeWidth={1.4} />
      <Rect x={18.3} y={9} width={2.5} height={4} rx={0.8} fill="#26215C" />
      <Rect x={2.5}  y={8.5} width={barW} height={5} rx={0.8} fill={fillColor} />
      {level === 5 && (
        <Path d="M 11 6 L 9.5 11 L 11 11 L 9.5 16 L 14 10 L 12 10 Z"
          fill="#F5E040" opacity={0.9} />
      )}
    </Svg>
  );
}

// ─── Domain config ────────────────────────────────────────────────────────────

const DOMAIN_META: Record<QuickLogDomain, { title: string; subtitle: string }> = {
  flow:   { title: "Log flow",   subtitle: "How heavy is it today?" },
  mood:   { title: "Log mood",   subtitle: "How are you feeling right now?" },
  pain:   { title: "Log pain",   subtitle: "How much pain today?" },
  energy: { title: "Log energy", subtitle: "How's your energy level?" },
};

// ─── Merge helper ─────────────────────────────────────────────────────────────

async function mergeAndSave(
  domain: QuickLogDomain,
  value: string | number,
  symptoms?: string[]
): Promise<DailyLog> {
  const today = new Date().toISOString().split("T")[0];
  const allLogs = await storage.getDailyLogs();
  const existing = allLogs.find((l) => l.date === today);

  let existingSymptoms: string[] = existing?.symptoms ?? [];

  // For pain: strip any previously-saved pain quick-log symptoms before adding new ones
  if (domain === "pain") {
    existingSymptoms = existingSymptoms.filter(
      (s) => !PAIN_SYMPTOM_IDS.includes(s)
    );
    existingSymptoms = [...existingSymptoms, ...(symptoms ?? [])];
  }

  const merged: DailyLog = {
    id: existing?.id ?? generateId(),
    date: today,
    symptoms: existingSymptoms,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    ...(existing ?? {}),
    ...(domain === "flow"   ? { flow: value as DailyLog["flow"] } : {}),
    ...(domain === "mood"   ? { mood: String(value) } : {}),
    ...(domain === "energy" ? { energy: Number(value) } : {}),
    ...(domain === "pain"   ? { symptoms: existingSymptoms } : {}),
  };

  await storage.addDailyLog(merged);
  return merged;
}

// ─── Option pill ──────────────────────────────────────────────────────────────

function OptionPill({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      {icon}
      <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  domain: QuickLogDomain;
  onDismiss: () => void;
  /** Called after the log is persisted. Receives the domain and the merged log. */
  onSaved?: (domain: QuickLogDomain, log: import("@/lib/storage").DailyLog) => void;
}

export function QuickLogSheet({ visible, domain, onDismiss, onSaved }: Props) {
  const insets = useSafeAreaInsets();

  const [selectedFlow,   setSelectedFlow]   = useState<string | null>(null);
  const [selectedMood,   setSelectedMood]   = useState<string | null>(null);
  const [selectedPain,   setSelectedPain]   = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [saveError,      setSaveError]      = useState<string | null>(null);

  // Guard: tracks the pending close-after-animation timer so handleDismiss can
  // cancel it when the user taps "Not right now" during the 700 ms window.
  // Also prevents onSaved from being invoked more than once per save cycle.
  const closeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSavedFiredRef = useRef(false);

  const meta = DOMAIN_META[domain];

  const hasSelection =
    (domain === "flow"   && selectedFlow   !== null) ||
    (domain === "mood"   && selectedMood   !== null) ||
    (domain === "pain"   && selectedPain   !== null) ||
    (domain === "energy" && selectedEnergy !== null);

  const handleSave = async () => {
    if (!hasSelection || saving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    onSavedFiredRef.current = false;
    try {
      let savedLog: DailyLog | null = null;
      if (domain === "flow" && selectedFlow) {
        savedLog = await mergeAndSave("flow", selectedFlow);
      } else if (domain === "mood" && selectedMood) {
        savedLog = await mergeAndSave("mood", selectedMood);
      } else if (domain === "energy" && selectedEnergy !== null) {
        savedLog = await mergeAndSave("energy", selectedEnergy);
      } else if (domain === "pain" && selectedPain !== null) {
        const painOpt = PAIN_OPTIONS.find((o) => o.id === selectedPain);
        savedLog = await mergeAndSave("pain", selectedPain, [...(painOpt?.symptoms ?? [])]);
      }
      setSaved(true);
      // Fire onSaved exactly once — guard prevents a second call if the parent
      // re-renders or the user dismisses early and triggers another code path.
      if (savedLog && !onSavedFiredRef.current) {
        onSavedFiredRef.current = true;
        onSaved?.(domain, savedLog);
      }
      // Store the timer so handleDismiss can cancel it during the animation window.
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setSaved(false);
        setSaving(false);
        resetSelections();
        onDismiss();
      }, 700);
    } catch (e) {
      console.error("[QuickLogSheet] save error:", e);
      setSaving(false);
      setSaveError("Could not save. Please try again.");
    }
  };

  const resetSelections = () => {
    setSelectedFlow(null);
    setSelectedMood(null);
    setSelectedPain(null);
    setSelectedEnergy(null);
    setSaveError(null);
  };

  const handleDismiss = () => {
    // Cancel any pending close-after-animation timer so the sheet doesn't call
    // onDismiss a second time after the user already dismissed it manually.
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSaved(false);
    setSaving(false);
    resetSelections();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      {/* Scrim */}
      <Pressable style={styles.scrim} onPress={handleDismiss} />

      {/* Sheet */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{meta.title}</Text>
          <Text style={styles.subtitle}>{meta.subtitle}</Text>
        </View>

        {/* Options */}
        <ScrollView
          horizontal={false}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {domain === "flow" && (
            <View style={styles.pillGrid}>
              {FLOW_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.id}
                  icon={<FlowIcon level={opt.id} />}
                  label={opt.label}
                  selected={selectedFlow === opt.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedFlow(opt.id);
                  }}
                />
              ))}
            </View>
          )}

          {domain === "mood" && (
            <View style={styles.pillGrid}>
              {MOOD_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.id}
                  icon={<MoodIcon mood={opt.id} />}
                  label={opt.label}
                  selected={selectedMood === opt.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMood(opt.id);
                  }}
                />
              ))}
            </View>
          )}

          {domain === "pain" && (
            <View style={styles.pillGrid}>
              {PAIN_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.id}
                  icon={<PainIcon level={opt.id} />}
                  label={opt.label}
                  selected={selectedPain === opt.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPain(opt.id);
                  }}
                />
              ))}
            </View>
          )}

          {domain === "energy" && (
            <View style={styles.pillGrid}>
              {ENERGY_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.id}
                  icon={<EnergyIcon level={opt.id} />}
                  label={opt.label}
                  selected={selectedEnergy === opt.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedEnergy(opt.id);
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={!hasSelection || saving}
          style={[
            styles.saveBtn,
            (!hasSelection || saving) && styles.saveBtnDisabled,
            saved && styles.saveBtnSaved,
          ]}
        >
          {saving && !saved ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>
              {saved ? "Logged ✓" : "Log it"}
            </Text>
          )}
        </Pressable>

        {/* Save error */}
        {saveError && (
          <Text style={styles.errorText}>{saveError}</Text>
        )}

        {/* Dismiss link */}
        <Pressable onPress={handleDismiss} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Not right now</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CORAL = "#D85A30";

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#FAF8F3",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    minHeight: 360,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(38,33,92,0.18)",
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#26215C",
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B6591",
    lineHeight: 20,
  },
  optionsContainer: {
    paddingBottom: 8,
  },
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#EEEDFE",
    borderWidth: 1.5,
    borderColor: "#D8D6F0",
  },
  pillSelected: {
    backgroundColor: "#FAECE7",
    borderColor: CORAL,
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#26215C",
  },
  pillLabelSelected: {
    fontWeight: "700",
    color: "#D85A30",
  },
  saveBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.38,
  },
  saveBtnSaved: {
    backgroundColor: "#0F6E56",
  },
  saveBtnText: {
    color: "#FAECE7",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    color: "#6B6591",
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    color: "#B04020",
    textAlign: "center",
  },
});
