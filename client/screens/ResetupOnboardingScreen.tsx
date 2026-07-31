/**
 * ResetupOnboardingScreen
 *
 * A lightweight re-onboarding flow that lets users update their name,
 * conditions, cycle length, and last period date without wiping their logs.
 *
 * Skips the "welcome" and "valueprop" intro steps; starts at "name".
 * Preserves all daily logs and screenings.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { LannaMascot } from "@/components/LannaMascot";
import { storage, UserProfile, generateId } from "@/lib/storage";
import { saveOnboardingCycleProfile } from "@/services/cycleProfileService";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ResetupStep =
  | "name"
  | "personalize"
  | "ttcnote"
  | "cyclelength"
  | "lastperiod";

// ─── Colors (match OnboardingScreen palette) ──────────────────────────────────

const PINK = "#F06B9A";
const PINK_LIGHT = "#F9C4D7";
const BG = "#FDF5F8";
const TEXT_DARK = "#2D1F2B";
const TEXT_MID = "#5A4252";
const TEXT_SOFT = "#8A6F80";

// ─── Shared buttons ───────────────────────────────────────────────────────────

function PrimaryBtn({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function BackBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.backBtn}>
      <Text style={styles.backBtnText}>‹</Text>
    </Pressable>
  );
}

// ─── Step: Name ───────────────────────────────────────────────────────────────

function NameStep({
  name,
  setName,
  onNext,
  onCancel,
}: {
  name: string;
  setName: (s: string) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.stepContainer,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <BackBtn onPress={onCancel} />
      <View style={styles.stepCenter}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="menstrual" size={90} />
        </View>
        <Text style={styles.stepTitle}>What shall I call you?</Text>
        <Text style={styles.stepSubtitle}>Update your name below.</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Your name"
          placeholderTextColor={TEXT_SOFT}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => name.trim() && onNext()}
        />
      </View>
      <PrimaryBtn label="Continue" onPress={onNext} disabled={!name.trim()} />
    </View>
  );
}

// ─── Step: Personalize ────────────────────────────────────────────────────────

const PERSONALIZE_OPTIONS = [
  { id: "pmos", label: "PMOS" },
  { id: "endo", label: "Endometriosis" },
  { id: "irregular", label: "Irregular cycles" },
  { id: "ttc", label: "Trying to conceive" },
  { id: "none", label: "None of these" },
];

function PersonalizeStep({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={[
        styles.stepContainer,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <BackBtn onPress={onBack} />
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="menstrual" size={80} />
        </View>
        <Text style={styles.stepTitle}>Does any of this apply?</Text>
        <Text style={styles.stepSubtitle}>
          We'll tailor your check-ins around it.{"\n"}You can always change this
          again.
        </Text>
      </View>
      <View style={styles.optionsList}>
        {PERSONALIZE_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              onPress={() => onToggle(opt.id)}
              style={[
                styles.optionRow,
                isSelected && styles.optionRowSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {opt.label}
              </Text>
              <View
                style={[
                  styles.optionCheck,
                  isSelected && styles.optionCheckSelected,
                ]}
              >
                {isSelected && (
                  <Text style={styles.optionCheckMark}>✓</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 24 }}>
        <PrimaryBtn
          label="Continue"
          onPress={onNext}
          disabled={selected.length === 0}
        />
      </View>
    </ScrollView>
  );
}

// ─── Step: TTC note ───────────────────────────────────────────────────────────

function TTCNoteStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={[
        styles.stepContainer,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <BackBtn onPress={onBack} />
      <View style={{ flex: 1, justifyContent: "center", gap: 24 }}>
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <View style={styles.mascotSmall}>
            <LannaMascot phase="follicular" size={80} expression="bright" />
          </View>
        </View>
        <Text style={styles.stepTitle}>One thing to know</Text>
        <View style={styles.ttcCard}>
          <Text style={styles.ttcBody}>
            Olanna is built for tracking symptoms, pain, and cycle patterns —
            not for fertility or ovulation monitoring.
          </Text>
          <Text style={[styles.ttcBody, { marginTop: 12 }]}>
            If you're trying to conceive and you have PMOS, endometriosis, or
            irregular cycles, your symptoms are still worth logging here.
          </Text>
          <Text style={[styles.ttcBody, { marginTop: 12 }]}>
            We'd gently encourage looping in a specialist sooner rather than
            later. You deserve care that's tailored to your situation.
          </Text>
        </View>
      </View>
      <PrimaryBtn label="Got it, let's continue" onPress={onNext} />
    </ScrollView>
  );
}

// ─── Step: Cycle length ───────────────────────────────────────────────────────

const CYCLE_LENGTHS = Array.from({ length: 25 }, (_, i) => i + 21); // 21–45

function CycleLengthStep({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: number;
  onChange: (n: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.stepContainer,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <BackBtn onPress={onBack} />
      <View style={styles.stepCenter}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="follicular" size={80} />
        </View>
        <Text style={styles.stepTitle}>How long is your cycle?</Text>
        <Text style={styles.stepSubtitle}>
          Count day 1 of your period to the day before the next.{"\n"}Most
          cycles are 24–35 days.
        </Text>

        <View style={styles.cycleLengthDisplay}>
          <Text style={styles.cycleLengthNumber}>{value}</Text>
          <Text style={styles.cycleLengthUnit}>days</Text>
        </View>

        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => value > 21 && onChange(value - 1)}
            style={[styles.stepperBtn, value <= 21 && styles.stepperBtnDisabled]}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </Pressable>
          <View style={styles.stepperTrack}>
            {CYCLE_LENGTHS.map((n) => (
              <Pressable key={n} onPress={() => onChange(n)} style={styles.stepperPip}>
                <View
                  style={[
                    styles.stepperPipDot,
                    n === value && styles.stepperPipDotActive,
                    Math.abs(n - value) === 1 && styles.stepperPipDotNear,
                  ]}
                />
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => value < 45 && onChange(value + 1)}
            style={[styles.stepperBtn, value >= 45 && styles.stepperBtnDisabled]}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.stepSubtitle}>Not sure? 28 is a great starting point.</Text>
      </View>
      <PrimaryBtn label="Continue" onPress={onNext} />
    </View>
  );
}

// ─── Step: Last period date ───────────────────────────────────────────────────

function LastPeriodStep({
  initialDate,
  onNext,
  onBack,
}: {
  initialDate: Date;
  onNext: (date: string) => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(false);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleContinue = () => {
    const iso = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    onNext(iso);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.stepContainer,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <BackBtn onPress={onBack} />
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text style={styles.stepTitle}>
          When did your last{"\n"}period start?
        </Text>
        <Text style={styles.stepSubtitle}>
          This keeps your cycle prediction accurate.
        </Text>
      </View>

      {Platform.OS === "ios" ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="inline"
          onChange={(_, date) => date && setSelectedDate(date)}
          maximumDate={new Date()}
          style={{ width: "100%" }}
        />
      ) : (
        <>
          <Pressable
            onPress={() => setShowPicker(true)}
            style={styles.datePickerBtn}
          >
            <Text style={styles.datePickerText}>{fmt(selectedDate)}</Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowPicker(false);
                if (date) setSelectedDate(date);
              }}
              maximumDate={new Date()}
            />
          )}
        </>
      )}
      <View style={[styles.dateConfirmCard, { backgroundColor: PINK_LIGHT + "80" }]}>
        <Text style={styles.dateConfirmLabel}>Last period started</Text>
        <Text style={[styles.dateConfirmValue, { color: PINK }]}>
          {fmt(selectedDate)}
        </Text>
      </View>
      <View style={{ marginTop: 12 }}>
        <PrimaryBtn label="Save & finish" onPress={handleContinue} />
      </View>
    </ScrollView>
  );
}

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function ResetupOnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);

  // State pre-filled from existing profile
  const [existingProfile, setExistingProfile] = useState<UserProfile | null>(null);
  const [step, setStep] = useState<ResetupStep>("name");
  const [name, setName] = useState("");
  const [personalized, setPersonalized] = useState<string[]>([]);
  const [cycleLength, setCycleLength] = useState(28);
  const [initialLastPeriodDate, setInitialLastPeriodDate] = useState(new Date());

  // Load current profile on mount to pre-fill fields
  useEffect(() => {
    storage.getUserProfile().then((profile) => {
      if (profile) {
        setExistingProfile(profile);
        setName(profile.name || "");
        setCycleLength(profile.cycleLength || 28);

        // Build conditions list from profile flags
        const conds: string[] = [];
        if (profile.hasPCOS) conds.push("pmos");
        if (profile.hasEndometriosis) conds.push("endo");
        if (conds.length === 0) conds.push("none");
        setPersonalized(conds);

        if (profile.lastPeriodStart) {
          setInitialLastPeriodDate(
            new Date(profile.lastPeriodStart + "T00:00:00")
          );
        }
      }
      setLoading(false);
    });
  }, []);

  const togglePersonalize = (id: string) => {
    if (id === "none") {
      setPersonalized(["none"]);
      return;
    }
    const without = personalized.filter((x) => x !== "none");
    if (without.includes(id)) {
      setPersonalized(without.filter((x) => x !== id));
    } else {
      setPersonalized([...without, id]);
    }
  };

  const finishResetup = async (lastPeriodIso: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const hasPMOS = personalized.includes("pmos");
      const hasEndo = personalized.includes("endo");

      // Preserve existing profile data (id, dateOfBirth, createdAt, healthGoals)
      // and only overwrite the fields the user just updated.
      const updatedProfile: UserProfile = {
        id: existingProfile?.id ?? generateId(),
        name: name.trim() || "Friend",
        dateOfBirth: existingProfile?.dateOfBirth ?? "",
        cycleLength,
        periodLength: existingProfile?.periodLength ?? 5,
        lastPeriodStart: lastPeriodIso,
        healthGoals: existingProfile?.healthGoals ?? [],
        hasPCOS: hasPMOS,
        hasEndometriosis: hasEndo,
        createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
      };

      await storage.setUserProfile(updatedProfile);
      await saveOnboardingCycleProfile({
        userId: updatedProfile.id,
        lastPeriodStartDate: lastPeriodIso,
        averageCycleLength: cycleLength,
        averagePeriodLength: updatedProfile.periodLength,
      });

      // Return to the main app — logs and screenings are untouched
      (navigation as any).replace("Main");
    } catch (e) {
      console.error("[ResetupOnboarding] error saving:", e);
      (navigation as any).replace("Main");
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingContainer]}>
        <ActivityIndicator color={PINK} size="large" />
      </View>
    );
  }

  const renderStep = () => {
    switch (step) {
      case "name":
        return (
          <NameStep
            name={name}
            setName={setName}
            onNext={() => setStep("personalize")}
            onCancel={() => (navigation as any).goBack()}
          />
        );
      case "personalize":
        return (
          <PersonalizeStep
            selected={personalized}
            onToggle={togglePersonalize}
            onNext={() =>
              personalized.includes("ttc")
                ? setStep("ttcnote")
                : setStep("cyclelength")
            }
            onBack={() => setStep("name")}
          />
        );
      case "ttcnote":
        return (
          <TTCNoteStep
            onNext={() => setStep("cyclelength")}
            onBack={() => setStep("personalize")}
          />
        );
      case "cyclelength":
        return (
          <CycleLengthStep
            value={cycleLength}
            onChange={setCycleLength}
            onNext={() => setStep("lastperiod")}
            onBack={() =>
              personalized.includes("ttc")
                ? setStep("ttcnote")
                : setStep("personalize")
            }
          />
        );
      case "lastperiod":
        return (
          <LastPeriodStep
            initialDate={initialLastPeriodDate}
            onNext={finishResetup}
            onBack={() => setStep("cyclelength")}
          />
        );
      default:
        return null;
    }
  };

  return <View style={styles.root}>{renderStep()}</View>;
}

// ─── Styles (mirrors OnboardingScreen palette) ────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  stepCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  mascotSmall: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 14,
    color: TEXT_SOFT,
    textAlign: "center",
    lineHeight: 20,
  },
  nameInput: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EDD8E7",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 16,
    color: TEXT_DARK,
    marginTop: 8,
  },
  optionsList: {
    width: "100%",
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EDD8E7",
    backgroundColor: "#FFFFFF",
  },
  optionRowSelected: {
    borderColor: PINK,
    backgroundColor: "#FDF0F5",
  },
  optionLabel: {
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: "500",
  },
  optionLabelSelected: {
    color: PINK,
    fontWeight: "600",
  },
  optionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#EDD8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  optionCheckSelected: {
    borderColor: PINK,
    backgroundColor: PINK,
  },
  optionCheckMark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  ttcCard: {
    backgroundColor: "rgba(209,120,179,0.10)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(209,120,179,0.20)",
  },
  ttcBody: {
    fontSize: 15,
    lineHeight: 23,
    color: TEXT_DARK,
  },
  cycleLengthDisplay: {
    alignItems: "center",
    marginVertical: 16,
  },
  cycleLengthNumber: {
    fontSize: 64,
    fontWeight: "700",
    color: PINK,
    lineHeight: 72,
  },
  cycleLengthUnit: {
    fontSize: 16,
    color: TEXT_SOFT,
    marginTop: -4,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PINK_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontSize: 24,
    color: PINK,
    fontWeight: "600",
    lineHeight: 28,
  },
  stepperTrack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 32,
  },
  stepperPip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 32,
  },
  stepperPipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0C8D8",
  },
  stepperPipDotNear: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK_LIGHT,
  },
  stepperPipDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PINK,
  },
  datePickerBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EDD8E7",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  datePickerText: {
    fontSize: 15,
    color: TEXT_DARK,
  },
  dateConfirmCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
    marginTop: 8,
  },
  dateConfirmLabel: {
    fontSize: 12,
    color: TEXT_SOFT,
  },
  dateConfirmValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  backBtn: {
    alignSelf: "flex-start",
    padding: 4,
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 32,
    color: TEXT_DARK,
    lineHeight: 32,
  },
});
