import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, Modal, ScrollView, Dimensions } from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Button } from './Button';
import { SeveritySlider } from './SeveritySlider';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { BODY_REGIONS, PAIN_TYPES, PAIN_DURATIONS, BodyPainPoint, BodyView, BodyRegion } from '@/lib/symptomSchema';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
const MAP_HEIGHT = MAP_WIDTH * 1.45;
const SVG_VB_W = 100;
const SVG_VB_H = 100;

interface BodyMapProps {
  painPoints: BodyPainPoint[];
  onAddPainPoint: (painPoint: Omit<BodyPainPoint, 'id' | 'timestamp'>) => void;
  onRemovePainPoint?: (painPointId: string) => void;
  date: string;
}

const FRONT_BODY = `
  M50 3 C57 3 62 7 62 14 C62 20 57 23 50 23 C43 23 38 20 38 14 C38 7 43 3 50 3
  M50 23 L50 25 C50 25 38 27 33 35 C28 43 30 55 32 62 L32 63 L35 63 L35 73 L37 96 L46 96 L46 73 L54 73 L54 96 L63 96 L65 73 L65 63 L68 63 L68 62 C70 55 72 43 67 35 C62 27 50 25 50 25
`;

const BACK_BODY = `
  M50 3 C57 3 62 7 62 14 C62 20 57 23 50 23 C43 23 38 20 38 14 C38 7 43 3 50 3
  M50 23 L50 25 C50 25 38 27 33 35 C28 43 30 55 32 62 L32 63 L35 63 L35 73 L37 96 L46 96 L46 73 L54 73 L54 96 L63 96 L65 73 L65 63 L68 63 L68 62 C70 55 72 43 67 35 C62 27 50 25 50 25
  M40 30 L60 30 M40 45 L60 45
`;

function getSeverityColor(severity: number, opacity = 1): string {
  if (severity <= 3) return `rgba(76, 175, 80, ${opacity})`;
  if (severity <= 6) return `rgba(255, 152, 0, ${opacity})`;
  return `rgba(244, 67, 54, ${opacity})`;
}

function getSeverityLabel(severity: number): string {
  if (severity <= 3) return 'Mild';
  if (severity <= 6) return 'Moderate';
  return 'Severe';
}

