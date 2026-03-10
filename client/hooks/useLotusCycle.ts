import { useCallback, useState } from "react";
import { CyclePrediction, CycleProfile } from "../types/cycle";
import {
  getCycleProfile,
  getEffectiveLastPeriodStartDate,
} from "../services/cycleStorage";
import {
  generateCyclePrediction,
  getLotusPhaseContent,
  LotusPhaseContent,
} from "../services/cycleCalculator";

interface UseLotusCycleResult {
  loading: boolean;
  profile: CycleProfile | null;
  prediction: CyclePrediction | null;
  phaseContent: LotusPhaseContent | null;
  refresh: () => Promise<void>;
}

export function useLotusCycle(): UseLotusCycleResult {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CycleProfile | null>(null);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
  const [phaseContent, setPhaseContent] = useState<LotusPhaseContent | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    const storedProfile = await getCycleProfile();
    const effectiveLastPeriodStartDate = await getEffectiveLastPeriodStartDate();

    setProfile(storedProfile);

    if (storedProfile && effectiveLastPeriodStartDate) {
      const computedPrediction = generateCyclePrediction({
        profile: storedProfile,
        effectiveLastPeriodStartDate,
      });

      setPrediction(computedPrediction);
      setPhaseContent(getLotusPhaseContent(computedPrediction.currentPhase));
    } else {
      setPrediction(null);
      setPhaseContent(null);
    }

    setLoading(false);
  }, []);

  return { loading, profile, prediction, phaseContent, refresh };
}
