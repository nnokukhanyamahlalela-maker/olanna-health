# Olanna Health

A cycle-tracking and hormonal health app for women, with a focus on PMOS (Polycystic Morphology Ovarian Syndrome) and endometriosis support.

## Stack

- **Frontend:** Expo (React Native for iOS/Android/Web), React Navigation
- **Backend:** Express + Drizzle ORM + PostgreSQL
- **Key entry:** `client/App.tsx` → `RootStackNavigator` → `MainTabNavigator` → 5 tab screens

## Running the app

- **Frontend:** `npm run expo:dev` (workflow: Start Frontend)
- **Backend:** `npm run server:dev` (workflow: Start Backend — requires `DATABASE_URL`)

## Architecture notes

- All 5 tab screens redesigned to match approved mockups (Cycle, Calendar, Check-in, Health, Learn)
- Design system: 4 phase color tokens (`menstrual #F06B9A`, `follicular #D178B3`, `ovulatory #DE73DE`, `luteal #C9A0DC`)
- Mascot "Lanna": parametric SVG with 5 expressions, phase-driven colors — see `client/components/LannaMascot.tsx`
- Bottom nav: filled SVG icons, active = circular pill + phase color — see `client/components/CustomTabBar.tsx`
- Large surfaces use phase tint at 0.22–0.33 opacity, never solid fills
- `PMOS` (not PCOS) throughout all UI labels; medical articles keep clinical "PCOS" terminology

## npm quirks

- `tar@7.5.11` and `shell-quote@1.8.x` are blocked by Replit security policy (CVE).
  Overrides set in `package.json`: `tar → 7.5.22`, `shell-quote → 1.9.0`
- Use `npm install --legacy-peer-deps` if you need to add packages

## User preferences

- Use PMOS (not PCOS) in all UI-facing copy; medical content may keep the clinical term
- Phase colors drive all tinting — never use arbitrary pinks
- Body map figure is a placeholder — do not finalize it
