import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveCycleProfile,
  CYCLE_PROFILE_KEY,
  CYCLE_LOGS_KEY,
} from "../services/cycleStorage";

export default function OnboardingScreen({ navigation }: any) {
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState("2026-03-01");
  const [averageCycleLength, setAverageCycleLength] = useState("28");
  const [averagePeriodLength, setAveragePeriodLength] = useState("5");

  const handleSaveCycleProfile = async () => {
    try {
      if (!lastPeriodStartDate || !averageCycleLength || !averagePeriodLength) {
        Alert.alert("Missing details", "Please complete all fields.");
        return;
      }

      await saveCycleProfile({
        userId: "user-123",
        lastPeriodStartDate,
        averageCycleLength: Number(averageCycleLength),
        averagePeriodLength: Number(averagePeriodLength),
        onboardingSymptoms: ["cramps", "bloating"],
        onboardingPreferences: ["gentle reminders"],
      });

      Alert.alert(
        "Saved",
        "Your cycle details now flow into your Lotus Cycle and Calendar."
      );

      navigation.navigate("Main");
    } catch (error) {
      Alert.alert("Something went wrong", "We couldn't save your cycle details.");
    }
  };

  const handleResetDemo = async () => {
    await AsyncStorage.multiRemove([CYCLE_PROFILE_KEY, CYCLE_LOGS_KEY]);
    Alert.alert("Reset complete", "Demo data has been cleared.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Olanna Health</Text>
        <Text style={styles.title}>Let's understand your rhythm</Text>
        <Text style={styles.subtitle}>
          Add a few cycle details so your Lotus Cycle and Calendar can reflect
          your onboarding answers immediately.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Last period start date</Text>
          <TextInput
            value={lastPeriodStartDate}
            onChangeText={setLastPeriodStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9E8E98"
            style={styles.input}
            testID="input-last-period-date"
          />

          <Text style={styles.label}>Average cycle length</Text>
          <TextInput
            value={averageCycleLength}
            onChangeText={setAverageCycleLength}
            keyboardType="numeric"
            placeholder="28"
            placeholderTextColor="#9E8E98"
            style={styles.input}
            testID="input-cycle-length"
          />

          <Text style={styles.label}>Average period length</Text>
          <TextInput
            value={averagePeriodLength}
            onChangeText={setAveragePeriodLength}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor="#9E8E98"
            style={styles.input}
            testID="input-period-length"
          />

          <Pressable
            style={styles.button}
            onPress={handleSaveCycleProfile}
            testID="button-continue"
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleResetDemo}
            testID="button-reset-demo"
          >
            <Text style={styles.secondaryButtonText}>Reset demo data</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9FC",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 13,
    color: "#B57A94",
    marginBottom: 10,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    color: "#402B35",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#6F5A64",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#5A4750",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#F0DCE5",
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#FFF7FA",
    color: "#2F2127",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#D991AD",
    borderRadius: 18,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 14,
    borderRadius: 18,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#F7EAF0",
  },
  secondaryButtonText: {
    color: "#8A5E72",
    fontSize: 15,
    fontWeight: "600",
  },
});
