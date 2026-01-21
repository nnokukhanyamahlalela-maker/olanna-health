import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";

interface HeaderTitleProps {
  title: string;
  showIcon?: boolean;
  size?: "small" | "large";
}

export function HeaderTitle({ title, showIcon = true, size = "small" }: HeaderTitleProps) {
  const { theme } = useTheme();
  const isLarge = size === "large";

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      {showIcon ? (
        <Image
          source={require("../assets/images/olanna-logo.png")}
          style={isLarge ? styles.iconLarge : styles.icon}
          resizeMode="contain"
        />
      ) : null}
      <ThemedText 
        style={[
          isLarge ? styles.titleLarge : styles.title, 
          { color: theme.text }
        ]}
      >
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  containerLarge: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: Spacing.sm,
  },
  iconLarge: {
    width: 72,
    height: 72,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Typography.h2.fontFamily,
    letterSpacing: 0.3,
  },
  titleLarge: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Typography.h1.fontFamily,
    letterSpacing: 0.5,
  },
});
