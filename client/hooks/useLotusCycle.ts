/**
 * useLotusCycle Hook
 *
 * Provides cycle prediction data for the Lotus Cycle screen.
 * Reads from the cycle profile service (populated during onboarding)
 * and generates a full CyclePrediction.
 *
 * Data flow:
 *   1. getCycleProfile(userId) → retrieves baseline CycleProfile from cache/storage
 *   2. storage.getDailyLogs() → retrieves any user-logged flow data
 *   3. getEffectiveLastPeriodStart(profile, logs) → derives the real period start
 *      (uses onboarding baseline until user logs actual data that overrides it)
 *   4. generateCyclePrediction(effectiveProfile) → computes current day, phase,
 *      next period, fertile window, etc.
 *
 * Uses useFocusEffect so the hook re-runs every time the screen comes into focus.
 * This ensures data is fresh after onboarding, after logging periods, or after
 * navigating between tabs.
 *
 * @param userId - The user's ID (pass profile?.id || "" if profile may be null)
 * @returns { data: CyclePrediction | null, loading: boolean }
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getCycleProfile } from "../services/cycleProfileService";
import { generateCyclePrediction } from "../services/cycleCalculator";
import { getEffectiveLastPeriodStart } from "../utils/cycleUtils";
import { storage } from "../lib/storage";
import { CyclePrediction } from "../types/cycle";

export function useLotusCycle(userId: string) {
  const [data, setData] = useState<CyclePrediction | null>(null);
  const [loading, setLoading] = useState(true);

  // useFocusEffect re-runs every time this screen gains focus,
  // ensuring fresh data after onboarding or log changes
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);

        // Step 1: Get the baseline profile (from onboarding cache or storage)
        const profile = await getCycleProfile(userId);

        if (profile) {
          // Step 2: Check for logged flow data that might override predictions
          const logs = await storage.getDailyLogs();

          // Step 3: Determine the real period start (onboarding vs logged data)
          const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
          const effectiveProfile = { ...profile, lastPeriodStartDate: effectiveStart };

          // Step 4: Generate the full prediction
          const prediction = generateCyclePrediction(effectiveProfile);
          if (active) setData(prediction);
        } else {
          if (active) setData(null);
        }

        if (active) setLoading(false);
      }

      load();

      // Cleanup: prevent state updates if the screen loses focus mid-load
      return () => { active = false; };
    }, [userId])
  );

  return { data, loading };
}
