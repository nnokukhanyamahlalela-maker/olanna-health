import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Platform,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { OnboardingGlassCard } from "@/components/onboarding/GlassCard";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { BRAND_COLORS } from "@/constants/onboardingTokens";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

export interface ExtractedCycleData {
  regularity: "regular" | "irregular" | "not_sure" | "";
  lastPeriodStartDate: string;
  averageCycleLength: number | null;
  periodDuration: number | null;
  previousPeriodDates: string[];
  confidence: {
    regularity: number;
    lastPeriodStartDate: number;
    averageCycleLength: number;
  };
  source: "screenshot_upload";
}

type ImportState = "idle" | "loading" | "error";

interface ScreenshotImportProps {
  onDataExtracted: (data: ExtractedCycleData) => void;
  onManualEntry: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScreenshotImport({
  onDataExtracted,
  onManualEntry,
}: ScreenshotImportProps) {
  const [state, setState] = useState<ImportState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [needsSettings, setNeedsSettings] = useState(false);
  const uploadScale = useSharedValue(1);

  const uploadAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: uploadScale.value }],
  }));

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        if (!permissionResult.canAskAgain && Platform.OS !== "web") {
          setErrorMessage(
            "Photo library access was denied. Please enable it in your device Settings to import a screenshot."
          );
          setNeedsSettings(true);
        } else {
          setErrorMessage(
            "We need access to your photo library to import a screenshot."
          );
          setNeedsSettings(false);
        }
        setState("error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.uri) return;

      setPreviewUri(asset.uri);
      await analyzeImage(asset.uri);
    } catch {
      setErrorMessage(
        "Something went wrong selecting your image. Please try again."
      );
      setState("error");
    }
  };

  const analyzeImage = async (uri: string) => {
    setState("loading");
    setErrorMessage("");

    try {
      let base64: string;

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1] || "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64 = await readAsStringAsync(uri, {
          encoding: EncodingType.Base64,
        });
      }

      const res = await apiRequest("POST", "/api/cycle-import/analyze", {
        image: base64,
      });

      const data: ExtractedCycleData = await res.json();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDataExtracted(data);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let msg =
        "We couldn't read cycle data from this screenshot. Try a clearer image, or enter your details manually.";
      try {
        const parsed = JSON.parse(
          err.message?.replace(/^\d+:\s*/, "") || "{}"
        );
        if (parsed.message) msg = parsed.message;
      } catch {}

      setErrorMessage(msg);
      setState("error");
    }
  };

  const handleRetry = () => {
    setState("idle");
    setErrorMessage("");
    setPreviewUri(null);
    pickImage();
  };

  if (state === "loading") {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <OnboardingGlassCard>
          <View style={styles.loadingContent}>
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={styles.previewSmall}
                resizeMode="cover"
              />
            ) : null}
            <ActivityIndicator
              size="large"
              color={BRAND_COLORS.hotPink}
              style={styles.spinner}
            />
            <ThemedText style={styles.loadingTitle}>
              Analyzing your screenshot
            </ThemedText>
            <ThemedText style={styles.loadingSubtext}>
              Looking for cycle dates and patterns...
            </ThemedText>
          </View>
        </OnboardingGlassCard>
      </Animated.View>
    );
  }

  if (state === "error") {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <OnboardingGlassCard>
          <View style={styles.errorContent}>
            <View style={styles.errorIconCircle}>
              <Feather
                name="alert-circle"
                size={32}
                color={BRAND_COLORS.hotPink}
              />
            </View>
            <ThemedText style={styles.errorTitle}>
              Import unsuccessful
            </ThemedText>
            <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
            <View style={styles.errorActions}>
              {needsSettings && Platform.OS !== "web" ? (
                <PrimaryButton
                  label="Open Settings"
                  onPress={async () => {
                    try {
                      await Linking.openSettings();
                    } catch {}
                  }}
                  icon="settings"
                  testID="button-open-settings"
                />
              ) : (
                <PrimaryButton
                  label="Try another screenshot"
                  onPress={handleRetry}
                  icon="camera"
                  testID="button-retry-screenshot"
                />
              )}
              <PrimaryButton
                label="Enter manually instead"
                onPress={onManualEntry}
                variant="secondary"
                testID="button-manual-entry"
              />
            </View>
          </View>
        </OnboardingGlassCard>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <OnboardingGlassCard>
        <View style={styles.idleContent}>
          <AnimatedPressable
            onPress={pickImage}
            onPressIn={() => {
              uploadScale.value = withSpring(0.96, {
                damping: 15,
                stiffness: 200,
              });
            }}
            onPressOut={() => {
              uploadScale.value = withSpring(1, {
                damping: 15,
                stiffness: 200,
              });
            }}
            style={[styles.uploadArea, uploadAnimStyle]}
            accessibilityRole="button"
            accessibilityLabel="Upload a screenshot of your cycle history"
            testID="button-upload-screenshot"
          >
            <View style={styles.uploadIconCircle}>
              <Feather name="image" size={32} color={BRAND_COLORS.hotPink} />
            </View>
            <ThemedText style={styles.uploadTitle}>
              Upload a screenshot
            </ThemedText>
            <ThemedText style={styles.uploadSubtext}>
              Upload a screenshot of your recent cycle history from another app
            </ThemedText>
            <View style={styles.formatBadges}>
              {["JPG", "PNG", "WEBP"].map((fmt) => (
                <View key={fmt} style={styles.formatBadge}>
                  <ThemedText style={styles.formatBadgeText}>{fmt}</ThemedText>
                </View>
              ))}
            </View>
          </AnimatedPressable>

          <View style={styles.privacyRow}>
            <Feather
              name="lock"
              size={14}
              color={BRAND_COLORS.textSecondary}
            />
            <ThemedText style={styles.privacyText}>
              Your screenshot is only used to help estimate your cycle
              information
            </ThemedText>
          </View>
        </View>
      </OnboardingGlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  idleContent: {
    gap: Spacing.lg,
  },
  uploadArea: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: 12,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.glassBorder,
    borderStyle: "dashed",
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(232,90,156,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  uploadTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: BRAND_COLORS.textPrimary,
    textAlign: "center",
  },
  uploadSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: BRAND_COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },
  formatBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  formatBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  formatBadgeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: BRAND_COLORS.textSecondary,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.sm,
  },
  privacyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: BRAND_COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  loadingContent: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: 12,
  },
  previewSmall: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    marginBottom: 4,
  },
  spinner: {
    marginVertical: 8,
  },
  loadingTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: BRAND_COLORS.textPrimary,
    textAlign: "center",
  },
  loadingSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: BRAND_COLORS.textSecondary,
    textAlign: "center",
  },
  errorContent: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: 12,
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(232,90,156,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: BRAND_COLORS.textPrimary,
    textAlign: "center",
  },
  errorMessage: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: BRAND_COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.sm,
    lineHeight: 18,
  },
  errorActions: {
    width: "100%",
    gap: 8,
    marginTop: 4,
  },
});
