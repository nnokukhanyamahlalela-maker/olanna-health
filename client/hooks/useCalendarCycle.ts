import { useCallback, useState } from "react";
import {
  getCycleProfile,
  getEffectiveLastPeriodStartDate,
} from "../services/cycleStorage";
import { generateCyclePrediction } from "../services/cycleCalculator";

type MarkedDates = Record<string, any>;

function enumerateDates(start: string, end: string): string[] {
  const values: string[] = [];
  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    values.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return values;
}

export function useCalendarCycle() {
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const refresh = useCallback(async () => {
    setLoading(true);

    const profile = await getCycleProfile();
    const effectiveLastPeriodStartDate = await getEffectiveLastPeriodStartDate();

    if (!profile || !effectiveLastPeriodStartDate) {
      setMarkedDates({});
      setLoading(false);
      return;
    }

    const prediction = generateCyclePrediction({
      profile,
      effectiveLastPeriodStartDate,
    });

    const marks: MarkedDates = {};

    prediction.periodDates.forEach((date) => {
      marks[date] = {
        ...(marks[date] || {}),
        selected: true,
        selectedColor: "#EAA4B5",
      };
    });

    enumerateDates(
      prediction.fertileWindowStart,
      prediction.fertileWindowEnd
    ).forEach((date) => {
      marks[date] = {
        ...(marks[date] || {}),
        marked: true,
        dotColor: "#C9A7EB",
      };
    });

    marks[prediction.ovulationDate] = {
      ...(marks[prediction.ovulationDate] || {}),
      selected: true,
      selectedColor: "#B57EDC",
      marked: true,
      dotColor: "#FFFFFF",
    };

    const todayKey = new Date().toISOString().split("T")[0];
    marks[todayKey] = {
      ...(marks[todayKey] || {}),
      customStyles: {
        container: {
          borderWidth: 1,
          borderColor: "#D48AA3",
          borderRadius: 10,
        },
        text: {
          fontWeight: "700",
        },
      },
    };

    setMarkedDates(marks);
    setLoading(false);
  }, []);

  return { loading, markedDates, refresh };
}
