# Olanna Health Design Guidelines

## Brand Philosophy
**Soft, grounded, intelligent.**
- Calm enough for vulnerable moments
- Serious enough to be trusted for health
- Feminine without being juvenile

## Target Audience
African women, especially in South Africa, seeking comprehensive femtech solutions for menstrual health, fertility, PCOS, endometriosis, and sexual/reproductive health.

## Core Color Palette

### Primary Brand Colors
| Color | Hex | Usage | Emotion |
|-------|-----|-------|---------|
| Blush Lotus (Primary) | `#F4B6C2` | Primary buttons, highlights, active states, icons, key accents | Warmth, care, femininity, safety |
| Soft Clay (Secondary) | `#D6B2A2` | Cards, secondary buttons, background panels | Grounded, earthy, African warmth |

### Neutral Foundation
| Color | Hex | Usage |
|-------|-----|-------|
| Warm Ivory (Background) | `#FFF7F2` | App background, screens, modals |
| Sandstone Beige | `#F1E6DE` | Card backgrounds, section dividers |
| Taupe Brown (Text Secondary) | `#7A6A5F` | Body text, helper text |
| Deep Cocoa (Text Primary) | `#3A2F2A` | Headings, important labels |

### Accent & Insight Colors (use sparingly)
| Color | Hex | Usage |
|-------|-----|-------|
| Muted Gold | `#C9A24D` | Ovulation indicators, insights, "peak" moments |
| Dusty Lavender | `#C8BFD6` | Mood states, reflection prompts, luteal phase |
| Sage Green | `#A8BFA5` | Gut health, recovery, "doing okay" states |
| Soft Terracotta | `#D98C7A` | Pain indicators, warnings (never bright red) |

