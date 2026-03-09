import { useEffect, useState } from "react";
import { getCycleProfile } from "../services/cycleProfileService";
import { generateCyclePrediction } from "../services/cycleCalculator";
import { CyclePrediction } from "../types/cycle";

export function useLotusCycle(userId: string) {
  const [data, setData] = useState<CyclePrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const profile = await getCycleProfile(userId);

      if (profile) {
        const prediction = generateCyclePrediction(profile);
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
