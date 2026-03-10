import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_300Light_Italic,
  DMSans_400Regular_Italic,
} from "@expo-google-fonts/dm-sans";
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { setCycleProfileStorageBackend } from "@/services/cycleProfileService";
import { storage } from "@/lib/storage";
import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReduceTransparencyProvider } from "@/components/GlassCard";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppText } from "@/components/AppText";
import { typography, defaultTextColor } from "@/theme/typography";
import type { AppTextVariant } from "@/theme/typography";

SplashScreen.preventAutoHideAsync();
setCycleProfileStorageBackend(storage);

const SHOW_TYPOGRAPHY_DEMO = false;

const variantMeta: {
  variant: AppTextVariant;
  label: string;
  sample: string;
  detail: string;
}[] = [
  {
    variant: "h1",
    label: "h1",
    sample: "Page Heading",
    detail: "28 / SemiBold (600)",
  },
  {
    variant: "h2",
    label: "h2",
    sample: "Section Title",
    detail: "22 / Medium (500)",
  },
  {
    variant: "body",
    label: "body",
    sample:
      "Body text for reading. Olanna Health empowers women with evidence-based reproductive health tools.",
    detail: "17 / Regular (400) / lineHeight 24",
  },
  {
    variant: "label",
    label: "label",
    sample: "Form Label",
    detail: "15 / Medium (500)",
  },
  {
    variant: "caption",
    label: "caption",
    sample: "Supporting detail or timestamp",
    detail: "13 / Regular (400) / lineHeight 18",
  },
  {
    variant: "editorialTitle",
    label: "editorialTitle",
    sample: "Understanding Your Cycle",
    detail: `24 / Medium (500) / serif (${Platform.OS === "ios" ? "New York" : Platform.OS === "android" ? "serif" : "Georgia"})`,
  },
];

function TypographyDemo() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[demoStyles.root, { backgroundColor: "#FFFCFA" }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          demoStyles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={demoStyles.header}>
          <AppText variant="h1" color={defaultTextColor}>
            Typography
          </AppText>
          <AppText
            variant="caption"
            color="#8E8E93"
            style={demoStyles.headerSub}
          >
            {Platform.OS === "ios"
              ? "SF Pro (system) + New York (serif)"
              : Platform.OS === "android"
                ? "Roboto (system) + serif"
                : "System default + Georgia (serif)"}
          </AppText>
        </View>

        <View style={demoStyles.divider} />

        {variantMeta.map(({ variant, label, sample, detail }) => (
          <View key={variant} style={demoStyles.card}>
            <View style={demoStyles.labelRow}>
              <View style={demoStyles.badge}>
                <AppText variant="caption" color="#FFFCFA">
                  {label}
                </AppText>
              </View>
              <AppText variant="caption" color="#8E8E93">
                {detail}
              </AppText>
            </View>
            <AppText variant={variant}>{sample}</AppText>
          </View>
        ))}

        <View style={demoStyles.divider} />

        <View style={demoStyles.card}>
          <AppText variant="caption" color="#8E8E93" style={demoStyles.note}>
            Default color: {defaultTextColor}
          </AppText>
          <AppText variant="caption" color="#8E8E93" style={demoStyles.note}>
            allowFontScaling: true (respects system font size)
          </AppText>
          <AppText variant="caption" color="#8E8E93" style={demoStyles.note}>
            maxFontSizeMultiplier: 1.5
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const demoStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 8,
  },
  headerSub: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 24,
  },
  card: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  note: {
    marginBottom: 4,
  },
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_300Light_Italic,
    DMSans_400Regular_Italic,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (SHOW_TYPOGRAPHY_DEMO) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <TypographyDemo />
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <ReduceTransparencyProvider>
              <KeyboardProvider>
                <NavigationContainer>
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="light" />
              </KeyboardProvider>
            </ReduceTransparencyProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
