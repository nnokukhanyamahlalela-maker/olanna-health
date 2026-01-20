import React, { useState } from "react";
import { View, StyleSheet, Image, TextInput, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SymptomChip } from "@/components/SymptomChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserProfile, generateId } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const healthGoals = [
  { id: "track_period", label: "Track my period" },
  { id: "manage_pcos", label: "Manage PCOS" },
  { id: "manage_endo", label: "Manage Endometriosis" },
  { id: "fertility", label: "Track fertility" },
  { id: "sexual_health", label: "Sexual health" },
  { id: "wellness", label: "General wellness" },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [lastPeriodStart, setLastPeriodStart] = useState(new Date());
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const profile: UserProfile = {
        id: generateId(),
        name: name.trim(),
        dateOfBirth: dateOfBirth.toISOString().split("T")[0],
        cycleLength: parseInt(cycleLength) || 28,
        periodLength: parseInt(periodLength) || 5,
        lastPeriodStart: lastPeriodStart.toISOString().split("T")[0],
        healthGoals: selectedGoals,
        hasPCOS: selectedGoals.includes("manage_pcos"),
        hasEndometriosis: selectedGoals.includes("manage_endo"),
        createdAt: new Date().toISOString(),
      };
      await storage.setUserProfile(profile);
      await storage.setOnboardingComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
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

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Image
        source={require("../../assets/images/onboarding-hero.png")}
        style={styles.heroImage}
        resizeMode="contain"
      />
      <ThemedText type="h1" style={styles.title}>
        Welcome to Olanna Health
      </ThemedText>
      <ThemedText type="body" style={styles.subtitle}>
        Your personal wellness companion for menstrual health, fertility tracking, and holistic care.
      </ThemedText>
      <Button onPress={handleNext} style={styles.button}>
        Get Started
      </Button>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        What should we call you?
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="Your name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <ThemedText type="h4" style={styles.fieldLabel}>
        Date of Birth
      </ThemedText>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[
          styles.dateButton,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <ThemedText type="body">{formatDate(dateOfBirth)}</ThemedText>
        <Feather name="calendar" size={20} color={theme.textSecondary} />
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
      <Button onPress={handleNext} disabled={!name.trim()} style={styles.button}>
        Continue
      </Button>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        Tell us about your cycle
      </ThemedText>
      <ThemedText type="h4" style={styles.fieldLabel}>
        Average cycle length (days)
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="28"
        placeholderTextColor={theme.textSecondary}
        value={cycleLength}
        onChangeText={setCycleLength}
        keyboardType="number-pad"
        maxLength={2}
      />
      <ThemedText type="h4" style={styles.fieldLabel}>
        Average period length (days)
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="5"
        placeholderTextColor={theme.textSecondary}
        value={periodLength}
        onChangeText={setPeriodLength}
        keyboardType="number-pad"
        maxLength={2}
      />
      <ThemedText type="h4" style={styles.fieldLabel}>
        When did your last period start?
      </ThemedText>
      <Pressable
        onPress={() => setShowLastPeriodPicker(true)}
        style={[
          styles.dateButton,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <ThemedText type="body">{formatDate(lastPeriodStart)}</ThemedText>
        <Feather name="calendar" size={20} color={theme.textSecondary} />
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
      <Button onPress={handleNext} style={styles.button}>
        Continue
      </Button>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="h2" style={styles.stepTitle}>
        What are your health goals?
      </ThemedText>
      <ThemedText type="body" style={styles.subtitle}>
        Select all that apply. You can change these later.
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
      <Button
        onPress={handleComplete}
        disabled={isSaving || selectedGoals.length === 0}
        style={styles.button}
      >
        {isSaving ? "Setting up..." : "Complete Setup"}
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        {step > 1 ? (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                { backgroundColor: s <= step ? theme.primary : theme.backgroundSecondary },
              ]}
            />
          ))}
        </View>
        <View style={styles.backButton} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing["2xl"],
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  heroImage: {
    width: "100%",
    height: 250,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
  },
  stepTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  fieldLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  dateButton: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  button: {
    marginTop: Spacing.xl,
  },
});
