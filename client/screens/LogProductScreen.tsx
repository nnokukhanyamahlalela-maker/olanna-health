import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getDeviceId } from "@/lib/deviceId";

const PRODUCT_TYPES = [
  "Pad",
  "Pantyliner",
  "Tampon",
  "Cup",
  "Period underwear",
  "Other",
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LogProductScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [productType, setProductType] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [scented, setScented] = useState(false);
  const [notes, setNotes] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toastOpacity = useSharedValue(0);
  const saveScale = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const saveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setToastMsg(null), 350);
    }, 2500);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const deviceId = await getDeviceId();
      const today = new Date().toISOString().split("T")[0];
      const baseUrl = getApiUrl();
      const response = await fetch(
        new URL("/api/product-logs", baseUrl).href,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-device-id": deviceId,
          },
          body: JSON.stringify({
            date: today,
            productType,
            brand: brand.trim() || null,
            scented,
            notes: notes.trim() || null,
          }),
        }
      );
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody || "Failed to save");
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/product-logs"] });
      showToast("Saved");
      setTimeout(() => navigation.goBack(), 800);
    },
    onError: (err: Error) => {
      showToast("Could not save. Please try again.");
    },
  });

  const handleSave = () => {
    if (!productType) {
      showToast("Please select a product type.");
      return;
    }
    saveMutation.mutate();
  };

  const handleScentedToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScented(value);
  };

  const todayStr = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isSaving = saveMutation.isPending;

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
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
            DATE
          </ThemedText>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={18} color={theme.textSecondary} />
            <ThemedText style={[styles.dateText, { color: theme.text }]}>
              {todayStr}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
            PRODUCT TYPE
          </ThemedText>
          <Pressable
            testID="dropdown-product-type"
            accessibilityRole="button"
            accessibilityLabel={productType ? "Product type: " + productType + ". Tap to change" : "Select a product type"}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            style={[styles.dropdownTrigger, { borderColor: theme.border }]}
          >
            <ThemedText
              style={[
                styles.dropdownText,
                { color: productType ? theme.text : theme.textSecondary },
              ]}
            >
              {productType || "Select a product type"}
            </ThemedText>
            <Feather
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>
          {dropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: theme.border }]}>
              {PRODUCT_TYPES.map((type) => (
                <Pressable
                  key={type}
                  testID={`option-${type.toLowerCase().replace(/\s+/g, "-")}`}
                  accessibilityRole="button"
                  accessibilityLabel={type + (productType === type ? ", selected" : "")}
                  onPress={() => {
                    setProductType(type);
                    setDropdownOpen(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    productType === type
                      ? { backgroundColor: "#F6BFD3" + "20" }
                      : null,
                  ]}
                >
                  <ThemedText style={[styles.dropdownItemText, { color: theme.text }]}>
                    {type}
                  </ThemedText>
                  {productType === type ? (
                    <Feather name="check" size={16} color="#F6BFD3" />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
            BRAND
          </ThemedText>
          <TextInput
            testID="input-brand"
            accessibilityLabel="Brand name"
            style={[
              styles.textInput,
              {
                color: theme.text,
                borderColor: theme.border,
                fontFamily: Fonts.body,
              },
            ]}
            placeholder="e.g. Always, Kotex, Lil-Lets"
            placeholderTextColor={theme.textSecondary}
            value={brand}
            onChangeText={setBrand}
            maxLength={60}
            editable={!isSaving}
          />
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
                SCENTED
              </ThemedText>
              <ThemedText style={[styles.toggleHint, { color: theme.textSecondary }]}>
                Is this product scented?
              </ThemedText>
            </View>
            <Switch
              testID="toggle-scented"
              accessibilityLabel={scented ? "Scented, on" : "Scented, off"}
              value={scented}
              onValueChange={handleScentedToggle}
              trackColor={{ false: theme.border, true: "#F6BFD3" }}
              thumbColor="#FFFFFF"
              disabled={isSaving}
            />
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
            NOTES
          </ThemedText>
          <TextInput
            testID="input-notes"
            accessibilityLabel="Notes"
            style={[
              styles.textArea,
              {
                color: theme.text,
                borderColor: theme.border,
                fontFamily: Fonts.body,
              },
            ]}
            placeholder="Any observations or details..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
            editable={!isSaving}
          />
        </View>

        <AnimatedPressable
          testID="button-save-product"
          accessibilityRole="button"
          accessibilityLabel="Save product log"
          onPress={handleSave}
          disabled={isSaving}
          onPressIn={() => {
            saveScale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
          }}
          onPressOut={() => {
            saveScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          }}
          style={[styles.saveButton, isSaving ? { opacity: 0.6 } : null, saveAnimStyle]}
        >
          {isSaving ? (
            <ActivityIndicator color="#3A2F35" size="small" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          )}
        </AnimatedPressable>

        <ThemedText style={[styles.privacyNote, { color: theme.textSecondary }]}>
          Your product logs are private to you. You can export or delete them anytime.
        </ThemedText>
      </ScrollView>

      {toastMsg ? (
        <Animated.View style={[styles.toast, toastStyle]}>
          <ThemedText style={styles.toastText}>
            {toastMsg}
          </ThemedText>
        </Animated.View>
      ) : null}
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
  fieldCard: {
    borderRadius: 12,
    padding: Spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    marginVertical: 2,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dateText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  dropdownText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  dropdownList: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    flex: 1,
    gap: 2,
  },
  toggleHint: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 100,
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F6BFD3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    color: "#3A2F35",
    letterSpacing: 0.3,
  },
  privacyNote: {
    fontFamily: Fonts.body,
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#3A2F35",
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  toastText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
