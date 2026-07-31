import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SymptomChip } from "@/components/SymptomChip";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserProfile } from "@/lib/storage";
import { saveOnboardingCycleProfile } from "@/services/cycleProfileService";

const healthGoals = [
  { id: "track_period", label: "Track my period" },
  { id: "manage_pcos", label: "Manage PCOS" },
  { id: "manage_endo", label: "Manage Endometriosis" },
  // "Track fertility" is hidden behind FEATURES.FERTILITY_TRACKING_ENABLED.
  // The goal ID is preserved in storage for any users who selected it previously.
  { id: "sexual_health", label: "Sexual health" },
  { id: "wellness", label: "General wellness" },
];

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [lastPeriodStart, setLastPeriodStart] = useState(new Date());
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await storage.getUserProfile();
    if (profile) {
      setOriginalProfile(profile);
      setName(profile.name);
      setDateOfBirth(new Date(profile.dateOfBirth + "T12:00:00"));
      setCycleLength(profile.cycleLength.toString());
      setPeriodLength(profile.periodLength.toString());
      setLastPeriodStart(new Date(profile.lastPeriodStart + "T12:00:00"));
      setSelectedGoals(profile.healthGoals);
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleSave = async () => {
    if (!originalProfile) return;

    setIsSaving(true);
    try {
      const updatedProfile: UserProfile = {
        ...originalProfile,
        name: name.trim(),
        dateOfBirth: `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, "0")}-${String(dateOfBirth.getDate()).padStart(2, "0")}`,
        cycleLength: Math.max(15, Math.min(60, Number.isFinite(parseInt(cycleLength)) ? parseInt(cycleLength) : 28)),
        periodLength: Math.max(1, Math.min(14, Number.isFinite(parseInt(periodLength)) ? parseInt(periodLength) : 5)),
        lastPeriodStart: `${lastPeriodStart.getFullYear()}-${String(lastPeriodStart.getMonth() + 1).padStart(2, "0")}-${String(lastPeriodStart.getDate()).padStart(2, "0")}`,
        healthGoals: selectedGoals,
        hasPCOS: selectedGoals.includes("manage_pcos"),
        hasEndometriosis: selectedGoals.includes("manage_endo"),
      };
      await storage.setUserProfile(updatedProfile);
      await saveOnboardingCycleProfile({
        userId: updatedProfile.id,
        lastPeriodStartDate: updatedProfile.lastPeriodStart,
        averageCycleLength: updatedProfile.cycleLength,
        averagePeriodLength: updatedProfile.periodLength,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save profile:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AppGradient style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Name
        </ThemedText>
        <GlassSurface style={styles.inputWrapper} noPadding>
          <TextInput
            style={[
              styles.input,
              { color: theme.text },
            ]}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </GlassSurface>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Date of Birth
        </ThemedText>
        <Pressable onPress={() => setShowDatePicker(true)}>
          <GlassSurface style={styles.dateButton} noPadding>
            <View style={styles.dateButtonInner}>
              <ThemedText type="body">{formatDate(dateOfBirth)}</ThemedText>
              <Feather name="calendar" size={20} color={theme.textSecondary} />
            </View>
          </GlassSurface>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === "ios");
              if (date) setDateOfBirth(date);
            }}
            maximumDate={new Date()}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Average Cycle Length (days)
        </ThemedText>
        <GlassSurface style={styles.inputWrapper} noPadding>
          <TextInput
            style={[
              styles.input,
              { color: theme.text },
            ]}
            placeholder="28"
            placeholderTextColor={theme.textSecondary}
            value={cycleLength}
            onChangeText={setCycleLength}
            keyboardType="number-pad"
            maxLength={2}
          />
        </GlassSurface>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Average Period Length (days)
        </ThemedText>
        <GlassSurface style={styles.inputWrapper} noPadding>
          <TextInput
            style={[
              styles.input,
              { color: theme.text },
            ]}
            placeholder="5"
            placeholderTextColor={theme.textSecondary}
            value={periodLength}
            onChangeText={setPeriodLength}
            keyboardType="number-pad"
            maxLength={2}
          />
        </GlassSurface>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Last Period Start Date
        </ThemedText>
        <Pressable onPress={() => setShowLastPeriodPicker(true)}>
          <GlassSurface style={styles.dateButton} noPadding>
            <View style={styles.dateButtonInner}>
              <ThemedText type="body">{formatDate(lastPeriodStart)}</ThemedText>
              <Feather name="calendar" size={20} color={theme.textSecondary} />
            </View>
          </GlassSurface>
        </Pressable>
        {showLastPeriodPicker ? (
          <DateTimePicker
            value={lastPeriodStart}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowLastPeriodPicker(Platform.OS === "ios");
              if (date) setLastPeriodStart(date);
            }}
            maximumDate={new Date()}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Health Goals
        </ThemedText>
        <View style={styles.goalsGrid}>
          {healthGoals.map((goal) => (
            <SymptomChip
              key={goal.id}
              label={goal.label}
              selected={selectedGoals.includes(goal.id)}
              onPress={() => toggleGoal(goal.id)}
            />
          ))}
        </View>
      </View>

      <Button onPress={handleSave} disabled={isSaving || !name.trim()} style={styles.saveButton}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
      </KeyboardAwareScrollViewCompat>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    borderRadius: BorderRadius.md,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  dateButton: {
    borderRadius: BorderRadius.md,
  },
  dateButtonInner: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
