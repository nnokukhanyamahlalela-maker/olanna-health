/**
 * useCalendarCycle Hook
 *
 * Provides marked date data for the Calendar screen.
 * Reads from the same cycle profile service as useLotusCycle, ensuring
 * both screens show consistent predictions from the same source of truth.
 *
 * Data flow:
 *   1. getCycleProfile(userId) → retrieves baseline CycleProfile
 *   2. storage.getDailyLogs() → retrieves user-logged flow data
 *   3. getEffectiveLastPeriodStart(profile, logs) → derives real period start
 *   4. generateCyclePrediction(effectiveProfile) → generates predictions
 *   5. Transforms prediction into a markedDates record for the calendar UI
 *
 * The markedDates record maps ISO date strings to marker objects with:
 *   - type: "predictedPeriod" | "ovulation" | "fertileWindow"
 *   - marked: true
 *
 * Uses useFocusEffect to re-run on every screen focus, keeping calendar
 * markers fresh after onboarding or period logging changes.
 *
 * @param userId - The user's ID (pass profile?.id || "" if profile may be null)
 * @returns { markedDates: Record<string, any>, loading: boolean }
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getCycleProfile } from "../services/cycleProfileService";
import { generateCyclePrediction } from "../services/cycleCalculator";
import { getEffectiveLastPeriodStart } from "../utils/cycleUtils";
import { storage } from "../lib/storage";

export function useCalendarCycle(userId: string) {
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);

        // Step 1: Get baseline profile from onboarding cache or storage
        const profile = await getCycleProfile(userId);

        if (!profile) {
          if (active) {
            setMarkedDates({});
            setLoading(false);
          }
          return;
        }

        // Step 2: Load logged flow data to allow overrides
        const logs = await storage.getDailyLogs();

        // Step 3: Derive effective period start (onboarding vs logged data)
        const effectiveStart = getEffectiveLastPeriodStart(profile, logs);

        // Step 4: Generate the prediction
        const prediction = generateCyclePrediction({
          profile,
          effectiveLastPeriodStartDate: effectiveStart,
        });

        // Step 5: Build the markedDates record for the calendar UI
        const marks: Record<string, any> = {};

        // Mark predicted period days
        prediction.periodDates.forEach((date) => {
          marks[date] = {
            marked: true,
            type: "predictedPeriod",
          };
        });

        // Mark ovulation day
        marks[prediction.ovulationDate] = {
          marked: true,
          type: "ovulation",
        };

        // Mark fertile window days
        let fertileCursor = new Date(prediction.fertileWindowStart);
        const fertileEnd = new Date(prediction.fertileWindowEnd);

        while (fertileCursor <= fertileEnd) {
          const key = fertileCursor.toISOString().split("T")[0];
          marks[key] = {
            ...(marks[key] || {}),
            marked: true,
            type: "fertileWindow",
          };
          fertileCursor.setDate(fertileCursor.getDate() + 1);
        }

        if (active) {
          setMarkedDates(marks);
          setLoading(false);
        }
      }

      load();

      return () => { active = false; };
    }, [userId])
  );

  return { markedDates, loading };
}
