# Olanna Health Design Guidelines

## Brand Identity

**Purpose**: Empowering femtech platform for African women combining period tracking with comprehensive sexual and reproductive health tools. Evidence-based, culturally relevant, and accessible.

**Aesthetic Direction**: **Cosmic Sanctuary** - Blend Stardust's mystical, celestial aesthetic (moon phases, constellation patterns, ethereal gradients) with Lively's clean, organized dashboards. The app should feel like a personal wellness sanctuary—comforting, empowering, and scientifically grounded. Avoid stereotypical pink; use inclusive, sophisticated color palette with cosmic purples, teals, and warm earth tones.

**Memorable Element**: Dynamic cycle wheel visualization at app's heart—a cosmic interface showing menstrual phase, moon alignment, and health markers in one intuitive, beautiful view.

## Navigation Architecture

**Root Navigation**: Tab Navigation (5 tabs)
- **Home** (cycle dashboard)
- **Track** (daily logging)
- **Health** (PCOS, endometriosis, screenings) - CENTER TAB
- **Learn** (education library)
- **Profile** (settings, community, AI chat)

**Authentication**: Required (multi-user, data sync, community features)
- Apple Sign-In + Google Sign-In
- Include privacy policy, terms of service links
- Account management in Profile > Settings

## Screen-by-Screen Specifications

### Onboarding Flow (Stack-Only)
1. **Welcome Screen**: Hero illustration of cosmic cycle wheel, app value proposition, "Get Started" CTA
2. **Profile Setup**: Name, date of birth, cycle length inputs with validation
3. **Health Goals**: Multi-select cards (track period, manage PCOS, pregnancy planning, etc.)
4. **Permissions**: Notifications, health data access requests

### Home Tab - Cycle Dashboard
- **Header**: Transparent, greeting text (e.g., "Good morning, [Name]"), settings icon (right)
- **Layout**: Scrollable
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Main Content**:
  - Large circular cycle wheel (cosmic theme with phase colors, day counter, predicted dates)
  - Daily Decode card (mind/body/beauty insights)
  - Quick stats: next period, fertility window, cycle day
  - Recent trends graph (optional)
- **Empty State**: If no cycle data, illustration showing "Start tracking your first cycle"

### Track Tab - Daily Logging
- **Header**: Date selector (swipeable carousel), "Today" quick button (right)
- **Layout**: Scrollable form
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Categories** (expandable sections):
  - Flow (icons: light/medium/heavy/spotting)
  - Symptoms (multi-select chips: cramps, bloating, headache, etc.)
  - Mood & Energy (emoji-style selectors)
  - Sexual Activity (toggle + notes)
  - Temperature, Weight (numeric inputs)
  - Custom notes (text area)
- Save button floats at bottom with subtle shadow

### Health Tab - Health Modules
- **Header**: Title "Health Center", filter icon (right)
- **Layout**: Scrollable
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Content**:
  - Action cards for active reminders (Pap smear due, STI screening)
  - Module cards: PCOS, Endometriosis, Sexual Health, Screenings
  - Each card shows status, next action, progress indicator
- **Empty State**: Illustration + "Complete your health profile to get personalized recommendations"

#### PCOS Module Screen (modal stack from Health)
- Custom header with back button, "PCOS Management" title
- Tabs: Symptoms, Lifestyle, Goals, Reports
- Symptom correlation charts (line graphs showing patterns)
- Lifestyle tracking (nutrition, exercise log)
- AI-generated insights card

#### Endometriosis Module Screen
- Similar structure to PCOS
- Pain mapping visual (body diagram)
- Symptom-lifestyle correlation grid (Bearable-style)
- Export report CTA

#### Sexual Health Screen
- STI risk questionnaire with yes/no toggles
- Testing schedule with countdown timers
- Educational cards about each STI
- "Book Appointment" CTA links

#### Cervical Screening Screen
- Visual timeline of screening history
- Next test due date (prominent)
- HPV vs Pap smear explainer
- Reminder toggle

