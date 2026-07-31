/**
 * buildHealthSummary
 *
 * Aggregates DailyLogs and SymptomLogs into a structured summary object that
 * can be rendered in HealthSummarySheet or converted to shareable text.
 *
 * Deliberately kept client-side: no AI, no backend. Any amount of data is
 * useful — the blurb always frames the data as valid regardless of volume.
 */

import { DailyLog, UserProfile } from "./storage";
import { SymptomLog, DailyCheckIn } from "./symptomSchema";
import { getPhaseForDay } from "@/constants/phaseConfig";
import type { Phase } from "@/constants/phaseConfig";

export interface SymptomFreq {
  id: string;
  name: string;
  count: number;
  avgSeverity: number | null;
}

export interface PhaseSnapshot {
  phase: Phase;
  label: string;
  logCount: number;
  topSymptoms: string[]; // display names, up to 4
}

export interface HealthSummary {
  generatedAt: string;       // ISO date string
  dateRange: { start: string; end: string } | null;
  totalLogDays: number;
  cycleCount: number;
  cycleLength: number;
  periodLength: number;
  flowDays: number;
  heavyFlowDays: number;
  topSymptoms: SymptomFreq[];   // sorted by count desc
  phaseSnapshots: PhaseSnapshot[];
  personalNotes: string[];      // non-empty notes from DailyLogs
  blurb: string;                // plain-language overview
}

const PHASE_LABELS: Record<Phase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulatory",
  luteal: "Luteal",
  late: "Late / Extended",
};

// Rough symptom ID → display name mapping for the most common IDs.
// Falls back to capitalising the id if not found.
const SYMPTOM_NAMES: Record<string, string> = {
  cramps: "Cramps",
  bloating: "Bloating",
  "lower-back-pain": "Lower back pain",
  "breast-tenderness": "Breast tenderness",
  headache: "Headache",
  migraine: "Migraine",
  nausea: "Nausea",
  fatigue: "Fatigue",
  "fatigue-mild": "Fatigue (mild)",
  "fatigue-moderate": "Fatigue (moderate)",
  "fatigue-extreme": "Fatigue (extreme)",
  "low-mood": "Low mood",
  irritable: "Irritability",
  anxious: "Anxiety",
  "sugar-cravings": "Sugar cravings",
  "deep-pelvic-pain": "Deep pelvic pain",
  "chronic-pelvic-pain": "Chronic pelvic pain",
  "pain-during-sex": "Pain during sex",
  "pain-bowel-movement": "Pain with bowel movements",
  "irregular-bleeding": "Irregular bleeding",
  spotting: "Spotting",
  "flow-light": "Light flow",
  "flow-medium": "Medium flow",
  "flow-heavy": "Heavy flow",
  "left-ovary-pain": "Left ovary pain",
  "right-ovary-pain": "Right ovary pain",
  "sleep-quality-poor": "Poor sleep",
  "cm-eggwhite": "Egg-white discharge",
  "libido-up": "Increased libido",
  dizziness: "Dizziness",
  "water-retention": "Water retention",
};

