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

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);

        const profile = await getCycleProfile(userId);

        if (profile) {
          const logs = await storage.getDailyLogs();

          const effectiveStart = getEffectiveLastPeriodStart(profile, logs);

          const prediction = generateCyclePrediction({
            profile: { ...profile, lastPeriodStartDate: effectiveStart },
            effectiveLastPeriodStartDate: effectiveStart,
          });
          if (active) setData(prediction);
        } else {
          if (active) setData(null);
        }

        if (active) setLoading(false);
      }

      load();

      return () => { active = false; };
    }, [userId])
  );

  return { data, loading };
}
