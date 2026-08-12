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
  | "goals"
  | "ttcnote"
  | "symptoms"
  | "cyclelength"
  | "lastperiod";

// ─── Internal symptom inference (never shown to user as condition names) ───────

interface SymptomAnswers {
  pelvisPain?: number;
  bleeding?: string;
  sexActivity?: string;
  sexPain?: boolean;
  bowelPain?: boolean;
  urinaryPain?: boolean;
}

function inferFlags(
  goals: string[],
  answers: SymptomAnswers
): { hasEndometriosis: boolean; hasPCOS: boolean } {
  if (!goals.includes("manage_symptoms")) {
    return { hasEndometriosis: false, hasPCOS: false };
  }
  const pelvisPain  = answers.pelvisPain  ?? 0;
  const bowelPain   = answers.bowelPain   === true;
  const sexPain     = answers.sexPain     === true;
  const urinaryPain = answers.urinaryPain === true;
  const isHeavyFlow = answers.bleeding === "heavy";
  const endoPattern = pelvisPain >= 4 && (bowelPain || sexPain || urinaryPain);
  const pcosPattern = !endoPattern && pelvisPain >= 2 && isHeavyFlow;
  return { hasEndometriosis: endoPattern, hasPCOS: pcosPattern };
}

// ─── Colors (match OnboardingScreen palette) ──────────────────────────────────

const PINK = "#D85A30";
const PINK_LIGHT = "#FAECE7";
const BG = "#EEEDFE";
const TEXT_DARK = "#26215C";
const TEXT_MID = "#4A4580";
const TEXT_SOFT = "#6B6591";

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

// ─── Step: Goals ─────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { id: "track_cycle",     label: "Track my periods & cycle",  emoji: "📅" },
  { id: "manage_symptoms", label: "Manage symptoms or pain",   emoji: "💙" },
  { id: "understand_body", label: "Understand my body better", emoji: "✨" },
  { id: "ttc",             label: "Trying to conceive",        emoji: "🌱" },
  { id: "avoid_pregnancy", label: "Avoid pregnancy",           emoji: "🛡️" },
  { id: "exploring",       label: "Just exploring for now",    emoji: "🔍" },
];

