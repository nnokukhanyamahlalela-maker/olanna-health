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

import React, { useState } from "react";
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
  emoji,
  label,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={styles.pillEmoji}>{emoji}</Text>
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
      if (savedLog) onSaved?.(domain, savedLog);
      setTimeout(() => {
        setSaved(false);
        setSaving(false);
        resetSelections();
        onDismiss();
      }, 700);
    } catch (e) {
      console.error("[QuickLogSheet] save error:", e);
      setSaving(false);
    }
  };

  const resetSelections = () => {
    setSelectedFlow(null);
    setSelectedMood(null);
    setSelectedPain(null);
    setSelectedEnergy(null);
  };

  const handleDismiss = () => {
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
                  emoji={opt.emoji}
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
                  emoji={opt.emoji}
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
                  emoji={opt.emoji}
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
                  emoji={opt.emoji}
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

        {/* Dismiss link */}
        <Pressable onPress={handleDismiss} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Not right now</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PINK = "#F06B9A";

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#FDF5F8",
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
    backgroundColor: "rgba(90,66,82,0.25)",
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D1F2B",
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 14,
    color: "#8A6F80",
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
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(240,107,154,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(240,107,154,0.18)",
  },
  pillSelected: {
    backgroundColor: "rgba(240,107,154,0.18)",
    borderColor: PINK,
  },
  pillEmoji: {
    fontSize: 18,
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#5A4252",
  },
  pillLabelSelected: {
    fontWeight: "700",
    color: "#2D1F2B",
  },
  saveBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "rgba(240,107,154,0.35)",
  },
  saveBtnSaved: {
    backgroundColor: "#6AB494",
  },
  saveBtnText: {
    color: "#fff",
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
    color: "#8A6F80",
  },
});
