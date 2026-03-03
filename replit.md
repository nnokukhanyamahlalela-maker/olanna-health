# Olanna Health

## Overview
Olanna Health is a context-sensitive femtech mobile application for African women, particularly in South Africa. It integrates menstrual and fertility tracking with comprehensive sexual and reproductive health tools, grounded in evidence-based research and South African health guidelines. The project aims to provide a sophisticated, refined, and culturally relevant wellness experience, akin to a luxury wellness magazine, focusing on empowering women with personalized health insights and support.

## User Preferences
- Evidence-based health information following South African guidelines (SAHCS, SASOG)
- "Soft, grounded, intelligent" aesthetic with earthy pastels (blush, clay, gold, sage)
- Privacy-focused with local data storage and trust indicators
- Dark mode support with Light/Dark/System theme options (accessible via Profile → Appearance)
- Lotus flower visualization with option to switch to cycle wheel
- African-centered design with subtle cultural patterns

## Security
- **Encrypted Local Storage**: Sensitive health data (profile, cycle data, daily logs) is encrypted using `expo-secure-store` with automatic fallback to AsyncStorage on web. Implementation in `client/lib/secureStorage.ts` with chunking support for data exceeding 2KB SecureStore limit.
- **API Rate Limiting**: General limit of 100 requests/15 min on all API routes; strict limit of 20 requests/15 min on the AI chat message endpoint. Implemented via `express-rate-limit`.
- **API Key Authentication**: All conversation endpoints (GET/POST/DELETE `/api/conversations`, POST `/api/conversations/:id/messages`) and the AI assistant endpoint require `x-api-key` header matching `SESSION_SECRET` in production. Skipped in development mode. Middleware in `server/middleware/apiAuth.ts`.
- **Input Validation**: All API endpoints validate input (conversation title max 200 chars, message content required and max 10000 chars, IDs must be positive integers).
- **HTTPS Enforcement**: All client API calls use HTTPS via `getApiUrl()` in `client/lib/query-client.ts`.
- **Database**: PostgreSQL (Neon-backed) with Drizzle ORM for chat conversations, messages, and product logs. Schema in `shared/schema.ts`, db module in `server/db.ts`.
- **Privacy Statement**: Full privacy statement screen (`client/screens/PrivacyStatementScreen.tsx`) accessible from Privacy & Data settings. Covers data collection, local storage, server communication, user rights, Partner Mode privacy, POPIA compliance, and contact info. A subtle privacy notice also appears during onboarding on the Goals screen.
- **Device-Scoped Product Logs**: Product logs are scoped per device using a client-generated device ID stored in AsyncStorage (`client/lib/deviceId.ts`). The `x-device-id` header is sent with all product log API requests. Users can only access their own device's logs.
- **Partner Mode**: Privacy-first partner sharing via device-based identity. Primary users push cycle snapshots to the server; a server-side shared view generator (`server/partnerSharedView.ts`) enforces strict allowlists based on `partner_sharing_settings` toggles. Partners authenticate via `x-partner-token` header validated against `partner_links` table. 6-char invite codes (SHA-256 hashed) with 24h expiry for linking. Emergency revoke invalidates partner tokens immediately. Audit log tracks all partner actions. Rate limiting: 5 accept attempts/15 min.