export function BodyMap({ painPoints, onAddPainPoint, onRemovePainPoint, date }: BodyMapProps) {
  const { theme, isDark } = useTheme();
  const [activeView, setActiveView] = useState<BodyView>('front');
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [painType, setPainType] = useState<string>('');
  const [severity, setSeverity] = useState(0);
  const [duration, setDuration] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const visibleRegions = useMemo(
    () => BODY_REGIONS.filter(r => r.view === activeView),
    [activeView]
  );

  const frontCount = useMemo(
    () => painPoints.filter(p => BODY_REGIONS.find(r => r.id === p.region)?.view === 'front').length,
    [painPoints]
  );
  const backCount = useMemo(
    () => painPoints.filter(p => BODY_REGIONS.find(r => r.id === p.region)?.view === 'back').length,
    [painPoints]
  );

  const getRegionPain = (regionId: string): BodyPainPoint | undefined => {
    return painPoints.find(p => p.region === regionId);
  };

  const handleRegionPress = (region: BodyRegion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRegion(region);
    const existing = getRegionPain(region.id);
    if (existing) {
      setPainType(existing.painType);
      setSeverity(existing.severity);
      setDuration(existing.duration || '');
    } else {
      setPainType('');
      setSeverity(0);
      setDuration('');
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedRegion && painType && severity > 0) {
      const existing = getRegionPain(selectedRegion.id);
      if (existing) {
        if (!onRemovePainPoint) return;
        onRemovePainPoint(existing.id);
      }
      onAddPainPoint({
        date,
        region: selectedRegion.id,
        painType,
        severity,
        duration: duration || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
      setSelectedRegion(null);
    }
  };

  const handleRemove = () => {
    if (selectedRegion && onRemovePainPoint) {
      const existing = getRegionPain(selectedRegion.id);
      if (existing) {
        onRemovePainPoint(existing.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
    setShowModal(false);
    setSelectedRegion(null);
  };

  const bodyOutline = activeView === 'front' ? FRONT_BODY : BACK_BODY;
  const outlineColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';
  const fillColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const zoneDefaultBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const zoneBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <Pressable
          onPress={() => setActiveView('front')}
          style={[
            styles.toggleTab,
            activeView === 'front' ? [styles.toggleActive, { backgroundColor: isDark ? 'rgba(194,24,91,0.2)' : 'rgba(194,24,91,0.1)' }] : undefined,
          ]}
          testID="bodymap-toggle-front"
        >
          <ThemedText
            type="small"
            style={[
              styles.toggleText,
              { color: activeView === 'front' ? '#C2185B' : theme.textSecondary },
            ]}
          >
            Front{frontCount > 0 ? ` (${frontCount})` : ''}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveView('back')}
          style={[
            styles.toggleTab,
            activeView === 'back' ? [styles.toggleActive, { backgroundColor: isDark ? 'rgba(194,24,91,0.2)' : 'rgba(194,24,91,0.1)' }] : undefined,
          ]}
          testID="bodymap-toggle-back"
        >
          <ThemedText
            type="small"
            style={[
              styles.toggleText,
              { color: activeView === 'back' ? '#C2185B' : theme.textSecondary },
            ]}
          >
            Back{backCount > 0 ? ` (${backCount})` : ''}
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.mapContainer, { backgroundColor: isDark ? 'rgba(42,23,48,0.3)' : 'rgba(255,255,255,0.6)' }]}>
        <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${SVG_VB_W} ${SVG_VB_H}`}>
          <Path
            d={bodyOutline}
            fill={fillColor}
            stroke={outlineColor}
            strokeWidth="0.4"
          />

          {visibleRegions.map((region) => {
            const pain = getRegionPain(region.id);
            const { x, y, w, h } = region.zone;
            const bg = pain ? getSeverityColor(pain.severity, 0.25) : zoneDefaultBg;
            const border = pain ? getSeverityColor(pain.severity, 0.5) : zoneBorder;
            const labelX = region.labelSide === 'left' ? x - 1 : region.labelSide === 'right' ? x + w + 1 : x + w / 2;
            const labelAnchor = region.labelSide === 'left' ? 'end' : region.labelSide === 'right' ? 'start' : 'middle';
            const labelY = y + h / 2 + 1;

            return (
              <React.Fragment key={region.id}>
                <Rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={1.5}
                  ry={1.5}
                  fill={bg}
                  stroke={border}
                  strokeWidth={pain ? 0.5 : 0.3}
                />
                {pain ? (
                  <SvgText
                    x={x + w / 2}
                    y={y + h / 2 + 1.2}
                    textAnchor="middle"
                    fontSize={3.5}
                    fontWeight="700"
                    fill={getSeverityColor(pain.severity, 1)}
                  >
                    {pain.severity}
                  </SvgText>
                ) : null}
                <SvgText
                  x={labelX}
                  y={labelY}
                  textAnchor={labelAnchor}
                  fontSize={2.2}
                  fill={labelColor}
                >
                  {region.name}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        <View style={styles.touchOverlay}>
          {visibleRegions.map((region) => {
            const { x, y, w, h } = region.zone;
            const pxX = (x / SVG_VB_W) * MAP_WIDTH;
            const pxY = (y / SVG_VB_H) * MAP_HEIGHT;
            const pxW = Math.max((w / SVG_VB_W) * MAP_WIDTH, 44);
            const pxH = Math.max((h / SVG_VB_H) * MAP_HEIGHT, 44);
            const offsetX = pxW > (w / SVG_VB_W) * MAP_WIDTH ? ((pxW - (w / SVG_VB_W) * MAP_WIDTH) / 2) : 0;
            const offsetY = pxH > (h / SVG_VB_H) * MAP_HEIGHT ? ((pxH - (h / SVG_VB_H) * MAP_HEIGHT) / 2) : 0;

            return (
              <Pressable
                key={region.id}
                onPress={() => handleRegionPress(region)}
                style={[
                  styles.touchZone,
                  {
                    left: pxX - offsetX,
                    top: pxY - offsetY,
                    width: pxW,
                    height: pxH,
                  },
                ]}
                testID={`body-region-${region.id}`}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        {painPoints.length > 0 ? (
          <View style={styles.summaryList}>
            <ThemedText type="small" style={[styles.summaryTitle, { color: theme.textSecondary }]}>
              Logged Pain Points
            </ThemedText>
            {painPoints.map((point) => {
              const region = BODY_REGIONS.find(r => r.id === point.region);
              if (!region) return null;
              return (
                <Pressable
                  key={point.id}
                  onPress={() => {
                    if (region.view !== activeView) setActiveView(region.view);
                    handleRegionPress(region);
                  }}
                  style={[styles.summaryRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}
                  testID={`summary-${point.region}`}
                >
                  <View style={[styles.severityDot, { backgroundColor: getSeverityColor(point.severity) }]}>
                    <ThemedText type="caption" style={styles.severityDotText}>
                      {point.severity}
                    </ThemedText>
                  </View>
                  <View style={styles.summaryInfo}>
                    <ThemedText type="small" style={{ color: theme.text, fontWeight: '600' }}>
                      {region.name}
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {point.painType} · {getSeverityLabel(point.severity)}{point.duration ? ` · ${point.duration}` : ''}
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={14} color={theme.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Tap a region on the body to log pain
          </ThemedText>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={[styles.modalRegionDot, { backgroundColor: getRegionPain(selectedRegion?.id || '')
                  ? getSeverityColor(getRegionPain(selectedRegion?.id || '')!.severity)
                  : theme.primary
                }]} />
                <ThemedText type="h3">{selectedRegion?.name}</ThemedText>
              </View>
              <Pressable
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
                testID="close-pain-modal"
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Pain Type
              </ThemedText>
              <View style={styles.optionGrid}>
                {PAIN_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setPainType(type);
                    }}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: painType === type
                          ? (isDark ? 'rgba(194,24,91,0.25)' : 'rgba(194,24,91,0.12)')
                          : theme.backgroundSecondary,
                        borderColor: painType === type ? '#C2185B' : theme.border,
                      },
                    ]}
                    testID={`pain-type-${type}`}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color: painType === type ? '#C2185B' : theme.text,
                        fontWeight: painType === type ? '600' : '400',
                        textTransform: 'capitalize',
                      }}
                    >
                      {type}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Severity
              </ThemedText>
              <SeveritySlider
                value={severity}
                onChange={setSeverity}
                color={severity > 0 ? getSeverityColor(severity) : theme.secondary}
              />

              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Duration
              </ThemedText>
              <View style={styles.optionGrid}>
                {PAIN_DURATIONS.map((dur) => (
                  <Pressable
                    key={dur}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDuration(dur);
                    }}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: duration === dur
                          ? (isDark ? 'rgba(90,138,106,0.25)' : 'rgba(90,138,106,0.12)')
                          : theme.backgroundSecondary,
                        borderColor: duration === dur ? '#5A8A6A' : theme.border,
                      },
                    ]}
                    testID={`pain-duration-${dur}`}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color: duration === dur ? '#5A8A6A' : theme.text,
                        fontWeight: duration === dur ? '600' : '400',
                        textTransform: 'capitalize',
                      }}
                    >
                      {dur}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                onPress={handleSave}
                disabled={!painType || severity === 0}
                style={styles.saveButton}
                testID="save-pain-point"
              >
                {getRegionPain(selectedRegion?.id || '') ? 'Update Pain Point' : 'Save Pain Point'}
              </Button>

              {getRegionPain(selectedRegion?.id || '') && onRemovePainPoint ? (
                <Pressable
                  onPress={handleRemove}
                  style={styles.removeButton}
                  testID="remove-pain-point"
                >
                  <Feather name="trash-2" size={16} color={theme.error || '#F44336'} />
                  <ThemedText type="small" style={{ color: theme.error || '#F44336' }}>
                    Remove Pain Point
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    padding: 2,
    marginBottom: Spacing.lg,
    alignSelf: 'center',
  },
  toggleTab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  toggleActive: {
    borderRadius: 10,
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  mapContainer: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchZone: {
    position: 'absolute',
  },
  legend: {
    marginTop: Spacing.lg,
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  summaryList: {
    gap: 8,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    gap: 12,
  },
  severityDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityDotText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  summaryInfo: {
    flex: 1,
    gap: 2,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalRegionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flexGrow: 0,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalActions: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  saveButton: {
    width: '100%',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
});
