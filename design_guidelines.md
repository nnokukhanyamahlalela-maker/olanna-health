# Olanna Health Design Guidelines

## Brand Philosophy
**"Editorial Elegance meets African Wellness"**

Inspired by Vogue editorial aesthetics - sophisticated, refined, and timeless. The design should feel like a luxury wellness magazine, not a typical health app.

- Elevated and editorial, never cartoonish
- Calm enough for vulnerable moments
- Serious enough to be trusted for health
- Feminine without being juvenile

## Target Audience
African women, especially in South Africa, seeking comprehensive femtech solutions for menstrual health, fertility, PCOS, endometriosis, and sexual/reproductive health.

## Visual Identity

### Color Palette
The palette draws from warm, muted tones reminiscent of cream linens, dusty rose textiles, and natural materials - inspired by lifestyle editorial photography.

#### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#FAF6F3` | Primary background |
| Warm White | `#FFFCFA` | Card backgrounds |
| Dusty Rose | `#D4A99A` | Primary accent, buttons, lotus |

#### Neutral Tones
| Color | Hex | Usage |
|-------|-----|-------|
| Taupe | `#C4B5AD` | Secondary elements |
| Sand | `#E5DDD8` | Borders, dividers |
| Warm Gray | `#6B635C` | Secondary text |
| Charcoal | `#3A3530` | Primary text |

#### Accent Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Gold | `#C9A86C` | Highlights, insights, ovulation |
| Sage | `#B8C4B8` | Calm, wellness, follicular |
| Lavender | `#C8C0D0` | Reflection, mood, luteal |
| Terracotta | `#D4A090` | Energy, warmth, menstrual |

### Phase Colors
- **Menstrual**: Terracotta `#D4A090`
- **Follicular**: Sage `#B8C4B8`
- **Ovulation**: Gold `#C9A86C`
- **Luteal**: Lavender `#C8C0D0`

## Typography

### Font Family
**Poppins** - Used throughout for a clean, modern feel

### Font Weights
- **Light (300)** - Body text, captions
- **Regular (400)** - Standard text, form inputs
- **Medium (500)** - Emphasis, headings
- **SemiBold (600)** - Main headings, large titles
- **Bold (700)** - Hero text (use sparingly)

### Text Styles
- Headlines: Refined, with subtle letter-spacing (-0.5)
- Body: Light weight (300), generous line height for readability
- Buttons: Uppercase, letter-spaced (0.5) for editorial feel
- Numbers: Clean, modern numerals

### Type Scale
| Type | Size | Weight |
|------|------|--------|
| Hero | 32px | SemiBold |
| Screen Title (h1) | 28px | SemiBold |
| Section Header (h2) | 22px | Medium |
| Card Title (h3) | 18px | Regular |
| Body Text | 15px | Light |
| Small Text | 13px | Light |
| Captions | 12px | Light |
| Buttons | 13px | Medium, uppercase |

## UI Elements

### Buttons
- Softly rounded corners (16px radius) - NOT pill-shaped
- Uppercase text with letter-spacing
- Subtle shadow for depth
- Muted dusty rose color
- 52px height
- Text color: Warm White

### Cards
- Warm white backgrounds (`#FFFCFA`)
- Very subtle borders (sand color)
- Soft shadows (minimal elevation)
- Generous padding
- 8px border radius (reduced from 16px for refinement)

### Chips/Tags
- Pill-shaped only for selected states
- Soft backgrounds when unselected
- Refined, not playful
- Muted colors

### Input Fields
- 52px height
- 8px border radius
- Background: Warm White
- Border: Sand
- Focus state: Dusty Rose border
- Text: Charcoal
- Placeholder: Warm Gray

### Icons
- Feather icons (thin, elegant strokes)
- Used sparingly
- Always paired with text labels
- 20-24px for primary icons
- 16-18px for secondary icons

## Spacing System
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 40px
3xl: 48px
```

- Generous whitespace
- Asymmetric layouts where appropriate
- Content breathes on the page

## Border Radius
```
sm: 4px (refined edges)
md: 8px (cards, inputs)
lg: 16px (buttons, larger elements)
xl: 24px (modals)
full: 999px (avatar, pills)
```

## Shadows
Very subtle, never heavy:
```
Soft: 0px 2px 8px rgba(42, 36, 32, 0.04)
Glow: 0px 0px 16px rgba(232, 196, 184, 0.20)
```

## Lotus Visualization

The lotus is **data-driven**, not decorative.

### Phase-Based Lotus States
- **Menstrual:** Closed bud, terracotta tint
- **Follicular:** Rising, sage green tint
- **Ovulation:** Full bloom, gold accent
- **Luteal:** Petals closing, lavender softness

### Animation Rules
- Never spin, bounce, or sparkle
- This is calm embodiment, not gamification
- All motion should be slow, breathing-like (3s+ duration)
- Subtle, refined animations

## Imagery Style
Drawing from the Olanna Health website aesthetic:
- Editorial photography aesthetic
- Warm, natural lighting
- Soft focus backgrounds
- Lifestyle moments (morning routines, self-care)
- Inclusive representation of African women
- Muted, warm color grading
- Intimate, peaceful compositions

## Interaction Design
- Subtle, refined animations
- Gentle haptic feedback
- Smooth transitions
- No bouncy or cartoonish effects
- Spring animations with high damping

## Don'ts
- No bright, saturated colors
- No playful or cartoonish elements
- No heavy shadows or 3D effects
- No emoji in UI
- No harsh borders or outlines
- No neon or fluorescent colors
- No pure black (#000000)
- No clinical blue

## Do's
- Embrace negative space
- Use muted, sophisticated tones
- Keep interactions elegant
- Prioritize readability
- Maintain visual hierarchy through weight, not color
- Use warm, cream-based neutrals

## Navigation Architecture

### Tab Navigation (5 tabs)
1. **Cycle** - Cycle dashboard with lotus visualization
2. **Check-in** - Daily symptom and period logging
3. **Health** - PCOS, endometriosis, screening modules (CENTER, elevated)
4. **Calendar** - Monthly cycle view
5. **Learn** - Education library

### Screen Headers
- Transparent headers with blur effect
- Consistent title placement
- Clean back buttons

## Accessibility
- High contrast option available
- Minimum touch target: 44x44px
- Color is never the only indicator
- Support for screen readers
- Animations can be disabled
- Multiple language support (English, isiZulu)

## Cultural Sensitivity
- Diverse representation of African women
- Multiple South African languages support
- Respectful, empowering tone
- African-centered design without stereotypes
- Evidence-based content using SA health guidelines (SAHCS, SASOG)
