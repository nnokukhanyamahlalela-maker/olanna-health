import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  Platform,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

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

  const [productType, setProductType] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [scented, setScented] = useState(false);
  const [notes, setNotes] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toastOpacity = useSharedValue(0);
  const saveScale = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const saveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const handleSave = () => {
    setShowToast(true);
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setShowToast(false), 350);
    }, 2500);
  };

  const todayStr = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
            PRODUCT TYPE
          </ThemedText>
          <Pressable
            testID="dropdown-product-type"
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

        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
            BRAND
          </ThemedText>
          <TextInput
            testID="input-brand"
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
          />
        </View>

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
              value={scented}
              onValueChange={setScented}
              trackColor={{ false: theme.border, true: "#F6BFD3" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.fieldCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
            NOTES
          </ThemedText>
          <TextInput
            testID="input-notes"
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
          />
        </View>

        <AnimatedPressable
          testID="button-save-product"
          onPress={handleSave}
          onPressIn={() => {
            saveScale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
          }}
          onPressOut={() => {
            saveScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          }}
          style={[styles.saveButton, saveAnimStyle]}
        >
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </AnimatedPressable>
      </ScrollView>

      {showToast ? (
        <Animated.View style={[styles.toast, toastStyle]}>
          <ThemedText style={styles.toastText}>
            Saving will be enabled in the next update.
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: 12,
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
    marginTop: Spacing.sm,
  },
  saveButtonText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    color: "#3A2F35",
    letterSpacing: 0.3,
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
