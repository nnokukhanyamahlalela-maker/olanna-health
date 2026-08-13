/**
 * SettingsScreen — Consolidated cycle, health, and notification settings.
 *
 * Sections:
 *  1. Cycle Details   — period / cycle lengths, last period date
 *  2. Health Profile  — birth control type, conditions (PCOS / Endo)
 *  3. Notifications   — fertile window, period reminder, phase, pattern alerts
 *
 * Flat cream surface, no glassmorphism, brand-token colours throughout.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/useColorScheme";

import { storage, UserProfile } from "@/lib/storage";
import { saveOnboardingCycleProfile } from "@/services/cycleProfileService";
import {
  notificationSettingsStorage,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/lib/notificationSettings";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BG       = "#FAF8F3";   // cream page background
const SURFACE  = "#FFFFFF";   // card surface
const INK      = "#26215C";   // plum
const INK_MID  = "#6B6490";   // mid plum
const CORAL    = "#D85A30";
const TEAL     = "#0F6E56";
const BORDER   = "#E8E6F0";

// ─── Dark-mode colour overrides ───────────────────────────────────────────────
// Returns null in light mode so callsites can use `dk && { ... }` safely.
function getDarkC(isDark: boolean) {
  if (!isDark) return null;
  return {
    BG:      "#1C193A",
    SURFACE: "#28244A",
    INK:     "#F5F0F3",
    INK_MID: "#C4B3BF",
    BORDER:  "rgba(255,255,255,0.12)",
    BTN_BG:  "rgba(238,237,254,0.18)",
    BC_BG:   "rgba(245,244,251,0.10)",
    BC_SEL:  "rgba(250,236,231,0.18)",
  };
}

// ─── Birth control options ────────────────────────────────────────────────────
const BIRTH_CONTROL_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: "none",          label: "None",           icon: "x-circle" },
  { id: "pill",          label: "Pill",           icon: "circle" },
  { id: "iud-hormonal",  label: "IUD (hormonal)", icon: "anchor" },
  { id: "iud-copper",    label: "IUD (copper)",   icon: "anchor" },
  { id: "implant",       label: "Implant",        icon: "minus" },
  { id: "injection",     label: "Injection",      icon: "activity" },
  { id: "ring",          label: "Ring",           icon: "rotate-cw" },
  { id: "patch",         label: "Patch",          icon: "square" },
  { id: "condom",        label: "Condom",         icon: "shield" },
  { id: "other",         label: "Other",          icon: "more-horizontal" },
];

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({
  value,
  min,
  max,
  onDecrement,
  onIncrement,
  unit,
}: {
  value: number;
  min: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
  unit: string;
}) {
  const dk = getDarkC(useColorScheme() === "dark");
  return (
    <View style={stepperStyles.row}>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDecrement(); }}
        disabled={value <= min}
        style={[stepperStyles.btn, value <= min && stepperStyles.btnDisabled, dk && { backgroundColor: dk.BTN_BG }]}
      >
        <Feather name="minus" size={18} color={value <= min ? (dk?.INK_MID ?? INK_MID) : (dk?.INK ?? INK)} />
      </Pressable>
      <View style={stepperStyles.valueBox}>
        <Text style={[stepperStyles.valueText, dk && { color: dk.INK }]}>{value}</Text>
        <Text style={[stepperStyles.unitText, dk && { color: dk.INK_MID }]}> {unit}</Text>
      </View>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onIncrement(); }}
        disabled={value >= max}
        style={[stepperStyles.btn, value >= max && stepperStyles.btnDisabled, dk && { backgroundColor: dk.BTN_BG }]}
      >
        <Feather name="plus" size={18} color={value >= max ? (dk?.INK_MID ?? INK_MID) : (dk?.INK ?? INK)} />
      </Pressable>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 0 },
  btn: {
    width: 44, height: 44,
    borderRadius: 10,
    backgroundColor: "#EEEDFE",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.35 },
  valueBox: {
    flexDirection: "row",
    alignItems: "baseline",
    minWidth: 80,
    justifyContent: "center",
  },
  valueText: { fontSize: 22, fontWeight: "700", color: INK },
  unitText:  { fontSize: 13, color: INK_MID },
});

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ title, icon }: { title: string; icon: string }) {
  const dk = getDarkC(useColorScheme() === "dark");
  return (
    <View style={headStyles.row}>
      <View style={headStyles.iconBox}>
        <Feather name={icon as any} size={15} color={TEAL} />
      </View>
      <Text style={[headStyles.title, dk && { color: dk.INK }]}>{title}</Text>
    </View>
  );
}

const headStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, marginTop: 24 },
  iconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(15,110,86,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 13, fontWeight: "700", color: INK, letterSpacing: 0.6, textTransform: "uppercase" },
});

// ─── Notification row ─────────────────────────────────────────────────────────
function NotifRow({
  label,
  description,
  value,
  onToggle,
  isLast,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  isLast?: boolean;
}) {
  const dk = getDarkC(useColorScheme() === "dark");
  return (
    <View style={[
      notifStyles.row,
      !isLast && notifStyles.rowBorder,
      dk && !isLast && { borderBottomColor: dk.BORDER },
    ]}>
      <View style={notifStyles.text}>
        <Text style={[notifStyles.label, dk && { color: dk.INK }]}>{label}</Text>
        <Text style={[notifStyles.desc,  dk && { color: dk.INK_MID }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(v);
        }}
        trackColor={{ false: dk?.BORDER ?? BORDER, true: TEAL }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const notifStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER },
  text: { flex: 1 },
  label: { fontSize: 15, fontWeight: "600", color: INK, marginBottom: 2 },
  desc:  { fontSize: 12, color: INK_MID, lineHeight: 16 },
});

// ─── Condition toggle row ─────────────────────────────────────────────────────
function ConditionRow({
  label,
  description,
  value,
  onToggle,
  isLast,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  isLast?: boolean;
}) {
  const dk = getDarkC(useColorScheme() === "dark");
  return (
    <View style={[
      notifStyles.row,
      !isLast && notifStyles.rowBorder,
      dk && !isLast && { borderBottomColor: dk.BORDER },
    ]}>
      <View style={notifStyles.text}>
        <Text style={[notifStyles.label, dk && { color: dk.INK }]}>{label}</Text>
        <Text style={[notifStyles.desc,  dk && { color: dk.INK_MID }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(v);
        }}
        trackColor={{ false: dk?.BORDER ?? BORDER, true: CORAL }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const insets      = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation  = useNavigation();
  const dk          = getDarkC(useColorScheme() === "dark");

  // Profile state
  const [profile,       setProfile]       = useState<UserProfile | null>(null);
  const [cycleLength,   setCycleLength]   = useState(28);
  const [periodLength,  setPeriodLength]  = useState(5);
  const [lastPeriod,    setLastPeriod]    = useState(new Date());
  const [showPicker,    setShowPicker]    = useState(false);
  const [birthControl,  setBirthControl]  = useState("none");
  const [hasPCOS,       setHasPCOS]       = useState(false);
  const [hasEndo,       setHasEndo]       = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);

  // Notification state
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    ...DEFAULT_NOTIFICATION_SETTINGS,
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        storage.getUserProfile(),
        notificationSettingsStorage.get(),
      ]).then(([p, n]) => {
        if (!active) return;
        if (p) {
          setProfile(p);
          setCycleLength(p.cycleLength ?? 28);
          setPeriodLength(p.periodLength ?? 5);
          if (p.lastPeriodStart) {
            setLastPeriod(new Date(p.lastPeriodStart + "T12:00:00"));
          }
          setBirthControl(p.birthControl ?? "none");
          setHasPCOS(p.hasPCOS ?? false);
          setHasEndo(p.hasEndometriosis ?? false);
        }
        setNotifSettings(n);
      });
      return () => { active = false; };
    }, [])
  );

  // ── Save helpers ──────────────────────────────────────────────────────────

  const saveProfile = async (patch: Partial<UserProfile>) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const updated: UserProfile = { ...profile, ...patch };
      await storage.setUserProfile(updated);
      setProfile(updated);
      await saveOnboardingCycleProfile({
        userId: updated.id,
        lastPeriodStartDate: updated.lastPeriodStart,
        averageCycleLength: updated.cycleLength,
        averagePeriodLength: updated.periodLength,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Save failed", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveCycleDetails = () =>
    saveProfile({
      cycleLength,
      periodLength,
      lastPeriodStart: `${lastPeriod.getFullYear()}-${String(lastPeriod.getMonth() + 1).padStart(2, "0")}-${String(lastPeriod.getDate()).padStart(2, "0")}`,
    });

  const saveHealthProfile = () =>
    saveProfile({
      birthControl,
      hasPCOS,
      hasEndometriosis: hasEndo,
      healthGoals: [
        ...(profile?.healthGoals?.filter(
          (g) => !["manage_pcos", "manage_endo"].includes(g)
        ) ?? []),
        ...(hasPCOS ? ["manage_pcos"] : []),
        ...(hasEndo  ? ["manage_endo"] : []),
      ],
    });

  const toggleNotif = async (key: keyof NotificationSettings, value: boolean) => {
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);
    await notificationSettingsStorage.save({ [key]: value });
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.root, dk && { backgroundColor: dk.BG }]}
      contentContainerStyle={{
        paddingTop: headerHeight + 8,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >

      {/* ── 1. Cycle Details ── */}
      <SectionHead title="Cycle Details" icon="refresh-cw" />
      <View style={[styles.card, dk && { backgroundColor: dk.SURFACE, borderColor: dk.BORDER }]}>

        {/* Cycle length */}
        <View style={styles.fieldRow}>
          <View style={styles.fieldLabel}>
            <Text style={[styles.fieldTitle, dk && { color: dk.INK }]}>Cycle length</Text>
            <Text style={[styles.fieldSub,   dk && { color: dk.INK_MID }]}>How many days your typical cycle lasts</Text>
          </View>
          <Stepper
            value={cycleLength}
            min={15} max={60}
            unit="days"
            onDecrement={() => setCycleLength((v) => Math.max(15, v - 1))}
            onIncrement={() => setCycleLength((v) => Math.min(60, v + 1))}
          />
        </View>

        <View style={[styles.divider, dk && { backgroundColor: dk.BORDER }]} />

        {/* Period length */}
        <View style={styles.fieldRow}>
          <View style={styles.fieldLabel}>
            <Text style={[styles.fieldTitle, dk && { color: dk.INK }]}>Period length</Text>
            <Text style={[styles.fieldSub,   dk && { color: dk.INK_MID }]}>How many days your period typically lasts</Text>
          </View>
          <Stepper
            value={periodLength}
            min={1} max={14}
            unit="days"
            onDecrement={() => setPeriodLength((v) => Math.max(1, v - 1))}
            onIncrement={() => setPeriodLength((v) => Math.min(14, v + 1))}
          />
        </View>

        <View style={[styles.divider, dk && { backgroundColor: dk.BORDER }]} />

        {/* Last period start */}
        <View style={styles.fieldRowVertical}>
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.fieldTitle, dk && { color: dk.INK }]}>Last period start date</Text>
            <Text style={[styles.fieldSub,   dk && { color: dk.INK_MID }]}>Used to calculate your current cycle day</Text>
          </View>
          <Pressable
            onPress={() => setShowPicker(true)}
            style={[styles.dateBtn, dk && { backgroundColor: dk.BTN_BG }]}
          >
            <Feather name="calendar" size={16} color={dk?.INK_MID ?? INK_MID} />
            <Text style={[styles.dateBtnText, dk && { color: dk.INK }]}>{formatDate(lastPeriod)}</Text>
            <Feather name="chevron-down" size={14} color={dk?.INK_MID ?? INK_MID} />
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={lastPeriod}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowPicker(Platform.OS === "ios");
                if (date) setLastPeriod(date);
              }}
            />
          )}
        </View>

        <Pressable
          onPress={saveCycleDetails}
          disabled={isSaving}
          style={({ pressed }) => [styles.saveBtn, { opacity: pressed || isSaving ? 0.7 : 1 }]}
        >
          <Text style={styles.saveBtnText}>{isSaving ? "Saving…" : "Save cycle details"}</Text>
        </Pressable>
      </View>

      {/* ── 2. Health Profile ── */}
      <SectionHead title="Health Profile" icon="heart" />
      <View style={[styles.card, dk && { backgroundColor: dk.SURFACE, borderColor: dk.BORDER }]}>

        {/* Birth control */}
        <Text style={[styles.fieldTitle, dk && { color: dk.INK }]}>Birth control</Text>
        <Text style={[styles.fieldSub, { marginBottom: 12 }, dk && { color: dk.INK_MID }]}>
          Helps Lanna contextualise your cycle patterns
        </Text>
        <View style={styles.bcGrid}>
          {BIRTH_CONTROL_OPTIONS.map((opt) => {
            const selected = birthControl === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBirthControl(opt.id);
                }}
                style={[
                  styles.bcChip,
                  selected && styles.bcChipSelected,
                  dk && { backgroundColor: dk.BC_BG, borderColor: dk.BORDER },
                  dk && selected && { backgroundColor: dk.BC_SEL, borderColor: CORAL },
                ]}
              >
                <Feather
                  name={opt.icon as any}
                  size={13}
                  color={selected ? CORAL : (dk?.INK_MID ?? INK_MID)}
                />
                <Text style={[styles.bcLabel, selected && styles.bcLabelSelected, dk && !selected && { color: dk.INK_MID }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.divider, { marginTop: 16 }, dk && { backgroundColor: dk.BORDER }]} />

        {/* Conditions */}
        <Text style={[styles.fieldTitle, { marginTop: 12 }, dk && { color: dk.INK }]}>Health conditions</Text>
        <Text style={[styles.fieldSub, { marginBottom: 8 }, dk && { color: dk.INK_MID }]}>
          Enables condition-specific insights and symptom tracking
        </Text>
        <ConditionRow
          label="PCOS"
          description="Polycystic ovary syndrome — unlocks PCOS-specific patterns"
          value={hasPCOS}
          onToggle={setHasPCOS}
        />
        <ConditionRow
          label="Endometriosis"
          description="Unlocks endo pain tracking and flare-pattern detection"
          value={hasEndo}
          onToggle={setHasEndo}
          isLast
        />

        <Pressable
          onPress={saveHealthProfile}
          disabled={isSaving}
          style={({ pressed }) => [styles.saveBtn, { opacity: pressed || isSaving ? 0.7 : 1 }]}
        >
          <Text style={styles.saveBtnText}>{isSaving ? "Saving…" : "Save health profile"}</Text>
        </Pressable>
      </View>

      {/* ── 3. Notifications ── */}
      <SectionHead title="Notifications" icon="bell" />
      <View style={[styles.card, dk && { backgroundColor: dk.SURFACE, borderColor: dk.BORDER }]}>
        <NotifRow
          label="Fertile window alerts"
          description="Notified when your fertile window opens and at ovulation"
          value={notifSettings.fertileWindow}
          onToggle={(v) => toggleNotif("fertileWindow", v)}
        />
        <NotifRow
          label="Phase reminders"
          description="Daily nudge to log when a new cycle phase begins"
          value={notifSettings.phaseReminder}
          onToggle={(v) => toggleNotif("phaseReminder", v)}
        />
        <NotifRow
          label="Pattern alerts"
          description="Alert when Lanna detects a high-severity symptom pattern"
          value={notifSettings.thresholdAlert}
          onToggle={(v) => toggleNotif("thresholdAlert", v)}
        />
        <NotifRow
          label="Data milestones"
          description="Celebrate streaks and cycle-tracking milestones"
          value={notifSettings.dataMilestone}
          onToggle={(v) => toggleNotif("dataMilestone", v)}
        />
        <NotifRow
          label="Health summary refresh"
          description="Periodic reminder to review your health summary"
          value={notifSettings.healthSummaryRefresh}
          onToggle={(v) => toggleNotif("healthSummaryRefresh", v)}
        />
        <NotifRow
          label="Partner notifications"
          description="Share phase updates with your partner (requires Partner Mode)"
          value={notifSettings.partnerMode}
          onToggle={(v) => toggleNotif("partnerMode", v)}
          isLast
        />
      </View>

      {/* Quick links */}
      <SectionHead title="More Settings" icon="settings" />
      <View style={[styles.card, dk && { backgroundColor: dk.SURFACE, borderColor: dk.BORDER }]}>
        {[
          { label: "Edit full profile",  icon: "user",       route: "EditProfile" },
          { label: "Privacy & Data",     icon: "lock",       route: "PrivacySettings" },
          { label: "Partner Mode",       icon: "users",      route: "PartnerSettings" },
        ].map(({ label, icon, route }, i, arr) => (
          <Pressable
            key={route}
            onPress={() => (navigation as any).navigate(route)}
            style={({ pressed }) => [
              styles.linkRow,
              i < arr.length - 1 && styles.linkRowBorder,
              dk && i < arr.length - 1 && { borderBottomColor: dk.BORDER },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name={icon as any} size={16} color={dk?.INK_MID ?? INK_MID} />
            <Text style={[styles.linkLabel, dk && { color: dk.INK }]}>{label}</Text>
            <Feather name="chevron-right" size={16} color={dk?.INK_MID ?? INK_MID} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 4,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 14,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  fieldRowVertical: {},
  fieldLabel: { flex: 1 },
  fieldTitle: { fontSize: 15, fontWeight: "600", color: INK, marginBottom: 2 },
  fieldSub:   { fontSize: 12, color: INK_MID, lineHeight: 16 },

  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EEEDFE",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  dateBtnText: { fontSize: 14, fontWeight: "600", color: INK },

  saveBtn: {
    marginTop: 16,
    backgroundColor: CORAL,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },

  bcGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bcChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F4FB",
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  bcChipSelected: { backgroundColor: "#FAECE7", borderColor: CORAL },
  bcLabel:        { fontSize: 13, fontWeight: "500", color: INK_MID },
  bcLabelSelected: { color: CORAL, fontWeight: "600" },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  linkRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: INK },
});
