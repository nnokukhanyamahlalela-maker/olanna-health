---
name: Lanna Check-In module
description: Where the Lanna health-seeking behavior module lives and how it connects
---

**Files added:**
- `client/data/lannaContent.ts` — all user-facing copy (editable without code changes); exports `LANNA_CONDITION_CONTENT` and `LANNA_REFLECTION_PROMPTS`
- `client/data/careDirectory.ts` — SA care directory (stubbed); exports `getProvidersForCondition()`
- `client/lib/lannaPatternEngine.ts` — `runPatternEngine(input)` returns `DetectedPattern[]` sorted by tier desc
- `client/lib/lannaNudgeStorage.ts` — per-condition nudge state in AsyncStorage; `shouldShowNudge`, `recordNudgeShown`, `postponeNudge`, `markNudgeActioned`
- `client/hooks/useLannaCheckIn.ts` — orchestration hook; returns `activeNudge`, `onPostpone`, `onActioned`
- `client/components/LannaInsightBadge.tsx` — compact card shown on home screen when nudge is active
- `client/screens/LannaCheckInScreen.tsx` — full nudge screen, tier-adaptive tone and CTA

**Navigation:** `LannaCheckIn: { conditionId: ConditionId }` added to `RootStackParamList`; slides up from bottom.

**Integration:** `LannaInsightBadge` rendered in `LotusCycleScreen` when `useLannaCheckIn().activeNudge` is non-null.

**Why:** Pattern engine never diagnoses — it surfaces evidence and defers to copy in `lannaContent.ts`. Nudge state uses postponement intervals (5–14 days by tier) and avoidance detection (re-surfaces once if user hasn't acted in 7–21 days).
