import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { generateDailyDecode, CyclePhase } from '@/lib/dailyDecode';
import { storage, calculateCycleDataWithLogs, generateId } from '@/lib/storage';
import { BodyMap } from '@/components/BodyMap';
import {
  SYMPTOM_CATEGORIES,
  SymptomCategory,
  SymptomItem,
  SymptomLog,
  BodyPainPoint,
} from '@/lib/symptomSchema';
import {
  saveDailyCheckIn,
  getDailyCheckIn,
  getFavoriteSymptoms,
  saveFavoriteSymptoms,
} from '@/lib/symptomStorage';
import { maybeRequestPermission } from '@/lib/notificationService';
import { LannaMascot } from '@/components/LannaMascot';
import { SymptomCharacter } from '@/components/SymptomCharacter';
import { HealthSummarySheet } from '@/components/HealthSummarySheet';
import { Phase, getPhaseForDay } from '@/constants/phaseConfig';
import { phase as phaseTokens } from '@/constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ViewMode = 'symptoms' | 'bodymap';

// ─── Colors ──────────────────────────────────────────────────────────────────
const PINK = '#D85A30';   // coral CTA
const BG = '#EEEDFE';     // lavender base
const TEXT_DARK = '#26215C';
const TEXT_MID = '#4A4580';
const TEXT_SOFT = '#6B6591';


// ─── SymptomCard ──────────────────────────────────────────────────────────────

function SymptomCard({
  symptom,
  isSelected,
  isCorrelated,
  onPress,
  phaseColor,
}: {
  symptom: SymptomItem;
  isSelected: boolean;
  isCorrelated: boolean;
  onPress: () => void;
  phaseColor: string;
}) {
  const bg = isSelected
    ? phaseColor + '33'
    : isCorrelated
    ? phaseColor + '1A'
    : '#FAF8F3';
  const borderColor = isSelected ? phaseColor : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.symptomCard,
        { backgroundColor: bg, borderColor, borderWidth: isSelected ? 1.5 : 0 },
      ]}
    >
      <SymptomCharacter symptomId={symptom.id} size={44} />
      <Text
        style={[
          styles.symptomLabel,
          isCorrelated && !isSelected && { color: phaseColor, fontWeight: '600' },
          isSelected && { color: phaseColor, fontWeight: '700' },
        ]}
        numberOfLines={2}
      >
        {symptom.name}
      </Text>
    </Pressable>
  );
}

// ─── Quick-log summary banner ─────────────────────────────────────────────────

const FLOW_LABELS: Record<string, string> = {
  spotting: '🩸 Spotting',
  light:    '🩸 Light',
  medium:   '🩸 Medium',
  heavy:    '🩸 Heavy',
};

const MOOD_LABELS: Record<string, string> = {
  happy:     '😊 Happy',
  calm:      '😌 Calm',
  anxious:   '😟 Anxious',
  sad:       '😢 Sad',
  irritable: '😤 Irritable',
  energetic: '⚡ Energetic',
};

const ENERGY_LABELS: Record<number, string> = {
  1: '😴 Very Low',
  2: '🥱 Low',
  3: '🙂 Medium',
  4: '😄 High',
  5: '🚀 Very High',
};

