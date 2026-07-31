import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
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
import { saveOnboardingCycleProfile } from "@/services/cycleProfileService";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { CycleRegularity } from "@/constants/onboardingTokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type OnboardingStep =
  | "welcome"     // Hi, I'm Lanna
  | "valueprop"   // Meet your four phases
  | "name"        // What shall I call you?
  | "personalize" // Does any of this apply?
  | "ttcnote"     // Warm note shown only when user selects "Trying to conceive"
  | "cyclelength" // How long is your cycle?
  | "lastperiod"  // When did your last period start?
  | "done";

// ─── Colors ──────────────────────────────────────────────────────────────────

const PINK = "#F06B9A";
const PINK_LIGHT = "#F9C4D7";
const BG = "#FDF5F8";
const TEXT_DARK = "#2D1F2B";
const TEXT_MID = "#5A4252";
const TEXT_SOFT = "#8A6F80";

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
    title: "Built for PMOS support",
    body: "Tailored check-ins and insights for people navigating PMOS, endometriosis, and irregular cycles.",
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
                { backgroundColor: PHASE_CIRCLE_BG[ph] ?? "#EDD8E7" },
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

// ─── Step 4: Personalization ──────────────────────────────────────────────────

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
      contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <BackBtn onPress={onBack} />
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <View style={styles.mascotSmall}>
          <LannaMascot phase="menstrual" size={80} />
        </View>
        <Text style={styles.stepTitle}>Does any of this apply?</Text>
        <Text style={styles.stepSubtitle}>We'll tailor your check-ins around it.{"\n"}You can always change this later.</Text>
      </View>
      <View style={styles.optionsList}>
        {PERSONALIZE_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              onPress={() => onToggle(opt.id)}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
            >
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

// ─── Step 4b: TTC warm note (only shown when user selects "Trying to conceive") ─

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
            If you're trying to conceive and you have PMOS, endometriosis, or irregular cycles, your symptoms are still worth logging here — your patterns matter, and your provider or a fertility specialist can use that data.
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

// ─── Root OnboardingScreen ────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [name, setName] = useState("");
  const [personalized, setPersonalized] = useState<string[]>([]);
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<string | undefined>();

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

  const finishOnboarding = async (resolvedPeriodDate?: string) => {
    const periodDate = resolvedPeriodDate ?? lastPeriodDate;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const hasPMOS = personalized.includes("pmos");
      const hasEndo = personalized.includes("endo");
      const profileId = generateId();
      const profile: UserProfile = {
        id: profileId,
        name: name.trim() || "Friend",
        dateOfBirth: "",
        cycleLength,
        periodLength: 5,
        lastPeriodStart: periodDate ?? "",
        healthGoals: [],
        hasPCOS: hasPMOS,
        hasEndometriosis: hasEndo,
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
    } catch (e) {
      console.error("[Onboarding] error saving:", e);
      (navigation as any).replace("Main");
    }
  };

  const handleDataExtracted = (data: ExtractedCycleData) => {
    const extracted = data.lastPeriodStartDate || undefined;
    if (extracted) setLastPeriodDate(extracted);
    finishOnboarding(extracted);
  };

  const handleLastPeriodNext = (date: string) => {
    setLastPeriodDate(date);
    finishOnboarding(date);
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
            onNext={() => setStep("personalize")}
            onBack={() => setStep("valueprop")}
          />
        );
      case "personalize":
        return (
          <PersonalizeStep
            selected={personalized}
            onToggle={togglePersonalize}
            onNext={() => personalized.includes("ttc") ? setStep("ttcnote") : setStep("cyclelength")}
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
            onBack={() => setStep("personalize")}
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
    fontSize: 30,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 8,
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
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
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
  // Personalize
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
});
