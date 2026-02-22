import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

const LEARN_MORE_ITEMS = [
  {
    heading: "Recent Research",
    text: "A 2026 University of the Free State study tested 16 pad brands and 8 pantyliners sold in South Africa.",
  },
  {
    heading: "Chemicals Found",
    text: "All products tested contained at least two endocrine-disrupting chemicals from three groups: bisphenols, parabens, and phthalates.",
  },
  {
    heading: "Why It Matters",
    text: "Endocrine-disrupting chemicals can interfere with hormonal function. Repeated low-level exposure through menstrual products may be significant because of the sensitive absorption area and prolonged contact time.",
  },
  {
    heading: "What You Can Do",
    text: "Choosing unscented products may reduce fragrance-related chemical exposure. Tracking what you use helps you make informed decisions over time.",
  },
];

export default function LearnMoreSheet() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <AppGradient style={styles.container}>
      <View style={styles.header}>
        <View style={styles.handleBar} />
        <View style={styles.headerRow}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            About This Research
          </ThemedText>
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[styles.closeButton, { backgroundColor: theme.backgroundDefault }]}
            testID="button-close-learn-more"
          >
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingHorizontal: ScreenPadding.horizontal,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {LEARN_MORE_ITEMS.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={[styles.numberBadge, { backgroundColor: "#C4B5AD18" }]}>
              <ThemedText style={[styles.numberText, { color: "#C4B5AD" }]}>
                {index + 1}
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardHeading, { color: theme.text }]}>
                {item.heading}
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.textSecondary }]}>
                {item.text}
              </ThemedText>
            </View>
          </View>
        ))}

        <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
          For educational purposes only. Not medical advice. Consult a healthcare provider for personal guidance.
        </ThemedText>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingHorizontal: ScreenPadding.horizontal,
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(150,150,150,0.3)",
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  title: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: 12,
    gap: Spacing.md,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 14,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeading: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  cardText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  disclaimer: {
    fontFamily: Fonts.bodyLight,
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
