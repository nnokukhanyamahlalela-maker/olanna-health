import type { CycleSnapshot, PartnerSharingSettings } from "@shared/schema";

export interface SharedViewPayload {
  phase: { name: string; label: string } | null;
  nextPeriodWindow: { from: string; to: string; confidence: string } | null;
  fertileWindow: { from: string; to: string } | null;
  ovulationWindow: { from: string; to: string } | null;
  moodSummary: { level: string; message: string } | null;
  energySummary: { level: string; message: string } | null;
  tips: string[];
}

function widenDateWindow(from: string | null, to: string | null, precision: string): { from: string; to: string } | null {
  if (!from || !to) return null;
  if (precision === "low") {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setDate(fromDate.getDate() - 1);
    toDate.setDate(toDate.getDate() + 1);
    return {
      from: fromDate.toISOString().split("T")[0],
      to: toDate.toISOString().split("T")[0],
    };
  }
  return { from, to };
}

export function generateSharedView(
  snapshot: CycleSnapshot | null,
  settings: PartnerSharingSettings
): SharedViewPayload {
  if (!snapshot) {
    return {
      phase: null,
      nextPeriodWindow: null,
      fertileWindow: null,
      ovulationWindow: null,
      moodSummary: null,
      energySummary: null,
      tips: settings.shareTipsForPartner
        ? ["Check in with your partner today."]
        : [],
    };
  }

  const result: SharedViewPayload = {
    phase: null,
    nextPeriodWindow: null,
    fertileWindow: null,
    ovulationWindow: null,
    moodSummary: null,
    energySummary: null,
    tips: [],
  };

  if (settings.shareCyclePhase && snapshot.phase) {
    result.phase = {
      name: snapshot.phase,
      label: snapshot.phaseLabel || "",
    };
  }

  if (settings.shareNextPeriodWindow) {
    result.nextPeriodWindow = widenDateWindow(
      snapshot.nextPeriodFrom,
      snapshot.nextPeriodTo,
      settings.precisionLevel
    );
    if (result.nextPeriodWindow && snapshot.nextPeriodConfidence) {
      (result.nextPeriodWindow as any).confidence = snapshot.nextPeriodConfidence;
    }
  }

  if (settings.shareFertileWindow) {
    result.fertileWindow = widenDateWindow(
      snapshot.fertileWindowFrom,
      snapshot.fertileWindowTo,
      settings.precisionLevel
    );
  }

  if (settings.shareOvulationEstimate) {
    result.ovulationWindow = widenDateWindow(
      snapshot.ovulationWindowFrom,
      snapshot.ovulationWindowTo,
      settings.precisionLevel
    );
  }

  if (settings.shareMoodSummary && snapshot.moodLevel) {
    result.moodSummary = {
      level: snapshot.moodLevel,
      message: snapshot.moodMessage || "",
    };
  }

  if (settings.shareEnergySummary && snapshot.energyLevel) {
    result.energySummary = {
      level: snapshot.energyLevel,
      message: snapshot.energyMessage || "",
    };
  }

  if (settings.shareTipsForPartner && snapshot.tips) {
    result.tips = snapshot.tips;
  } else if (settings.shareTipsForPartner) {
    result.tips = ["Check in with your partner today."];
  }

  return result;
}
