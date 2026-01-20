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
- **UI**: Warm earth tone design ("Science meets Softness") with Nunito font, Feather icons
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
│   ├── TrackScreen.tsx    # Daily logging
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
- **Primary Color**: Sage Green (#7BA387)
- **Secondary Color**: Coral (#C4826B)
- **Tertiary Color**: Golden Yellow (#D4A84B)
- **Accent Color**: Burgundy (#8B3A4C)
- **Phase Colors**: Menstrual (burgundy), Follicular (sage), Ovulation (golden), Luteal (coral)
- **Font**: Nunito (Google Fonts)
- **Aesthetic**: Warm earth tones with African-inspired patterns
- **Theme Presets**: Earth (default), Sunrise, Moonlight
- **Visualization**: Lotus flower (primary) or cycle wheel (user selectable)

## Running the App
1. Backend starts on port 5000
2. Expo dev server runs on port 8081
3. Scan QR code with Expo Go app to test on device

## User Preferences
- Evidence-based health information following South African guidelines (SAHCS, SASOG)
- "Science meets Softness" aesthetic with warm earth tones (sage, coral, burgundy, golden)
- Privacy-focused with local data storage and trust indicators
- Accessibility with dark mode support
- Lotus flower visualization with option to switch to cycle wheel
- African-centered design with subtle cultural patterns

## Recent Changes
- Brand refinement with warm earth tone palette (January 2026)
- LotusWheel component with animated petals as primary visualization
- AfricanPattern component for subtle cultural background textures
- PrivacyBadge component for trust indicators on sensitive screens
- 5-step onboarding: Welcome, Profile Setup, Health Goals, Lotus Explanation, View Selection
- Theme presets (Earth, Sunrise, Moonlight) for personalization
- 5-tab navigation: Home, Track, Health, Learn, Profile
- Health modules for PCOS, Endometriosis, Sexual Health, Cervical Screening
- AI Health Assistant chat interface
