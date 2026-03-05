# Olanna Health

## Overview
Olanna Health is a femtech mobile application for African women, particularly in South Africa, focused on sexual and reproductive health. It integrates menstrual and fertility tracking with comprehensive health tools, grounded in evidence-based research and South African health guidelines. The project aims to provide a sophisticated, refined, and culturally relevant wellness experience, empowering women with personalized health insights and support.

## User Preferences
- Evidence-based health information following South African guidelines (SAHCS, SASOG)
- "Soft, grounded, intelligent" aesthetic with earthy pastels (blush, clay, gold, sage)
- Privacy-focused with local data storage and trust indicators
- Dark mode support with Light/Dark/System theme options (accessible via Profile → Appearance)
- Lotus flower visualization with option to switch to cycle wheel
- African-centered design with subtle cultural patterns

## System Architecture
Olanna Health is built with a React Native frontend (using Expo) and an Express.js backend with TypeScript. Sensitive health data is encrypted via `expo-secure-store` (with AsyncStorage fallback on web), while non-sensitive preferences use AsyncStorage. The UI/UX emphasizes an "Editorial Elegance meets African Wellness" brand philosophy with a "soft, grounded, intelligent" aesthetic, muted color palette (Pink Primary #F6BFD3, Warm White #FFFFFF), Poppins font, and Feather icons.

Key features and architectural decisions include:
- **Core Tracking**: Menstrual and fertility tracking with customizable Lotus flower or cycle wheel visualizations. Daily logging for flow, symptoms, mood, and energy. Auto-detection of period start dates and dynamic cycle predictions based on logged data.
- **Health Modules**: Dedicated modules for conditions like PCOS and Endometriosis, offering symptom tracking and lifestyle management. Sexual health features include STI and cervical screening reminders based on SAHCS and SASOG guidelines.
- **Health Tools**: Includes a PMS Symptom Checker with personalized results and lifestyle recommendations, and a Cycle Length Calculator for period, ovulation, and fertile window prediction.
- **Educational Content**: An evidence-based education library with articles covering various health topics, featuring hero images and organized content.
- **Navigation**: Uses React Navigation with a 5-tab bottom navigation (Cycle, Calendar, Check-in, Health, Learn).
- **Calendar Screen**: Custom-built calendar grid with phase-colored day backgrounds, filter options, a "Daily Cycle Decode" section, and "About Your Cycle" stats card, all within a glass card aesthetic.
- **Design System**: A token-based color system in `client/constants/colors.ts` ensures consistent branding, phase-specific colors, and WCAG AA compliant readability. `AppGradient` is used for brand backgrounds. Phase boundaries are dynamically calculated in `getPhaseForDay(day, cycleLength, periodLength)` from `client/constants/phaseConfig.ts` — all screens (CycleScreen, CalendarScreen, HomeScreen) and `calculateCycleData()` in `storage.ts` use this single function for consistent phase determination based on the user's actual cycle and period lengths.
- **Cycle Synchronization**: `getEffectiveLastPeriodStart()` and `calculateCycleDataWithLogs()` in `storage.ts` derive the real period start from flow logs (not just the profile's `lastPeriodStart`). All screens (CycleScreen, CalendarScreen, HomeScreen) use this to stay synchronized — logging a period on the Calendar immediately reflects on the Cycle wheel as Day 1 Menstrual.
- **iOS Liquid Glass UI**: Utilizes a `GlassSurface` component for a frosted glass aesthetic across the app, supporting different tint levels and adapting for dark mode, providing a consistent modern look.
- **Visualizations**: iOS-style cycle screen with an interactive circular cycle wheel, dynamic phase-specific lotus flower images, a "Phase Explainer" card with educational content, and a scrollable "Phase Insights" section with Vibes, Movement, Foods, and Self-Care cards driven by the selected day's phase via shared `PHASE_*` exports from `dailyDecode.ts`.
- **Theming**: Comprehensive theme system supporting Light, Dark, and System modes, with persistence via AsyncStorage, ensuring WCAG AA compliant contrast.
- **Symptom Tracking**: A robust system supporting 15 categories and over 200 symptoms, including a SeveritySlider, BodyMap (with front/back toggle, non-overlapping labeled SVG zones on a 100x145 viewBox, 44pt minimum touch targets, severity color-coding, pain summary list with "The body report" heading, and Olanna-tone copy), TagSelector, and customizable check-in screens.
- **Onboarding**: A conversational 8-step onboarding flow with a state machine, including intro splashes, name input, profile setup, goal selection, and a feature carousel. It uses a warm gradient palette and iOS-style glass cards.
- **Goals-Based Personalization**: User-selected health goals from onboarding drive personalized content ordering and prioritization across the application.
- **Security**: Features encrypted local storage for sensitive data (`expo-secure-store`), API rate limiting, input validation, HTTPS enforcement, and a PostgreSQL database with Drizzle ORM.
- **Privacy**: Includes a comprehensive privacy policy, device-scoped product logs, and a privacy-first Partner Mode with strict allowlists, invite codes, and an audit log for sharing cycle snapshots.
- **About & Legal**: Dedicated About Olanna Health, Terms of Service, and Privacy Policy screens accessible from Profile → About section. All legal content reflects current app features (no AI assistant references). Terms reference South African law (POPIA, Consumer Protection Act). Contact: admin@olanna.health.

## External Dependencies
- **React Native**: Frontend framework.
- **Expo**: Development platform for React Native.
- **Express.js**: Backend framework.
- **TypeScript**: For server-side development.
- **AsyncStorage**: For local data persistence.
- **React Navigation**: For in-app navigation.
- **Feather Icons**: Icon library.