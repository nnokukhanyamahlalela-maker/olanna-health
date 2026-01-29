# Olanna Health

## Overview
Olanna Health is a context-sensitive femtech mobile application designed for African women, especially those in South Africa. The app combines period tracking with comprehensive sexual and reproductive health tools, based on evidence-based research and South African health guidelines.

## Key Features
- **Menstrual & Fertility Tracking**: Accurate cycle prediction with lotus flower or cycle wheel visualization
- **Daily Logging**: Track flow, symptoms, mood, energy, and more
- **PCOS Module**: Symptom tracking, lifestyle management, and insights for PCOS
- **Endometriosis Module**: Pain tracking, symptom logging, and correlation analysis
- **Sexual Health**: STI screening reminders based on SAHCS 2022 guidelines
- **Cervical Screening**: Pap smear/HPV test scheduling per SASOG guidelines
- **Education Library**: Evidence-based articles on women's health topics
- **AI Health Assistant**: Multilingual chatbot supporting 6 South African languages (English, isiZulu, Afrikaans, Sesotho, isiXhosa, siSwati)

## Tech Stack
- **Frontend**: React Native with Expo (Expo Go compatible)
- **Backend**: Express.js with TypeScript
- **Storage**: AsyncStorage for local data persistence
- **UI**: "Soft, grounded, intelligent" aesthetic with Poppins font, Feather icons
- **Navigation**: React Navigation with bottom tabs and stack navigators

## Project Structure
```
client/
├── App.tsx                 # Root component with font loading
├── components/             # Reusable UI components
│   ├── CycleWheel.tsx     # Traditional circular cycle visualization
│   ├── LotusWheel.tsx     # Lotus flower cycle visualization (primary)
│   ├── AfricanPattern.tsx # Subtle cultural background patterns
│   ├── PrivacyBadge.tsx   # Trust/privacy indicator component
│   ├── InsightCard.tsx    # Feature cards with icons
│   ├── HealthModuleCard.tsx
│   ├── FlowSelector.tsx   # Period flow input
│   ├── MoodSelector.tsx   # Mood tracking input
│   └── ...
├── screens/               # Screen components
│   ├── HomeScreen.tsx     # Cycle dashboard
│   ├── CheckInScreen.tsx  # Daily symptom check-in
│   ├── PatternsScreen.tsx # Symptom patterns & trends
│   ├── HealthScreen.tsx   # Health modules hub
│   ├── LearnScreen.tsx    # Education library
│   ├── ProfileScreen.tsx  # User settings
│   └── ...modules
├── navigation/            # Navigation configuration
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and storage
└── constants/             # Theme and constants

server/
├── index.ts              # Express server setup
├── routes.ts             # API routes
└── storage.ts            # Data storage utilities
```

