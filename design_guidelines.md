# Olanna Health Design Guidelines

## Brand Philosophy
**"Science Meets Softness"** - Olanna Health positions itself as a women's health hub where evidence-based medicine meets gentle, nurturing care. The brand aesthetic balances clinical credibility with warmth and approachability.

## Target Audience
African women, especially in South Africa, seeking comprehensive femtech solutions for menstrual health, fertility, PCOS, endometriosis, and sexual/reproductive health.

## Color Palette

### Primary Colors (Warm Earth Tones)
- **Burgundy** `#8B3A4C` - Menstrual phase, strength, vitality
- **Sage Green** `#7BA387` - Follicular phase, growth, renewal, primary brand color
- **Golden Yellow** `#D4A84B` - Ovulation, peak energy, radiance
- **Coral** `#C4826B` - Luteal phase, nurturing, warmth

### Supporting Colors
- **Lavender** `#9B8AA8` - Calm, trust, sensitivity
- **Dusty Rose** `#D4A5A5` - Softness, femininity
- **Terracotta** `#C9735B` - Earthiness, warmth
- **Cream** `#FDF8F3` - Light background
- **Warm White** `#FAF7F4` - Root background
- **Sand** `#E8DDD4` - Secondary background

### Text Colors
- **Earth Brown** `#5C4A42` - Primary text
- **Warm Gray** `#7A6B63` - Secondary text

### Semantic Colors
- **Success** `#5B9A6F` - Confirmations, positive
- **Warning** `#D4A84B` - Alerts, attention
- **Error** `#C4574A` - Errors, critical
- **Info** `#6B8DA8` - Information, privacy

## Theme Presets

### Earth Theme (Default)
Primary sage green with coral accents. Grounded, natural, nurturing feel.

### Sunrise Theme
Primary coral with golden accents. Warm, energizing, optimistic feel.

### Moonlight Theme
Primary lavender with sage accents. Calm, restful, introspective feel.

## Typography

### Font Family
- **Nunito** - Primary font (headings and body)
  - Regular (400) - Body text
  - SemiBold (600) - Emphasis
  - Bold (700) - Headings

### Type Scale
- H1: 28px, Bold
- H2: 24px, Bold
- H3: 20px, SemiBold
- H4: 17px, SemiBold
- Body: 16px, Regular
- Small: 14px, Regular
- Caption: 12px, Regular

## Spacing System
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- 2xl: 24px
- 3xl: 32px
- 4xl: 40px
- inputHeight: 52px

## Border Radius
- sm: 6px
- md: 12px
- lg: 16px
- xl: 24px
- full: 999px (pills, buttons)

## Visual Elements

### Lotus Flower Visualization
The lotus flower is the primary cycle visualization metaphor:
- **Symbolism**: The lotus rises from muddy water to bloom beautifully—representing resilience, renewal, and transformation
- **Cultural resonance**: Found across African and Eastern cultures
- **Petals**: Each of the 4 main petals represents a cycle phase with its corresponding color
- **Animation**: Soft breathing effect (3s ease-in-out) conveys organic, living quality
- **Background**: Water ripple effect connects to the pond metaphor
- **Alternative**: Users can switch to traditional cycle wheel if preferred

### Cycle Wheel (Alternative View)
- Circular progress visualization
- Phase segments with appropriate colors
- Day indicator dot
- Central day counter

### African-Inspired Patterns
Subtle background patterns add cultural identity without cliches:
- **Zigzag** - Traditional geometric motif (default)
- **Waves** - Flow and continuity
- **Dots** - Rhythmic, organic feel
- **Triangles** - Strength and stability

Use at 2-3% opacity as subtle background textures.

### Cards and Containers
- Use soft shadows sparingly (sm shadow level)
- Rounded corners (lg radius - 16px)
- White/cream backgrounds
- 1px borders in light mode
- Layered card interfaces create depth without clutter

## Privacy Visual Cues
Since Olanna champions data privacy:
- **Lock/shield icons** near sensitive inputs
- **Calming colors** (muted blues/greens) for sensitive screens
- **PrivacyBadge component** explains data encryption
- Brief tooltips about local storage
- "Your data stays on your device" messaging

## Icons
Use Feather icons for consistency:
- Outlined style
- 20-24px for primary icons
- 16-18px for secondary icons
- No emojis except for mood selectors if necessary

## Animations
- **Breathing effect**: 3s ease-in-out for lotus
- **Spring animations**: damping 15, stiffness 150 for buttons
- **Micro-interactions**: Subtle scale on press (0.98)
- Respect user's reduced motion preferences

## Accessibility
- High contrast option available
- Minimum touch target: 44x44px
- Color is never the only indicator
- Support for screen readers
- Animations can be disabled
- Multiple language support planned (English, isiZulu, isiXhosa, Afrikaans)

## Cultural Sensitivity
- Diverse representation of African women in illustrations
- Multiple South African languages support (roadmap)
- Respectful, empowering tone
- African-centered design without stereotypes
- Evidence-based content using SA health guidelines (SAHCS, SASOG)

## Navigation Architecture

### Tab Navigation (5 tabs)
1. **Home** - Cycle dashboard with lotus/wheel visualization
2. **Track** - Daily symptom and period logging
3. **Health** - PCOS, endometriosis, screening modules (CENTER)
4. **Learn** - Education library
5. **Profile** - Settings, preferences, data management

### Screen Headers
- Transparent headers with blur effect (iOS 26+ liquid glass style)
- Consistent title placement
- Back buttons where appropriate

## Component Guidelines

### Buttons
- Full-width primary buttons use primary color (sage)
- Pill-shaped (full border radius)
- 52px height
- Spring animation on press

### Input Fields
- 52px height
- 12px border radius
- 1px border
- Placeholder text in secondary color

### Cards
- InsightCard: Icon + title + description + chevron
- QuickStatCard: Icon + value + label
- HealthModuleCard: Status badge support

## Assets Required
1. **icon.png** - App icon with lotus/cycle motif
2. **splash-icon.png** - Simplified lotus symbol
3. **empty-cycle.png** - Empty state for home
4. **empty-health.png** - Empty state for health
5. **onboarding-hero.png** - Welcome screen illustration
