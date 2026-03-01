import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActionButton({
  label,
  icon,
  variant,
  onPress,
  testID,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
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
      accessibilityRole="button"
      accessibilityLabel={label}
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
      {icon ? <Feather name={icon} size={18} color={isPrimary ? "#3A2F35" : theme.text} style={{ marginRight: 8 }} /> : null}
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

  const handleLogProduct = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("LogProduct");
  };

  const handleViewInsights = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ProductInsights");
  };

  const handleLearnMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("LearnMoreSheet");
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
        <GlassSurface style={styles.introCard}>
          <ThemedText style={[styles.introText, { color: theme.text }]}>
            A recent South African study found that some menstrual products may contain
            low levels of endocrine-disrupting chemicals. While research is ongoing,
            repeated exposure over time may matter.
          </ThemedText>
          <ThemedText style={[styles.introText, { color: theme.text, marginTop: 12 }]}>
            Olanna helps you track what you use — so you can make informed choices aligned
            with your body.
          </ThemedText>
        </GlassSurface>

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
          accessibilityRole="button"
          accessibilityLabel="Learn more about this research"
          onPress={handleLearnMore}
          style={[styles.learnMoreButton]}
        >
          <View style={[styles.learnMoreIconWrap, { backgroundColor: "#C4B5AD18" }]}>
            <Feather name="book-open" size={18} color="#C4B5AD" />
          </View>
          <View style={styles.learnMoreContent}>
            <ThemedText style={[styles.learnMoreTitle, { color: theme.text }]}>
              Learn More
            </ThemedText>
            <ThemedText style={[styles.learnMoreSubtitle, { color: theme.textSecondary }]}>
              About the research behind this feature
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </Pressable>

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  learnMoreIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  learnMoreContent: {
    flex: 1,
    gap: 2,
  },
  learnMoreTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  learnMoreSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  disclaimer: {
    fontFamily: Fonts.bodyLight,
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});
