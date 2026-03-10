import { useEffect, useState } from "react";
import { getCycleProfile } from "../services/cycleProfileService";
import { generateCyclePrediction } from "../services/cycleCalculator";

export function useCalendarCycle(userId: string) {
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const profile = await getCycleProfile(userId);

      if (!profile) {
        setMarkedDates({});
        setLoading(false);
        return;
      }

      const prediction = generateCyclePrediction(profile);

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

      setMarkedDates(marks);
      setLoading(false);
    }

    load();
  }, [userId]);

  return { markedDates, loading };
}
