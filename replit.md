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
- **AI Health Assistant**: Conversational support for health questions

## Tech Stack
- **Frontend**: React Native with Expo (Expo Go compatible)
- **Backend**: Express.js with TypeScript
- **Storage**: AsyncStorage for local data persistence
- **UI**: Pastel pink aesthetic ("Science meets Softness") with Nunito font, Feather icons
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
- **Brand Philosophy**: "Science Meets Softness" - evidence-based medicine meets gentle, nurturing care
- **Primary Color**: Pastel Pink (#FFB6C1)
- **Secondary Color**: Pastel Lavender (#E6E6FA)
- **Tertiary Color**: Pastel Peach (#FFDAB9)
- **Accent Color**: Pastel Mint (#B5EAD7)
- **Phase Colors**: Menstrual (pastel pink), Follicular (pastel mint), Ovulation (pastel yellow), Luteal (pastel peach)
- **Font**: Nunito (Google Fonts)
- **Aesthetic**: Soft pastel tones with African-inspired patterns
- **Theme Presets**: Blossom (default), Garden, Dreamy
- **Visualization**: Lotus flower (primary) or cycle wheel (user selectable)

## Running the App
1. Backend starts on port 5000
2. Expo dev server runs on port 8081
3. Scan QR code with Expo Go app to test on device

## User Preferences
- Evidence-based health information following South African guidelines (SAHCS, SASOG)
- "Science meets Softness" aesthetic with soft pastel colors (pink, lavender, mint, peach)
- Privacy-focused with local data storage and trust indicators
- Light mode only (no dark mode)
- Lotus flower visualization with option to switch to cycle wheel
- African-centered design with subtle cultural patterns

## Recent Changes
- Brand refresh with pastel pink aesthetic matching logo (January 2026)
- Updated color palette: pastel pink primary, pastel lavender, mint, peach accents
- Theme presets renamed: Blossom (default), Garden, Dreamy
- LotusWheel component with animated petals in pastel pink
- AfricanPattern component for subtle cultural background textures
- PrivacyBadge component for trust indicators on sensitive screens
- 5-step onboarding: Welcome, Profile Setup, Health Goals, Lotus Explanation, View Selection
- 5-tab navigation: Home, Check-in, Health, Learn, Profile
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