### Colors to Avoid
- Bright red
- Neon pink
- Stark black (#000000)
- Clinical blue

## Cycle Phase Color Mapping

### Menstrual Phase - Rest & Release
- **Lotus state:** Closed bud, submerged
- **Primary:** Soft Terracotta `#D98C7A`
- **Supporting:** Warm Ivory `#FFF7F2`, Taupe Brown `#7A6A5F`
- **Use for:** Flow tracking, pain indicators, rest prompts
- **Visual tone:** Muted, grounded, protective
- **Motion:** Very slow breathing/pulse (subtle)

### Follicular Phase - Emergence & Renewal
- **Lotus state:** Bud rising, gently opening
- **Primary:** Sage Green `#A8BFA5`
- **Supporting:** Sandstone Beige `#F1E6DE`, Soft Clay `#D6B2A2`
- **Use for:** New cycle start, planning, learning, goal-setting
- **Visual tone:** Fresh, hopeful
- **Motion:** Upward movement, petals easing open

### Ovulation Phase - Peak & Radiance
- **Lotus state:** Full bloom
- **Primary:** Muted Gold `#C9A24D`
- **Supporting:** Blush Lotus `#F4B6C2`, Warm Ivory `#FFF7F2`
- **Use for:** Fertility window, social energy, confidence
- **Visual tone:** Luminous, warm, celebratory
- **Motion:** Gentle glow/halo effect (not flashy)

### Luteal Phase - Reflection & Integration
- **Lotus state:** Petals slowly closing
- **Primary:** Dusty Lavender `#C8BFD6`
- **Supporting:** Taupe Brown `#7A6A5F`, Sandstone Beige `#F1E6DE`
- **Use for:** Mood tracking, PMS/PMDD support, reflection
- **Visual tone:** Introspective, soft
- **Motion:** Slow downward drift, petals folding

## Typography

### Font Family
- **Playfair Display** - Headings (elegant, editorial, trustworthy)
  - Medium (500) - Subheadings
  - SemiBold (600) - Main headings
- **Inter** - Body/UI (clean, modern, highly readable)
  - Regular (400) - Body text
  - Medium (500) - Emphasis
  - SemiBold (600) - Buttons
- **Manrope** - Numbers/Stats (modern, tech-clean)
  - Medium (500) - Regular numbers
  - Bold (700) - Large stats

### Type Scale
| Type | Size |
|------|------|
| Screen Title (h1) | 32px |
| Section Header (h2) | 24px |
| Card Title (h3) | 18px |
| Body Text | 16px |
| Small Text | 14px |
| Helper Text | 13px |
| Buttons | 16px (Medium weight) |

- Line height: 1.4-1.6
- Letter spacing: Slightly loose for headings

## Semantic Color Mapping

| Meaning | Color |
|---------|-------|
| Neutral / Default | Warm Ivory `#FFF7F2` |
| Action / Confirm | Blush Lotus `#F4B6C2` |
| Insight / Highlight | Muted Gold `#C9A24D` |
| Pain / Concern | Soft Terracotta `#D98C7A` |
| Calm / Stable | Sage Green `#A8BFA5` |
| Reflection / Emotions | Dusty Lavender `#C8BFD6` |
| Text (Primary) | Deep Cocoa `#3A2F2A` |
| Text (Secondary) | Taupe Brown `#7A6A5F` |

## Lotus Animation System

The lotus is **data-driven**, not decorative.

### How It Works
- Cycle phase determines lotus state and color
- Symptoms affect petal behavior
- Mood + energy subtly alter color saturation

### Phase-Based Lotus States
- **Menstrual:** Closed bud, terracotta glow
- **Follicular:** Rising, sage green tint
- **Ovulation:** Full bloom, gold halo
- **Luteal:** Petals closing, lavender softness

### Animation Rules
- Never spin, bounce, or sparkle
- This is calm embodiment, not gamification
- All motion should be slow, breathing-like (3s+ duration)

### Where the Lotus Appears
- Home screen (primary anchor)
- Daily check-in header
- Cycle insights screen
- Subtle watermark in charts

## Theme Presets

### Olanna Theme (Default)
Primary Blush Lotus with Soft Clay accents. Warm, grounded, African-inspired.

### Blossom Theme
Primary Blush Lotus with Dusty Lavender accents. Soft, feminine, nurturing.

### Garden Theme
Primary Sage Green with Blush Lotus accents. Fresh, natural, growth-oriented.

### Dreamy Theme
Primary Dusty Lavender with lighter accents. Calm, restful, introspective.

## Spacing System
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
```

## Border Radius
```
sm: 8px
md: 16px
lg: 24px
xl: 32px
full: 999px (pills)
```

## Shadows
```
Soft: 0px 4px 12px rgba(58, 47, 42, 0.08)
Glow: 0px 0px 20px rgba(201, 162, 77, 0.25)
```

## Visual Elements

### Cards and Containers
- Background: Sandstone Beige `#F1E6DE`
- Soft shadows (Deep Cocoa at low opacity)
- Border radius: 16px (md)
- Text: Deep Cocoa for titles, Taupe Brown for body

### African-Inspired Patterns
Subtle background patterns add cultural identity without cliches:
- **Zigzag** - Traditional geometric motif (default)
- **Waves** - Flow and continuity
- **Dots** - Rhythmic, organic feel
- **Triangles** - Strength and stability

Use at 2-3% opacity as subtle background textures.

## Privacy Visual Cues
- **Lock/shield icons** near sensitive inputs
- **Calming colors** (Sage Green) for sensitive screens
- **PrivacyBadge component** explains data encryption
- Brief tooltips about local storage
- "Your data stays on your device" messaging

## Icons
Use Feather icons for consistency:
- Outlined style
- 20-24px for primary icons
- 16-18px for secondary icons
- Use semantic colors matching content context
- No emojis except for mood selectors if necessary

## Accessibility
- High contrast option available
- Minimum touch target: 44x44px
- Color is never the only indicator
- Support for screen readers
- Animations can be disabled
- Multiple language support (English, isiZulu, isiXhosa, Afrikaans)

## Cultural Sensitivity
- Diverse representation of African women in illustrations
- Multiple South African languages support
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
- Transparent headers with blur effect
- Consistent title placement
- Back buttons where appropriate

## Component Guidelines

### Buttons
- Primary: Blush Lotus `#F4B6C2` with Deep Cocoa text
- Secondary: Soft Clay `#D6B2A2` with Deep Cocoa text
- Full-width primary buttons
- Pill-shaped (full border radius) or rounded (16px)
- 52px height
- Spring animation on press

### Input Fields
- 52px height
- 16px border radius
- Background: White
- Border: Sandstone Beige
- Focus state: Blush Lotus border
- Text: Deep Cocoa
- Placeholder: Taupe Brown

### Cards
- InsightCard: Icon + title + description + chevron
- QuickStatCard: Icon + value + label
- HealthModuleCard: Status badge support

## Visual Application Summary
- **Backgrounds:** Warm Ivory `#FFF7F2`
- **Cards:** Sandstone Beige `#F1E6DE`
- **Buttons:** Blush Lotus `#F4B6C2` (text in Deep Cocoa)
- **Sliders:** Muted Gold fill on neutral track
- **Pain map:** Soft Terracotta glow (never harsh)
- **Charts:** Sage, Lavender, Gold on neutral background
- **Lotus visuals:** Blush + Gold gradients

## Assets
1. **olanna-logo.png** - Main brand logo
2. **icon.png** - App icon with lotus/cycle motif
3. **splash-icon.png** - Simplified lotus symbol
4. **lotus-icon.png** - Lotus visualization element
