import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  Dimensions,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";

import { LannaMascot } from "@/components/LannaMascot";
import { ScreenshotImport, CycleReviewScreen } from "@/components/onboarding";
import type { ExtractedCycleData } from "@/components/onboarding";
import { storage, UserProfile, generateId } from "@/lib/storage";
import { maybeRequestPermission } from "@/lib/notificationService";
import { notificationSettingsStorage } from "@/lib/notificationSettings";
import { saveOnboardingCycleProfile } from "@/services/cycleProfileService";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { CycleRegularity } from "@/constants/onboardingTokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type OnboardingStep =
  | "welcome"       // Hi, I'm Lanna
  | "valueprop"     // Meet your four phases
  | "name"          // What shall I call you?
  | "goals"         // What do you want to focus on?
  | "ttcnote"       // Warm note shown only when user selects "Trying to conceive"
  | "symptoms"      // Short symptom questionnaire (only when "manage symptoms" selected)
  | "cyclelength"   // How long is your cycle?
  | "lastperiod"    // When did your last period start?
  | "consent"       // Privacy Policy + Terms checkbox (must agree to finish)
  | "notifications" // Category-based notification preferences
  | "done";

// ─── Symptom answers (internal only — never labels a condition to the user) ───

interface SymptomAnswers {
  pelvisPain?: number;       // 0–10
  bleeding?: string;         // "none" | "spotting" | "light" | "normal" | "heavy"
  sexActivity?: string;      // "yes" | "no" | "skip"
  sexPain?: boolean;
  bowelPain?: boolean;
  urinaryPain?: boolean;
}

/** Infer internal condition flags from symptom questionnaire — never shown to user. */
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

  // Endo-consistent pattern: significant pelvic pain + at least one secondary symptom
  const endoPattern = pelvisPain >= 4 && (bowelPain || sexPain || urinaryPain);

  // PCOS-consistent pattern: managed symptoms without endo-secondary cluster, heavy flow
  const pcosPattern = !endoPattern && pelvisPain >= 2 && isHeavyFlow;

  return { hasEndometriosis: endoPattern, hasPCOS: pcosPattern };
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const PINK = "#D85A30";        // coral CTA
const PINK_LIGHT = "#FAECE7";   // cream highlight
const BG = "#EEEDFE";           // lavender base
const TEXT_DARK = "#26215C";    // deep plum
const TEXT_MID = "#4A4580";
const TEXT_SOFT = "#6B6591";

// ─── Shared button ────────────────────────────────────────────────────────────

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

function SecondaryBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryBtn}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
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

function SkipBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.skipBtn}>
      <Text style={styles.skipBtnText}>Skip</Text>
    </Pressable>
  );
}

// ─── Step 1: Welcome / Lanna intro ───────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.stepContainer, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.stepCenter}>
        <Text style={styles.welcomeTitle}>Hi, I'm Lanna</Text>
        <View style={styles.mascotLarge}>
          <LannaMascot phase="follicular" size={180} expression="bright" />
        </View>
        <Text style={styles.welcomeSubtitle}>
          I'll be walking alongside you,{"\n"}phase by phase, day by day.
        </Text>
      </View>
      <PrimaryBtn label="Nice to meet you" onPress={onNext} />
    </View>
  );
}

// ─── Step 2: Value prop carousel ─────────────────────────────────────────────

// phase → circle background colour (pastel tint matching mascot phase)
const PHASE_CIRCLE_BG: Record<string, string> = {
  menstrual:  "#F9C8DC",
  follicular: "#C084BE",
  ovulation:  "#D96CD9",
  luteal:     "#B49ACC",
};

