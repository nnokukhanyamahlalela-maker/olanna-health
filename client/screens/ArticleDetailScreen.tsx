import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/spacing";
import { BorderRadius } from "@/constants/theme";
import { getArticleById, ArticleSection } from "@/data/articles";
import { LearnStackParamList } from "@/navigation/LearnStackNavigator";

type ArticleDetailRouteProp = RouteProp<LearnStackParamList, "ArticleDetail">;

const categoryColors: Record<string, string> = {
  Periods: "#D4A090",
  PCOS: "#B8C4B8",
  Endometriosis: "#C8C0D0",
  "Sexual Health": "#C9A86C",
  Fertility: "#D4A99A",
  Wellness: "#B8C4B8",
  Screenings: "#C8C0D0",
};

function SectionRenderer({ section, theme }: { section: ArticleSection; theme: any }) {
  switch (section.type) {
    case "heading":
      return (
        <ThemedText style={[styles.sectionHeading, { color: theme.text }]}>
          {section.content}
        </ThemedText>
      );
    case "subheading":
      return (
        <ThemedText style={[styles.sectionSubheading, { color: theme.text }]}>
          {section.content}
        </ThemedText>
      );
    case "paragraph":
      return (
        <ThemedText style={[styles.sectionParagraph, { color: theme.textSecondary }]}>
          {section.content}
        </ThemedText>
      );
    case "bullets":
      return (
        <View style={styles.bulletList}>
          {section.items?.map((item, i) => (
            <View key={i} style={styles.bulletItem}>
              <View style={[styles.bulletDot, { backgroundColor: theme.primary }]} />
              <ThemedText style={[styles.bulletText, { color: theme.textSecondary }]}>
                {item}
              </ThemedText>
            </View>
          ))}
        </View>
      );
    case "quote":
      return (
        <View style={[styles.quoteContainer, { borderLeftColor: theme.primary }]}>
          <ThemedText style={[styles.quoteText, { color: theme.text }]}>
            {section.content}
          </ThemedText>
        </View>
      );
    case "disclaimer":
      return (
        <View style={[styles.disclaimerContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="alert-circle" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            {section.content}
          </ThemedText>
        </View>
      );
    default:
      return null;
  }
}

export default function ArticleDetailScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const route = useRoute<ArticleDetailRouteProp>();
  const { articleId } = route.params;

  const article = getArticleById(articleId);

  if (!article) {
    return (
      <AppGradient style={styles.container}>
        <View style={[styles.errorContainer, { paddingTop: headerHeight + Spacing.lg }]}>
          <Feather name="alert-circle" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>
            Article not found
          </ThemedText>
        </View>
      </AppGradient>
    );
  }

  const categoryColor = categoryColors[article.category] || theme.primary;

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "20" }]}>
            <ThemedText style={[styles.categoryLabel, { color: categoryColor }]}>
              {article.category.toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText style={[styles.readTime, { color: theme.textSecondary }]}>
            {article.readTime} read
          </ThemedText>
        </View>

        <ThemedText style={[styles.title, { color: theme.text }]}>
          {article.title}
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {article.subtitle}
        </ThemedText>

        <View style={[styles.authorRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
          <View style={[styles.authorAvatar, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="edit-3" size={14} color={theme.primary} />
          </View>
          <View>
            <ThemedText style={[styles.authorName, { color: theme.text }]}>
              {article.author}
            </ThemedText>
            <ThemedText style={[styles.authorDate, { color: theme.textSecondary }]}>
              {article.date}
            </ThemedText>
          </View>
        </View>

        <View style={styles.bodyContent}>
          {article.sections.map((section, index) => (
            <SectionRenderer key={index} section={section} theme={theme} />
          ))}
        </View>

        {article.references.length > 0 ? (
          <View style={[styles.referencesSection, { borderTopColor: theme.border }]}>
            <ThemedText style={[styles.referencesTitle, { color: theme.textSecondary }]}>
              REFERENCES
            </ThemedText>
            {article.references.map((ref) => (
              <ThemedText key={ref.number} style={[styles.referenceText, { color: theme.textSecondary }]}>
                {ref.number}. {ref.text}
              </ThemedText>
            ))}
          </View>
        ) : null}
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  errorText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  categoryLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  readTime: {
    fontFamily: "DMSans_300Light",
    fontSize: 12,
  },
  title: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: "DMSans_300Light",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: Spacing.xl,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: Spacing.xl,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
  },
  authorDate: {
    fontFamily: "DMSans_300Light",
    fontSize: 12,
    marginTop: 2,
  },
  bodyContent: {
    gap: Spacing.md,
  },
  sectionHeading: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  sectionSubheading: {
    fontFamily: "DMSans_500Medium",
    fontSize: 17,
    lineHeight: 24,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxs,
  },
  sectionParagraph: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  bulletList: {
    gap: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
  },
  bulletText: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  quoteContainer: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  quoteText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
    fontStyle: "italic",
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: "DMSans_300Light",
    fontSize: 12,
    lineHeight: 18,
  },
  referencesSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
  },
  referencesTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  referenceText: {
    fontFamily: "DMSans_300Light",
    fontSize: 11,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
});
