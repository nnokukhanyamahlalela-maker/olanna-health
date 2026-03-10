// src/hooks/useLotusCycle.ts

import { useCallback, useEffect, useState } from "react";
import { CyclePrediction, CycleProfile } from "../types/cycle";
import {
  getCycleProfile,
  getEffectiveLastPeriodStartDate,
} from "../services/cycleStorage";
import { generateCyclePrediction } from "../services/cycleCalculator";

interface UseLotusCycleResult {
  loading: boolean;
  profile: CycleProfile | null;
  prediction: CyclePrediction | null;
  refresh: () => Promise<void>;
}

export function useLotusCycle(): UseLotusCycleResult {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CycleProfile | null>(null);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    const storedProfile = await getCycleProfile();
    const effectiveLastPeriodStartDate = await getEffectiveLastPeriodStartDate();

    setProfile(storedProfile);

    if (storedProfile && effectiveLastPeriodStartDate) {
      const computed = generateCyclePrediction({
        profile: storedProfile,
        effectiveLastPeriodStartDate,
      });
      setPrediction(computed);
    } else {
      setPrediction(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, profile, prediction, refresh };
}
