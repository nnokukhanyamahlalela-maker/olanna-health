import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

const LEARN_MORE_ITEMS = [
  "2026 University of the Free State study tested 16 pad brands and 8 pantyliners.",
  "All products tested contained at least two endocrine-disrupting chemicals.",
  "Chemical groups: bisphenols, parabens, phthalates.",
  "Choosing unscented products may reduce fragrance-related exposure.",
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActionButton({
  label,
  variant,
  onPress,
  testID,
}: {
  label: string;
  variant: "primary" | "secondary";
  onPress: () => void;
  testID?: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.actionButton,
        {
          backgroundColor: isPrimary ? "#F6BFD3" : theme.backgroundDefault,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? "transparent" : theme.border,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        style={[
          styles.actionButtonText,
          { color: isPrimary ? "#3A2F35" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductSafetyScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const chevronRotation = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const toggleLearnMore = () => {
    setLearnMoreOpen(!learnMoreOpen);
    chevronRotation.value = withTiming(learnMoreOpen ? 0 : 180, { duration: 250 });
  };

  const handleLogProduct = () => {
    navigation.navigate("LogProduct");
  };

  const handleViewInsights = () => {
    navigation.navigate("ProductInsights");
  };

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.introCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.introText, { color: theme.text }]}>
            A recent South African study found that some menstrual products may contain
            low levels of endocrine-disrupting chemicals. While research is ongoing,
            repeated exposure over time may matter.
          </ThemedText>
          <ThemedText style={[styles.introText, { color: theme.text, marginTop: 12 }]}>
            Olanna helps you track what you use — so you can make informed choices aligned
            with your body.
          </ThemedText>
        </View>

        <View style={styles.buttonGroup}>
          <ActionButton
            label="Log a Product"
            variant="primary"
            onPress={handleLogProduct}
            testID="button-log-product"
          />
          <ActionButton
            label="View My Insights"
            variant="secondary"
            onPress={handleViewInsights}
            testID="button-view-insights"
          />
        </View>

        <Pressable
          testID="button-learn-more"
          onPress={toggleLearnMore}
          style={[styles.learnMoreHeader, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText style={[styles.learnMoreTitle, { color: theme.text }]}>
            Learn More
          </ThemedText>
          <Animated.View style={chevronStyle}>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </Animated.View>
        </Pressable>

        {learnMoreOpen ? (
          <View style={[styles.learnMoreBody, { backgroundColor: theme.backgroundDefault }]}>
            {LEARN_MORE_ITEMS.map((item, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: "#C4B5AD" }]} />
                <ThemedText style={[styles.bulletText, { color: theme.text }]}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
          For educational purposes only. Not medical advice.
        </ThemedText>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  introCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  introText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 24,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  learnMoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: 2,
  },
  learnMoreTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  learnMoreBody: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  disclaimer: {
    fontFamily: Fonts.bodyLight,
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});
