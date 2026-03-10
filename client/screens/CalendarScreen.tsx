import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from "@react-navigation/native";
import { useCalendarCycle } from "../hooks/useCalendarCycle";

export default function CalendarScreen({ navigation }: any) {
  const { loading, markedDates, refresh } = useCalendarCycle();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Cycle Calendar</Text>
        <Text style={styles.subheader}>
          Your onboarding details are reflected here immediately.
        </Text>

        <View style={styles.calendarCard}>
          <Calendar
            markingType="custom"
            markedDates={markedDates}
            theme={{
              backgroundColor: "#FFFFFF",
              calendarBackground: "#FFFFFF",
              textSectionTitleColor: "#8A7480",
              selectedDayBackgroundColor: "#D991AD",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#B06C8D",
              dayTextColor: "#3F2A34",
              textDisabledColor: "#D6C8CF",
              monthTextColor: "#3F2A34",
              arrowColor: "#B06C8D",
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12,
            }}
          />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EAA4B5" }]} />
            <Text style={styles.legendText}>Predicted period</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#C9A7EB" }]} />
            <Text style={styles.legendText}>Fertile window</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#B57EDC" }]} />
            <Text style={styles.legendText}>Ovulation</Text>
          </View>
        </View>

        <Pressable
          style={[styles.button, { marginTop: 18 }]}
          onPress={() => navigation.navigate("Main", { screen: "Cycle" })}
          testID="button-back-lotus"
        >
          <Text style={styles.buttonText}>Back to Lotus Cycle</Text>
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
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  legendRow: {
    marginTop: 20,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 10,
  },
  legendText: {
    color: "#5E4953",
    fontSize: 14,
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
});
