import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { SymptomChip } from '@/components/SymptomChip';
import { SeveritySlider } from '@/components/SeveritySlider';
import { TagSelector } from '@/components/TagSelector';
import { BodyMap } from '@/components/BodyMap';
import { AfricanPattern } from '@/components/AfricanPattern';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
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
} from '@/lib/symptomStorage';

type ViewMode = 'categories' | 'bodymap' | 'patterns';

export default function CheckInScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const today = new Date().toISOString().split('T')[0];

  const [viewMode, setViewMode] = useState<ViewMode>('categories');
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

  const handleSaveCheckIn = async () => {
    const symptoms = Array.from(selectedSymptoms.values());
    await saveDailyCheckIn({
      date: today,
      symptoms,
      painPoints,
      completedAt: Date.now(),
    });
  };

  const loggedCount = selectedSymptoms.size + painPoints.length;

  const renderCategorySection = (category: SymptomCategory, index: number) => (
    <Animated.View
      key={category.id}
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={[styles.categorySection, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
          <Feather name={category.icon as any} size={18} color={category.color} />
        </View>
        <ThemedText type="h4" style={{ flex: 1 }}>{category.name}</ThemedText>
        {category.isPCOS ? (
          <View style={[styles.badge, { backgroundColor: `${theme.primary}20` }]}>
            <ThemedText type="caption" style={{ color: theme.primary }}>PCOS</ThemedText>
          </View>
        ) : null}
        {category.isEndometriosis ? (
          <View style={[styles.badge, { backgroundColor: `${theme.accent}20` }]}>
            <ThemedText type="caption" style={{ color: theme.accent }}>Endo</ThemedText>
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
              color={category.color}
              isFavorite={favorites.includes(symptom.id)}
              onPress={() => handleSymptomPress(category, symptom)}
              onLongPress={() => handleSymptomLongPress(symptom)}
            />
          );
        })}
      </View>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <AfricanPattern variant="dots" opacity={0.02} />

      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <View>
          <ThemedText type="h2">Daily Check-in</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {new Date().toLocaleDateString('en-ZA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.progressBadge, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name="check-circle" size={16} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>
              {loggedCount} logged
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setShowCustomizeModal(true)}
            style={[styles.settingsButton, { backgroundColor: `${theme.textSecondary}15` }]}
            testID="customize-symptoms"
          >
            <Feather name="sliders" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.viewTabs}>
        <Pressable
          onPress={() => setViewMode('categories')}
          style={[
            styles.viewTab,
            {
              backgroundColor: viewMode === 'categories' ? theme.primary : 'transparent',
              borderColor: theme.primary,
            },
          ]}
          testID="tab-categories"
        >
          <Feather
            name="grid"
            size={16}
            color={viewMode === 'categories' ? theme.buttonText : theme.primary}
          />
          <ThemedText
            type="small"
            style={{ color: viewMode === 'categories' ? theme.buttonText : theme.primary }}
          >
            Symptoms
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('bodymap')}
          style={[
            styles.viewTab,
            {
              backgroundColor: viewMode === 'bodymap' ? theme.secondary : 'transparent',
              borderColor: theme.secondary,
            },
          ]}
          testID="tab-bodymap"
        >
          <Feather
            name="user"
            size={16}
            color={viewMode === 'bodymap' ? theme.buttonText : theme.secondary}
          />
          <ThemedText
            type="small"
            style={{ color: viewMode === 'bodymap' ? theme.buttonText : theme.secondary }}
          >
            Body Map
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + Spacing.xl + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'categories' ? (
          <>
            {favorites.length > 0 ? (
              <View style={[styles.favoritesSection, { backgroundColor: `${theme.tertiary}10` }]}>
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
                        const key = `${cat.id}-${symptom.id}`;
                        const isSelected = selectedSymptoms.has(key);
                        const log = selectedSymptoms.get(key);
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
              </View>
            ) : null}

            {getOrderedCategories().map((category, index) => renderCategorySection(category, index))}
          </>
        ) : viewMode === 'bodymap' ? (
          <View style={styles.bodyMapContainer}>
            <ThemedText type="h3" style={styles.bodyMapTitle}>
              Pain Mapping
            </ThemedText>
            <ThemedText type="small" style={[styles.bodyMapSubtitle, { color: theme.textSecondary }]}>
              Track where you feel pain and discomfort
            </ThemedText>
            <BodyMap
              painPoints={painPoints}
              onAddPainPoint={handleAddPainPoint}
              date={today}
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.saveButtonContainer, { bottom: tabBarHeight + Spacing.lg }]}>
        <Button onPress={handleSaveCheckIn} testID="save-checkin">
          Save Today's Check-in
        </Button>
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
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
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
                            <Feather name="eye" size={20} color={theme.primary} />
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
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  viewTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  favoritesSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categorySection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
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
    gap: Spacing.sm,
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
    left: Spacing.xl,
    right: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
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
    width: 36,
    height: 36,
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
});
