import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/AppText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
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
        <AppText variant="h2" color={theme.text} style={styles.sectionHeading}>
          {section.content}
        </AppText>
      );
    case "subheading":
      return (
        <AppText variant="label" color={theme.text} style={styles.sectionSubheading}>
          {section.content}
        </AppText>
      );
    case "paragraph":
      return (
        <AppText variant="body" color={theme.textSecondary} style={styles.sectionParagraph}>
          {section.content}
        </AppText>
      );
    case "bullets":
      return (
        <View style={styles.bulletList}>
          {section.items?.map((item, i) => (
            <View key={i} style={styles.bulletItem}>
              <View style={[styles.bulletDot, { backgroundColor: "#C2185B" }]} />
              <AppText variant="body" color={theme.textSecondary} style={styles.bulletText}>
                {item}
              </AppText>
            </View>
          ))}
        </View>
      );
    case "quote":
      return (
        <GlassSurface borderRadius={BorderRadius.md} padding={Spacing.lg} tint="subtle" style={[styles.quoteContainer, { borderLeftColor: "#C2185B" }]}>
          <AppText variant="body" color={theme.text} style={styles.quoteText}>
            {section.content}
          </AppText>
        </GlassSurface>
      );
    case "disclaimer":
      return (
        <GlassSurface borderRadius={BorderRadius.md} padding={Spacing.md} tint="subtle" style={styles.disclaimerContainer}>
          <Feather name="alert-circle" size={16} color={theme.textSecondary} />
          <AppText variant="caption" color={theme.textSecondary} style={styles.disclaimerText}>
            {section.content}
          </AppText>
        </GlassSurface>
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
          <AppText variant="body" color={theme.textSecondary}>
            Article not found
          </AppText>
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
            <AppText variant="caption" color={categoryColor} style={styles.categoryLabel}>
              {article.category.toUpperCase()}
            </AppText>
          </View>
          <AppText variant="caption" color={theme.textSecondary}>
            {article.readTime} read
          </AppText>
        </View>

        <AppText variant="editorialTitle" color={theme.text} style={styles.title}>
          {article.title}
        </AppText>

        <AppText variant="body" color={theme.textSecondary} style={styles.subtitle}>
          {article.subtitle}
        </AppText>

        {article.imageSource ? (
          <Image source={article.imageSource} style={styles.heroImage} contentFit="cover" />
        ) : null}

        <GlassSurface borderRadius={BorderRadius.md} padding={Spacing.md} tint="subtle" style={styles.authorRow}>
          <View style={[styles.authorAvatar, { backgroundColor: "rgba(194,24,91,0.12)" }]}>
            <Feather name="edit-3" size={14} color="#C2185B" />
          </View>
          <View>
            <AppText variant="label" color={theme.text} style={styles.authorName}>
              {article.author}
            </AppText>
            <AppText variant="caption" color={theme.textSecondary}>
              {article.date}
            </AppText>
          </View>
        </GlassSurface>

        <View style={styles.bodyContent}>
          {article.sections.map((section, index) => (
            <SectionRenderer key={index} section={section} theme={theme} />
          ))}
        </View>

        {article.references.length > 0 ? (
          <View style={[styles.referencesSection, { borderTopColor: theme.border }]}>
            <AppText variant="caption" color={theme.textSecondary} style={styles.referencesTitle}>
              REFERENCES
            </AppText>
            {article.references.map((ref) => (
              <AppText key={ref.number} variant="caption" color={theme.textSecondary} style={styles.referenceText}>
                {ref.number}. {ref.text}
              </AppText>
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
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 1.5,
  },
  title: {
    lineHeight: 32,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: Spacing.xl,
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
    fontSize: 13,
  },
  bodyContent: {
    gap: Spacing.md,
  },
  sectionHeading: {
    lineHeight: 30,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  sectionSubheading: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionParagraph: {
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
    fontSize: 15,
    lineHeight: 24,
  },
  quoteContainer: {
    borderLeftWidth: 3,
    marginVertical: Spacing.sm,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: "italic",
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  referencesSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
  },
  referencesTitle: {
    fontWeight: "500",
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  referenceText: {
    fontSize: 11,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
});
