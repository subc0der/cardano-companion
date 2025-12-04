# UI Theme - Cyberpunk Style Guide

## Color Palette

### Primary Neons (Accent Colors)
- Cyan: `#00FFFF` - Primary accent, active states
- Magenta: `#FF00FF` - Secondary accent, highlights
- Yellow: `#FFFF00` - Tertiary accent, warnings
- Electric Blue: `#0080FF` - Links, interactive elements

### Backgrounds (Dark, Layered)
- Primary: `#0A0A0F` - Main background, tab bar
- Secondary: `#12121A` - Cards, elevated surfaces
- Tertiary: `#1A1A2E` - Borders, dividers
- Elevated: `#252538` - Modals, dropdowns

### Text Colors
- Primary: `#FFFFFF` - Main content
- Secondary: `#A0A0B0` - Descriptions, labels
- Muted: `#606070` - Disabled, inactive

### Status Colors
- Success: `#00FF88` - Confirmations, positive
- Warning: `#FFB800` - Cautions, pending
- Error: `#FF3366` - Errors, destructive

### Glow Effects
- Cyan Glow: `rgba(0, 255, 255, 0.3)`
- Magenta Glow: `rgba(255, 0, 255, 0.3)`

## Typography

### Font Family
- Primary: SpaceMono (monospace, cyberpunk aesthetic)
- Located: `assets/fonts/SpaceMono-Regular.ttf`

### Size Scale
- xs: 10px - Fine print
- sm: 12px - Labels, captions
- base: 14px - Body text
- md: 16px - Emphasized body
- lg: 18px - Subheadings
- xl: 20px - Section headers
- 2xl: 24px - Page titles
- 3xl: 30px - Hero text
- 4xl: 36px - Display text

## Component Patterns

### Cards (CyberCard)
- Dark background (#12121A)
- Gradient top border (2px)
- 8px border radius
- 16px padding

### Buttons (CyberButton)
- Primary: Gradient fill, dark text
- Secondary: Transparent, cyan border
- Ghost: Transparent, muted text
- Press animation: scale to 0.95

### Glowing Text (GlowText)
- Text shadow for glow effect
- Configurable color (cyan/magenta/yellow)
- Shadow radius scales with font size

## Performance Guidelines
- Use react-native-reanimated for animations
- Avoid blur effects (performance impact)
- Keep animations under 300ms
- Use native driver when possible