## Design System
- **Brand Philosophy**: "Editorial Elegance meets African Wellness" - sophisticated, refined, like a luxury wellness magazine
- **Primary Color**: Pink Primary (#F6BFD3) - used for tabs, primary buttons, and accents
- **Soft Pink**: Pink Soft (#FBE3EC) - lighter accent
- **Background**: BG Main (#FFF7FA)
- **Text Primary**: Charcoal (#3A2F35)
- **Text Secondary**: Warm Gray (#7A6A73)
- **Phase Colors**: Menstrual (#E7B4B8), Follicular (#DDE5DC), Ovulatory (#E6D2A8), Luteal (#D6CEDD)
- **Cards**: Warm White (#FFFFFF) with Sand borders (#E5DDD8)
- **Fonts**: Poppins throughout - Light (300) for body, Medium (500) for emphasis, SemiBold (600) for headings
- **Aesthetic**: Vogue-inspired editorial elegance with muted tones, generous whitespace, thin dividers
- **Typography Style**: Uppercase section labels with letter-spacing, pull quotes with left border accent
- **Visualization**: Minimalist lotus flower (3-7 petals by phase) or cycle wheel (user selectable)

## Running the App
1. Backend starts on port 5000
2. Expo dev server runs on port 8081
3. Scan QR code with Expo Go app to test on device

## User Preferences
- Evidence-based health information following South African guidelines (SAHCS, SASOG)
- "Soft, grounded, intelligent" aesthetic with earthy pastels (blush, clay, gold, sage)
- Privacy-focused with local data storage and trust indicators
- Light mode only (no dark mode)
- Lotus flower visualization with option to switch to cycle wheel
- African-centered design with subtle cultural patterns

## Recent Changes
- **Onboarding Flow Redesign (January 2026)**: Complete overhaul of user onboarding experience
  - Step 1: Gradient Spill Intro (8 seconds) - Gradient expands/spills across white screen, then OLANNA HEALTH logo fades in
  - Step 2: "Girl, hi! My name is Olanna." (5 seconds) - Blobbing text animation with scale and fade
  - Step 3: "What shall I call you?" - Name and date of birth inputs with glass-style UI
  - Step 4: "And to what do I owe this pleasure?" (5 seconds) - Intro text before health goals
  - Step 5: Health Goals Selection - Multiple choice with glass chips
  - Step 6: Cycle Information - Cycle length, period length, last period
  - All screens use gradient background (Sunset Orange → Hot Pink → Soft Pink)
  - Glass-style inputs with transparent backgrounds and white borders
  - White text throughout on gradient backgrounds
- **Splash Screen Update (January 2026)**: Matches new gradient branding
  - Gradient background: #F7A37A → #E85A9C → #D070A0
  - Bold white "OLANNA" text (48px) + spaced "HEALTH" text (18px)
  - Animated letter-by-letter reveal with spring effect
- **App Revamp with New Branding (January 2026)**: Complete visual refresh with new brand identity
  - New gradient color scheme: Sunset Orange (#F7A37A) → Hot Pink (#E85A9C) → Soft Pink (#D070A0)
  - GradientBackground component with variants: sunset, soft, card, glass
  - GlassCard component for glassmorphism UI effects
  - BRAND_COLORS exported for consistent theming
- **Logo Pink Theme Update (January 2026)**: Updated primary color scheme
  - Logo Pink (#FEC8EE) now used as primary accent color throughout the app
  - Tab bar selection uses logo pink instead of dusty rose
  - Splash screen simplified to match reference logo (bold "OLANNA" + wide-spaced "HEALTH" in pink)
  - Health tab maintains circular pink button design
- **Magazine-Style Redesign (January 2026)**: Complete visual refresh with Vogue-inspired editorial aesthetic
  - New philosophy: "Editorial Elegance meets African Wellness"
  - Typography: Poppins Light for body, Medium/SemiBold for headings
  - Colors: Muted cream/dusty rose palette (Cream #FAF6F3, Dusty Rose #D4A99A)
  - Editorial elements: Uppercase section labels, pull quotes with left border, thin dividers
  - Magazine-style ArticleCard with featured article layout
  - Refined QuickStatCard with clean typography
  - HomeScreen hero greeting with split styling
  - Phase-aware colors: Terracotta (menstrual), Sage (follicular), Gold (ovulation), Lavender (luteal)
- **Lotus Cycle Visualization (January 2026)**: New lotus flower-based cycle tracking
  - LotusCycleWheel: Days arranged as petals around a circle
  - Petals bloom outward during ovulation (larger, fuller petals)
  - Petals close during menstrual phase (smaller, tighter petals)
  - Central lotus flower that changes size/petals based on phase
  - Phase colors: Terracotta (menstrual), Sage (follicular), Gold (ovulation), Lavender (luteal)
  - Current day highlighted with darker fill and border
  - Phase messaging: "Rest & Release", "Growth & Renewal", "Radiance & Expression", "Boundaries & Reflection"
  - Day indicator showing "DAY X of Y"
  - Toggle between lotus wheel and traditional cycle wheel views
- **Animated Splash Screen (January 2026)**: New opening screen with jumping typewriter animation
  - "OLANNA" with stylized pink oval "O" and bold letters
  - "HEALTH" in dusty rose with wide letter spacing
  - "YOUR CYCLE COMPANION" tagline
  - Each letter animates with spring-based jumping effect
  - Staggered timing creates typewriter appearance
- Theme presets: Olanna (default), Blossom, Garden, Dreamy
- LotusWheel component with breathing animation and phase-aware colors
- AfricanPattern component for subtle cultural background textures
- PrivacyBadge component for trust indicators on sensitive screens
- 5-step onboarding: Welcome, Profile Setup, Health Goals, Lotus Explanation, View Selection
- 5-tab navigation: Cycle, Check-in, Calendar, Health (centered), Learn
- Profile accessible via header button on Home screen
- Health modules for PCOS, Endometriosis, Sexual Health, Cervical Screening
- AI Health Assistant chat interface
- Comprehensive symptom tracking system (January 2026):
  - 15 symptom categories with 200+ symptoms covering physical, emotional, cognitive, metabolic, reproductive, pain-mapping, PCOS-specific, endometriosis-specific, environmental, and psychosocial symptoms
  - All symptom categories updated with pastel color palette
  - SeveritySlider with lotus petal-inspired design
  - BodyMap with SVG silhouette and 17 touchable pain regions
  - TagSelector for context tracking (including South African-specific tags)
  - CheckInScreen with favorites quick access and customization modal
  - Custom symptom creation and demo mode with 60 days of sample data
  - PatternsScreen with calendar heatmap and trend analysis
  - Local insights engine for pattern detection (non-diagnostic)
  - Symptom customization: hide/restore symptoms, favorites via long-press, category reordering
  - Free-text notes support for detailed symptom context
- **Navigation Redesign (January 2026)**: Streamlined 5-tab bottom navigation
  - Moved Profile to header button (top right on Home screen)
  - Restored Check-in tab to bottom navigation
  - Added CycleCalculator screen for period/ovulation predictions
  - Calendar legend now uses minimalistic lotus icons per phase
  - Splash screen with wavy animation and SVG lotus "O" logo
- Minimalistic Lotus component with mathematical petal generation:
  - Menstrual: 3 petals (closed bud)
  - Follicular: 5 petals (opening)
  - Ovulation: 7 petals (full bloom)
  - Luteal: 5 petals (softening)
- **Enhanced Calendar (January 2026)**:
  - Logo pink color (#FEC8EE) integrated into color scheme
  - New semantic colors: Period pink (#F472B6), Fertile coral (#FB923C), PMS lavender (#A78BFA)
  - Filter chips to toggle view: Period, Fertile, PMS, All
  - "About your cycle" stats section with average cycle/period length
  - Timeline view showing past 3 months of cycle events (period, fertile window, PMS)
  - Enhanced day styling with colored borders and backgrounds for cycle phases
  - Selected day card showing logged symptoms and flow
  - "The Lotus Cycle" phase legend with lotus icons for all 4 phases
- **Lotus Flower Redesign (January 2026)**:
  - Minimalist line-art style matching reference design
  - Four distinct phases with progressive blooming:
    - Menstrual: Tight closed bud (3 petals) - Terracotta
    - Follicular: Opening bud (5 petals) - Sage
    - Ovulatory: Full bloom (7+ petals spread wide) - Gold
    - Luteal: Closing flower (6 petals) - Lavender
  - Consistent styling across LotusCycleWheel and CalendarScreen
  - Each phase has colored circular background matching phase color
  - Phase info displays: title, subtitle description, and day counter
- **Screen Blueprint Implementation (January 2026)**:
  - HomeScreen: Hero card with phase gradient background, big cycle day number (64px DMSans_700Bold), PhaseBadge with poetic names ("Rest & Release", "Rising Energy", "Full Radiance", "Inner Reflection"), gentle insights timeline
  - HeroCard component: Phase-aware gradient backgrounds transitioning at 135° angle, pink-tinted shadow (0 20px 40px rgba(246, 191, 211, 0.25))
  - PhaseBadge component: Gradient backgrounds with poetic phase names, uppercase text with letter-spacing
  - CalendarScreen: Soft glow dots for cycle phases (no harsh borders), pink halo for selected day with shadow effect, subtle transparent backgrounds
  - CheckInScreen: View tabs with pink (#F6BFD3) highlight on active selection, consistent charcoal text on pink background
  - LearnScreen: Clean white article cards, pink accents on category selection, no gradients for visual rest
