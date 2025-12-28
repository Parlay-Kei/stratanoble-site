# UI/UX Design Copilot Skill

## Overview
A specialized skill for matching app designs to reference mockups, with expertise in the Direct Cuts design system.

## Capabilities
- **Design Analysis**: Compare current implementation against reference designs
- **Gap Detection**: Identify color, spacing, typography, and layout issues
- **Code Generation**: Output production-ready React + Tailwind components
- **Design Token Management**: Maintain consistent design system tokens

## Usage

### Analyze a Screen
```
Analyze the Discovery screen against the reference design in page_004.png.
Identify all visual discrepancies and provide updated component code.
```

### Generate Component
```
Generate a BarberCard component that matches the reference design exactly.
Use the design system colors and spacing from specs/design-system.json.
```

### Audit Design System
```
Audit the current tailwind.config.js against the Direct Cuts design system.
List any missing or incorrect design tokens.
```

## Reference Files
- Design System: `/specs/design-system.json`
- System Prompt: `/system-prompts/design-agent.md`
- Reference Images: `/output_images/page_*.png`

## Key Design Elements

### Colors
- Brand Red: `#E63946` (use `bg-brand-red`, `text-brand-red`)
- Backgrounds: `bg-surface-primary` (#1A1A1A), `bg-surface-secondary` (#2D2D2D)
- Gold Stars: `text-gold` (#FFD700)

### Components
- Cards: `bg-surface-secondary rounded-2xl shadow-card p-4`
- Primary Button: `bg-brand-red text-white rounded-lg px-6 py-3`
- Category Pill: `bg-brand-red text-white rounded-full px-4 py-2 text-sm`

## Screen Reference Map
| Page | Screen |
|------|--------|
| page_003.png | Map View + Barber Profile |
| page_004.png | Discovery/Find & Book |
| page_007.png | Appointments |
| page_009.png | Monetization/Pricing |
