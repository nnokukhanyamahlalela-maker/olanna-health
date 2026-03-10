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

        const profile = await getCycleProfile(userId);

        if (!profile) {
          if (active) {
            setMarkedDates({});
            setLoading(false);
          }
          return;
        }

        const logs = await storage.getDailyLogs();

        const effectiveStart = getEffectiveLastPeriodStart(profile, logs);

        const prediction = generateCyclePrediction({
          profile: { ...profile, lastPeriodStartDate: effectiveStart },
          effectiveLastPeriodStartDate: effectiveStart,
        });

        const marks: Record<string, any> = {};

        prediction.periodDates.forEach((date) => {
          marks[date] = {
            marked: true,
            type: "predictedPeriod",
          };
        });

        marks[prediction.ovulationDate] = {
          marked: true,
          type: "ovulation",
        };

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