const VALUE_SLIDES = [
  {
    title: "Meet your four phases",
    body: "Menstrual, Follicular, Ovulatory and Luteal each come with their own mood, tips and a little companion to guide you through it.",
    phases: ["menstrual", "follicular", "ovulation", "luteal"] as const,
  },
  {
    title: "Know yourself better",
    body: "Track symptoms, energy, and mood over time to reveal patterns only you could discover.",
    phases: ["luteal", "menstrual", "follicular", "ovulation"] as const,
  },
  {
    title: "Built for how you feel",
    body: "Tailored check-ins and insights that adapt to your symptoms, your patterns, and where you are in your cycle.",
    phases: ["ovulation", "luteal", "menstrual", "follicular"] as const,
  },
];

function ValuePropStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const insets = useSafeAreaInsets();
  const [slide, setSlide] = useState(0);
  const current = VALUE_SLIDES[slide];

  const goNext = () => {
    if (slide < VALUE_SLIDES.length - 1) {
      setSlide(slide + 1);
    } else {
      onNext();
    }
  };

  return (
    <View style={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <SkipBtn onPress={onSkip} />
      <View style={styles.stepCenter}>
        {/* Four phase mascots in a row – each inside its phase-coloured circle */}
        <View style={styles.valuePropMascots}>
          {current.phases.map((ph, i) => (
            <View
              key={i}
              style={[
                styles.valuePropMascotCircle,
                { backgroundColor: PHASE_CIRCLE_BG[ph] ?? "#D8D6F0" },
              ]}
            >
              <LannaMascot phase={ph} size={62} />
            </View>
          ))}
        </View>
        <Text style={styles.valuePropTitle}>{current.title}</Text>
        <Text style={styles.valuePropBody}>{current.body}</Text>
        {/* Dots */}
        <View style={styles.dots}>
          {VALUE_SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
          ))}
        </View>
      </View>
      <PrimaryBtn label={slide < VALUE_SLIDES.length - 1 ? "Next" : "Let's go"} onPress={goNext} />
    </View>
  );
}

// ─── Step 3: Name input ───────────────────────────────────────────────────────

