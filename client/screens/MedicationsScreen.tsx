import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

const STORAGE_KEY = "olanna_medication_logs";

const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "As needed", value: "as_needed" },
  { label: "Twice daily", value: "twice_daily" },
];

interface MedicationEntry {
  id: string;
  medication_name: string;
  dosage_value: number | null;
  dosage_unit: string;
  frequency_label: string;
  taken_at: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MedicationsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<MedicationEntry[]>([]);
  const [medicationName, setMedicationName] = useState("");
  const [dosageValue, setDosageValue] = useState("");
  const [dosageUnit, setDosageUnit] = useState("");
  const [frequencyLabel, setFrequencyLabel] = useState("daily");
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toastOpacity = useSharedValue(0);
  const saveScale = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const saveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setToastMsg(null), 350);
    }, 2500);
  };

  const loadEntries = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const all: MedicationEntry[] = JSON.parse(raw);
        const todayKey = getTodayKey();
        const todayEntries = all.filter(
          (e) => e.taken_at.split("T")[0] === todayKey
        );
        setEntries(todayEntries);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    if (!medicationName.trim()) {
      showToast("Please enter a medication name.");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const newEntry: MedicationEntry = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        medication_name: medicationName.trim(),
        dosage_value: dosageValue ? parseFloat(dosageValue) : null,
        dosage_unit: dosageUnit.trim(),
        frequency_label: frequencyLabel,
        taken_at: new Date().toISOString(),
      };

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const all: MedicationEntry[] = raw ? JSON.parse(raw) : [];
      all.push(newEntry);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));

      setMedicationName("");
      setDosageValue("");
      setDosageUnit("");
      setFrequencyLabel("daily");
      setFrequencyOpen(false);

      await loadEntries();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Medication logged");
    } catch {
      showToast("Could not save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const all: MedicationEntry[] = raw ? JSON.parse(raw) : [];
      const filtered = all.filter((e) => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      await loadEntries();
      showToast("Entry removed");
    } catch {
      showToast("Could not remove entry.");
    }
  };

  const getFrequencyDisplay = (value: string) => {
    const option = FREQUENCY_OPTIONS.find((o) => o.value === value);
    return option ? option.label : value;
  };

  const todayStr = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const todayCount = entries.length;

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GlassSurface style={styles.fieldCard}>
          <ThemedText
            style={[styles.fieldLabel, { color: theme.textSecondary }]}
          >
            DATE
          </ThemedText>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={18} color={theme.textSecondary} />
            <ThemedText style={[styles.dateText, { color: theme.text }]}>
              {todayStr}
            </ThemedText>
          </View>
        </GlassSurface>

        {todayCount > 0 ? (
          <>
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
            <GlassSurface style={styles.fieldCard}>
              <ThemedText
                style={[styles.summaryText, { color: theme.text }]}
                testID="text-medication-summary"
              >
                You logged {todayCount} medication
                {todayCount !== 1 ? "s" : ""} today
              </ThemedText>
              <View style={styles.entryList}>
                {entries.map((entry) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.entryRow,
                      { borderBottomColor: theme.border },
                    ]}
                  >
                    <View style={styles.entryInfo}>
                      <ThemedText
                        style={[styles.entryName, { color: theme.text }]}
                      >
                        {entry.medication_name}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.entryMeta,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {entry.dosage_value
                          ? `${entry.dosage_value}${entry.dosage_unit ? " " + entry.dosage_unit : ""}`
                          : "No dosage specified"}
                        {" \u00B7 "}
                        {getFrequencyDisplay(entry.frequency_label)}
                      </ThemedText>
                    </View>
                    <Pressable
                      testID={`button-delete-medication-${entry.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${entry.medication_name}`}
                      onPress={() => handleDelete(entry.id)}
                      hitSlop={8}
                    >
                      <Feather
                        name="x"
                        size={18}
                        color={theme.textSecondary}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            </GlassSurface>
          </>
        ) : null}

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <GlassSurface style={styles.fieldCard}>
          <ThemedText
            style={[styles.fieldLabel, { color: theme.textSecondary }]}
          >
            MEDICATION NAME
          </ThemedText>
          <TextInput
            testID="input-medication-name"
            accessibilityLabel="Medication name"
            style={[
              styles.textInput,
              {
                color: theme.text,
                borderColor: theme.border,
                fontFamily: Fonts.body,
              },
            ]}
            placeholder="e.g. Ibuprofen, Metformin"
            placeholderTextColor={theme.textSecondary}
            value={medicationName}
            onChangeText={setMedicationName}
            maxLength={80}
            editable={!isSaving}
          />
        </GlassSurface>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={styles.dosageRow}>
          <View style={styles.dosageValueWrap}>
            <GlassSurface style={styles.fieldCard}>
              <ThemedText
                style={[styles.fieldLabel, { color: theme.textSecondary }]}
              >
                DOSAGE
              </ThemedText>
              <TextInput
                testID="input-dosage-value"
                accessibilityLabel="Dosage amount"
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    fontFamily: Fonts.body,
                  },
                ]}
                placeholder="e.g. 200"
                placeholderTextColor={theme.textSecondary}
                value={dosageValue}
                onChangeText={setDosageValue}
                keyboardType="numeric"
                maxLength={10}
                editable={!isSaving}
              />
            </GlassSurface>
          </View>
          <View style={styles.dosageUnitWrap}>
            <GlassSurface style={styles.fieldCard}>
              <ThemedText
                style={[styles.fieldLabel, { color: theme.textSecondary }]}
              >
                UNIT
              </ThemedText>
              <TextInput
                testID="input-dosage-unit"
                accessibilityLabel="Dosage unit"
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    fontFamily: Fonts.body,
                  },
                ]}
                placeholder="e.g. mg"
                placeholderTextColor={theme.textSecondary}
                value={dosageUnit}
                onChangeText={setDosageUnit}
                maxLength={20}
                editable={!isSaving}
              />
            </GlassSurface>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <GlassSurface style={styles.fieldCard}>
          <ThemedText
            style={[styles.fieldLabel, { color: theme.textSecondary }]}
          >
            FREQUENCY
          </ThemedText>
          <Pressable
            testID="dropdown-frequency"
            accessibilityRole="button"
            accessibilityLabel={`Frequency: ${getFrequencyDisplay(frequencyLabel)}. Tap to change`}
            onPress={() => setFrequencyOpen(!frequencyOpen)}
            style={[styles.dropdownTrigger, { borderColor: theme.border }]}
          >
            <ThemedText style={[styles.dropdownText, { color: theme.text }]}>
              {getFrequencyDisplay(frequencyLabel)}
            </ThemedText>
            <Feather
              name={frequencyOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>
          {frequencyOpen ? (
            <View
              style={[styles.dropdownList, { borderColor: theme.border }]}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  testID={`option-frequency-${option.value}`}
                  accessibilityRole="button"
                  accessibilityLabel={
                    option.label +
                    (frequencyLabel === option.value ? ", selected" : "")
                  }
                  onPress={() => {
                    setFrequencyLabel(option.value);
                    setFrequencyOpen(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    frequencyLabel === option.value
                      ? { backgroundColor: "#7B5EA7" + "20" }
                      : null,
                  ]}
                >
                  <ThemedText
                    style={[styles.dropdownItemText, { color: theme.text }]}
                  >
                    {option.label}
                  </ThemedText>
                  {frequencyLabel === option.value ? (
                    <Feather name="check" size={16} color="#7B5EA7" />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </GlassSurface>

        <AnimatedPressable
          testID="button-save-medication"
          accessibilityRole="button"
          accessibilityLabel="Log medication"
          onPress={handleSave}
          disabled={isSaving}
          onPressIn={() => {
            saveScale.value = withSpring(0.97, {
              damping: 15,
              stiffness: 150,
            });
          }}
          onPressOut={() => {
            saveScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          }}
          style={[
            styles.saveButton,
            isSaving ? { opacity: 0.6 } : null,
            saveAnimStyle,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#3A2F35" size="small" />
          ) : (
            <ThemedText style={styles.saveButtonText}>
              Log Medication
            </ThemedText>
          )}
        </AnimatedPressable>

        <GlassSurface
          style={[styles.fieldCard, { marginTop: Spacing.lg }]}
          tint="subtle"
        >
          <View style={styles.safetyRow}>
            <Feather name="info" size={16} color="#7B5EA7" />
            <ThemedText
              style={[styles.safetyNote, { color: theme.textSecondary }]}
            >
              Consider discussing your medication routine during your next
              healthcare visit.
            </ThemedText>
          </View>
        </GlassSurface>

        <ThemedText
          style={[styles.privacyNote, { color: theme.textSecondary }]}
        >
          Your medication logs are stored locally on your device and are
          completely private.
        </ThemedText>
      </ScrollView>

      {toastMsg ? (
        <Animated.View style={[styles.toast, toastStyle]}>
          <ThemedText style={styles.toastText}>{toastMsg}</ThemedText>
        </Animated.View>
      ) : null}
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  fieldCard: {
    borderRadius: 12,
    padding: Spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    marginVertical: 2,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dateText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  summaryText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  entryList: {
    gap: 0,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  entryInfo: {
    flex: 1,
    gap: 2,
  },
  entryName: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 14,
  },
  entryMeta: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  dosageRow: {
    flexDirection: "row",
    gap: 8,
  },
  dosageValueWrap: {
    flex: 1,
  },
  dosageUnitWrap: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  dropdownText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  dropdownList: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F6BFD3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    color: "#3A2F35",
    letterSpacing: 0.3,
  },
  safetyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  safetyNote: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  privacyNote: {
    fontFamily: Fonts.body,
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#3A2F35",
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  toastText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
