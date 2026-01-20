import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Button } from './Button';
import { SeveritySlider } from './SeveritySlider';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { BODY_REGIONS, PAIN_TYPES, PAIN_DURATIONS, BodyPainPoint } from '@/lib/symptomSchema';

interface BodyMapProps {
  painPoints: BodyPainPoint[];
  onAddPainPoint: (painPoint: Omit<BodyPainPoint, 'id' | 'timestamp'>) => void;
  date: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function BodyMap({ painPoints, onAddPainPoint, date }: BodyMapProps) {
  const { theme } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<typeof BODY_REGIONS[number] | null>(null);
  const [painType, setPainType] = useState<string>('');
  const [severity, setSeverity] = useState(0);
  const [duration, setDuration] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const handleRegionPress = (region: typeof BODY_REGIONS[number]) => {
    setSelectedRegion(region);
    setPainType('');
    setSeverity(0);
    setDuration('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedRegion && painType && severity > 0) {
      onAddPainPoint({
        date,
        region: selectedRegion.id,
        painType,
        severity,
        duration: duration || undefined,
      });
      setShowModal(false);
      setSelectedRegion(null);
    }
  };

  const getRegionPainLevel = (regionId: string): number => {
    const regionPain = painPoints.find(p => p.region === regionId);
    return regionPain?.severity || 0;
  };

  const getPainColor = (level: number): string => {
    if (level === 0) return 'transparent';
    const opacity = 0.2 + (level * 0.15);
    return `rgba(196, 130, 107, ${opacity})`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Svg width="200" height="320" viewBox="0 0 100 160">
          <Path
            d="M50 5 C60 5 65 10 65 20 C65 28 60 32 50 32 C40 32 35 28 35 20 C35 10 40 5 50 5"
            fill={theme.cardBackground}
            stroke={theme.border}
            strokeWidth="0.5"
          />
          
          <Path
            d="M50 32 L50 35 C50 35 35 38 30 50 C25 62 28 80 30 90 L35 90 L35 130 L45 130 L45 155 L55 155 L55 130 L65 130 L65 90 L70 90 C72 80 75 62 70 50 C65 38 50 35 50 35"
            fill={theme.cardBackground}
            stroke={theme.border}
            strokeWidth="0.5"
          />
          
          {BODY_REGIONS.map((region) => {
            const painLevel = getRegionPainLevel(region.id);
            return (
              <G key={region.id}>
                <Circle
                  cx={region.x}
                  cy={region.y}
                  r={painLevel > 0 ? 6 + painLevel : 5}
                  fill={getPainColor(painLevel)}
                  stroke={painLevel > 0 ? theme.secondary : 'transparent'}
                  strokeWidth={painLevel > 0 ? 1 : 0}
                  onPress={() => handleRegionPress(region)}
                />
                {painLevel > 0 ? (
                  <Circle
                    cx={region.x}
                    cy={region.y}
                    r={3 + painLevel}
                    fill={`${theme.secondary}40`}
                  />
                ) : null}
              </G>
            );
          })}
        </Svg>
        
        <View style={styles.touchOverlay}>
          {BODY_REGIONS.map((region) => (
            <Pressable
              key={region.id}
              onPress={() => handleRegionPress(region)}
              style={[
                styles.touchPoint,
                {
                  left: `${region.x - 5}%`,
                  top: `${region.y - 2}%`,
                },
              ]}
              testID={`body-region-${region.id}`}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.legend}>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Tap a body region to log pain
        </ThemedText>
        {painPoints.length > 0 ? (
          <View style={styles.painSummary}>
            <ThemedText type="small" style={{ color: theme.text }}>
              {painPoints.length} pain point{painPoints.length !== 1 ? 's' : ''} logged today
            </ThemedText>
          </View>
        ) : null}
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
              <ThemedText type="h3">{selectedRegion?.name}</ThemedText>
              <Pressable onPress={() => setShowModal(false)} testID="close-pain-modal">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Pain Type
              </ThemedText>
              <View style={styles.optionGrid}>
                {PAIN_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setPainType(type)}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: painType === type ? theme.primary : theme.backgroundSecondary,
                        borderColor: painType === type ? theme.primary : theme.border,
                      },
                    ]}
                    testID={`pain-type-${type}`}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: painType === type ? theme.buttonText : theme.text }}
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
                color={theme.secondary}
              />

              <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Duration
              </ThemedText>
              <View style={styles.optionGrid}>
                {PAIN_DURATIONS.map((dur) => (
                  <Pressable
                    key={dur}
                    onPress={() => setDuration(dur)}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: duration === dur ? theme.tertiary : theme.backgroundSecondary,
                        borderColor: duration === dur ? theme.tertiary : theme.border,
                      },
                    ]}
                    testID={`pain-duration-${dur}`}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: duration === dur ? theme.buttonText : theme.text }}
                    >
                      {dur}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Button
              onPress={handleSave}
              disabled={!painType || severity === 0}
              style={styles.saveButton}
              testID="save-pain-point"
            >
              Save Pain Point
            </Button>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mapContainer: {
    width: 200,
    height: 320,
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
  touchPoint: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  legend: {
    marginTop: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  painSummary: {
    marginTop: Spacing.xs,
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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  saveButton: {
    marginTop: Spacing.xl,
  },
});
