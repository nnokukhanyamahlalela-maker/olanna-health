/**
 * Lanna's Check-In — Nudge State Persistence
 *
 * Tracks per-condition nudge state so we can:
 *   - Not show the same nudge every time the app opens
 *   - Resurface dismissed nudges at a longer interval (postponement respect)
 *   - Track whether the user has taken action (booked, dismissed, postponed)
 *   - Detect avoidance (tier 2/3 user hasn't acted within the follow-up window)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ConditionId, NudgeTier } from "../data/lannaContent";

const STORAGE_KEY = "@olanna_lanna_nudge_state";

// ─── Postponement intervals by tier ──────────────────────────────────────────
// How many days before the nudge resurfaces after "not now"
const POSTPONE_DAYS_BY_TIER: Record<NudgeTier, number> = {
  1: 14, // Tier 1 — resurface in 2 weeks
  2: 7,  // Tier 2 — resurface in 1 week
  3: 5,  // Tier 3 — resurface in 5 days (safety-relevant)
};

// How long before we send a follow-up check-in for avoidance detection
const AVOIDANCE_WINDOW_DAYS: Record<NudgeTier, number> = {
  1: 21,
  2: 14,
  3: 7,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type NudgeAction =
  | "booked"        // User said they booked / took action
  | "dismissed"     // User dismissed permanently (shown "not now" multiple times)
  | "postponed"     // User clicked "not now" once
  | "viewed"        // User opened the nudge screen
  | "follow_up_sent"; // Avoidance follow-up was sent

export interface NudgeState {
  conditionId: ConditionId;
  /** Most recently detected tier for this condition */
  currentTier: NudgeTier;
  /** When the nudge was last shown (ISO date) */
  lastShownAt: string | null;
  /** When it should next resurface (ISO date, null = show now) */
  resurfaceAt: string | null;
  /** Total number of times this nudge has been shown */
  showCount: number;
  /** Most recent user action */
  lastAction: NudgeAction | null;
  /** When the last action was taken */
  lastActionAt: string | null;
  /** Whether a follow-up was sent for avoidance detection */
  followUpSent: boolean;
  /** When the follow-up was sent */
  followUpSentAt: string | null;
  /** Whether the user has permanently dismissed (unlikely) */
  isDismissedPermanently: boolean;
  /** The tier at which a push notification was last sent (to avoid re-firing) */
  lastNotifiedTier: NudgeTier | null;
  /** When the push notification was last sent */
  lastNotifiedAt: string | null;
}

type NudgeStateMap = Partial<Record<ConditionId, NudgeState>>;

// ─── Storage helpers ──────────────────────────────────────────────────────────

