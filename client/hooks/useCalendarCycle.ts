// src/hooks/useCalendarCycle.ts

import { useCallback, useEffect, useState } from "react";
import {
  getCycleProfile,
  getEffectiveLastPeriodStartDate,
} from "../services/cycleStorage";
import { generateCyclePrediction } from "../services/cycleCalculator";

type MarkedDates = Record<string, any>;

function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
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
        marked: true,
        dotColor: "#E88CA2",
        activeOpacity: 0.7,
      };
    });

    enumerateDates(
      prediction.fertileWindowStart,
      prediction.fertileWindowEnd
    ).forEach((date) => {
      marks[date] = {
        ...(marks[date] || {}),
        marked: true,
        dotColor: "#B8A1D9",
      };
    });

    marks[prediction.ovulationDate] = {
      ...(marks[prediction.ovulationDate] || {}),
      selected: true,
      selectedColor: "#C86DD7",
    };

    setMarkedDates(marks);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, markedDates, refresh };
}
