import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import {
  DailyLog,
  storage,
  generateId,
  calculateCycleData,
  detectPeriodStart,
} from "@/lib/storage";

const BRAND_PINK = "#E83E8C";

type FlowLevel = "spotting" | "light" | "medium" | "heavy";

interface FlowOption {
  value: FlowLevel;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  droplets: number;
}

const FLOW_OPTIONS: FlowOption[] = [
  { value: "spotting", label: "Spotting", icon: "droplet", color: "#F5A9C0", droplets: 1 },
  { value: "light", label: "Light", icon: "droplet", color: "#E87DA0", droplets: 2 },
  { value: "medium", label: "Medium", icon: "droplet", color: "#D45680", droplets: 3 },
  { value: "heavy", label: "Heavy", icon: "droplet", color: "#C22E60", droplets: 4 },
];

const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", icon: "smile" as const },
  { value: "calm", label: "Calm", icon: "sun" as const },
  { value: "tired", label: "Tired", icon: "moon" as const },
  { value: "anxious", label: "Anxious", icon: "alert-circle" as const },
  { value: "sad", label: "Sad", icon: "cloud" as const },
  { value: "irritable", label: "Irritable", icon: "zap" as const },
];

function formatDisplayDate(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

interface PeriodLogSheetProps {
  visible: boolean;
  date: string;
  existingLog: DailyLog | null;
  onSave: () => void;
  onDismiss: () => void;
}

export function PeriodLogSheet({
  visible,
  date,
  existingLog,
  onSave,
  onDismiss,
}: PeriodLogSheetProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [flow, setFlow] = useState<FlowLevel | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setFlow(existingLog?.flow || null);
      setMood(existingLog?.mood || null);
      setNotes(existingLog?.notes || "");
    }
  }, [visible, existingLog]);

  const handleSave = async () => {
    if (saving || !flow) return;
    setSaving(true);
    try {
      const log: DailyLog = {
        id: existingLog?.id || generateId(),
        date,
        flow: flow || undefined,
        symptoms: existingLog?.symptoms || [],
        mood: mood || undefined,
        energy: existingLog?.energy,
        notes: notes.trim() || undefined,
        createdAt: existingLog?.createdAt || new Date().toISOString(),
      };

      await storage.addDailyLog(log);
      console.log("[PeriodLog] Saved daily log:", { date, flow, mood });

      if (flow) {
        const [allLogs, profile] = await Promise.all([
          storage.getDailyLogs(),
          storage.getUserProfile(),
        ]);

        if (!profile) {
          const newProfile = {
            id: generateId(),
            name: "",
            dateOfBirth: "",
            cycleLength: 28,
            periodLength: 5,
            lastPeriodStart: date,
            healthGoals: [],
            hasPCOS: false,
            hasEndometriosis: false,
            createdAt: new Date().toISOString(),
          };
          await storage.setUserProfile(newProfile);
          const cycleData = calculateCycleData(newProfile);
          await storage.setCycleData(cycleData);
        } else {
          const isNewPeriodStart = detectPeriodStart(
            date,
            allLogs,
            profile.lastPeriodStart
          );

          if (isNewPeriodStart) {
            const updated = { ...profile, lastPeriodStart: date };
            await storage.setUserProfile(updated);
            const cycleData = calculateCycleData(updated);
            await storage.setCycleData(cycleData);
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave();
    } catch (err) {
      console.error("Failed to save period log:", err);
    } finally {
      setSaving(false);
    }
  };

  const bgColor = isDark ? "rgba(30,18,32,0.97)" : "rgba(255,255,255,0.97)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <Animated.View
          entering={FadeInDown.duration(250)}
          style={[styles.sheet, { backgroundColor: bgColor, paddingBottom: insets.bottom + 16 }]}
        >
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.sheetContent}
          >
            <ThemedText style={[styles.dateLabel, { color: theme.textSecondary }]}>
              {formatDisplayDate(date)}
            </ThemedText>

            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Flow
            </ThemedText>
            <View style={styles.flowGrid}>
              {FLOW_OPTIONS.map((opt) => {
                const selected = flow === opt.value;
                return (
                  <Pressable
                    key={opt.label}
                    testID={`flow-${opt.value || "none"}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFlow(opt.value);
                    }}
                    style={[
                      styles.flowPill,
                      {
                        backgroundColor: selected
                          ? opt.color + "25"
                          : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                        borderColor: selected ? opt.color : "transparent",
                        borderWidth: selected ? 2 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name={opt.icon}
                      size={18}
                      color={selected ? opt.color : theme.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.flowLabel,
                        { color: selected ? opt.color : theme.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Mood
            </ThemedText>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((opt) => {
                const selected = mood === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    testID={`mood-${opt.value}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMood(selected ? null : opt.value);
                    }}
                    style={[
                      styles.moodPill,
                      {
                        backgroundColor: selected
                          ? BRAND_PINK + "20"
                          : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                        borderColor: selected ? BRAND_PINK : "transparent",
                        borderWidth: selected ? 2 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name={opt.icon}
                      size={16}
                      color={selected ? BRAND_PINK : theme.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.moodLabel,
                        { color: selected ? BRAND_PINK : theme.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Notes
            </ThemedText>
            <TextInput
              testID="input-period-notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="How are you feeling today?"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.notesInput,
                {
                  color: theme.text,
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                },
              ]}
              maxLength={200}
            />

            <Pressable
              testID="button-save-period"
              onPress={handleSave}
              disabled={saving || !flow}
              style={({ pressed }) => [
                styles.saveButton,
                { opacity: pressed || saving || !flow ? 0.5 : 1 },
              ]}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <ThemedText style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save"}
              </ThemedText>
            </Pressable>
            {!flow ? (
              <ThemedText style={[styles.flowHint, { color: theme.textSecondary }]}>
                Select a flow level to log your period
              </ThemedText>
            ) : null}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(128,128,128,0.3)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    marginBottom: 12,
  },
  flowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  flowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.xl,
  },
  flowLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 13,
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  moodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.xl,
  },
  moodLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  notesInput: {
    fontFamily: Fonts.body,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND_PINK,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
  },
  saveButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: "#FFFFFF",
  },
  flowHint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
  },
});