async function loadState(): Promise<NudgeStateMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveState(state: NudgeStateMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("[LannaNudge] Failed to save nudge state:", e);
  }
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysSince(date: string | null): number {
  if (!date) return Infinity;
  return Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function defaultState(conditionId: ConditionId, tier: NudgeTier): NudgeState {
  return {
    conditionId,
    currentTier: tier,
    lastShownAt: null,
    resurfaceAt: null,
    showCount: 0,
    lastAction: null,
    lastActionAt: null,
    followUpSent: false,
    followUpSentAt: null,
    isDismissedPermanently: false,
    lastNotifiedTier: null,
    lastNotifiedAt: null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Get the nudge state for a specific condition */
export async function getNudgeState(
  conditionId: ConditionId
): Promise<NudgeState | null> {
  const state = await loadState();
  return state[conditionId] ?? null;
}

/** Get all nudge states */
export async function getAllNudgeStates(): Promise<NudgeStateMap> {
  return loadState();
}


/**
 * Determine whether a nudge for this condition should be shown right now.
 * Returns true if:
 *   - Never shown before
 *   - Postpone window has expired
 *   - Tier has escalated since last shown
 *   - Follow-up is due (avoidance detection)
 */
export async function shouldShowNudge(
  conditionId: ConditionId,
  detectedTier: NudgeTier
): Promise<{ show: boolean; isFollowUp: boolean }> {
  const state = await loadState();
  const nudge = state[conditionId];

  if (!nudge) return { show: true, isFollowUp: false };
  if (nudge.isDismissedPermanently) return { show: false, isFollowUp: false };

  // Tier escalated — show immediately
  if (detectedTier > nudge.currentTier) return { show: true, isFollowUp: false };

  // Postpone window check
  if (nudge.resurfaceAt) {
    const todayStr = today();
    if (todayStr < nudge.resurfaceAt) return { show: false, isFollowUp: false };
  }

  // Avoidance detection: tier 2/3 user hasn't acted after the follow-up window
  if (
    detectedTier >= 2 &&
    nudge.lastAction === "postponed" &&
    !nudge.followUpSent
  ) {
    const avoidanceWindow = AVOIDANCE_WINDOW_DAYS[detectedTier];
    if (daysSince(nudge.lastActionAt) >= avoidanceWindow) {
      return { show: true, isFollowUp: true };
    }
  }

  // Normal resurface check
  if (!nudge.resurfaceAt || today() >= nudge.resurfaceAt) {
    return { show: true, isFollowUp: false };
  }

  return { show: false, isFollowUp: false };
}

/** Record that a nudge was shown */
export async function recordNudgeShown(
  conditionId: ConditionId,
  tier: NudgeTier,
  isFollowUp = false
): Promise<void> {
  const state = await loadState();
  const existing = state[conditionId] ?? defaultState(conditionId, tier);

  state[conditionId] = {
    ...existing,
    currentTier: tier,
    lastShownAt: today(),
    showCount: existing.showCount + 1,
    lastAction: "viewed",
    lastActionAt: today(),
    ...(isFollowUp ? { followUpSent: true, followUpSentAt: today() } : {}),
  };

  await saveState(state);
}

/** User clicked "not now" / postpone */
export async function postponeNudge(
  conditionId: ConditionId
): Promise<void> {
  const state = await loadState();
  const existing = state[conditionId];
  if (!existing) return;

  const interval = POSTPONE_DAYS_BY_TIER[existing.currentTier];
  state[conditionId] = {
    ...existing,
    lastAction: "postponed",
    lastActionAt: today(),
    resurfaceAt: addDays(today(), interval),
    followUpSent: false, // Reset follow-up so it can fire again
  };

  await saveState(state);
}

/** User took positive action (booked, found care, etc.) */
export async function markNudgeActioned(
  conditionId: ConditionId
): Promise<void> {
  const state = await loadState();
  const existing = state[conditionId];
  if (!existing) return;

  state[conditionId] = {
    ...existing,
    lastAction: "booked",
    lastActionAt: today(),
    // Resurface in 90 days — they've taken action, give them space
    resurfaceAt: addDays(today(), 90),
  };

  await saveState(state);
}

/** Permanently dismiss (should be used sparingly — spec says dismissal isn't disengagement) */
export async function dismissNudgePermanently(
  conditionId: ConditionId
): Promise<void> {
  const state = await loadState();
  const existing = state[conditionId];
  if (!existing) return;

  state[conditionId] = {
    ...existing,
    isDismissedPermanently: true,
    lastAction: "dismissed",
    lastActionAt: today(),
  };

  await saveState(state);
}

/** Record that a push notification was sent for a pattern at the given tier. */
export async function recordPatternNotification(
  conditionId: ConditionId,
  tier: NudgeTier
): Promise<void> {
  const state = await loadState();
  const existing = state[conditionId] ?? defaultState(conditionId, tier);
  state[conditionId] = {
    ...existing,
    lastNotifiedTier: tier,
    lastNotifiedAt: today(),
  };
  await saveState(state);
}

/** Clear all nudge state (for testing / logout) */
export async function clearAllNudgeState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// ─── Threshold card state ─────────────────────────────────────────────────────
// The threshold card is a lightweight on-Home nudge that appears when ≥3
// consecutive high-severity pain days are detected.  It stores the date of
// the threshold event it was dismissed for; a new event (different date) will
// show the card again.

const THRESHOLD_CARD_KEY = "@olanna_threshold_card_state";

interface ThresholdCardPersistedState {
  /** The ISO date of the threshold event the user most recently dismissed */
  dismissedForDate: string | null;
}

async function loadThresholdState(): Promise<ThresholdCardPersistedState> {
  try {
    const raw = await AsyncStorage.getItem(THRESHOLD_CARD_KEY);
    return raw ? JSON.parse(raw) : { dismissedForDate: null };
  } catch {
    return { dismissedForDate: null };
  }
}

/**
 * Returns true if the threshold card should be shown for a given threshold
 * event date (ISO date string of the most recent consecutive-pain day).
 * Returns false when the user has already dismissed this exact event.
 */
export async function shouldShowThresholdCard(
  thresholdEventDate: string
): Promise<boolean> {
  const state = await loadThresholdState();
  if (!state.dismissedForDate) return true;
  // Show again only when this event date is strictly newer than the dismissed one
  return thresholdEventDate > state.dismissedForDate;
}

/**
 * Record that the user dismissed the threshold card for the given event date.
 * The card will not reappear until a newer threshold event occurs.
 */
export async function dismissThresholdCard(
  thresholdEventDate: string
): Promise<void> {
  try {
    const payload: ThresholdCardPersistedState = {
      dismissedForDate: thresholdEventDate,
    };
    await AsyncStorage.setItem(THRESHOLD_CARD_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("[LannaNudge] Failed to save threshold card state:", e);
  }
}

/** Clear threshold card state (for testing / logout) */
export async function clearThresholdCardState(): Promise<void> {
  await AsyncStorage.removeItem(THRESHOLD_CARD_KEY);
}
