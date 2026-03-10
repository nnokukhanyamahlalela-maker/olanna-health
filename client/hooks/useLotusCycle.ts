import { useEffect, useState } from "react";
import { getCycleProfile } from "../services/cycleProfileService";
import { generateCyclePrediction } from "../services/cycleCalculator";
import { getEffectiveLastPeriodStart } from "../utils/cycleUtils";
import { storage } from "../lib/storage";
import { CyclePrediction } from "../types/cycle";

export function useLotusCycle(userId: string) {
  const [data, setData] = useState<CyclePrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const profile = await getCycleProfile(userId);

      if (profile) {
        const logs = await storage.getDailyLogs();
        const effectiveStart = getEffectiveLastPeriodStart(profile, logs);
        const effectiveProfile = { ...profile, lastPeriodStartDate: effectiveStart };
        const prediction = generateCyclePrediction(effectiveProfile);
        setData(prediction);
      } else {
        setData(null);
      }

      setLoading(false);
    }

    load();
  }, [userId]);

  return { data, loading };
}