function symptomName(id: string): string {
  return SYMPTOM_NAMES[id] || id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function buildHealthSummary(
  logs: DailyLog[],
  symptomLogs: SymptomLog[],
  profile: UserProfile | null,
  checkIns: DailyCheckIn[] = []
): HealthSummary {
  const generatedAt = toISO(new Date());

  // ── Merge symptom logs from both sources (dedupe by id) ──────────────────────
  // getDailyCheckIns() stores symptoms directly on the check-in record.
  // getSymptomLogs() is a separate flat store. Union both to avoid missing data.
  const checkInSymptoms: SymptomLog[] = checkIns.flatMap((ci) => ci.symptoms || []);
  const seenIds = new Set<string>();
  const mergedSymptomLogs: SymptomLog[] = [];
  [...checkInSymptoms, ...symptomLogs].forEach((sl) => {
    if (!seenIds.has(sl.id)) {
      seenIds.add(sl.id);
      mergedSymptomLogs.push(sl);
    }
  });

  // ── Date range ──────────────────────────────────────────────────────────────
  const logDates = logs.map((l) => l.date).sort();
  const symDates = mergedSymptomLogs.map((l) => l.date).sort();
  const checkInDates = checkIns.map((ci) => ci.date).sort();
  const allDates = [...logDates, ...symDates, ...checkInDates].sort();
  const dateRange = allDates.length
    ? { start: allDates[0], end: allDates[allDates.length - 1] }
    : null;

  const uniqueLogDays = new Set(allDates).size;

  // ── Cycle info ───────────────────────────────────────────────────────────────
  const cycleLength = profile?.cycleLength || 28;
  const periodLength = profile?.periodLength || 5;
  const lastPeriodStart = profile?.lastPeriodStart;

  // Count cycles: estimate from date range
  let cycleCount = 0;
  if (dateRange) {
    const days = Math.round(
      (new Date(dateRange.end + "T12:00:00").getTime() -
        new Date(dateRange.start + "T12:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    );
    cycleCount = Math.max(1, Math.floor(days / cycleLength));
  }

  // ── Flow ────────────────────────────────────────────────────────────────────
  const flowLogs = logs.filter((l) => l.flow && l.flow !== "spotting");
  const heavyFlowLogs = logs.filter((l) => l.flow === "heavy");

  // ── Symptom frequency (merged source) ───────────────────────────────────────
  const freqMap = new Map<string, { count: number; severities: number[] }>();

  mergedSymptomLogs.forEach((sl) => {
    const existing = freqMap.get(sl.symptomId) || { count: 0, severities: [] };
    existing.count += 1;
    if (sl.severity) existing.severities.push(sl.severity);
    freqMap.set(sl.symptomId, existing);
  });

  // Also incorporate DailyLog.symptoms (string[]) which are plain symptom IDs
  logs.forEach((l) => {
    (l.symptoms || []).forEach((id) => {
      const existing = freqMap.get(id) || { count: 0, severities: [] };
      existing.count += 1;
      freqMap.set(id, existing);
    });
  });

  const topSymptoms: SymptomFreq[] = Array.from(freqMap.entries())
    .map(([id, data]) => ({
      id,
      name: symptomName(id),
      count: data.count,
      avgSeverity:
        data.severities.length
          ? Math.round((data.severities.reduce((a, b) => a + b, 0) / data.severities.length) * 10) / 10
          : null,
    }))
    .filter((s) => !["flow-light", "flow-medium", "flow-heavy", "spotting"].includes(s.id))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Phase snapshots ──────────────────────────────────────────────────────────
  const phaseSymptomMap = new Map<Phase, Map<string, number>>();
  const phaseLogCount = new Map<Phase, number>();

  if (lastPeriodStart) {
    const refDate = new Date(lastPeriodStart + "T00:00:00");

    mergedSymptomLogs.forEach((sl) => {
      const logDate = new Date(sl.date + "T00:00:00");
      const daysSince = Math.floor((logDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = Math.abs(daysSince % cycleLength) + 1;
      const phase = getPhaseForDay(cycleDay, cycleLength, periodLength);

      const count = phaseLogCount.get(phase) || 0;
      phaseLogCount.set(phase, count + 1);

      const phaseMap = phaseSymptomMap.get(phase) || new Map();
      phaseMap.set(sl.symptomId, (phaseMap.get(sl.symptomId) || 0) + 1);
      phaseSymptomMap.set(phase, phaseMap);
    });
  }

  const phaseOrder: Phase[] = ["menstrual", "follicular", "ovulation", "luteal"];
  const phaseSnapshots: PhaseSnapshot[] = phaseOrder
    .map((phase) => {
      const symMap = phaseSymptomMap.get(phase);
      const top = symMap
        ? Array.from(symMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([id]) => symptomName(id))
        : [];
      return {
        phase,
        label: PHASE_LABELS[phase],
        logCount: phaseLogCount.get(phase) || 0,
        topSymptoms: top,
      };
    })
    .filter((p) => p.logCount > 0);

  // ── Personal notes (from both DailyLog and DailyCheckIn) ────────────────────
  const notesByDate = new Map<string, string>();
  logs.forEach((l) => {
    if (l.notes?.trim()) notesByDate.set(l.date, l.notes.trim());
  });
  checkIns.forEach((ci) => {
    if (ci.notes?.trim()) {
      // Merge: append check-in note if a daily log note already exists for same date
      const existing = notesByDate.get(ci.date);
      notesByDate.set(ci.date, existing ? `${existing}; ${ci.notes.trim()}` : ci.notes.trim());
    }
  });
  const personalNotes = Array.from(notesByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, note]) => `${formatDisplay(date)}: ${note}`);

  // ── Blurb ────────────────────────────────────────────────────────────────────
  let blurb = "";
  if (uniqueLogDays === 0) {
    blurb =
      "You haven't logged any data yet. Even a few days of entries are enough for your provider to start seeing your patterns.";
  } else if (cycleCount >= 3) {
    blurb = `You've tracked ${uniqueLogDays} days across ${cycleCount} cycles — enough for your provider to identify meaningful patterns. Your data tells a real story.`;
  } else if (cycleCount >= 1) {
    blurb = `You've collected ${uniqueLogDays} days of data across ${cycleCount > 1 ? cycleCount + " cycles" : "your first cycle"}. Even this early, your logs help a provider understand what's normal for you.`;
  } else {
    blurb = `You've logged ${uniqueLogDays} day${uniqueLogDays !== 1 ? "s" : ""} so far. Every entry adds to your health picture — even a few weeks of logs helps your provider see patterns.`;
  }

  return {
    generatedAt,
    dateRange,
    totalLogDays: uniqueLogDays,
    cycleCount,
    cycleLength,
    periodLength,
    flowDays: flowLogs.length,
    heavyFlowDays: heavyFlowLogs.length,
    topSymptoms,
    phaseSnapshots,
    personalNotes,
    blurb,
  };
}

/**
 * Converts a HealthSummary into a plain-text string suitable for sharing or
 * copying. Pass includeNotes=false to strip personal free-text entries for
 * privacy when sharing externally.
 */
export function summaryToShareText(
  summary: HealthSummary,
  includeNotes: boolean
): string {
  const lines: string[] = [];

  lines.push("OLANNA HEALTH SUMMARY");
  lines.push(`Generated: ${formatDisplay(summary.generatedAt)}`);
  lines.push("");

  if (summary.dateRange) {
    lines.push(
      `Data collected: ${formatDisplay(summary.dateRange.start)} – ${formatDisplay(summary.dateRange.end)}`
    );
  }
  lines.push(`Tracking: ${summary.totalLogDays} day${summary.totalLogDays !== 1 ? "s" : ""} logged`);
  if (summary.cycleCount > 0) {
    lines.push(`Cycles covered: ${summary.cycleCount}`);
  }
  lines.push(`Average cycle length: ${summary.cycleLength} days`);
  lines.push("");

  if (summary.flowDays > 0) {
    lines.push("FLOW");
    lines.push(`Flow logged: ${summary.flowDays} day${summary.flowDays !== 1 ? "s" : ""}`);
    if (summary.heavyFlowDays > 0) {
      lines.push(`Heavy flow: ${summary.heavyFlowDays} day${summary.heavyFlowDays !== 1 ? "s" : ""}`);
    }
    lines.push("");
  }

  if (summary.topSymptoms.length > 0) {
    lines.push("TOP SYMPTOMS");
    summary.topSymptoms.slice(0, 8).forEach((s) => {
      const sev = s.avgSeverity ? ` (avg severity ${s.avgSeverity}/5)` : "";
      lines.push(`• ${s.name}: ${s.count} occurrence${s.count !== 1 ? "s" : ""}${sev}`);
    });
    lines.push("");
  }

  if (summary.phaseSnapshots.length > 0) {
    lines.push("BY CYCLE PHASE");
    summary.phaseSnapshots.forEach((p) => {
      lines.push(`${p.label}:`);
      if (p.topSymptoms.length > 0) {
        lines.push(`  Most logged — ${p.topSymptoms.join(", ")}`);
      } else {
        lines.push("  No symptoms logged");
      }
    });
    lines.push("");
  }

  if (includeNotes && summary.personalNotes.length > 0) {
    lines.push("PERSONAL NOTES");
    summary.personalNotes.forEach((n) => lines.push(`• ${n}`));
    lines.push("");
  }

  lines.push("─────────────────────────────");
  lines.push("Prepared with Olanna Health");
  lines.push("Your provider can use this to understand your cycle and symptom patterns.");

  return lines.join("\n");
}
