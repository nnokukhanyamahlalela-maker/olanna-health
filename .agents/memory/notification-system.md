---
name: Notification system
description: Architecture and wiring for the 6-category opt-in push notification system.
---

## What was built

Full local notification system using `expo-notifications` (target version `~0.32.17`).

### New files
- `client/lib/notificationSettings.ts` — `NotificationSettings` interface + AsyncStorage CRUD (`notificationSettingsStorage`)
- `client/lib/notificationService.ts` — permission request (`maybeRequestPermission`, `requestNotificationPermission`), quiet-hours logic, `scheduleLocalNotification`, `fireImmediateNotification`
- `client/lib/notificationScheduler.ts` — one function per category (all idempotent, safe to call on every focus)
- `client/screens/NotificationSettingsScreen.tsx` — 6-category toggle UI + permission banner

### Wiring points
- Permission request: `OnboardingScreen.finishOnboarding` (1.5s delay after navigate) + `CheckInScreen.handleSave` — gated by `permissionRequested` flag, fires only once
- Threshold alert: `useLannaCheckIn.evaluate()` — fires when new Tier-3 pattern detected, de-duped by `NudgeState.lastNotifiedTier`
- Phase/lapsed/summary scheduling: `LotusCycleScreen` — `useEffect` keyed on `[profile?.id, dailyLogs.length, data?.currentPhase]`
- Milestone nudge: `LotusCycleScreen` — `useEffect` keyed on `[milestone?.label]`
- Navigation: `ProfileScreen` Notifications row → `NotificationSettings`; route registered in `RootStackNavigator`

### Categories (in priority order)
1. `thresholdAlert` — pattern-engine Tier-3 alert; relaxed quiet hours (10pm–7am); default ON
2. `phaseReminder` — phase-aware log reminder; backs off to weekly at 5+ logs/week; default ON
3. `dataMilestone` — fires once per milestone key (de-duped in `SchedulerState.firedMilestoneKeys`); default ON
4. `lapsedUser` — 14+ days inactive, max once per 30 days; default ON
5. `healthSummaryRefresh` — monthly, requires 10+ logs; default OFF
6. `partnerMode` — infrastructure only, UI toggle present, no actual delivery until consent step; default OFF

### NudgeState extension
Added `lastNotifiedTier: NudgeTier | null` and `lastNotifiedAt: string | null` to `NudgeState` interface + `defaultState()`.
Added `recordPatternNotification(conditionId, tier)` to `lannaNudgeStorage.ts`.

**Why:** Threshold alerts must fire at most once per tier escalation — re-running the pattern engine on every focus would otherwise spam the user.

### Known gaps
- Partner Mode notifications need a separate consent UI before any real delivery
- `expo-notifications` plugin in `app.json` is present but only affects native builds (EAS); web is no-op by design
- `healthSummaryRefresh` is off by default; consider turning on after first appointment-prep flow is built

### Type quirk
`NotificationPermissionsStatus` from `expo-notifications` has `status` and `granted` fields, but TypeScript types from the installed version didn't expose them cleanly — used `as any` cast in `notificationService.ts` to resolve.