function NameStep({
  name,
  setName,
  onNext,
  onBack,
}: {
  name: string;
  setName: (s: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <BackBtn onPress={onBack} />
      <View style={styles.stepCenter}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="menstrual" size={90} />
        </View>
        <Text style={styles.stepTitle}>And what shall I call you?</Text>
        <Text style={styles.stepSubtitle}>Just your first name is perfect.</Text>
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

// ─── Step 4: Goals selection ──────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { id: "track_cycle",      label: "Track my periods & cycle",   emoji: "📅" },
  { id: "manage_symptoms",  label: "Manage symptoms or pain",    emoji: "💙" },
  { id: "understand_body",  label: "Understand my body better",  emoji: "✨" },
  { id: "ttc",              label: "Trying to conceive",         emoji: "🌱" },
  { id: "avoid_pregnancy",  label: "Avoid pregnancy",            emoji: "🛡️" },
  { id: "exploring",        label: "Just exploring for now",     emoji: "🔍" },
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
      contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <BackBtn onPress={onBack} />
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="follicular" size={80} expression="bright" />
        </View>
        <Text style={styles.stepTitle}>What do you want to focus on?</Text>
        <Text style={styles.stepSubtitle}>Pick everything that fits — you can update this any time.</Text>
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

// ─── Step 4b: TTC warm note (shown when "Trying to conceive" is selected) ─────

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
      contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
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
            Olanna is built for tracking symptoms, pain, and cycle patterns — not for fertility or ovulation monitoring. There's no conception timing, basal body temperature logging, or LH surge tracking here yet.
          </Text>
          <Text style={[styles.ttcBody, { marginTop: 12 }]}>
            If you're trying to conceive, your cycle and symptom patterns are still worth logging here — your data matters, and your provider or a fertility specialist can use it.
          </Text>
          <Text style={[styles.ttcBody, { marginTop: 12 }]}>
            We'd gently encourage looping in a specialist sooner rather than later. You deserve care that's tailored to your situation.
          </Text>
        </View>
      </View>
      <PrimaryBtn label="Got it, let's continue" onPress={onNext} />
    </ScrollView>
  );
}

// ─── Step 4c: Symptom questionnaire (shown when "Manage symptoms" selected) ───
// Framed as pattern-tracking only — no condition names shown to user.

const PAIN_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const BLEEDING_OPTIONS = [
  { id: "none",    label: "None" },
  { id: "spotting",label: "Spotting" },
  { id: "light",   label: "Light" },
  { id: "normal",  label: "Normal" },
  { id: "heavy",   label: "Heavy" },
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
            style={[
              styles.symptomChip,
              active && styles.symptomChipActive,
            ]}
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
      contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <BackBtn onPress={onBack} />
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="luteal" size={80} />
        </View>
        <Text style={styles.stepTitle}>A few quick questions</Text>
        <Text style={styles.stepSubtitle}>
          This helps us understand what you're experiencing.{"\n"}
          It's pattern-tracking, not a diagnosis.
        </Text>
      </View>

      {/* Q1: Pelvic / abdominal pain */}
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
                <Text style={[styles.painScoreText, active && styles.painScoreTextActive]}>
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={styles.painScaleHint}>No pain</Text>
          <Text style={styles.painScaleHint}>Worst imaginable</Text>
        </View>
      </View>

      {/* Q2: Flow heaviness */}
      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>How would you describe your typical flow?</Text>
        <ChipRow
          options={BLEEDING_OPTIONS}
          value={answers.bleeding}
          onSelect={(id) => onChange({ bleeding: id })}
        />
      </View>

      {/* Q3: Sex pain */}
      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>Do you ever feel pain during or after sex?</Text>
        <ChipRow
          options={YES_NO_SKIP}
          value={
            answers.sexActivity === "skip" ? "skip"
            : answers.sexPain === true ? "yes"
            : answers.sexPain === false ? "no"
            : undefined
          }
          onSelect={(id) => {
            if (id === "skip") {
              onChange({ sexActivity: "skip", sexPain: undefined });
            } else {
              onChange({ sexActivity: "yes", sexPain: id === "yes" });
            }
          }}
        />
      </View>

      {/* Q4: Bowel pain */}
      <View style={styles.symptomQuestion}>
        <Text style={styles.symptomQLabel}>Do you ever have painful bowel movements?</Text>
        <ChipRow
          options={YES_NO}
          value={answers.bowelPain === true ? "yes" : answers.bowelPain === false ? "no" : undefined}
          onSelect={(id) => onChange({ bowelPain: id === "yes" })}
        />
      </View>

      {/* Q5: Urinary pain */}
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

// ─── Step 5: Last period date ─────────────────────────────────────────────────

type LastPeriodMode = "pick" | "upload";

function LastPeriodStep({
  onNext,
  onBack,
  onDataExtracted,
}: {
  onNext: (date: string) => void;
  onBack: () => void;
  onDataExtracted: (data: ExtractedCycleData) => void;
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<LastPeriodMode>("pick");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleContinue = () => {
    const iso = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    onNext(iso);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
    >
      <BackBtn onPress={onBack} />
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text style={styles.stepTitle}>When did your last{"\n"}period start?</Text>
        <Text style={styles.stepSubtitle}>This helps me get your cycle right from day one.</Text>
      </View>

      {/* Toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          onPress={() => setMode("pick")}
          style={[styles.modeTab, mode === "pick" && styles.modeTabActive]}
        >
          <Text style={[styles.modeTabText, mode === "pick" && styles.modeTabTextActive]}>Pick a date</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("upload")}
          style={[styles.modeTab, mode === "upload" && styles.modeTabActive]}
        >
          <Text style={[styles.modeTabText, mode === "upload" && styles.modeTabTextActive]}>Upload screenshot</Text>
        </Pressable>
      </View>

      {mode === "pick" ? (
        <View style={{ width: "100%" }}>
          {/* Calendar picker inline */}
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
            <Text style={[styles.dateConfirmValue, { color: PINK }]}>{fmt(selectedDate)}</Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <PrimaryBtn label="Continue" onPress={handleContinue} />
          </View>
        </View>
      ) : (
        <View style={{ width: "100%" }}>
          <ScreenshotImport
            onDataExtracted={onDataExtracted}
            onManualEntry={() => setMode("pick")}
          />
          <Text style={styles.privacyNote}>We only extract dates — screenshots aren't stored</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Step 5: Cycle length picker ─────────────────────────────────────────────

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
    <View style={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <BackBtn onPress={onBack} />
      <View style={styles.stepCenter}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="follicular" size={80} />
        </View>
        <Text style={styles.stepTitle}>How long is your cycle?</Text>
        <Text style={styles.stepSubtitle}>
          Count day 1 of your period to the day before the next.{"\n"}Most cycles are 24–35 days.
        </Text>

        {/* Value display */}
        <View style={styles.cycleLengthDisplay}>
          <Text style={styles.cycleLengthNumber}>{value}</Text>
          <Text style={styles.cycleLengthUnit}>days</Text>
        </View>

        {/* +/− stepper */}
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

// ─── Step 7: Consent (Privacy Policy + Terms) ─────────────────────────────────

function ConsentStep({
  onNext,
  onBack,
  onOpenPrivacy,
  onOpenTerms,
}: {
  onNext: () => void;
  onBack: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <BackBtn onPress={onBack} />
      <View style={styles.stepCenter}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="follicular" size={90} expression="bright" />
        </View>
        <Text style={styles.stepTitle}>Almost done</Text>
        <Text style={styles.stepSubtitle}>
          Your data stays on your device. Before you begin,{"\n"}please review how we handle your information.
        </Text>
      </View>

      <Pressable
        onPress={() => setAgreed(!agreed)}
        style={styles.consentRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
      >
        <View style={[styles.consentCheckbox, agreed && styles.consentCheckboxChecked]}>
          {agreed && <Text style={styles.consentCheckMark}>✓</Text>}
        </View>
        <Text style={styles.consentText}>
          {"I've read and agree to the "}
          <Text
            style={styles.consentLink}
            onPress={(e) => { e.stopPropagation?.(); onOpenPrivacy(); }}
          >
            Privacy Policy
          </Text>
          {" and "}
          <Text
            style={styles.consentLink}
            onPress={(e) => { e.stopPropagation?.(); onOpenTerms(); }}
          >
            Terms of Use
          </Text>
        </Text>
      </Pressable>

      <PrimaryBtn label="Get started" onPress={onNext} disabled={!agreed} />
    </View>
  );
}

// ─── Notification Preferences Step ───────────────────────────────────────────

interface NotifPrefs {
  cyclePredictions: boolean;
  checkInReminders: boolean;
  learningContent:  boolean;
  tipsContent:      boolean;
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  cyclePredictions: true,
  checkInReminders: true,
  learningContent:  false,
  tipsContent:      true,
};

const NOTIF_CATEGORIES: Array<{
  id: keyof NotifPrefs;
  label: string;
  desc: string;
}> = [
  {
    id:    "cyclePredictions",
    label: "Cycle predictions",
    desc:  "Period start estimates and fertile window updates.",
  },
  {
    id:    "checkInReminders",
    label: "Check-in reminders",
    desc:  "A gentle nudge to log how you're feeling. No pressure.",
  },
  {
    id:    "learningContent",
    label: "Learning content",
    desc:  "Short reads about what's happening in your body right now.",
  },
  {
    id:    "tipsContent",
    label: "Tips and insights",
    desc:  "Small encouragements and cycle insights from Lanna.",
  },
];

function NotificationsStep({
  onNext,
  onBack,
}: {
  onNext: (prefs: NotifPrefs) => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<NotifPrefs>({ ...DEFAULT_NOTIF_PREFS });

  const toggle = (id: keyof NotifPrefs) =>
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.stepContainer,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <BackBtn onPress={onBack} />

      <View style={[styles.stepCenter, { gap: 8, marginBottom: 28 }]}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="follicular" size={80} expression="bright" />
        </View>
        <Text style={styles.stepTitle}>How should Lanna stay in touch?</Text>
        <Text style={styles.stepSubtitle}>
          Turn off anything that doesn't feel useful. You can always change this in Settings.
        </Text>
      </View>

      <View style={styles.notifCategories}>
        {NOTIF_CATEGORIES.map((cat) => (
          <View key={cat.id} style={styles.notifCategoryRow}>
            <View style={styles.notifCategoryText}>
              <Text style={styles.notifCategoryLabel}>{cat.label}</Text>
              <Text style={styles.notifCategoryDesc}>{cat.desc}</Text>
            </View>
            <Switch
              value={prefs[cat.id]}
              onValueChange={() => toggle(cat.id)}
              trackColor={{ false: "#D8D6F0", true: PINK + "80" }}
              thumbColor={prefs[cat.id] ? PINK : "#F0EEF8"}
              ios_backgroundColor="#D8D6F0"
            />
          </View>
        ))}
      </View>

      <View style={styles.notifPrivacyNote}>
        <Text style={styles.notifPrivacyText}>
          🔒 Your data stays on your device. Olanna never sells or shares it.
        </Text>
      </View>

      <PrimaryBtn label="Let's go 🌸" onPress={() => onNext(prefs)} />
    </ScrollView>
  );
}

// ─── Root OnboardingScreen ────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [name, setName] = useState("");
  const [goals,          setGoals]          = useState<string[]>([]);
  const [symptomAnswers, setSymptomAnswers] = useState<SymptomAnswers>({});
  const [cycleLength,    setCycleLength]    = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<string | undefined>();

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleNotificationsNext = async (prefs: NotifPrefs) => {
    // Save user-facing notification category prefs before navigating
    await notificationSettingsStorage
      .save({
        cyclePredictions: prefs.cyclePredictions,
        checkInReminders: prefs.checkInReminders,
        learningContent:  prefs.learningContent,
        tipsContent:      prefs.tipsContent,
      })
      .catch(() => {});
    finishOnboarding();
  };

  const finishOnboarding = async (resolvedPeriodDate?: string) => {
    const periodDate = resolvedPeriodDate ?? lastPeriodDate;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Infer internal flags from symptom answers — never shown to user as condition names
      const { hasEndometriosis, hasPCOS } = inferFlags(goals, symptomAnswers);
      const profileId = generateId();
      const profile: UserProfile = {
        id: profileId,
        name: name.trim() || "Friend",
        dateOfBirth: "",
        cycleLength,
        periodLength: 5,
        lastPeriodStart: periodDate ?? "",
        healthGoals: goals,
        hasPCOS,
        hasEndometriosis,
        createdAt: new Date().toISOString(),
      };
      await storage.setUserProfile(profile);
      if (periodDate) {
        await saveOnboardingCycleProfile({
          userId: profileId,
          lastPeriodStartDate: periodDate,
          averageCycleLength: cycleLength,
          averagePeriodLength: 5,
        });
      }
      (navigation as any).replace("Main");
      // Request notification permission after onboarding — delay so the
      // navigation settles before the OS dialog appears.
      setTimeout(() => { maybeRequestPermission().catch(() => {}); }, 1500);
    } catch (e) {
      console.error("[Onboarding] error saving:", e);
      (navigation as any).replace("Main");
    }
  };

  const handleDataExtracted = (data: ExtractedCycleData) => {
    const extracted = data.lastPeriodStartDate || undefined;
    if (extracted) setLastPeriodDate(extracted);
    // Go to consent before finishing — lastPeriodDate state is set above
    setStep("consent");
  };

  const handleLastPeriodNext = (date: string) => {
    setLastPeriodDate(date);
    // Go to consent before finishing — finishOnboarding will read lastPeriodDate
    setStep("consent");
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return <WelcomeStep onNext={() => setStep("valueprop")} />;
      case "valueprop":
        return (
          <ValuePropStep
            onNext={() => setStep("name")}
            onSkip={() => setStep("name")}
          />
        );
      case "name":
        return (
          <NameStep
            name={name}
            setName={setName}
            onNext={() => setStep("goals")}
            onBack={() => setStep("valueprop")}
          />
        );
      case "goals":
        return (
          <GoalsStep
            selected={goals}
            onToggle={toggleGoal}
            onNext={() => goals.includes("ttc") ? setStep("ttcnote") : goals.includes("manage_symptoms") ? setStep("symptoms") : setStep("cyclelength")}
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
            onBack={() => goals.includes("manage_symptoms") ? setStep("symptoms") : goals.includes("ttc") ? setStep("ttcnote") : setStep("goals")}
          />
        );
      case "lastperiod":
        return (
          <LastPeriodStep
            onNext={handleLastPeriodNext}
            onBack={() => setStep("cyclelength")}
            onDataExtracted={handleDataExtracted}
          />
        );
      case "consent":
        return (
          <ConsentStep
            onNext={() => setStep("notifications")}
            onBack={() => setStep("lastperiod")}
            onOpenPrivacy={() => navigation.navigate("PrivacyStatement")}
            onOpenTerms={() => navigation.navigate("TermsOfService")}
          />
        );
      case "notifications":
        return (
          <NotificationsStep
            onNext={handleNotificationsNext}
            onBack={() => setStep("consent")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
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
  // Welcome
  welcomeTitle: {
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 30,
    fontWeight: "800",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  mascotLarge: {
    marginVertical: 24,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: TEXT_MID,
    textAlign: "center",
    lineHeight: 24,
  },
  // Value prop
  valuePropMascots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  valuePropMascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  valuePropTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  valuePropBody: {
    fontSize: 15,
    color: TEXT_MID,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0C8D8",
  },
  dotActive: {
    backgroundColor: PINK,
    width: 18,
  },
  // Name
  mascotSmall: {
    marginBottom: 16,
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
  stepTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    letterSpacing: -0.3,
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
  // Goals / options list
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
  // Symptom questionnaire
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
  // Last period
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#F0E4EB",
    borderRadius: 28,
    padding: 3,
    marginBottom: 20,
    width: "100%",
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: PINK,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_SOFT,
  },
  modeTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  privacyNote: {
    fontSize: 12,
    color: TEXT_SOFT,
    textAlign: "center",
    marginTop: 12,
  },
  // Cycle length step
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
  // Shared buttons
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
  secondaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: TEXT_MID,
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
  skipBtn: {
    alignSelf: "flex-end",
    padding: 8,
  },
  skipBtnText: {
    fontSize: 15,
    color: TEXT_SOFT,
  },
  // Consent step
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  consentCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#D8D6F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  consentCheckboxChecked: {
    backgroundColor: PINK,
    borderColor: PINK,
  },
  consentCheckMark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16,
  },
  consentText: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    lineHeight: 23,
  },
  consentLink: {
    color: PINK,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  // ── Notifications step ────────────────────────────────────────────────────
  notifCategories: {
    gap: 2,
    marginBottom: 20,
  },
  notifCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D8D6F0",
  },
  notifCategoryText: {
    flex: 1,
    gap: 3,
  },
  notifCategoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  notifCategoryDesc: {
    fontSize: 13,
    color: TEXT_SOFT,
    lineHeight: 18,
  },
  notifPrivacyNote: {
    backgroundColor: "#F5F4FD",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  notifPrivacyText: {
    fontSize: 13,
    color: TEXT_MID,
    lineHeight: 19,
  },
});
