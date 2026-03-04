import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/components/ThemeProvider";
import { Fonts, Spacing } from "@/constants/theme";

interface MarkdownTextProps {
  children: string;
  color?: string;
}

function parseBold(text: string, color: string, boldColor: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={i} style={[styles.bold, { color: boldColor }]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i} style={{ color }}>{part}</Text>;
  });
}

export function MarkdownText({ children, color }: MarkdownTextProps) {
  const { theme } = useTheme();
  const textColor = color || (theme.textPrimary as string);
  const boldColor = textColor;
  const dividerColor = theme.textTertiary as string;

  const lines = children.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      elements.push(<View key={`sp-${i}`} style={styles.paragraphSpacing} />);
      i++;
      continue;
    }

    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      elements.push(
        <View key={`hr-${i}`} style={[styles.divider, { backgroundColor: dividerColor }]} />
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <Text key={`h3-${i}`} style={[styles.heading3, { color: textColor }]}>
          {parseBold(trimmed.slice(4), textColor, textColor)}
        </Text>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <Text key={`h2-${i}`} style={[styles.heading2, { color: textColor }]}>
          {parseBold(trimmed.slice(3), textColor, textColor)}
        </Text>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <Text key={`h1-${i}`} style={[styles.heading1, { color: textColor }]}>
          {parseBold(trimmed.slice(2), textColor, textColor)}
        </Text>
      );
      i++;
      continue;
    }

    if (/^[-*]\s/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[-*]\s+/, "");
      elements.push(
        <View key={`bl-${i}`} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, { color: textColor }]}>{"\u2022"}</Text>
          <Text style={[styles.bulletText, { color: textColor }]}>
            {parseBold(bulletContent, textColor, textColor)}
          </Text>
        </View>
      );
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (match) {
        elements.push(
          <View key={`ol-${i}`} style={styles.bulletRow}>
            <Text style={[styles.orderedNumber, { color: textColor }]}>{match[1]}.</Text>
            <Text style={[styles.bulletText, { color: textColor }]}>
              {parseBold(match[2], textColor, textColor)}
            </Text>
          </View>
        );
      }
      i++;
      continue;
    }

    elements.push(
      <Text key={`p-${i}`} style={[styles.paragraph, { color: textColor }]}>
        {parseBold(trimmed, textColor, textColor)}
      </Text>
    );
    i++;
  }

  return <View style={styles.container}>{elements}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  paragraph: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  bold: {
    fontFamily: Fonts.heading,
    fontWeight: "600",
  },
  heading1: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  heading2: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  heading3: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: Spacing.sm,
    marginVertical: 2,
  },
  bulletDot: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    width: 16,
  },
  orderedNumber: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    width: 22,
  },
  bulletText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
    opacity: 0.3,
  },
  paragraphSpacing: {
    height: Spacing.xs,
  },
});
