import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ArticleCardProps {
  title: string;
  summary: string;
  category: string;
  readTime: string;
  imageUri?: string;
  onPress?: () => void;
  featured?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categoryColors: Record<string, string> = {
  Periods: "#D4A090",
  PCOS: "#B8C4B8",
  Endometriosis: "#C8C0D0",
  "Sexual Health": "#C9A86C",
  Fertility: "#D4A99A",
  Wellness: "#B8C4B8",
  Screenings: "#C8C0D0",
};

export function ArticleCard({
  title,
  summary,
  category,
  readTime,
  imageUri,
  onPress,
  featured = false,
}: ArticleCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
  };

  const categoryColor = categoryColors[category] || theme.primary;

  if (featured) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.featuredContainer, animatedStyle]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.featuredImage} contentFit="cover" />
        ) : (
          <View style={[styles.featuredImagePlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="book-open" size={48} color={theme.textSecondary} />
          </View>
        )}
        <View style={styles.featuredContent}>
          <ThemedText style={[styles.categoryLabel, { color: categoryColor }]}>
            {category.toUpperCase()}
          </ThemedText>
          <ThemedText style={[styles.featuredTitle, { color: theme.text }]} numberOfLines={3}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.featuredSummary, { color: theme.textSecondary }]} numberOfLines={2}>
            {summary}
          </ThemedText>
          <View style={styles.readTimeRow}>
            <ThemedText style={[styles.readTimeText, { color: theme.textSecondary }]}>
              {readTime} read
            </ThemedText>
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.content}>
        <ThemedText style={[styles.categoryLabel, { color: categoryColor }]}>
          {category.toUpperCase()}
        </ThemedText>
        <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.summary, { color: theme.textSecondary }]} numberOfLines={2}>
          {summary}
        </ThemedText>
        <View style={styles.readTimeRow}>
          <ThemedText style={[styles.readTimeText, { color: theme.textSecondary }]}>
            {readTime} read
          </ThemedText>
          <Feather name="arrow-right" size={14} color={theme.textSecondary} />
        </View>
      </View>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.thumbnail} contentFit="cover" />
      ) : (
        <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="book-open" size={20} color={theme.textSecondary} />
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  categoryLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  summary: {
    fontFamily: "Poppins_300Light",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  readTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  readTimeText: {
    fontFamily: "Poppins_300Light",
    fontSize: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredContainer: {
    marginBottom: Spacing.lg,
  },
  featuredImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  featuredImagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredContent: {
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
  },
  featuredTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  featuredSummary: {
    fontFamily: "Poppins_300Light",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
});
