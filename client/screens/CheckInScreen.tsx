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
import { storage, calculateCycleDataWithLogs } from '@/lib/storage';
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
import { LannaMascot } from '@/components/LannaMascot';
import { SymptomCharacter } from '@/components/SymptomCharacter';
import { Phase, getPhaseForDay } from '@/constants/phaseConfig';
import { phase as phaseTokens } from '@/constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ViewMode = 'symptoms' | 'bodymap';

// ─── Colors ──────────────────────────────────────────────────────────────────
const PINK = '#F06B9A';
const BG = '#FDF5F8';
const TEXT_DARK = '#2D1F2B';
const TEXT_MID = '#5A4252';
const TEXT_SOFT = '#8A6F80';


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
    : '#F5EDF3';
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

  useEffect(() => {
    (async () => {
      try {
        const existingCheckIn = await getDailyCheckIn(today);
        if (existingCheckIn) {
          const m = new Map<string, SymptomLog>();
          existingCheckIn.symptoms.forEach((s) => m.set(`${s.categoryId}-${s.symptomId}`, s));
          setSelectedSymptoms(m);
          setPainPoints(existingCheckIn.painPoints || []);
        }
        const profile = await storage.getUserProfile();
        if (profile?.lastPeriodStart) {
          const start = new Date(profile.lastPeriodStart);
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
      const cycleData = profile ? calculateCycleDataWithLogs(profile, logs) : null;
      const phase: CyclePhase = (cycleData?.phase as CyclePhase) || 'follicular';
      const decode = generateDailyDecode({ symptoms, phase, hasPCOS: profile?.hasPCOS || false });
      navigation.navigate('DailyDecode', { decode });
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
          <LannaMascot phase={currentPhase} size={36} />
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
          {/* Pattern insight */}
          {patternMessage && (
            <PatternInsightCard message={patternMessage} phaseColor={phaseColor} />
          )}

          {/* Physical and hormonal */}
          <Text style={styles.sectionTitle}>Physical and hormonal</Text>
          <View style={styles.symptomsGrid}>
            {physicalCats.flatMap((cat) =>
              cat.items.map((symptom) => {
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
              })
            )}
          </View>

          {/* PMOS indicators */}
          {pmosCats.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>PMOS indicators</Text>
              <View style={styles.symptomsGrid}>
                {pmosCats.flatMap((cat) =>
                  cat.items.map((symptom) => {
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
                  })
                )}
              </View>
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

      {/* Save button */}
      <View style={[styles.saveBar, { paddingBottom: tabBarHeight + 8 }]}>
        <Pressable
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: phaseColor }]}
        >
          <Text style={styles.saveBtnText}>Save today's check-in</Text>
        </Pressable>
      </View>
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
    backgroundColor: '#EDD8E7',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EDD8E7',
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
});
