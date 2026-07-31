/**
 * Lanna's Check-In — Pattern Detection Engine
 *
 * Analyzes cycle history and symptom logs over rolling windows
 * (3, 6, 12 cycles) to detect patterns associated with four
 * conditions: irregular periods, PMOS, endometriosis, and perimenopause.
 *
 * IMPORTANT: This module surfaces patterns only — it never diagnoses.
 * All output must be presented via LANNA_CONDITION_CONTENT copy
 * which enforces the "Lanna suggests, never diagnoses" rule.
 */

import { UserProfile, CycleData } from "./storage";
import { SymptomLog } from "./symptomSchema";
import type { ConditionId, NudgeTier } from "../data/lannaContent";
import { FEATURES } from "@/constants/features";

// ─── Output types ─────────────────────────────────────────────────────────────

export interface PatternEvidence {
  description: string;
  dataPoints: number;
}

export interface DetectedPattern {
  conditionId: ConditionId;
  tier: NudgeTier;
  /** Human-readable evidence for debugging / display */
  evidence: PatternEvidence[];
  /** ISO date when this was detected */
  detectedAt: string;
  /** Confidence score 0–1 (informational only, never shown to user) */
  confidence: number;
}

export interface PatternEngineInput {
  profile: UserProfile;
  cycleData: CycleData | null;
  symptomLogs: SymptomLog[];
  /** Today's date (ISO, override for testing) */
  today?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(a: string, b: string): number {
  return Math.abs(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function logsWithin(logs: SymptomLog[], days: number, today: string): SymptomLog[] {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return logs.filter((l) => l.date >= cutoffStr);
}

function logsForSymptoms(logs: SymptomLog[], ids: string[]): SymptomLog[] {
  return logs.filter((l) => ids.includes(l.symptomId));
}

function userAgeYears(profile: UserProfile): number | null {
  if (!profile.dateOfBirth) return null;
  const dob = new Date(profile.dateOfBirth + "T12:00:00");
  const now = new Date();
  return Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

// ─── Condition detectors ──────────────────────────────────────────────────────

/**
 * Irregular periods:
 *   Tier 1 — stdDev of cycle lengths > 4 days across ≥ 3 recent cycles
 *   Tier 2 — stdDev > 7 days across ≥ 4 cycles, or any cycle < 21 or > 35 days
 *   Tier 3 — stdDev > 10 days across ≥ 5 cycles, or period missing > 45 days
 */
function detectIrregularPeriods(
  profile: UserProfile,
  cycleData: CycleData | null,
  today: string
): DetectedPattern | null {
  const cycles = cycleData?.cycles ?? [];
  const recentCycles = cycles.slice(-12);
  if (recentCycles.length < 2) return null;

  const lengths = recentCycles.map((c) => c.length).filter((l) => l > 0);
  if (lengths.length < 2) return null;

  const sd = stdDev(lengths);
  const hasVeryShort = lengths.some((l) => l < 21);
  const hasVeryLong = lengths.some((l) => l > 35);
  const evidence: PatternEvidence[] = [];

  // Check if period is currently very late
  const daysSinceLastPeriod = profile.lastPeriodStart
    ? daysBetween(profile.lastPeriodStart, today)
    : 0;
  const expectedCycleLength = profile.cycleLength || 28;
  const daysLate = Math.max(0, daysSinceLastPeriod - expectedCycleLength);

  if (sd > 4) {
    evidence.push({
      description: `Cycle length varies by ~${Math.round(sd)} days across recent cycles`,
      dataPoints: lengths.length,
    });
  }
  if (hasVeryShort) evidence.push({ description: "Some cycles under 21 days", dataPoints: lengths.filter(l => l < 21).length });
  if (hasVeryLong) evidence.push({ description: "Some cycles over 35 days", dataPoints: lengths.filter(l => l > 35).length });
  if (daysLate > 7) evidence.push({ description: `Current period is ${daysLate} days late`, dataPoints: 1 });

  if (evidence.length === 0) return null;

  let tier: NudgeTier = 1;
  let confidence = 0.3;

  if (daysLate > 45 || (sd > 10 && lengths.length >= 5)) {
    tier = 3;
    confidence = 0.85;
  } else if ((sd > 7 && lengths.length >= 4) || (hasVeryShort || hasVeryLong) && lengths.length >= 4) {
    tier = 2;
    confidence = 0.6;
  } else if (sd > 4 && lengths.length >= 3) {
    tier = 1;
    confidence = 0.4;
  } else {
    return null;
  }

  return {
    conditionId: "irregular_periods",
    tier,
    evidence,
    detectedAt: today,
    confidence,
  };
}

/**
 * PMOS (Rotterdam-adjacent criteria, symptom cluster approach):
 *   Symptoms tracked: irregular cycles, acne (jawline/hormonal), excess hair,
 *   hair thinning, weight changes, fatigue after meals, pelvic heaviness.
 *
 *   Tier 1 — 2+ unique PMOS symptoms in last 60 days
 *   Tier 2 — 3+ unique PMOS symptoms over 90 days, confirmed pattern
 *   Tier 3 — 4+ unique PMOS symptoms over 120 days with ≥ 2 cycles irregular
 */
function detectPMOS(
  profile: UserProfile,
  cycleData: CycleData | null,
  symptomLogs: SymptomLog[],
  today: string
): DetectedPattern | null {
  const PMOS_SYMPTOM_IDS = [
    "acne-jawline", "acne-chin", "acne-skin",
    "excess-facial-hair", "excess-hair", "hair-thinning",
    "irregular-cycle", "irregular-cycles", "long-cycles",
    "weight-changes", "fatigue-after-meals",
    "pelvic-heaviness", "skin-darkening",
  ];

  const logs90 = logsWithin(symptomLogs, 90, today);
  const logs120 = logsWithin(symptomLogs, 120, today);
  const logs60 = logsWithin(symptomLogs, 60, today);

  const pmosLogs60 = logsForSymptoms(logs60, PMOS_SYMPTOM_IDS);
  const pmosLogs90 = logsForSymptoms(logs90, PMOS_SYMPTOM_IDS);
  const pmosLogs120 = logsForSymptoms(logs120, PMOS_SYMPTOM_IDS);

  const unique60 = new Set(pmosLogs60.map((l) => l.symptomId));
  const unique90 = new Set(pmosLogs90.map((l) => l.symptomId));
  const unique120 = new Set(pmosLogs120.map((l) => l.symptomId));

  const cycles = cycleData?.cycles ?? [];
  const recentLengths = cycles.slice(-6).map((c) => c.length);
  const irregularCycleCount = recentLengths.filter((l) => l < 21 || l > 35).length;

  const evidence: PatternEvidence[] = [];
  if (unique90.size >= 2) {
    evidence.push({ description: `${unique90.size} distinct PMOS-related symptoms logged in past 3 months`, dataPoints: pmosLogs90.length });
  }
  if (irregularCycleCount >= 2) {
    evidence.push({ description: `${irregularCycleCount} irregular cycles in recent history`, dataPoints: irregularCycleCount });
  }

  if (evidence.length === 0 && unique60.size < 2) return null;

  let tier: NudgeTier = 1;
  let confidence = 0.3;

  if (unique120.size >= 4 && irregularCycleCount >= 2) {
    tier = 3;
    confidence = 0.8;
  } else if (unique90.size >= 3) {
    tier = 2;
    confidence = 0.6;
  } else if (unique60.size >= 2) {
    tier = 1;
    confidence = 0.35;
    evidence.push({ description: `${unique60.size} PMOS-related symptoms noted recently`, dataPoints: pmosLogs60.length });
  } else {
    return null;
  }

  return {
    conditionId: "pmos",
    tier,
    evidence,
    detectedAt: today,
    confidence,
  };
}

/**
 * Endometriosis (pain pattern analysis):
 *   Pain symptom IDs tracked across categories.
 *
 *   Tier 1 — 2+ endo pain symptoms logged with severity ≥ 2
 *   Tier 2 — 3+ endo pain symptoms, any with severity ≥ 3, or pain outside period window
 *   Tier 3 — 4+ high-severity pain logs (severity ≥ 4) or escalating trend over 3+ months
 */
function detectEndometriosis(
  profile: UserProfile,
  symptomLogs: SymptomLog[],
  today: string
): DetectedPattern | null {
  const ENDO_SYMPTOM_IDS = [
    "deep-pelvic-pain", "pain-during-sex", "pain-after-sex",
    "pain-bowel-movement", "chronic-pelvic-pain", "pain-outside-period",
    "pelvic-pain", "lower-back-pain", "cramps",
    "left-ovary-pain", "right-ovary-pain",
  ];

  const HIGH_SEVERITY_IDS = [
    "deep-pelvic-pain", "pain-during-sex", "chronic-pelvic-pain",
    "pain-outside-period", "pain-bowel-movement",
  ];

  const logs90 = logsWithin(symptomLogs, 90, today);
  const logs180 = logsWithin(symptomLogs, 180, today);

  const endoLogs90 = logsForSymptoms(logs90, ENDO_SYMPTOM_IDS);
  const endoLogs180 = logsForSymptoms(logs180, ENDO_SYMPTOM_IDS);

  const severeSpecificLogs = logsForSymptoms(
    endoLogs180.filter((l) => (l.severity ?? 0) >= 4),
    HIGH_SEVERITY_IDS
  );

  const logsWithAnySeverity = endoLogs90.filter((l) => (l.severity ?? 0) >= 2);
  const uniqueSymptoms90 = new Set(endoLogs90.map((l) => l.symptomId));

  // Escalation check: compare average severity in first vs second half of logs
  const sorted = [...endoLogs180].sort((a, b) => a.date.localeCompare(b.date));
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);
  const avgSev = (logs: SymptomLog[]) =>
    logs.length > 0
      ? logs.reduce((s, l) => s + (l.severity ?? 0), 0) / logs.length
      : 0;
  const isEscalating =
    sorted.length >= 4 && avgSev(secondHalf) > avgSev(firstHalf) * 1.25;

  const evidence: PatternEvidence[] = [];
  if (uniqueSymptoms90.size >= 2) {
    evidence.push({ description: `${uniqueSymptoms90.size} endometriosis-associated pain types logged`, dataPoints: endoLogs90.length });
  }
  if (severeSpecificLogs.length >= 2) {
    evidence.push({ description: `${severeSpecificLogs.length} high-severity specific pain logs`, dataPoints: severeSpecificLogs.length });
  }
  if (isEscalating) {
    evidence.push({ description: "Pain severity appears to be escalating over time", dataPoints: sorted.length });
  }

  if (evidence.length === 0 && uniqueSymptoms90.size < 2) return null;

  let tier: NudgeTier = 1;
  let confidence = 0.3;

  if (severeSpecificLogs.length >= 4 || (isEscalating && severeSpecificLogs.length >= 2)) {
    tier = 3;
    confidence = 0.82;
  } else if (uniqueSymptoms90.size >= 3 || severeSpecificLogs.length >= 2) {
    tier = 2;
    confidence = 0.62;
  } else if (logsWithAnySeverity.length >= 2) {
    tier = 1;
    confidence = 0.38;
  } else {
    return null;
  }

  return {
    conditionId: "endometriosis",
    tier,
    evidence,
    detectedAt: today,
    confidence,
  };
}

/**
 * Perimenopause:
 *   Age-gated (≥ 35) + cycle gap + vasomotor symptoms
 *
 *   Tier 1 — Age ≥ 38, cycles getting longer or any gap > 40 days
 *   Tier 2 — Age ≥ 40, cycle gap > 45 days + any vasomotor symptoms
 *   Tier 3 — Age ≥ 40, gap > 60 days or 2+ vasomotor symptom types logged
 */
function detectMenopause(
  profile: UserProfile,
  cycleData: CycleData | null,
  symptomLogs: SymptomLog[],
  today: string
): DetectedPattern | null {
  const age = userAgeYears(profile);
  if (!age || age < 35) return null;

  const VASOMOTOR_IDS = [
    "hot-flashes", "night-sweats", "heat-intolerance",
    "sleep-disruption", "insomnia", "waking-at-night",
    "mood-swings", "vaginal-dryness",
  ];

  const cycles = cycleData?.cycles ?? [];
  const recentCycles = cycles.slice(-6);
  const lastLength = recentCycles[recentCycles.length - 1]?.length ?? 0;
  const isGettingLonger =
    recentCycles.length >= 3 &&
    recentCycles[recentCycles.length - 1]?.length >
      recentCycles[recentCycles.length - 3]?.length + 5;

  const daysSinceLast = profile.lastPeriodStart
    ? daysBetween(profile.lastPeriodStart, today)
    : 0;
  const expectedLength = profile.cycleLength || 28;
  const cycleGap = Math.max(0, daysSinceLast - expectedLength);

  const vasomotorLogs = logsForSymptoms(symptomLogs, VASOMOTOR_IDS);
  const uniqueVasomotor = new Set(vasomotorLogs.map((l) => l.symptomId));

  const evidence: PatternEvidence[] = [];
  if (cycleGap > 20) evidence.push({ description: `Current cycle is ${cycleGap} days longer than expected`, dataPoints: 1 });
  if (isGettingLonger) evidence.push({ description: "Cycles have been progressively getting longer", dataPoints: recentCycles.length });
  if (uniqueVasomotor.size >= 1) evidence.push({ description: `${uniqueVasomotor.size} vasomotor symptoms logged (hot flashes, sleep disruption)`, dataPoints: vasomotorLogs.length });
  if (age >= 40) evidence.push({ description: `Age ${age} — perimenopause is common in this range`, dataPoints: 1 });

  if (evidence.length < 2 && cycleGap < 20 && uniqueVasomotor.size === 0) return null;

  let tier: NudgeTier = 1;
  let confidence = 0.3;

  if ((cycleGap > 60 || uniqueVasomotor.size >= 2) && age >= 40) {
    tier = 3;
    confidence = 0.78;
  } else if ((cycleGap > 45 || isGettingLonger) && uniqueVasomotor.size >= 1 && age >= 40) {
    tier = 2;
    confidence = 0.58;
  } else if ((cycleGap > 40 || isGettingLonger) && age >= 38) {
    tier = 1;
    confidence = 0.4;
  } else {
    return null;
  }

  return {
    conditionId: "menopause",
    tier,
    evidence,
    detectedAt: today,
    confidence,
  };
}

// ─── Main engine ──────────────────────────────────────────────────────────────

/**
 * Run all condition detectors and return a prioritised list of patterns.
 * Patterns are sorted: highest tier first, then by confidence.
 */
export function runPatternEngine(input: PatternEngineInput): DetectedPattern[] {
  const today = input.today ?? new Date().toISOString().split("T")[0];
  const { profile, cycleData, symptomLogs } = input;

  const results: DetectedPattern[] = [];

  const irregular = detectIrregularPeriods(profile, cycleData, today);
  if (irregular) results.push(irregular);

  const pmos = detectPMOS(profile, cycleData, symptomLogs, today);
  if (pmos) results.push(pmos);

  const endo = detectEndometriosis(profile, symptomLogs, today);
  if (endo) results.push(endo);

  // Perimenopause detection is feature-flagged off until menopause research
  // is complete. The detectMenopause function and all its content remain intact.
  if (FEATURES.PERIMENOPAUSE_ENABLED) {
    const menopause = detectMenopause(profile, cycleData, symptomLogs, today);
    if (menopause) results.push(menopause);
  }

  // Sort: tier 3 first, then 2, then 1; within tier sort by confidence desc
  return results.sort((a, b) => {
    if (b.tier !== a.tier) return b.tier - a.tier;
    return b.confidence - a.confidence;
  });
}
