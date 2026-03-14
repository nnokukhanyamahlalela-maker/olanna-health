import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { generateDailyDecode, CyclePhase } from '@/lib/dailyDecode';
import { storage, calculateCycleDataWithLogs } from '@/lib/storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { SymptomChip } from '@/components/SymptomChip';
import { SeveritySlider } from '@/components/SeveritySlider';
import { TagSelector } from '@/components/TagSelector';
import { BodyMap } from '@/components/BodyMap';
import { AfricanPattern } from '@/components/AfricanPattern';
import { AppGradient } from '@/components/AppGradient';
import { GlassSurface } from '@/components/GlassSurface';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, ScreenPadding, CardSpacing, PillSpacing, ButtonSpacing, TabBarSpacing } from '@/constants/spacing';
import { BorderRadius } from '@/constants/theme';
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
  getHiddenSymptoms,
  saveHiddenSymptoms,
  getCategoryOrder,
  saveCategoryOrder,
  generateSeedData,
  getCustomSymptoms,
  saveCustomSymptom,
  CustomSymptom,
} from '@/lib/symptomStorage';

type ViewMode = 'categories' | 'bodymap' | 'patterns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CheckInScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('core-cycle');
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Map<string, SymptomLog>>(new Map());
  const [painPoints, setPainPoints] = useState<BodyPainPoint[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState<SymptomItem | null>(null);
  const [currentSeverity, setCurrentSeverity] = useState(0);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [currentNotes, setCurrentNotes] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hiddenSymptoms, setHiddenSymptoms] = useState<string[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customSymptoms, setCustomSymptoms] = useState<CustomSymptom[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState('core-cycle');
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const existingCheckIn = await getDailyCheckIn(today);
    if (existingCheckIn) {
      const symptomsMap = new Map<string, SymptomLog>();
      existingCheckIn.symptoms.forEach(s => {
        symptomsMap.set(`${s.categoryId}-${s.symptomId}`, s);
      });
      setSelectedSymptoms(symptomsMap);
      setPainPoints(existingCheckIn.painPoints || []);
    }
    const favs = await getFavoriteSymptoms();
    setFavorites(favs);
    const hidden = await getHiddenSymptoms();
    setHiddenSymptoms(hidden);
    const order = await getCategoryOrder();
    setCategoryOrder(order);
    const custom = await getCustomSymptoms();
    setCustomSymptoms(custom);
  };

  const handleLoadDemoData = async () => {
    setLoadingDemo(true);
    await generateSeedData();
    setLoadingDemo(false);
    setShowCustomizeModal(false);
  };

  const handleAddCustomSymptom = async () => {
    if (!newCustomName.trim()) return;
    const newSymptom: CustomSymptom = {
      id: `custom-${Date.now()}`,
      name: newCustomName.trim(),
      categoryId: newCustomCategory,
      icon: 'plus',
      inputType: 'severity',
      createdAt: Date.now(),
    };
    await saveCustomSymptom(newSymptom);
    setCustomSymptoms([...customSymptoms, newSymptom]);
    setNewCustomName('');
    setShowAddCustom(false);
  };

  const toggleHideSymptom = async (symptomId: string) => {
    const newHidden = hiddenSymptoms.includes(symptomId)
      ? hiddenSymptoms.filter(h => h !== symptomId)
      : [...hiddenSymptoms, symptomId];
    setHiddenSymptoms(newHidden);
    await saveHiddenSymptoms(newHidden);
  };

  const getOrderedCategories = () => {
    if (categoryOrder.length === 0) return SYMPTOM_CATEGORIES;
    const ordered: SymptomCategory[] = [];
    categoryOrder.forEach(id => {
      const cat = SYMPTOM_CATEGORIES.find(c => c.id === id);
      if (cat) ordered.push(cat);
    });
    SYMPTOM_CATEGORIES.forEach(cat => {
      if (!categoryOrder.includes(cat.id)) ordered.push(cat);
    });
    return ordered;
  };

  const getVisibleSymptoms = (category: SymptomCategory) => {
    return category.items.filter(item => !hiddenSymptoms.includes(item.id));
  };

  const handleSymptomPress = (category: SymptomCategory, symptom: SymptomItem) => {
    const key = `${category.id}-${symptom.id}`;

    if (symptom.inputType === 'toggle') {
      if (selectedSymptoms.has(key)) {
        const newMap = new Map(selectedSymptoms);
        newMap.delete(key);
        setSelectedSymptoms(newMap);
      } else {
        const log: SymptomLog = {
          id: `${today}-${key}`,
          date: today,
          symptomId: symptom.id,
          categoryId: category.id,
          value: true,
          timestamp: Date.now(),
        };
        const newMap = new Map(selectedSymptoms);
        newMap.set(key, log);
        setSelectedSymptoms(newMap);
      }
    } else {
      setCurrentSymptom(symptom);
      setSelectedCategory(category);
      const existing = selectedSymptoms.get(key);
      setCurrentSeverity(existing?.severity || 0);
      setCurrentTags(existing?.tags || []);
      setCurrentNotes(existing?.notes || '');
      setShowDetailModal(true);
    }
  };

  const handleSymptomLongPress = async (symptom: SymptomItem) => {
    const newFavorites = favorites.includes(symptom.id)
      ? favorites.filter(f => f !== symptom.id)
      : [...favorites, symptom.id];
    setFavorites(newFavorites);
    await saveFavoriteSymptoms(newFavorites);
  };

  const saveSymptomDetail = () => {
    if (!currentSymptom || !selectedCategory) return;

    const key = `${selectedCategory.id}-${currentSymptom.id}`;
    const log: SymptomLog = {
      id: `${today}-${key}`,
      date: today,
      symptomId: currentSymptom.id,
      categoryId: selectedCategory.id,
      value: currentSeverity > 0,
      severity: currentSeverity,
      tags: currentTags.length > 0 ? currentTags : undefined,
      notes: currentNotes || undefined,
      timestamp: Date.now(),
    };

    const newMap = new Map(selectedSymptoms);
    if (currentSeverity > 0) {
      newMap.set(key, log);
    } else {
      newMap.delete(key);
    }
    setSelectedSymptoms(newMap);
    setShowDetailModal(false);
    setCurrentSymptom(null);
  };

  const handleAddPainPoint = (painPoint: Omit<BodyPainPoint, 'id' | 'timestamp'>) => {
    const newPainPoint: BodyPainPoint = {
      ...painPoint,
      id: `${today}-pain-${Date.now()}`,
      timestamp: Date.now(),
    };
    setPainPoints([...painPoints, newPainPoint]);
  };

  const handleRemovePainPoint = (painPointId: string) => {
    setPainPoints(prev => prev.filter(p => p.id !== painPointId));
  };

  const handleSaveCheckIn = async () => {
    try {
      const symptoms = Array.from(selectedSymptoms.values());
      await saveDailyCheckIn({
        date: today,
        symptoms,
        painPoints,
        completedAt: Date.now(),
      });

      const [userProfile, logs] = await Promise.all([
        storage.getUserProfile(),
        storage.getDailyLogs(),
      ]);
      const cycleData = userProfile ? calculateCycleDataWithLogs(userProfile, logs) : null;
      
      const phase: CyclePhase = (cycleData?.phase as CyclePhase) || 'follicular';
      const hasPCOS = userProfile?.hasPCOS || false;

      const decode = generateDailyDecode({
        symptoms,
        phase,
        hasPCOS,
        hasEndometriosis: userProfile?.hasEndometriosis,
      });

      navigation.navigate('DailyDecode', { decode });
    } catch (error) {
      Alert.alert(
        "Hmm — that didn't save",
        "Try once more, I've got you.",
        [{ text: "OK" }]
      );
    }
  };

  const loggedCount = selectedSymptoms.size + painPoints.length;

  const getCategoryLoggedCount = useCallback((categoryId: string) => {
    let count = 0;
    selectedSymptoms.forEach((_, key) => {
      if (key.startsWith(categoryId + '-')) count++;
    });
    return count;
  }, [selectedSymptoms]);

  const activeCategory = getOrderedCategories().find(c => c.id === activeCategoryId) || getOrderedCategories()[0];

  const renderCategorySection = (category: SymptomCategory, index: number) => (
    <Animated.View
      key={category.id}
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={styles.categorySectionOuter}
    >
      <GlassSurface borderRadius={CardSpacing.radius} padding={CardSpacing.padding}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: "rgba(194,24,91,0.12)" }]}>
            <Feather name={category.icon as any} size={18} color="#C2185B" />
          </View>
          <ThemedText type="h4" style={{ flex: 1, color: theme.text }}>{category.name}</ThemedText>
          {category.isPCOS ? (
            <View style={[styles.badge, { backgroundColor: "rgba(194,24,91,0.12)" }]}>
              <ThemedText type="caption" style={{ color: "#C2185B" }}>PCOS</ThemedText>
            </View>
          ) : null}
          {category.isEndometriosis ? (
            <View style={[styles.badge, { backgroundColor: "rgba(123,94,167,0.12)" }]}>
              <ThemedText type="caption" style={{ color: "#7B5EA7" }}>Endo</ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.symptomsGrid}>
          {getVisibleSymptoms(category).map(symptom => {
            const key = `${category.id}-${symptom.id}`;
            const isSelected = selectedSymptoms.has(key);
            const log = selectedSymptoms.get(key);
            return (
              <SymptomChip
                key={symptom.id}
                label={symptom.name}
                icon={symptom.icon as any}
                selected={isSelected}
                severity={log?.severity}
                color="#C2185B"
                isFavorite={favorites.includes(symptom.id)}
                onPress={() => handleSymptomPress(category, symptom)}
                onLongPress={() => handleSymptomLongPress(symptom)}
              />
            );
          })}
        </View>
      </GlassSurface>
    </Animated.View>
  );

  return (
    <AppGradient style={styles.container}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <View>
          <ThemedText type="h2" style={{ color: theme.text }}>Daily Check-in</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {new Date().toLocaleDateString('en-ZA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          <GlassSurface borderRadius={BorderRadius.full} padding={0} noPadding>
            <View style={styles.progressBadge}>
              <Feather name="check-circle" size={16} color="#C2185B" />
              <ThemedText type="small" style={{ color: "#C2185B", fontWeight: '600' }}>
                {loggedCount} logged
              </ThemedText>
            </View>
          </GlassSurface>
          <GlassSurface borderRadius={BorderRadius.md} padding={0} noPadding>
            <Pressable
              onPress={() => setShowCustomizeModal(true)}
              style={styles.settingsButton}
              testID="customize-symptoms"
            >
              <Feather name="sliders" size={18} color={theme.textSecondary} />
            </Pressable>
          </GlassSurface>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryStrip}
        style={styles.categoryStripContainer}
      >
        <Pressable
          onPress={() => { setViewMode('categories'); setActiveCategoryId(activeCategoryId === '__bodymap__' ? 'core-cycle' : activeCategoryId); }}
          style={[
            styles.viewModeChip,
            viewMode === 'categories' ? styles.viewModeChipActive : undefined,
          ]}
          testID="tab-categories"
        >
          <Feather name="grid" size={14} color={viewMode === 'categories' ? '#C2185B' : theme.textSecondary} />
          <ThemedText type="caption" style={{ color: viewMode === 'categories' ? '#C2185B' : theme.textSecondary, fontWeight: '600' }}>
            Symptoms
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => { setViewMode('bodymap'); setActiveCategoryId('__bodymap__'); }}
          style={[
            styles.viewModeChip,
            viewMode === 'bodymap' ? styles.viewModeChipActive : undefined,
          ]}
          testID="tab-bodymap"
        >
          <Feather name="user" size={14} color={viewMode === 'bodymap' ? '#C2185B' : theme.textSecondary} />
          <ThemedText type="caption" style={{ color: viewMode === 'bodymap' ? '#C2185B' : theme.textSecondary, fontWeight: '600' }}>
            Body Map
          </ThemedText>
        </Pressable>

        {viewMode === 'categories' ? (
          <View style={styles.categoryDivider} />
        ) : null}

        {viewMode === 'categories' ? (
          <>
            {favorites.length > 0 ? (
              <Pressable
                onPress={() => setActiveCategoryId('__favorites__')}
                style={[
                  styles.categoryPillBtn,
                  activeCategoryId === '__favorites__' ? styles.categoryPillBtnActive : undefined,
                ]}
                testID="category-pill-favorites"
              >
                <Feather name="star" size={14} color={activeCategoryId === '__favorites__' ? '#FFFFFF' : theme.tertiary} />
                <ThemedText type="caption" style={{ color: activeCategoryId === '__favorites__' ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
                  Favourites
                </ThemedText>
              </Pressable>
            ) : null}
            {getOrderedCategories().map(cat => {
              const isActive = activeCategoryId === cat.id;
              const catCount = getCategoryLoggedCount(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setActiveCategoryId(cat.id)}
                  style={[
                    styles.categoryPillBtn,
                    isActive ? styles.categoryPillBtnActive : undefined,
                  ]}
                  testID={`category-pill-${cat.id}`}
                >
                  <Feather name={cat.icon as any} size={14} color={isActive ? '#FFFFFF' : '#C2185B'} />
                  <ThemedText
                    type="caption"
                    style={{ color: isActive ? '#FFFFFF' : theme.text, fontWeight: '600' }}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </ThemedText>
                  {catCount > 0 ? (
                    <View style={[
                      styles.categoryCountBadge,
                      { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(194,24,91,0.15)' },
                    ]}>
                      <ThemedText type="caption" style={{ color: isActive ? '#FFFFFF' : '#C2185B', fontWeight: '700', fontSize: 10 }}>
                        {catCount}
                      </ThemedText>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </>
        ) : null}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + TabBarSpacing.totalHeight + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'categories' ? (
          <Animated.View key={activeCategoryId} entering={FadeInDown.duration(200)}>
            {activeCategoryId === '__favorites__' ? (
              <GlassSurface borderRadius={BorderRadius.lg} padding={Spacing.md} style={styles.favoritesSection}>
                <View style={styles.favoritesHeader}>
                  <Feather name="star" size={16} color={theme.tertiary} />
                  <ThemedText type="h4" style={{ color: theme.tertiary }}>
                    Quick Access
                  </ThemedText>
                </View>
                <View style={styles.symptomsGrid}>
                  {SYMPTOM_CATEGORIES.flatMap(cat =>
                    cat.items
                      .filter(item => favorites.includes(item.id))
                      .map(symptom => {
                        const symKey = `${cat.id}-${symptom.id}`;
                        const isSelected = selectedSymptoms.has(symKey);
                        const log = selectedSymptoms.get(symKey);
                        return (
                          <SymptomChip
                            key={`fav-${symptom.id}`}
                            label={symptom.name}
                            icon={symptom.icon as any}
                            selected={isSelected}
                            severity={log?.severity}
                            color={cat.color}
                            isFavorite
                            onPress={() => handleSymptomPress(cat, symptom)}
                          />
                        );
                      })
                  )}
                </View>
              </GlassSurface>
            ) : activeCategory ? (
              renderCategorySection(activeCategory, 0)
            ) : null}
          </Animated.View>
        ) : viewMode === 'bodymap' ? (
          <View style={styles.bodyMapContainer}>
            <ThemedText type="h3" style={styles.bodyMapTitle}>
              Pain Mapping
            </ThemedText>
            <ThemedText type="small" style={[styles.bodyMapSubtitle, { color: theme.textSecondary }]}>
              Show us where it hurts, we're listening
            </ThemedText>
            <BodyMap
              painPoints={painPoints}
              onAddPainPoint={handleAddPainPoint}
              onRemovePainPoint={handleRemovePainPoint}
              date={today}
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.saveButtonContainer, { bottom: insets.bottom + TabBarSpacing.totalHeight + Spacing.md }]}>
        <GlassSurface borderRadius={ButtonSpacing.radius} padding={0} noPadding>
          <Pressable 
            onPress={handleSaveCheckIn} 
            testID="save-checkin"
            style={styles.saveButton}
          >
            <ThemedText style={[styles.saveButtonText, { color: "#C2185B" }]}>SAVE TODAY'S CHECK-IN</ThemedText>
          </Pressable>
        </GlassSurface>
      </View>

      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{currentSymptom?.name}</ThemedText>
              <Pressable onPress={() => setShowDetailModal(false)} testID="close-symptom-modal">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Severity
            </ThemedText>
            <SeveritySlider
              value={currentSeverity}
              onChange={setCurrentSeverity}
              color={selectedCategory?.color}
            />

            <TagSelector selectedTags={currentTags} onTagsChange={setCurrentTags} />

            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Notes (optional)
            </ThemedText>
            <TextInput
              value={currentNotes}
              onChangeText={setCurrentNotes}
              placeholder="Add any additional notes..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.notesInput,
                {
                  backgroundColor: isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.20)",
                  borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.35)",
                  color: theme.text,
                },
              ]}
              testID="symptom-notes-input"
            />

            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <Pressable
                onPress={() => {
                  if (currentSymptom) {
                    toggleHideSymptom(currentSymptom.id);
                    setShowDetailModal(false);
                  }
                }}
                style={[styles.hideButton, { borderColor: theme.textSecondary }]}
                testID="hide-symptom"
              >
                <Feather name="eye-off" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Hide</ThemedText>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button onPress={saveSymptomDetail} testID="save-symptom-detail">
                  {currentSeverity > 0 ? 'Save' : 'Clear'}
                </Button>
              </View>
            </View>
            {currentSymptom && selectedCategory && selectedSymptoms.has(`${selectedCategory.id}-${currentSymptom.id}`) ? (
              <Pressable
                onPress={() => {
                  const key = `${selectedCategory!.id}-${currentSymptom!.id}`;
                  const newMap = new Map(selectedSymptoms);
                  newMap.delete(key);
                  setSelectedSymptoms(newMap);
                  setShowDetailModal(false);
                  setCurrentSymptom(null);
                }}
                style={[styles.removeSymptomButton, { borderColor: theme.error || '#F44336' }]}
                testID="remove-symptom"
              >
                <Feather name="x-circle" size={16} color={theme.error || '#F44336'} />
                <ThemedText type="small" style={{ color: theme.error || '#F44336' }}>Clear this one</ThemedText>
              </Pressable>
            ) : null}
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={showCustomizeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCustomizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.background, maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Customize Symptoms</ThemedText>
              <Pressable onPress={() => setShowCustomizeModal(false)} testID="close-customize-modal">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
              Long-press any symptom to add it to Quick Access. Hidden symptoms appear below.
            </ThemedText>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.customizeSection}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Hidden Symptoms ({hiddenSymptoms.length})
                </ThemedText>
                {hiddenSymptoms.length === 0 ? (
                  <View style={styles.emptyHidden}>
                    <Feather name="eye" size={32} color={theme.textSecondary} style={{ marginBottom: Spacing.sm }} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                      No hidden symptoms. All symptoms are visible.
                    </ThemedText>
                  </View>
                ) : (
                  SYMPTOM_CATEGORIES.flatMap(cat =>
                    cat.items
                      .filter(item => hiddenSymptoms.includes(item.id))
                      .map(symptom => (
                        <View
                          key={symptom.id}
                          style={[styles.customizeItem, { borderColor: theme.border }]}
                        >
                          <View style={styles.customizeItemLeft}>
                            <Feather name={symptom.icon as any} size={18} color={cat.color} />
                            <View>
                              <ThemedText>{symptom.name}</ThemedText>
                              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                                {cat.name}
                              </ThemedText>
                            </View>
                          </View>
                          <Pressable onPress={() => toggleHideSymptom(symptom.id)} testID={`restore-${symptom.id}`}>
                            <Feather name="eye" size={20} color="#C2185B" />
                          </Pressable>
                        </View>
                      ))
                  )
                )}
              </View>

              <View style={styles.customizeSection}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Quick Access ({favorites.length})
                </ThemedText>
                {favorites.length === 0 ? (
                  <View style={styles.emptyHidden}>
                    <Feather name="star" size={32} color={theme.textSecondary} style={{ marginBottom: Spacing.sm }} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                      Long-press any symptom to add it to Quick Access.
                    </ThemedText>
                  </View>
                ) : (
                  SYMPTOM_CATEGORIES.flatMap(cat =>
                    cat.items
                      .filter(item => favorites.includes(item.id))
                      .map(symptom => (
                        <View
                          key={`fav-${symptom.id}`}
                          style={[styles.customizeItem, { borderColor: theme.border }]}
                        >
                          <View style={styles.customizeItemLeft}>
                            <Feather name={symptom.icon as any} size={18} color={cat.color} />
                            <View>
                              <ThemedText>{symptom.name}</ThemedText>
                              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                                {cat.name}
                              </ThemedText>
                            </View>
                          </View>
                          <Pressable onPress={() => handleSymptomLongPress(symptom)} testID={`unfav-${symptom.id}`}>
                            <Feather name="star" size={20} color={theme.tertiary} />
                          </Pressable>
                        </View>
                      ))
                  )
                )}
              </View>

              <View style={styles.customizeSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
                  <ThemedText type="h4">Custom Symptoms ({customSymptoms.length})</ThemedText>
                  <Pressable
                    onPress={() => setShowAddCustom(!showAddCustom)}
                    style={[styles.addButton, { backgroundColor: "rgba(194,24,91,0.10)" }]}
                    testID="add-custom-symptom"
                  >
                    <Feather name={showAddCustom ? 'minus' : 'plus'} size={18} color="#C2185B" />
                  </Pressable>
                </View>
                {showAddCustom ? (
                  <View style={[styles.addCustomForm, { backgroundColor: isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.18)", borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.30)" }]}>
                    <TextInput
                      value={newCustomName}
                      onChangeText={setNewCustomName}
                      placeholder="Symptom name..."
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.customInput, { backgroundColor: isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.20)", borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.35)", color: theme.text }]}
                      testID="custom-symptom-name"
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                      <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                        {SYMPTOM_CATEGORIES.slice(0, 6).map(cat => (
                          <Pressable
                            key={cat.id}
                            onPress={() => setNewCustomCategory(cat.id)}
                            style={[
                              styles.categoryPill,
                              {
                                backgroundColor: newCustomCategory === cat.id ? cat.color : `${cat.color}20`,
                                borderColor: cat.color,
                              },
                            ]}
                          >
                            <ThemedText type="caption" style={{ color: newCustomCategory === cat.id ? '#fff' : cat.color }}>
                              {cat.name.split(' ')[0]}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                    <Pressable
                      onPress={handleAddCustomSymptom}
                      style={[styles.addCustomButton, { backgroundColor: "#C2185B" }]}
                      testID="save-custom-symptom"
                    >
                      <ThemedText type="small" style={{ color: theme.buttonText, fontWeight: '600' }}>Add Symptom</ThemedText>
                    </Pressable>
                  </View>
                ) : customSymptoms.length === 0 ? (
                  <View style={styles.emptyHidden}>
                    <Feather name="plus-circle" size={32} color={theme.textSecondary} style={{ marginBottom: Spacing.sm }} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                      Add your own symptoms to track things unique to you.
                    </ThemedText>
                  </View>
                ) : (
                  customSymptoms.map(symptom => (
                    <View key={symptom.id} style={[styles.customizeItem, { borderColor: theme.border }]}>
                      <View style={styles.customizeItemLeft}>
                        <Feather name="plus" size={18} color="#C2185B" />
                        <View>
                          <ThemedText>{symptom.name}</ThemedText>
                          <ThemedText type="caption" style={{ color: theme.textSecondary }}>Custom</ThemedText>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={[styles.demoSection, { borderTopColor: theme.border }]}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>Demo Mode</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                  Load 60 days of sample data to explore patterns and insights.
                </ThemedText>
                <Pressable
                  onPress={handleLoadDemoData}
                  style={[styles.demoButton, { borderColor: theme.tertiary }]}
                  disabled={loadingDemo}
                  testID="load-demo-data"
                >
                  <Feather name="database" size={18} color={theme.tertiary} />
                  <ThemedText type="small" style={{ color: theme.tertiary, fontWeight: '600' }}>
                    {loadingDemo ? 'Loading...' : 'Load Demo Data'}
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: Spacing.sm,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  favoritesSection: {
    marginBottom: Spacing.lg,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryStripContainer: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: Spacing.sm,
  },
  categoryStrip: {
    paddingHorizontal: ScreenPadding.horizontal,
    gap: 6,
    alignItems: 'center',
  },
  viewModeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  viewModeChipActive: {
    borderColor: 'rgba(194,24,91,0.3)',
    backgroundColor: 'rgba(194,24,91,0.08)',
  },
  categoryDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E8D5DC',
    marginHorizontal: 2,
  },
  categoryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: '#F0E0E8',
  },
  categoryPillBtnActive: {
    backgroundColor: '#C2185B',
    borderColor: '#C2185B',
  },
  categoryCountBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  categorySectionOuter: {
    marginBottom: CardSpacing.gap,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PillSpacing.gap,
  },
  bodyMapContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  bodyMapTitle: {
    marginBottom: Spacing.xs,
  },
  bodyMapSubtitle: {
    marginBottom: Spacing.xl,
  },
  saveButtonContainer: {
    position: 'absolute',
    left: ScreenPadding.horizontal,
    right: ScreenPadding.horizontal,
  },
  saveButton: {
    height: ButtonSpacing.height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)', // QA: Subtle dim backdrop
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28, // QA: Rounded top corners for modal sheet
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingBottom: Spacing["3xl"], // QA: Extra bottom padding for home indicator
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.xl,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsButton: {
    width: 44, // QA: Minimum 44x44 tap target
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizeSection: {
    marginBottom: Spacing.lg,
  },
  customizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  customizeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  emptyHidden: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  hideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  removeSymptomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomForm: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryPill: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  addCustomButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  demoSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    marginTop: Spacing.md,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
});