### Learn Tab - Education Library
- **Header**: Search bar (prominent), filter button (right)
- **Layout**: Scrollable list
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Content**:
  - Featured article card (large image, title, summary)
  - Category sections: Periods, Fertility, PCOS, Sexual Health, etc.
  - Offline badge for downloaded content
- **Empty State** (search): "No articles found" illustration

### Profile Tab
- **Header**: Avatar (left), notification icon (right), transparent
- **Layout**: Scrollable
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Sections**:
  - User info card (avatar, name, email)
  - Community forums card
  - AI Assistant chat CTA (prominent button)
  - Share with Partner toggle
  - Settings (nested screen)
  - Data & Privacy (nested screen with export, delete account)
  - Log Out

### AI Chat Screen (modal)
- Full-screen modal with close button (top left)
- Message bubbles (user: right-aligned, AI: left-aligned with avatar)
- Input bar at bottom (safe area insets)
- Disclaimer banner: "I don't replace medical advice"

### Community Screen (from Profile)
- Tab-based: Forums, Local Groups
- Anonymous posts with support reactions
- Moderated badge for verified content
- Report/flag functionality

## Color Palette

**Primary**: #8B5CF6 (Cosmic Purple) - CTAs, active states
**Secondary**: #14B8A6 (Teal) - fertility/health indicators
**Tertiary**: #F59E0B (Warm Amber) - alerts, ovulation

**Background**:
- Light mode: #F9FAFB (soft white)
- Dark mode: #1F2937 (deep charcoal)

**Surface**:
- Light mode: #FFFFFF
- Dark mode: #374151

**Text**:
- Primary: #111827 (light) / #F9FAFB (dark)
- Secondary: #6B7280 (light) / #D1D5DB (dark)

**Semantic**:
- Success: #10B981 (green)
- Warning: #F59E0B (amber)
- Error: #EF4444 (red)
- Info: #3B82F6 (blue)

**Phase Colors** (cycle wheel):
- Menstrual: #EF4444 (red gradient)
- Follicular: #8B5CF6 (purple gradient)
- Ovulation: #F59E0B (amber gradient)
- Luteal: #14B8A6 (teal gradient)

## Typography

**Font**: Nunito (Google Font) - friendly, approachable, highly legible
**Pairing**: System sans-serif for body text at small sizes

**Type Scale**:
- Heading 1: Nunito Bold, 32px
- Heading 2: Nunito Bold, 24px
- Heading 3: Nunito SemiBold, 20px
- Body: System Regular, 16px
- Caption: System Regular, 14px
- Label: System Medium, 12px

## Visual Design

- Use Feather icons from @expo/vector-icons (no emojis except mood selectors)
- Floating action buttons: shadowOffset {0, 2}, shadowOpacity 0.10, shadowRadius 2
- Cards: subtle border or light shadow, rounded corners (12px radius)
- Touchable feedback: slight scale (0.95) on press
- Illustrations: soft, organic shapes with cosmic accents (stars, moons, gradients)

## Assets to Generate

**Required**:
1. **icon.png** - App icon: Cosmic cycle wheel symbol with purple/teal gradient (WHERE: Home screen, app icon)
2. **splash-icon.png** - Simplified cycle wheel (WHERE: Launch screen)
3. **empty-cycle.png** - Illustration of celestial calendar with prompt "Track your first cycle" (WHERE: Home tab empty state)
4. **empty-health.png** - Illustration of health checklist with stars (WHERE: Health tab empty state)
5. **empty-search.png** - Illustration of open book with magnifying glass (WHERE: Learn tab search empty state)
6. **onboarding-hero.png** - Cosmic cycle wheel with soft glow, welcoming aesthetic (WHERE: Welcome screen)

**Recommended**:
7. **avatar-1.png, avatar-2.png, avatar-3.png** - Celestial-themed avatars (moon, star, constellation) (WHERE: Profile setup, account screen)
8. **body-map.png** - Female body outline for pain tracking (WHERE: Endometriosis module)
9. **ai-assistant-avatar.png** - Friendly cosmic character (WHERE: AI chat screen)
10. **community-header.png** - Supportive illustration of connected women (WHERE: Community screen header)

All illustrations use app color palette (purples, teals, warm ambers) with soft gradients and minimal detail for elegance.