function GoalsStep({
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
          <LannaMascot phase="follicular" size={80} expression="bright" />
        </View>
        <Text style={styles.stepTitle}>What do you want to focus on?</Text>
        <Text style={styles.stepSubtitle}>
          Update anything that's changed.{"\n"}You can always adjust this again.
        </Text>
      </View>
      <View style={styles.optionsList}>
        {GOAL_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              onPress={() => onToggle(opt.id)}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
              <View style={[styles.optionCheck, isSelected && styles.optionCheckSelected]}>
                {isSelected && <Text style={styles.optionCheckMark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 24 }}>
        <PrimaryBtn label="Continue" onPress={onNext} disabled={selected.length === 0} />
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
            Your cycle and symptom patterns are still worth logging here —
            your data matters, and your provider or a fertility specialist can use it.
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

// ─── Step: Symptom questionnaire ──────────────────────────────────────────────

const PAIN_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const BLEEDING_OPTIONS = [
  { id: "none",     label: "None" },
  { id: "spotting", label: "Spotting" },
  { id: "light",    label: "Light" },
  { id: "normal",   label: "Normal" },
  { id: "heavy",    label: "Heavy" },
];
const YES_NO_SKIP = [
  { id: "yes",  label: "Yes" },
  { id: "no",   label: "No" },
  { id: "skip", label: "Prefer not to say" },
];
const YES_NO = [
  { id: "yes", label: "Yes" },
  { id: "no",  label: "No" },
];

function SymptomQuestionnaireStep({
  answers,
  onChange,
  onNext,
  onBack,
}: {
  answers: SymptomAnswers;
  onChange: (updates: Partial<SymptomAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();

  const ChipRow = ({
    options,
    value,
    onSelect,
  }: {
    options: { id: string; label: string }[];
    value: string | undefined;
    onSelect: (id: string) => void;
  }) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            style={[styles.symptomChip, active && styles.symptomChipActive]}
          >
            <Text style={[styles.symptomChipText, active && styles.symptomChipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.stepContainer,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <BackBtn onPress={onBack} />
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="luteal" size={80} />
        </View>
        <Text style={styles.stepTitle}>A few quick questions</Text>
        <Text style={styles.stepSubtitle}>
          Pattern-tracking, not a diagnosis.{"\n"}Update anything that's changed.
        </Text>
      </View>

      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>
          How bad is pelvic or abdominal pain for you, most of the time?
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {PAIN_SCORES.map((n) => {
            const active = answers.pelvisPain === n;
            return (
              <Pressable
                key={n}
                onPress={() => onChange({ pelvisPain: n })}
                style={[styles.painScoreBtn, active && styles.painScoreBtnActive]}
              >
                <Text style={[styles.painScoreText, active && styles.painScoreTextActive]}>{n}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={styles.painScaleHint}>No pain</Text>
          <Text style={styles.painScaleHint}>Worst imaginable</Text>
        </View>
      </View>

      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>How would you describe your typical flow?</Text>
        <ChipRow options={BLEEDING_OPTIONS} value={answers.bleeding} onSelect={(id) => onChange({ bleeding: id })} />
      </View>

      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>Do you ever feel pain during or after sex?</Text>
        <ChipRow
          options={YES_NO_SKIP}
          value={answers.sexActivity === "skip" ? "skip" : answers.sexPain === true ? "yes" : answers.sexPain === false ? "no" : undefined}
          onSelect={(id) => {
            if (id === "skip") onChange({ sexActivity: "skip", sexPain: undefined });
            else onChange({ sexActivity: "yes", sexPain: id === "yes" });
          }}
        />
      </View>

      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>Do you ever have painful bowel movements?</Text>
        <ChipRow
          options={YES_NO}
          value={answers.bowelPain === true ? "yes" : answers.bowelPain === false ? "no" : undefined}
          onSelect={(id) => onChange({ bowelPain: id === "yes" })}
        />
      </View>

      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>Do you ever feel pain or pressure when urinating?</Text>
        <ChipRow
          options={YES_NO}
          value={answers.urinaryPain === true ? "yes" : answers.urinaryPain === false ? "no" : undefined}
          onSelect={(id) => onChange({ urinaryPain: id === "yes" })}
        />
      </View>

      <View style={{ marginTop: 24 }}>
        <PrimaryBtn label="Continue" onPress={onNext} />
      </View>
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
  const [goals,          setGoals]          = useState<string[]>([]);
  const [symptomAnswers, setSymptomAnswers] = useState<SymptomAnswers>({});
  const [cycleLength,    setCycleLength]    = useState(28);
  const [initialLastPeriodDate, setInitialLastPeriodDate] = useState(new Date());

  // Load current profile on mount to pre-fill fields
  useEffect(() => {
    storage.getUserProfile().then((profile) => {
      if (profile) {
        setExistingProfile(profile);
        setName(profile.name || "");
        setCycleLength(profile.cycleLength || 28);
        // Pre-fill goals from saved healthGoals, or derive from flags if goals not set
        if (profile.healthGoals && profile.healthGoals.length > 0) {
          setGoals(profile.healthGoals);
        } else {
          const derived: string[] = ["track_cycle"];
          if (profile.hasPCOS || profile.hasEndometriosis) derived.push("manage_symptoms");
          setGoals(derived);
        }
        if (profile.lastPeriodStart) {
          setInitialLastPeriodDate(
            new Date(profile.lastPeriodStart + "T00:00:00")
          );
        }
      }
      setLoading(false);
    });
  }, []);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const finishResetup = async (lastPeriodIso: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Infer internal flags from symptom answers — not shown to user as condition names
      const { hasEndometriosis, hasPCOS } = inferFlags(goals, symptomAnswers);

      // Preserve existing profile data (id, dateOfBirth, createdAt)
      // and only overwrite the fields the user just updated.
      const updatedProfile: UserProfile = {
        id: existingProfile?.id ?? generateId(),
        name: name.trim() || "Friend",
        dateOfBirth: existingProfile?.dateOfBirth ?? "",
        cycleLength,
        periodLength: existingProfile?.periodLength ?? 5,
        lastPeriodStart: lastPeriodIso,
        healthGoals: goals,
        hasPCOS,
        hasEndometriosis,
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
            onNext={() => setStep("goals")}
            onCancel={() => (navigation as any).goBack()}
          />
        );
      case "goals":
        return (
          <GoalsStep
            selected={goals}
            onToggle={toggleGoal}
            onNext={() =>
              goals.includes("ttc")
                ? setStep("ttcnote")
                : goals.includes("manage_symptoms")
                ? setStep("symptoms")
                : setStep("cyclelength")
            }
            onBack={() => setStep("name")}
          />
        );
      case "ttcnote":
        return (
          <TTCNoteStep
            onNext={() => goals.includes("manage_symptoms") ? setStep("symptoms") : setStep("cyclelength")}
            onBack={() => setStep("goals")}
          />
        );
      case "symptoms":
        return (
          <SymptomQuestionnaireStep
            answers={symptomAnswers}
            onChange={(updates) => setSymptomAnswers((prev) => ({ ...prev, ...updates }))}
            onNext={() => setStep("cyclelength")}
            onBack={() => goals.includes("ttc") ? setStep("ttcnote") : setStep("goals")}
          />
        );
      case "cyclelength":
        return (
          <CycleLengthStep
            value={cycleLength}
            onChange={setCycleLength}
            onNext={() => setStep("lastperiod")}
            onBack={() =>
              goals.includes("manage_symptoms")
                ? setStep("symptoms")
                : goals.includes("ttc")
                ? setStep("ttcnote")
                : setStep("goals")
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
    borderColor: "#D8D6F0",
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
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D8D6F0",
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  optionRowSelected: {
    borderColor: PINK,
    backgroundColor: "#FDF0F5",
  },
  optionEmoji: {
    fontSize: 18,
    width: 26,
    textAlign: "center",
  },
  optionLabel: {
    flex: 1,
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
    borderColor: "#D8D6F0",
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
  // Symptom questionnaire styles
  symptomQuestion: {
    width: "100%",
    marginBottom: 20,
  },
  symptomQLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    lineHeight: 21,
  },
  symptomChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D8D6F0",
    backgroundColor: "#FFFFFF",
  },
  symptomChipActive: {
    borderColor: PINK,
    backgroundColor: "#FDF0F5",
  },
  symptomChipText: {
    fontSize: 14,
    color: TEXT_MID,
    fontWeight: "500",
  },
  symptomChipTextActive: {
    color: PINK,
    fontWeight: "600",
  },
  painScoreBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#D8D6F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  painScoreBtnActive: {
    borderColor: PINK,
    backgroundColor: PINK,
  },
  painScoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MID,
  },
  painScoreTextActive: {
    color: "#FFFFFF",
  },
  painScaleHint: {
    fontSize: 10,
    color: TEXT_SOFT,
    marginTop: 2,
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
    borderColor: "#D8D6F0",
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
