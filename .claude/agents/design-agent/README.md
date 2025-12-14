# Direct Cuts Design Agent 🎨

An autonomous AI agent that analyzes, improves, and modernizes your React/Tailwind UI components.

## What It Does

1. **Analyzes** your current components for design issues
2. **Identifies** improvements (animations, accessibility, modern patterns)
3. **Generates** enhanced production-ready code
4. **Applies** changes to your codebase (optional)

## Quick Start

```bash
# Install
cd agents/design-agent
npm install

# Set your API key
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-xxxxx

# Run full autonomous pipeline
npm start auto -- -p ../..
```

## Commands

### `analyze` - Audit Your Design

```bash
npm start analyze -- -p ../../ -v
```

Outputs:
- Overall design score (0-100)
- Design system consistency metrics
- Per-component scores
- Prioritized recommendations

### `enhance` - Improve Components

```bash
# Interactive mode - select components
npm start enhance -- -p ../../

# Specific component
npm start enhance -- -p ../../ -c BarberCard

# All components
npm start enhance -- -p ../../ --all

# Auto-apply changes
npm start enhance -- -p ../../ --all --auto-apply
```

### `generate` - Create New Components

```bash
# Interactive
npm start generate -- -p ../../

# With options
npm start generate -- -p ../../ -n ReviewCard -t component -d "A card showing customer reviews with star ratings, reviewer info, and the review text"
```

### `auto` - Full Autonomous Pipeline

```bash
# Preview mode (saves to enhanced-components/)
npm start auto -- -p ../../

# Apply changes directly
npm start auto -- -p ../../ --apply
```

## Example Output

### Analysis Report

```
📊 Analysis Summary

Overall Score: 72/100
Components Analyzed: 15
Total Issues: 23
Total Improvements: 45

🎯 Design System Consistency

Color Consistency: 85%
Typography Consistency: 70%
Spacing Consistency: 65%
Component Reuse: 40%

📋 Top Recommendations

#1 Inconsistent spacing in card components
   Impact: High - affects multiple screens
   Screens: BarberCard, ServiceCard, AppointmentCard

#2 Missing hover states on interactive elements
   Impact: Medium
   Screens: DiscoveryPage, ProfilePage
```

### Enhanced Component

Before:
```tsx
<div className="bg-gray-800 p-4 rounded">
  <h3 className="text-white">{barber.name}</h3>
  <p className="text-gray-400">{barber.specialty}</p>
</div>
```

After:
```tsx
<div className="bg-surface-secondary p-4 rounded-2xl shadow-lg 
                hover:bg-surface-elevated transition-all duration-200 
                cursor-pointer group">
  <h3 className="text-white font-semibold group-hover:text-brand-red 
                 transition-colors">{barber.name}</h3>
  <p className="text-gray-400 text-sm">{barber.specialty}</p>
</div>
```

## Design System

The agent is trained on the Direct Cuts design system:

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `brand-red` | #E63946 | CTAs, accents |
| `surface-primary` | #1A1A1A | Backgrounds |
| `surface-secondary` | #2D2D2D | Cards |
| `gold` | #FFD700 | Ratings |

### Components
- Buttons (primary, secondary, icon)
- Cards (standard, interactive, featured)
- Inputs (default, error)
- Badges (primary, secondary, status)
- Navigation (bottom tabs)

## Programmatic Usage

```typescript
import { DesignAgent } from '@directcuts/design-agent';

const agent = new DesignAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  projectPath: '/path/to/project',
});

// Run full pipeline
const result = await agent.runAutonomousPipeline({
  applyChanges: false,
  maxComponents: 10,
});

console.log(`Enhanced ${result.enhancements.length} components`);
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Design Agent Pipeline                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. DISCOVER                                                │
│     └─> Scan src/pages/*.tsx and src/components/*.tsx       │
│                                                             │
│  2. ANALYZE                                                 │
│     └─> Claude vision analyzes each component               │
│         - Design system compliance                          │
│         - Accessibility issues                              │
│         - Modern pattern opportunities                      │
│                                                             │
│  3. PRIORITIZE                                              │
│     └─> Rank by impact and effort                           │
│         - Critical issues first                             │
│         - Quick wins highlighted                            │
│                                                             │
│  4. ENHANCE                                                 │
│     └─> Generate improved code                              │
│         - Fix identified issues                             │
│         - Add micro-interactions                            │
│         - Improve accessibility                             │
│                                                             │
│  5. OUTPUT                                                  │
│     └─> Save enhanced components + report                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

Create a `design-agent.config.json` in your project root:

```json
{
  "designSystem": "./specs/design-system.json",
  "referenceImages": "./output_images",
  "excludePatterns": ["*.test.tsx", "*.stories.tsx"],
  "autoApply": false,
  "maxConcurrency": 3
}
```

## Limitations

- Requires Anthropic API key (Claude Sonnet)
- Processes TypeScript/React components only
- Cannot modify non-component files (hooks, utils, etc.)
- Large components may be truncated

## Cost Estimate

Approximate API costs per run:
- Analysis: ~$0.02 per component
- Enhancement: ~$0.05 per component
- Full pipeline (20 components): ~$1.40

## License

MIT
