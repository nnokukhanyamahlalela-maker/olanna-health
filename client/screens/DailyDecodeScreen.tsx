import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { AppGradient } from '@/components/AppGradient';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { RootStackParamList } from '@/navigation/RootStackNavigator';
import { DailyDecodeOutput } from '@/lib/dailyDecode';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyDecode'>;

const PINK_PRIMARY = '#F6BFD3';

export default function DailyDecodeScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const decode = route.params?.decode as DailyDecodeOutput;

  if (!decode) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.errorContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <Feather name="alert-circle" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>
            Hmm — that didn't load properly. Head back and try again, I've got you.
          </ThemedText>
          <Button onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${PINK_PRIMARY}30` }]}>
                <Feather name="sun" size={20} color={PINK_PRIMARY} />
              </View>
              <ThemedText style={styles.cardLabel}>TODAY'S VIBE</ThemedText>
            </View>
            <ThemedText style={[styles.vibeText, { color: theme.text }]}>
              {decode.vibeText}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#D1FAE530' }]}>
                <Feather name="activity" size={20} color="#10B981" />
              </View>
              <ThemedText style={styles.cardLabel}>WHAT I'D DO TODAY</ThemedText>
            </View>
            <ThemedText style={[styles.movementTitle, { color: theme.text }]}>
              {decode.movementTitle}
            </ThemedText>
            <ThemedText style={[styles.movementBody, { color: theme.textSecondary }]}>
              {decode.movementBody}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C730' }]}>
                <Feather name="heart" size={20} color="#F59E0B" />
              </View>
              <ThemedText style={styles.cardLabel}>{decode.foodsTitle.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.foodsList}>
              {decode.foodsList.map((food, index) => (
                <View key={index} style={[styles.foodItem, { backgroundColor: `${PINK_PRIMARY}15` }]}>
                  <ThemedText style={[styles.foodText, { color: theme.text }]}>{food}</ThemedText>
                </View>
              ))}
            </View>
            <ThemedText style={[styles.foodsBody, { color: theme.textSecondary }]}>
              {decode.foodsBody}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF30' }]}>
                <Feather name="clock" size={20} color="#6366F1" />
              </View>
              <ThemedText style={styles.cardLabel}>TINY RESET IDEA</ThemedText>
            </View>
            <ThemedText style={[styles.resetText, { color: theme.text }]}>
              {decode.tinyReset}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.closingContainer}>
            <ThemedText style={[styles.closingLine, { color: theme.text }]}>
              {decode.closingLine}
            </ThemedText>
            <ThemedText style={[styles.signOff, { color: PINK_PRIMARY }]}>
              — Olanna
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Pressable
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            style={[styles.doneButton, { backgroundColor: PINK_PRIMARY }]}
          >
            <ThemedText style={styles.doneButtonText}>Back to Home</ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#7A6A73',
    flex: 1,
  },
  vibeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
    textAlign: 'left',
  },
  movementTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: Spacing.sm,
  },
  movementBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
  },
  foodsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  foodItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  foodText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
  foodsBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
  },
  resetText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'left',
  },
  closingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  closingLine: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  signOff: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
  },
  doneButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  doneButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: '#3A2F35',
  },
});
