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
const SVG_VB_W = 100;
const SVG_VB_H = 145;
const MAP_HEIGHT = MAP_WIDTH * (SVG_VB_H / SVG_VB_W);

interface BodyMapProps {
  painPoints: BodyPainPoint[];
  onAddPainPoint: (painPoint: Omit<BodyPainPoint, 'id' | 'timestamp'>) => void;
  onRemovePainPoint?: (painPointId: string) => void;
  date: string;
}

const FRONT_BODY = `
  M50 4 C57 4 62 10 62 20 C62 29 57 33 50 33 C43 33 38 29 38 20 C38 10 43 4 50 4
  M50 33 L50 36 C50 36 38 39 33 51 C28 62 30 80 32 90 L32 91 L35 91 L35 106 L37 139 L46 139 L46 106 L54 106 L54 139 L63 139 L65 106 L65 91 L68 91 L68 90 C70 80 72 62 67 51 C62 39 50 36 50 36
`;

const BACK_BODY = `
  M50 4 C57 4 62 10 62 20 C62 29 57 33 50 33 C43 33 38 29 38 20 C38 10 43 4 50 4
  M50 33 L50 36 C50 36 38 39 33 51 C28 62 30 80 32 90 L32 91 L35 91 L35 106 L37 139 L46 139 L46 106 L54 106 L54 139 L63 139 L65 106 L65 91 L68 91 L68 90 C70 80 72 62 67 51 C62 39 50 36 50 36
  M40 44 L60 44 M40 65 L60 65
`;

const LABEL_FONT = 3.2;
const SEVERITY_FONT = 4;

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
  const outlineColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
  const fillColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const zoneDefaultBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const zoneBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const labelColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

  return (
    <View style={styles.container}>
      <View style={[styles.viewToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
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
            const border = pain ? getSeverityColor(pain.severity, 0.6) : zoneBorder;

            return (
              <React.Fragment key={region.id}>
                <Rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={2}
                  ry={2}
                  fill={bg}
                  stroke={border}
                  strokeWidth={pain ? 0.6 : 0.3}
                />
                {pain ? (
                  <SvgText
                    x={x + w / 2}
                    y={y + h / 2 + SEVERITY_FONT * 0.35}
                    textAnchor="middle"
                    fontSize={SEVERITY_FONT}
                    fontWeight="700"
                    fill={getSeverityColor(pain.severity, 1)}
                  >
                    {pain.severity}
                  </SvgText>
                ) : null}
                <SvgText
                  x={region.labelSide === 'left' ? x - 1.5 : region.labelSide === 'right' ? x + w + 1.5 : x + w / 2}
                  y={y + h / 2 + LABEL_FONT * 0.35}
                  textAnchor={region.labelSide === 'left' ? 'end' : region.labelSide === 'right' ? 'start' : 'middle'}
                  fontSize={LABEL_FONT}
                  fill={pain ? getSeverityColor(pain.severity, 0.8) : labelColor}
                  fontWeight={pain ? '600' : '400'}
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
            const rawW = (w / SVG_VB_W) * MAP_WIDTH;
            const rawH = (h / SVG_VB_H) * MAP_HEIGHT;
            const pxW = Math.max(rawW, 44);
            const pxH = Math.max(rawH, 44);
            const pxX = (x / SVG_VB_W) * MAP_WIDTH - (pxW - rawW) / 2;
            const pxY = (y / SVG_VB_H) * MAP_HEIGHT - (pxH - rawH) / 2;

            return (
              <Pressable
                key={region.id}
                onPress={() => handleRegionPress(region)}
                style={[
                  styles.touchZone,
                  {
                    left: pxX,
                    top: pxY,
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
              The body report
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

            <View style={styles.severityLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(76, 175, 80, 1)' }]} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>Mild</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(255, 152, 0, 1)' }]} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>Moderate</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(244, 67, 54, 1)' }]} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>Severe</ThemedText>
              </View>
            </View>
          </View>
        ) : (
          <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
            Your body has opinions — tap a spot to start listening
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
                What kind of feeling is it?
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
                On a scale of "meh" to "send help"
              </ThemedText>
              <SeveritySlider
                value={severity}
                onChange={setSeverity}
                color={severity > 0 ? getSeverityColor(severity) : theme.secondary}
              />

              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                How long has this been going?
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
                {getRegionPain(selectedRegion?.id || '') ? 'Update, noted' : 'Noted, queen'}
              </Button>

              {getRegionPain(selectedRegion?.id || '') && onRemovePainPoint ? (
                <Pressable
                  onPress={handleRemove}
                  style={styles.removeButton}
                  testID="remove-pain-point"
                >
                  <Feather name="trash-2" size={16} color={theme.error || '#F44336'} />
                  <ThemedText type="small" style={{ color: theme.error || '#F44336' }}>
                    Nevermind, clear this
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
  severityLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
