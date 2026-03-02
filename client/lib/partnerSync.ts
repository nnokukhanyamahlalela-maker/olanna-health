import { storage } from "./storage";
import { getDeviceId } from "./deviceId";
import { getApiUrl } from "./query-client";
import { isPartnerLinked, getPartnerRole } from "./partnerStorage";

const PHASE_LABELS: Record<string, string> = {
  menstrual: "Rest & Release",
  follicular: "Growth & Renewal",
  ovulation: "Peak Energy",
  luteal: "Boundaries & Reflection",
};

const PHASE_TIPS: Record<string, string[]> = {
  menstrual: [
    "She may need extra rest right now.",
    "A warm drink or gentle check-in goes a long way.",
    "Keep plans low-key if possible.",
  ],
  follicular: [
    "Energy is rising — great time for planning together.",
    "She may be feeling more social and creative.",
    "Try something new together.",
  ],
  ovulation: [
    "Energy and mood are typically at their peak.",
    "A great time for quality time together.",
    "She may feel more confident and outgoing.",
  ],
  luteal: [
    "She may be more sensitive or need extra patience.",
    "Comfort activities are appreciated.",
    "Check in without judgement.",
  ],
};

export async function pushCycleSnapshot(): Promise<void> {
  try {
    const role = await getPartnerRole();
    if (role !== "primary" && role !== "none") return;

    const linked = await isPartnerLinked();
    if (!linked) return;

    const cycleData = await storage.getCycleData();
    if (!cycleData) return;

    const deviceId = await getDeviceId();
    const logs = await storage.getDailyLogs();
    const todayStr = new Date().toISOString().split("T")[0];
    const todayLog = logs.find((l) => l.date === todayStr);

    let moodLevel: string | null = null;
    let moodMessage: string | null = null;
    if (todayLog?.mood) {
      moodLevel = todayLog.mood;
      moodMessage = getMoodMessage(todayLog.mood);
    }

    let energyLevel: string | null = null;
    let energyMessage: string | null = null;
    if (todayLog?.energy != null) {
      energyLevel = getEnergyLabel(todayLog.energy);
      energyMessage = getEnergyMessage(todayLog.energy);
    }

    const nextPeriodFrom = cycleData.nextPeriodStart;
    const nextPeriodEnd = new Date(cycleData.nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + cycleData.periodLength);

    const snapshot = {
      phase: cycleData.phase,
      phaseLabel: PHASE_LABELS[cycleData.phase] || cycleData.phase,
      nextPeriodFrom,
      nextPeriodTo: nextPeriodEnd.toISOString().split("T")[0],
      nextPeriodConfidence: "estimated",
      fertileWindowFrom: cycleData.fertileWindowStart,
      fertileWindowTo: cycleData.fertileWindowEnd,
      ovulationWindowFrom: cycleData.ovulationDate,
      ovulationWindowTo: cycleData.ovulationDate,
      moodLevel,
      moodMessage,
      energyLevel,
      energyMessage,
      tips: PHASE_TIPS[cycleData.phase] || [],
    };

    const baseUrl = getApiUrl();
    const url = new URL("/api/partner/snapshot", baseUrl);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(snapshot),
    });
  } catch (err) {
    console.warn("Partner sync failed (non-critical):", err);
  }
}

function getMoodMessage(mood: string): string {
  const map: Record<string, string> = {
    great: "Feeling great today",
    good: "In a good mood",
    okay: "Feeling okay",
    low: "Feeling a bit low",
    stressed: "Feeling stressed",
    anxious: "Feeling anxious",
    sad: "Feeling down",
    irritable: "Feeling irritable",
    calm: "Feeling calm",
    happy: "Feeling happy",
    energetic: "Full of energy",
  };
  return map[mood] || "Mood tracked";
}

function getEnergyLabel(energy: number): string {
  if (energy >= 8) return "high";
  if (energy >= 5) return "steady";
  return "low";
}

function getEnergyMessage(energy: number): string {
  if (energy >= 8) return "Energy levels are high";
  if (energy >= 5) return "Energy is at a steady level";
  return "Energy is running low";
}
