---
name: Gen Z rebrand — brand token system
description: Documents the new visual brand system, which files were updated, and key decisions made during the rebrand.
---

## New Brand Token System

| Token | Value | Usage |
|---|---|---|
| Background | `#EEEDFE` | App-wide background (lavender) |
| Ink / text | `#26215C` | All primary text, icons |
| Mid ink | `#4A4580` | Secondary text |
| Soft ink | `#6B6591` | Captions, metadata |
| Primary CTA | `#D85A30` | Coral — exactly ONE button per screen |
| CTA text | `#FAECE7` | Cream on coral buttons |
| Phase tags / teal | `#0F6E56` | Phase status pills, calendar fertile days |
| Cards / sheets | `#FAF8F3` | Warm cream — all cards and bottom sheets |
| Border | `#D8D6F0` | Lavender border |

**Why:** User requested Gen Z-forward rebrand with bold ink-on-lavender base, single dominant coral CTA per screen, and muted teal for cycle-phase context.

**Rule:** No gradients anywhere — flat fills only. `AppGradient` now renders flat `#EEEDFE`.

## Phase Mascot States (LannaMascot.tsx)

| Phase | State | Petal color | Ring size | Opacity | Expression |
|---|---|---|---|---|---|
| Menstrual | Bud | `#B8B4E8` back / `#9490C8` deep | small | 1.0 | sleepy (closed lines) |
| Follicular | Opening | `#E8A070` / `#C07848` | medium | 1.0 | curious (offset eye) |
| Ovulatory | Full bloom | `#D85A30` / `#B04020` | largest | 1.0 | bright (glint, wide smile) |
| Luteal | Settling | `#7ABFB0` / `#4A9080` | medium-small | 0.72 | calm (16° rotation droop) |

Face ink always `#26215C`. Petal counts unchanged (5 back + 5 front).

## Phase Wheel / Calendar Colors

| Phase | Color |
|---|---|
| Menstrual | `#D85A30` (coral) |
| Follicular | `#E8A070` (soft coral) / calendar `#B8B4E8` |
| Ovulatory | `#0F6E56` (teal) |
| Luteal | `#7ABFB0` (soft teal) |

## Files Updated

Core tokens:
- `client/constants/colors.ts` — complete rewrite
- `client/constants/theme.ts` — textPrimary updated
- `client/constants/onboardingTokens.ts` — textPrimary updated
- `client/constants/themeColors.ts` — textPrimary updated

Components:
- `client/components/LannaMascot.tsx` — complete rewrite (4-state)
- `client/components/AppGradient.tsx` — flat `#EEEDFE` (no LinearGradient)
- `client/components/CustomTabBar.tsx` — cream bg, lavender border
- `client/components/QuickLogSheet.tsx` — coral save btn, cream sheet
- `client/components/LannaReactionCard.tsx` — cream bg, plum text
- `client/components/HealthSummarySheet.tsx` — coral/cream/plum

Screens (all updated BG/TEXT/PINK constants + buttons):
- `client/screens/LotusCycleScreen.tsx` — + streak badge, teal phase pill, flat card, coral Log Today CTA
- `client/screens/CalendarScreen.tsx`
- `client/screens/CheckInScreen.tsx` — Lanna removed from header, coral save btn
- `client/screens/OnboardingScreen.tsx`
- `client/screens/ResetupOnboardingScreen.tsx`
- `client/screens/HealthScreen.tsx`
- `client/screens/LearnScreen.tsx`
- `client/screens/SplashScreen.tsx` — flat lavender, coral mascot
- `client/screens/LannaCheckInScreen.tsx`
- `client/screens/NotificationSettingsScreen.tsx`
- `client/screens/IntroLogo.tsx`
- `client/screens/ProfileScreen.tsx`
- `client/components/LannaInsightBadge.tsx`
- `client/components/LannaThresholdCard.tsx`

## New Home Screen Features

- **Streak badge** (🔥 X day streak) — shown when consecutive log streak ≥ 2, via new `calcStreak()` helper in LotusCycleScreen. Falls back to milestone badge.
- **Teal phase status pill** — `#0F6E56` bg, `#FAF8F3` text, uppercase, above the day counter.
- **"Log Today" coral CTA** — single dominant `#D85A30` button below the quick-log row.
- **Flat cream about-this-phase card** — `#FAF8F3`, no phase-color mixing.

**How to apply:** Keep coral reserved for ONE primary action per screen. Teal for phase/cycle context only. Tab bar active color remains phase-driven (auto-updates via phaseTokens).