## System Architecture
Olanna Health is built with a React Native frontend (using Expo) and an Express.js backend with TypeScript. Sensitive health data is encrypted via `expo-secure-store` (with AsyncStorage fallback on web). Non-sensitive preferences use AsyncStorage. The UI/UX emphasizes an "Editorial Elegance meets African Wellness" brand philosophy, featuring a "soft, grounded, intelligent" aesthetic. Key design elements include a muted color palette with Pink Primary (#F6BFD3) and Warm White (#FFFFFF), Poppins font for all typography, and Feather icons.

The application includes:
- **Core Tracking**: Menstrual and fertility tracking with user-selectable Lotus flower or traditional cycle wheel visualizations. Daily logging for flow, symptoms, mood, and energy. Period logging directly from the Calendar screen via `PeriodLogSheet` bottom sheet (`client/components/PeriodLogSheet.tsx`) — users tap any day, then "Log your period" to record flow intensity (Spotting/Light/Medium/Heavy), mood, and notes. Auto-detects new period start dates via `detectPeriodStart()` in `client/lib/storage.ts` and updates `lastPeriodStart` to recalculate cycle predictions. CycleScreen now uses real profile data instead of hardcoded values.
- **Health Modules**: Dedicated modules for PCOS and Endometriosis, offering symptom tracking and lifestyle management insights. Sexual health features include STI screening reminders based on SAHCS 2022, and cervical screening reminders per SASOG guidelines.
- **Health Tools**: PMS Symptom Checker (`PMSCheckerScreen.tsx`) — 3-category quiz (Physical/Emotional/Behavioral), 16 symptoms with severity rating (None/Mild/Moderate/Severe), scoring engine, personalized results with top symptoms and lifestyle recommendations. Cycle Length Calculator (`CycleCalculatorScreen.tsx`) for period/ovulation/fertile window prediction. Both accessible from Health tab's TOOLS section.
- **Educational Content**: An evidence-based education library.
- **AI Health Assistant**: A multilingual chatbot supporting English and five other South African languages (isiZulu, Afrikaans, Sesotho, isiXhosa, siSwati). Features prompt chips — horizontally scrollable suggested conversation starters (e.g., "What phase am I in?", "Is this symptom normal?", "PCOS basics") that appear when the chat is fresh and disappear after the first message. Prompt catalog in `client/constants/promptCatalog.ts`. Backend endpoint `POST /api/assistant` (`server/assistantRoutes.ts`) accepts `promptId` or `freeText` with `userContext` (cycleDay, phase, symptoms, etc.), uses structured prompt templates with user context interpolation, gpt-4.1-mini model at temperature 0.4, and appends a medical safety footer to every response. Accessible from Profile screen. Six built-in prompt templates: phase_today, symptom_normal, late_period, cramps_help, pcos_basics, doctor_when.
- **Navigation**: Uses React Navigation with a 5-tab bottom navigation (Cycle, Calendar, Check-in, Health, Learn) with inline lotus icon for center tab. No floating FAB — all tabs evenly spaced. The Profile screen is accessible via a header button.
- **Calendar Screen**: Custom-built calendar grid (no react-native-calendars) with phase-colored day backgrounds (pink=period, peach=fertile, lavender=PMS), filter pills (Period/Fertile/PMS/All), Daily Cycle Decode section with phase-specific educational content and tips, and About Your Cycle stats card. Glass card aesthetic matching reference designs. Local timezone-safe date formatting.
- **Design System**: Token-based color system in `client/constants/colors.ts` with brand (#E83E8C primary, gradient #FF6A4D → #FF2F8E → #D633A6), neutral (warm cream #F8F6F4 base), phase (Menstrual: soft pink #F2A2B8, Follicular: cool grey/lilac #CFCBD6, Ovulatory: warm peach #F2C9A2, Luteal: lavender #D7B3E7), and semantic (success/warning/danger/info) tokens. Helper utilities: `getPhaseGradient()`, `getPhaseColors()`, `getBrandGradient()`. Cycle components use tokens exclusively — no hardcoded hex values. Other screens use `AppGradient` component (`client/components/AppGradient.tsx`) for brand gradient backgrounds.
- **iOS Liquid Glass UI**: All cards and surfaces throughout the app use `GlassSurface` component (`client/components/GlassSurface.tsx`) for a frosted glass aesthetic. Features: BlurView on iOS, CSS backdrop-filter + LinearGradient overlay on web/Android, hairline borders, highlight line at top, inner glow, soft shadows. Supports three tint levels: `light` (default, 0.38 opacity), `prominent` (0.55, more opaque), `subtle` (0.22, near-invisible). Dark mode uses rgba(42,23,48) base. Small inline elements (pills, badges, inputs) use glass-like rgba inline styles instead of the full component. Modal backgrounds remain solid. `GlassCard` component also exists for the calendar grid.
- **Visualizations**: iOS-style cycle screen with:
  - Top header showing month/year with profile button
  - Mini week calendar row with gradient date pills (pink → orange)
  - Main glass card (BlurView) containing interactive circular cycle wheel with 4-phase gradient segments (Menstrual: purple/lavender, Follicular: soft lilac, Ovulation: peach/orange, Luteal: pink/magenta)
  - Interactive wheel features: Users can drag or tap anywhere on the wheel to explore different days; haptic feedback on day changes; "Return to Today" button appears when viewing other days
  - Phase-specific lotus flower PNG images in center that change based on cycle phase (stored in `client/assets/images/`):
    - Menstrual (bud): Pink circle with single white petal (`lotus-menstrual.png`)
    - Follicular (rising): Light pink circle with 3 white petals (`lotus-follicular.png`)
    - Ovulation (bloom): Orange circle with 7 white petals, full bloom (`lotus-ovulation.png`)
    - Luteal (closing): Lavender circle with 5 white petals (`lotus-luteal.png`)
  - Phase Explainer card below the wheel with iOS-friendly educational content:
    - "This phase" heading with phase name badge
    - "What's happening" - 3 concise bullet points about hormonal/body changes
    - "You might notice" - 3 bullet points about symptoms and experiences
    - "Try this" - single-line self-care tip
  - Current day indicator dot on the wheel ring
  - Center content with uppercase phase title, large day number, and subtitle
  - "OLANNA HEALTH" brand footer
  - Calendar features soft glow dots for cycle phases and a pink halo for selected days.
- **Theming**: Comprehensive theme system supporting Light, Dark, and System modes, persisted via AsyncStorage. Theme-aware components adapt styling based on selected theme, including gradients and text colors. WCAG AA compliant contrast is maintained.
- **Symptom Tracking**: A comprehensive system with 15 categories and 200+ symptoms, including a SeveritySlider, BodyMap with SVG silhouette, TagSelector, and customizable check-in screen with favorites.
- **Onboarding**: A conversational 8-step onboarding flow with:
  - Step-based state machine: splash → intro → name → greeting → profile → goals → confirmation → carousel
  - Splash screen with video background (auto-advances in 900ms)
  - Intro screen: "Go hi. My name is Olanna." with Continue button
  - Name screen: "And what shall I call you?" with glass input and progress dots (step 1/3)
  - Greeting screen: "Nice to meet you, [Name]" (auto-advances in 2.5s)
  - Profile screen: Cycle regularity, last period date, average cycle length (step 2/3)
  - Goals screen: Multi-select pills for 6 health goals (Track period, PCOS, Endometriosis, Fertility, Sexual health, General wellness) (step 3/3)
  - Confirmation screen: "Perfect. Let's get started." (auto-advances in 2.8s)
  - Carousel: 3 slides (Track your cycle, Gain insights, Take control) with Get Started button
  - Warm gradient palette (peach → pink → lilac), iOS-style glass cards, Poppins typography
  - Reusable components: ProgressDots, OnboardingGlassCard, PrimaryButton, PillSelect, AnimatedHeading/Subtext
  - Types defined in `client/constants/onboardingTokens.ts`
- **Goals-Based Personalization**: User-selected health goals from onboarding (stored in AsyncStorage) drive personalized content ordering across the app. The system uses a scoring-based approach to reorder modules, check-in categories, and educational topics based on user goals (period_tracking, ttc, symptoms, pcos, endometriosis, regularity, learn_hormones). Key utilities in `utils/onboardingStorage.ts` and `utils/personalization.ts`.

## External Dependencies
- **React Native**: Frontend framework.
- **Expo**: Development platform for React Native, compatible with Expo Go.
- **Express.js**: Backend framework.
- **TypeScript**: For server-side development.
- **AsyncStorage**: For local data persistence on the client side.
- **React Navigation**: For in-app navigation.
- **OpenAI API (gpt-4.1-mini)**: For the AI Health Assistant's natural language processing and multilingual support.
- **Feather Icons**: Icon library for UI elements.