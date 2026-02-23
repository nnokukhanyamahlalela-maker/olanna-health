import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LotusCycleWheel } from "@/components/LotusCycleWheel";
import { PhaseCard } from "@/components/PhaseCard";
import {
  Phase,
  getPhaseForDay,
  getStatusText,
  phaseConfig,
} from "@/constants/phaseConfig";
import { Fonts } from "@/constants/theme";

const CYCLE_LENGTH = 28;
const CURRENT_DAY = 22;

export function CycleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(CURRENT_DAY);
  const [logSheetVisible, setLogSheetVisible] = useState(false);

  const currentPhase = getPhaseForDay(selectedDay, CYCLE_LENGTH);
  const statusText = getStatusText(selectedDay, CYCLE_LENGTH);

  return (
    <LinearGradient
      colors={["#F8F0FA", "#FDF0F5", "#F5E8F0"]}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.root}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation bar */}
        <View style={styles.navBar}>
          <View style={styles.navSpacer} />
          <Text style={styles.navTitle}>Cycle</Text>
          <Pressable
            style={styles.navButton}
            onPress={() => setLogSheetVisible(true)}
            accessibilityLabel="Log symptoms"
            testID="button-log"
          >
            <Feather name="plus" size={20} color="#3A2F35" />
          </Pressable>
        </View>

        {/* The Lotus Cycle card */}
        <PhaseCard currentPhase={currentPhase} />

        {/* Lotus Cycle Wheel */}
        <View style={styles.wheelSection}>
          <LotusCycleWheel
            cycleLength={CYCLE_LENGTH}
            currentDay={CURRENT_DAY}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
          />
        </View>

        {/* Status text */}
        <Text style={styles.statusText}>{statusText}</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    height: 44,
  },
  navSpacer: {
    width: 40,
  },
  navTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: "#3A2F35",
    letterSpacing: 0.2,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  wheelSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#7A6A73",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default CycleScreen;
