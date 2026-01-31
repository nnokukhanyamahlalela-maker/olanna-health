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

## System Architecture
Olanna Health is built with a React Native frontend (using Expo) and an Express.js backend with TypeScript. Local data persistence is managed via AsyncStorage. The UI/UX emphasizes an "Editorial Elegance meets African Wellness" brand philosophy, featuring a "soft, grounded, intelligent" aesthetic. Key design elements include a muted color palette with Pink Primary (#F6BFD3) and Warm White (#FFFFFF), Poppins font for all typography, and Feather icons.

The application includes:
- **Core Tracking**: Menstrual and fertility tracking with user-selectable Lotus flower or traditional cycle wheel visualizations. Daily logging for flow, symptoms, mood, and energy.
- **Health Modules**: Dedicated modules for PCOS and Endometriosis, offering symptom tracking and lifestyle management insights. Sexual health features include STI screening reminders based on SAHCS 2022, and cervical screening reminders per SASOG guidelines.
- **Educational Content**: An evidence-based education library.
- **AI Health Assistant**: A multilingual chatbot supporting English and five other South African languages (isiZulu, Afrikaans, Sesotho, isiXhosa, siSwati).
- **Navigation**: Uses React Navigation with a 5-tab bottom navigation (Cycle, Check-in, Calendar, Health, Learn) and stack navigators. The Profile screen is accessible via a header button.
- **Design System**: Features a sophisticated design language with generous whitespace, thin dividers, uppercase section labels with letter-spacing, and pull quotes. Phase-aware coloring (Menstrual: Terracotta/Orange, Follicular: Sage/Hot Pink, Ovulatory: Gold/Soft Pink, Luteal: Lavender/Purple) is used throughout.
- **Visualizations**: Lotus Cycle Wheel with dynamic petal generation (3, 5, 7 petals based on phase) and breathing animation. Calendar features soft glow dots for cycle phases and a pink halo for selected days.
- **Theming**: Comprehensive theme system supporting Light, Dark, and System modes, persisted via AsyncStorage. Theme-aware components adapt styling based on selected theme, including gradients and text colors. WCAG AA compliant contrast is maintained.
- **Symptom Tracking**: A comprehensive system with 15 categories and 200+ symptoms, including a SeveritySlider, BodyMap with SVG silhouette, TagSelector, and customizable check-in screen with favorites.
- **Onboarding**: A multi-step onboarding flow with branded splash screens, animated text, glass-style UI elements, and health goal selection.
- **Goals-Based Personalization**: User-selected health goals from onboarding (stored in AsyncStorage) drive personalized content ordering across the app. The system uses a scoring-based approach to reorder modules, check-in categories, and educational topics based on user goals (period_tracking, ttc, symptoms, pcos, endometriosis, regularity, learn_hormones). Key utilities in `utils/onboardingStorage.ts` and `utils/personalization.ts`.

## External Dependencies
- **React Native**: Frontend framework.
- **Expo**: Development platform for React Native, compatible with Expo Go.
- **Express.js**: Backend framework.
- **TypeScript**: For server-side development.
- **AsyncStorage**: For local data persistence on the client side.
- **React Navigation**: For in-app navigation.
- **OpenAI API (gpt-5.2)**: For the AI Health Assistant's natural language processing and multilingual support.
- **Feather Icons**: Icon library for UI elements.