import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLotusCycle } from "../hooks/useLotusCycle";
import { saveCycleLog } from "../services/cycleStorage";

export default function LotusCycleScreen({ navigation }: any) {
  const { loading, prediction, phaseContent, refresh } = useLotusCycle();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleLogPeriodToday = async () => {
    const today = new Date().toISOString().split("T")[0];

    await saveCycleLog({
      id: String(Date.now()),
      userId: "user-123",
      periodStartDate: today,
      createdAt: new Date().toISOString(),
    });

    await refresh();

    Alert.alert(
      "Period logged",
      "Your actual logged date now overrides the onboarding prediction."
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!prediction || !phaseContent) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyTitle}>No cycle data yet</Text>
        <Text style={styles.emptySubtitle}>
          Complete onboarding to see your Lotus Cycle.
        </Text>

        <Pressable
          style={[styles.button, { marginTop: 20, minWidth: 220 }]}
          onPress={() => navigation.navigate("Onboarding")}
          testID="button-go-onboarding"
        >
          <Text style={styles.buttonText}>Go to onboarding</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Lotus Cycle</Text>
        <Text style={styles.subheader}>Your rhythm, gently visualised</Text>

        <View style={styles.heroCard}>
          <Text style={styles.phaseEyebrow}>Current phase</Text>
          <Text style={styles.phaseTitle}>{phaseContent.title}</Text>
          <Text style={styles.phaseSubtitle}>{phaseContent.subtitle}</Text>

          <View style={styles.divider} />

          <Text style={styles.detail}>Cycle day {prediction.currentCycleDay}</Text>
          <Text style={styles.detail}>Phase: {prediction.currentPhase}</Text>
          <Text style={styles.detail}>Ovulation: {prediction.ovulationDate}</Text>
          <Text style={styles.detail}>
            Next period: {prediction.nextPeriodStartDate}
          </Text>
        </View>

        <Pressable
          style={[styles.button, { marginTop: 18 }]}
          onPress={() => navigation.navigate("Main", { screen: "Calendar" })}
          testID="button-open-calendar"
        >
          <Text style={styles.buttonText}>Open Cycle Calendar</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, { marginTop: 12 }]}
          onPress={handleLogPeriodToday}
          testID="button-log-period-today"
        >
          <Text style={styles.secondaryButtonText}>
            Log period start today
          </Text>
        </Pressable>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9FC",
    padding: 24,
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
    color: "#3F2A34",
    marginBottom: 8,
  },
  subheader: {
    fontSize: 15,
    color: "#74606A",
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: "#F8EEF6",
    borderRadius: 28,
    padding: 24,
  },
  phaseEyebrow: {
    fontSize: 13,
    color: "#A56F89",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  phaseTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: "#472F3A",
    marginBottom: 10,
  },
  phaseSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#6E5862",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5D2DC",
    marginVertical: 20,
  },
  detail: {
    fontSize: 15,
    color: "#503C45",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#402B35",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6F5A64",
    textAlign: "center",
  },
  button: {
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