function QuickLogBanner({
  flow,
  mood,
  energy,
  phaseColor,
}: {
  flow:    string | null;
  mood:    string | null;
  energy:  number | null;
  phaseColor: string;
}) {
  const items: { label: string; value: string }[] = [];
  if (flow   != null) items.push({ label: 'Flow',   value: FLOW_LABELS[flow]   ?? flow });
  if (mood   != null) items.push({ label: 'Mood',   value: MOOD_LABELS[mood]   ?? mood });
  if (energy != null) items.push({ label: 'Energy', value: ENERGY_LABELS[energy] ?? String(energy) });

  if (items.length === 0) return null;

  return (
    <View style={[bannerStyles.card, { borderLeftColor: phaseColor }]}>
      <Text style={[bannerStyles.heading, { color: phaseColor }]}>Already logged today</Text>
      <View style={bannerStyles.row}>
        {items.map((item) => (
          <View key={item.label} style={[bannerStyles.pill, { backgroundColor: phaseColor + '1A' }]}>
            <Text style={[bannerStyles.pillText, { color: phaseColor }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FAF8F3',
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 12,
    gap: 8,
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

// ─── Pattern insight card ─────────────────────────────────────────────────────

function PatternInsightCard({
  message,
  phaseColor,
}: {
  message: string;
  phaseColor: string;
}) {
  return (
    <View style={[styles.patternCard, { backgroundColor: phaseColor + '22' }]}>
      <Text style={[styles.patternTitle, { color: phaseColor }]}>Noticed a pattern</Text>
      <Text style={[styles.patternBody, { color: TEXT_DARK }]}>{message}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const [viewMode, setViewMode] = useState<ViewMode>('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Map<string, SymptomLog>>(new Map());
  const [painPoints, setPainPoints] = useState<BodyPainPoint[]>([]);
  const [currentPhase, setCurrentPhase] = useState<Phase>('follicular');
  const [summaryVisible, setSummaryVisible] = useState(false);

  // Quick-log fields already recorded earlier today (read-only display)
  const [quickLogFlow, setQuickLogFlow] = useState<string | null>(null);
  const [quickLogMood, setQuickLogMood] = useState<string | null>(null);
  const [quickLogEnergy, setQuickLogEnergy] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [existingCheckIn, allLogs, profile] = await Promise.all([
          getDailyCheckIn(today),
          storage.getDailyLogs(),
          storage.getUserProfile(),
        ]);
        if (existingCheckIn) {
          const m = new Map<string, SymptomLog>();
          existingCheckIn.symptoms.forEach((s) => m.set(`${s.categoryId}-${s.symptomId}`, s));
          setSelectedSymptoms(m);
          setPainPoints(existingCheckIn.painPoints || []);
        }
        // Surface any quick-log fields (flow / mood / energy) recorded earlier today
        const todayLog = allLogs.find((l) => l.date === today);
        if (todayLog) {
          if (todayLog.flow)   setQuickLogFlow(todayLog.flow);
          if (todayLog.mood)   setQuickLogMood(todayLog.mood);
          if (todayLog.energy != null) setQuickLogEnergy(todayLog.energy);
        }
        if (profile?.lastPeriodStart) {
          const start = new Date(profile.lastPeriodStart + "T12:00:00");
          const daysSince = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          const cycleDay = (daysSince % (profile.cycleLength || 28)) + 1;
          setCurrentPhase(getPhaseForDay(cycleDay, profile.cycleLength || 28, profile.periodLength || 5));
        }
      } catch {}
    })();
  }, []);

  const phaseKey = currentPhase === 'ovulation' ? 'ovulatory' : currentPhase === 'late' ? 'luteal' : currentPhase;
  const phaseColor = (phaseTokens as any)[phaseKey]?.front ?? PINK;

  const toggleSymptom = (category: SymptomCategory, symptom: SymptomItem) => {
    const key = `${category.id}-${symptom.id}`;
    const newMap = new Map(selectedSymptoms);
    if (newMap.has(key)) {
      newMap.delete(key);
    } else {
      newMap.set(key, {
        id: `${today}-${key}`,
        date: today,
        symptomId: symptom.id,
        categoryId: category.id,
        value: true,
        timestamp: Date.now(),
      });
    }
    setSelectedSymptoms(newMap);
  };

  const handleSave = async () => {
    try {
      const symptoms = Array.from(selectedSymptoms.values());
      await saveDailyCheckIn({ date: today, symptoms, painPoints, completedAt: Date.now() });

      const [profile, logs] = await Promise.all([storage.getUserProfile(), storage.getDailyLogs()]);

      // Merge check-in symptom IDs into today's DailyLog, preserving any quick-log
      // fields (flow, mood, energy, etc.) that the user set earlier in the day.
      const existing = logs.find((l) => l.date === today);
      const checkInSymptomIds = symptoms.map((s) => s.symptomId);
      // Keep any symptoms from the existing log that weren't touched by this check-in,
      // then append the full set the user selected just now.
      const preservedSymptoms = (existing?.symptoms ?? []).filter(
        (id) => !checkInSymptomIds.includes(id),
      );
      // Deduplicate via Set to guard against the same symptomId appearing under
      // multiple categories, or any pre-existing duplicates in the stored log.
      const mergedSymptoms = Array.from(new Set([...preservedSymptoms, ...checkInSymptomIds]));

      const mergedLog = {
        id: existing?.id ?? generateId(),
        date: today,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        // Spread existing first so ALL quick-log fields (flow, mood, energy, sleep…)
        // are preserved, then only overwrite the symptoms field.
        ...(existing ?? {}),
        symptoms: mergedSymptoms,
      };
      await storage.addDailyLog(mergedLog);

      const cycleData = profile ? calculateCycleDataWithLogs(profile, logs) : null;
      const phase: CyclePhase = (cycleData?.phase as CyclePhase) || 'follicular';
      const decode = generateDailyDecode({ symptoms, phase, hasPCOS: profile?.hasPCOS || false });
      navigation.navigate('DailyDecode', { decode });
      // Request notification permission after the first log — fires only once
      maybeRequestPermission().catch(() => {});
    } catch {
      Alert.alert('Could not save', 'Please try again.', [{ text: 'OK' }]);
    }
  };

  const loggedCount = selectedSymptoms.size + painPoints.length;

  // Find correlated symptoms (any category with 2+ selections this session — placeholder logic)
  const correlatedIds = new Set<string>();
  const selectedList = Array.from(selectedSymptoms.values());
  if (selectedList.length >= 2) {
    selectedList.slice(0, 2).forEach((s) => correlatedIds.add(s.symptomId));
  }

  const patternMessage =
    selectedList.length >= 2
      ? `${SYMPTOM_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === selectedList[0]?.symptomId)?.name ?? 'Fatigue'} and ${SYMPTOM_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === selectedList[1]?.symptomId)?.name?.toLowerCase() ?? 'sugar cravings'} have shown up together.`
      : null;

  // Split categories: physical/hormonal vs PMOS
  const physicalCats = SYMPTOM_CATEGORIES.filter((c) => !c.isPCOS);
  const pmosCats = SYMPTOM_CATEGORIES.filter((c) => c.isPCOS);

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>Check-in</Text>
            <Text style={styles.headerDate}>{dateLabel}</Text>
          </View>
        </View>
        <View style={[styles.loggedBadge, { backgroundColor: phaseColor + '22' }]}>
          <Text style={[styles.loggedText, { color: phaseColor }]}>{loggedCount} logged</Text>
        </View>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentedControl}>
        <Pressable
          onPress={() => setViewMode('symptoms')}
          style={[styles.segment, viewMode === 'symptoms' && { backgroundColor: phaseColor }]}
        >
          <Text style={[styles.segmentText, viewMode === 'symptoms' && styles.segmentTextActive]}>
            Symptoms
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('bodymap')}
          style={[styles.segment, viewMode === 'bodymap' && { backgroundColor: phaseColor }]}
        >
          <Text style={[styles.segmentText, viewMode === 'bodymap' && styles.segmentTextActive]}>
            Body map
          </Text>
        </Pressable>
      </View>

      {viewMode === 'symptoms' ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick-log data recorded earlier today */}
          <QuickLogBanner
            flow={quickLogFlow}
            mood={quickLogMood}
            energy={quickLogEnergy}
            phaseColor={phaseColor}
          />

          {/* Pattern insight */}
          {patternMessage && (
            <PatternInsightCard message={patternMessage} phaseColor={phaseColor} />
          )}

          {/* Per-category symptom sections */}
          {physicalCats.map((cat) => (
            <View key={cat.id}>
              <Text style={styles.categoryHeader}>{cat.name}</Text>
              <View style={styles.symptomsGrid}>
                {cat.items.map((symptom) => {
                  const key = `${cat.id}-${symptom.id}`;
                  return (
                    <SymptomCard
                      key={key}
                      symptom={symptom}
                      isSelected={selectedSymptoms.has(key)}
                      isCorrelated={correlatedIds.has(symptom.id)}
                      onPress={() => toggleSymptom(cat, symptom)}
                      phaseColor={phaseColor}
                    />
                  );
                })}
              </View>
            </View>
          ))}

          {/* PMOS indicators — same per-category treatment */}
          {pmosCats.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>PMOS indicators</Text>
              {pmosCats.map((cat) => (
                <View key={cat.id}>
                  <Text style={styles.categoryHeader}>{cat.name}</Text>
                  <View style={styles.symptomsGrid}>
                    {cat.items.map((symptom) => {
                      const key = `${cat.id}-${symptom.id}`;
                      return (
                        <SymptomCard
                          key={key}
                          symptom={symptom}
                          isSelected={selectedSymptoms.has(key)}
                          isCorrelated={false}
                          onPress={() => toggleSymptom(cat, symptom)}
                          phaseColor={phaseColor}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 80 }]}
        >
          <BodyMap
            date={today}
            painPoints={painPoints}
            onAddPainPoint={(pp) => setPainPoints((prev) => [...prev, { ...pp, id: `${today}-pain-${Date.now()}`, timestamp: Date.now() }])}
            onRemovePainPoint={(id) => setPainPoints((prev) => prev.filter((p) => p.id !== id))}
          />
        </ScrollView>
      )}

      {/* Save button + Summary CTA */}
      <View style={[styles.saveBar, { paddingBottom: tabBarHeight + 8 }]}>
        <Pressable
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: '#D85A30' }]}
        >
          <Text style={styles.saveBtnText}>Save today's check-in</Text>
        </Pressable>
        <Pressable
          onPress={() => setSummaryVisible(true)}
          style={styles.summaryPill}
        >
          <Text style={styles.summaryPillText}>📋 My Health Summary</Text>
        </Pressable>
      </View>

      <HealthSummarySheet
        visible={summaryVisible}
        onDismiss={() => setSummaryVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  headerDate: {
    fontSize: 12,
    color: TEXT_SOFT,
  },
  loggedBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loggedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#D8D6F0',
    borderRadius: 28,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_SOFT,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  patternCard: {
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  patternTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  patternBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  categoryHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: "#8880B0",
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symptomCard: {
    width: '30%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  symptomCharacter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomLabel: {
    fontSize: 11,
    color: TEXT_DARK,
    textAlign: 'center',
    lineHeight: 15,
  },
  saveBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FAF8F3',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D8D6F0',
  },
  saveBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  summaryPill: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(148,144,200,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(148,144,200,0.22)',
  },
  summaryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4580',
    letterSpacing: 0.1,
  },
});
