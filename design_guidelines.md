# Olanna Health Design Guidelines

## Brand Philosophy
**"Science Meets Softness"** - Olanna Health positions itself as a women's health hub where evidence-based medicine meets gentle, nurturing care. The brand aesthetic balances clinical credibility with warmth and approachability.

## Target Audience
African women, especially in South Africa, seeking comprehensive femtech solutions for menstrual health, fertility, PCOS, endometriosis, and sexual/reproductive health.

## Color Palette

### Primary Colors (Pastel Palette)
- **Pastel Pink** `#FFB6C1` - Primary brand color, actions, menstrual phase
- **Pastel Pink Light** `#FFD1DC` - Lighter variant for backgrounds
- **Pastel Pink Dark** `#F8A5B0` - Darker variant for active states

### Secondary Colors
- **Pastel Lavender** `#E6E6FA` - Calm, trust, emotional elements
- **Pastel Mint** `#B5EAD7` - Fresh, health, follicular phase
- **Pastel Peach** `#FFDAB9` - Warm, nurturing, luteal phase
- **Pastel Yellow** `#FFFACD` - Gentle highlight, ovulation phase
- **Pastel Blue** `#B4D7E8` - Soft accent, cognitive elements

### Cycle Phase Colors
- **Menstrual Phase** - Pastel Pink `#FFB6C1`
- **Follicular Phase** - Pastel Mint `#B5EAD7`
- **Ovulation Phase** - Pastel Yellow `#FFFACD`
- **Luteal Phase** - Pastel Peach `#FFDAB9`

### Background Colors
- **Cream** `#FFF8F5` - Light background
- **Warm White** `#FFFAF8` - Root background
- **Blush** `#F5E1DF` - Secondary background
- **Sand** `#F8F0EB` - Card backgrounds

### Text Colors
- **Soft Brown** `#8B7B73` - Primary text
- **Warm Gray** `#9A8B83` - Secondary text
- **Border** `#F5E8E5`

### Semantic Colors
- **Success** - Pastel Mint `#B5EAD7`
- **Warning** - Pastel Peach `#FFDAB9`
- **Error** `#E8A0A0` - Soft rose
- **Info** - Pastel Blue `#B4D7E8`

## Theme Presets

### Blossom Theme (Default)
Primary pastel pink with lavender accents. Soft, feminine, nurturing feel matching the brand logo.

### Garden Theme
Primary pastel mint with pink accents. Fresh, natural, growth-oriented feel.

### Dreamy Theme
Primary pastel lavender with blue accents. Calm, restful, introspective feel.

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
- **Center**: Pastel Yellow `#FFFACD`
- **Petals**: Pastel Pink `#FFB6C1`
- **Glow**: `rgba(255, 182, 193, 0.25)`
- **Water Ripple**: `rgba(181, 234, 215, 0.2)`
- **Animation**: Soft breathing effect (3s ease-in-out)
- **Alternative**: Users can switch to traditional cycle wheel if preferred

### Cycle Wheel (Alternative View)
- Circular progress visualization
- Phase segments with pastel colors
- Day indicator dot in pastel pink
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
- **Calming colors** (pastel mint/blue) for sensitive screens
- **PrivacyBadge component** explains data encryption
- Brief tooltips about local storage
- "Your data stays on your device" messaging

## Icons
Use Feather icons for consistency:
- Outlined style
- 20-24px for primary icons
- 16-18px for secondary icons
- Use pastel colors matching content context
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
2. **Check-in** - Daily symptom and period logging
3. **Health** - PCOS, endometriosis, screening modules (CENTER)
4. **Learn** - Education library
5. **Profile** - Settings, preferences, data management

### Screen Headers
- Transparent headers with blur effect (iOS 26+ liquid glass style)
- Consistent title placement
- Back buttons where appropriate

## Component Guidelines

### Buttons
- Full-width primary buttons use pastel pink
- Pill-shaped (full border radius)
- 52px height
- Spring animation on press
- White text on pastel pink background

### Input Fields
- 52px height
- 12px border radius
- 1px border
- Placeholder text in secondary color
- Focus state: pastel pink border

### Cards
- InsightCard: Icon + title + description + chevron
- QuickStatCard: Icon + value + label
- HealthModuleCard: Status badge support

## Logo Usage
The Olanna Health logo features:
- Bold pastel pink wordmark "OLANNA"
- Lighter pink "HEALTH" subtitle
- Clean, modern sans-serif typography
- Use on white or cream backgrounds
- Maintain clear space around logo

## Assets
1. **olanna-logo.png** - Main brand logo
2. **icon.png** - App icon with lotus/cycle motif
3. **splash-icon.png** - Simplified lotus symbol
