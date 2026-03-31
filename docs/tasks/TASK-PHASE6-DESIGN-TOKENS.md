# TASK: Phase 6 — Design Foundation (Tokens, Fonts, Globals)

**Branch:** `feature/site-revamp-phase-6-design-tokens`  
**Base:** `main` (after Phase 5 PR is merged)  
**Context:** The brand guide specifies a precise visual system — Command Navy dominant surfaces, Forest Green accents, Clash Display headlines, General Sans body, IBM Plex Mono for data, sharp corners, no gradients, no glows, no border-radius. The current site uses none of these. Phase 6 replaces the design foundation so every component inherits the correct tokens. No component logic changes — only the design system underneath.

**Source of truth:** `Brand_Identity_STRATA_NOBLE_Brand_Strategy_Style_Guide` (uploaded to project context)

---

## What Changes

### Fonts
**Current:** Inter (body) + Bitter (serif, loaded but never used)  
**Target:** Clash Display (headlines) + General Sans or Satoshi (body) + IBM Plex Mono (data/system)

### Colors  
**Current:** Tailwind emerald overrides, accent-gold/cream, navy defaults, hardcoded `#070f1a`  
**Target:**  
| Token | Hex | Role |
|-------|-----|------|
| `command-navy` | `#0E1A2B` | Primary surface (~60%) |
| `forest-green` | `#2D6A4F` | Primary accent, CTAs (~20%) |
| `field-sage` | `#A8C5B0` | Secondary accent, data highlights (~10%) |
| `slate-grey` | `#8A9BAE` | Neutral, structural, secondary text (~8%) |
| `void` | `#070F1A` | Deep surface, panel backgrounds (~2%) |
| `fault-amber` | `#C8852A` | Alert/error states only |
| `white` | `#FFFFFF` | Body text on dark surfaces |
| `off-white` | `#F5F2EE` | Light backgrounds (print only, sparingly on web) |

### Surface Language
**Current:** White backgrounds on subpages, gradients, rounded corners, glass effects, shadows  
**Target:** Dark matte flat surfaces, sharp corners (no border-radius), 1px borders in Slate Grey or Forest Green, no gradients/glows/bevels

### Animations
**Current:** Framer-motion spring/bounce animations, 600ms+ transitions  
**Target:** Hard cuts or 200ms max fades, no bounce/spring/playful easing

---

## 6A — Font Installation

### Steps

1. **Source the fonts.** Clash Display and General Sans are available from [Fontshare](https://www.fontshare.com/) (free for commercial use). IBM Plex Mono is on Google Fonts.

   Download and place font files:
   ```
   apps/website/public/fonts/
   ├── ClashDisplay-Bold.woff2
   ├── ClashDisplay-Regular.woff2
   ├── ClashDisplay-Light.woff2
   ├── GeneralSans-Regular.woff2
   ├── GeneralSans-Medium.woff2
   ```

   Alternatively, if self-hosting is too heavy for now, use Fontshare CDN or Google Fonts CDN for IBM Plex Mono.

2. **Update `src/app/layout.tsx`:**
   - Remove `Bitter` and `Inter` imports from `next/font/google`
   - Add IBM Plex Mono from `next/font/google`:
     ```tsx
     import { IBM_Plex_Mono } from 'next/font/google';
     const plexMono = IBM_Plex_Mono({
       subsets: ['latin'],
       weight: ['400', '600'],
       display: 'swap',
       variable: '--font-mono',
     });
     ```
   - For Clash Display and General Sans (self-hosted), use `next/font/local`:
     ```tsx
     import localFont from 'next/font/local';
     const clashDisplay = localFont({
       src: [
         { path: '../../../public/fonts/ClashDisplay-Light.woff2', weight: '300' },
         { path: '../../../public/fonts/ClashDisplay-Regular.woff2', weight: '400' },
         { path: '../../../public/fonts/ClashDisplay-Bold.woff2', weight: '700' },
       ],
       variable: '--font-display',
       display: 'swap',
     });
     const generalSans = localFont({
       src: [
         { path: '../../../public/fonts/GeneralSans-Regular.woff2', weight: '400' },
         { path: '../../../public/fonts/GeneralSans-Medium.woff2', weight: '500' },
       ],
       variable: '--font-body',
       display: 'swap',
     });
     ```
   - Update `<html>` className: `${clashDisplay.variable} ${generalSans.variable} ${plexMono.variable}`

3. **Update `tailwind.config.js` fontFamily:**
   ```js
   fontFamily: {
     display: ['var(--font-display)', 'Clash Display', 'sans-serif'],
     sans: ['var(--font-body)', 'General Sans', 'Satoshi', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
     mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
   },
   ```

4. **Remove** the `Bitter` font entirely — no serif stack in the brand guide.

### Validation
- `npm run build` exit 0
- Browser: headlines should show Clash Display (if font files are loaded), body text General Sans

### Commit
```bash
git commit -m "feat(design): install Clash Display, General Sans, IBM Plex Mono — replace Inter/Bitter"
```

---

## 6B — Color Token Replacement

### Steps

1. **Replace the color palette in `tailwind.config.js`:**

   Remove: all current `navy`, `silver`, `emerald` overrides, `dark-purple`, `accent-red`, `accent-gold`, `accent-cream`, `brand.*`, `primary.*`, `accent.*`, `neutral.*`

   Replace with:
   ```js
   colors: {
     // Brand palette — source: Brand Strategy & Style Guide v1.0
     'command-navy': '#0E1A2B',
     'forest-green': '#2D6A4F',
     'field-sage': '#A8C5B0',
     'slate-grey': '#8A9BAE',
     'void': '#070F1A',
     'fault-amber': '#C8852A',
     'off-white': '#F5F2EE',

     // Semantic aliases (for component shorthand)
     primary: {
       DEFAULT: '#0E1A2B',    // command-navy
       accent: '#2D6A4F',     // forest-green
       highlight: '#A8C5B0',  // field-sage
     },
     surface: {
       DEFAULT: '#0E1A2B',    // command-navy — primary canvas
       deep: '#070F1A',       // void — deep panels
       light: '#F5F2EE',      // off-white — sparingly
     },
     text: {
       DEFAULT: '#FFFFFF',    // white on dark
       secondary: '#8A9BAE',  // slate-grey
       accent: '#A8C5B0',     // field-sage for data
       dark: '#0E1A2B',       // command-navy on light surfaces
     },
     border: {
       DEFAULT: '#8A9BAE',    // slate-grey
       accent: '#2D6A4F',     // forest-green
     },
     state: {
       active: '#A8C5B0',     // field-sage
       idle: '#8A9BAE',       // slate-grey
       fault: '#C8852A',      // fault-amber
     },
   },
   ```

2. **Update `globals.css`:**
   ```css
   @layer base {
     body {
       @apply bg-command-navy text-white;
     }
   }
   ```

   Update button classes:
   ```css
   .btn-primary {
     @apply btn bg-forest-green text-white hover:bg-forest-green/90 active:bg-forest-green/80;
   }
   .btn-secondary {
     @apply btn bg-transparent text-white border border-slate-grey hover:border-forest-green hover:text-field-sage;
   }
   .btn-ghost {
     @apply btn text-slate-grey hover:text-white hover:bg-command-navy;
   }
   ```

   Remove: gradient backgrounds from utilities, `accent-gold`/`accent-cream` utilities, `glass-effect`

3. **Remove from tailwind config:**
   - `backgroundImage` gradient definitions
   - `backdropBlur` glass definitions
   - `boxShadow` glass/card definitions (replace with flat 1px borders)

4. **Global find-and-replace pass** (agent must execute carefully):
   This is the tedious but critical step. Every component currently using old color tokens needs updating. The agent should:
   
   a. Search for all occurrences of old tokens and map to new:
   ```
   bg-navy / bg-navy-900 / bg-[#003366] → bg-command-navy
   bg-[#070f1a] / bg-[#0c1524] → bg-void (or bg-command-navy depending on context)
   text-navy-900 / text-navy → text-command-navy (on light) or text-white (on dark)
   text-emerald-600 / text-emerald-700 → text-forest-green
   text-emerald-400 → text-field-sage
   bg-emerald-500 / bg-emerald-600 → bg-forest-green
   text-slate-400 / text-slate-500 → text-slate-grey
   text-slate-300 / text-gray-300 → text-slate-grey (or text-white for primary body on dark)
   border-slate-200 / border-gray-200 → border-slate-grey/30 (or border-slate-grey)
   border-emerald-500 → border-forest-green
   text-accent-gold / bg-accent-gold → REMOVE (not in palette)
   text-accent-cream / bg-accent-cream → REMOVE
   from-emerald-500 to-teal-500 → bg-forest-green (flat, no gradient)
   bg-gradient-to-* → REMOVE all gradient classes (brand guide: no gradients)
   ```
   
   b. Replace `rounded-2xl`, `rounded-xl`, `rounded-lg` → remove or replace with `rounded-none` (brand guide: sharp corners, no border-radius). Exception: form inputs may keep minimal rounding for usability (`rounded-sm` at most).
   
   c. Replace `shadow-xl`, `shadow-2xl`, `shadow-lg` → remove (brand guide: flat surfaces, no shadows). Use 1px borders instead.
   
   d. Replace `backdrop-blur-*`, `glass-effect` → remove.

   **IMPORTANT:** This step will break visual appearance across all pages. That's expected — the pages will look wrong with new tokens and old layouts. Phase 7 fixes layouts.

### Validation
- `npm run build` exit 0
- All pages render (even if they look rough — expected at this stage)
- No references to old color tokens remain

### Commit
```bash
git commit -m "feat(design): replace color palette with brand guide tokens — Command Navy, Forest Green, Field Sage"
```

---

## 6C — Animation & Surface Cleanup

### Steps

1. **Framer Motion:** Replace spring/bounce animations with minimal transitions:
   - Search for `transition={{ type: 'spring'` → replace with `transition={{ duration: 0.2 }}`
   - Search for `whileHover={{ y: -4, scale:` → replace with `whileHover={{ opacity: 0.9 }}` or remove
   - Search for `animate={{ scale: [1, 1.1, 1], rotate:` → remove (no looping ambient animations)
   - `AnimatePresence` on mobile menu is fine — keep, but ensure exit transitions are ≤200ms

2. **Remove** all `hover:scale-105`, `hover:shadow-xl`, `transform hover:scale-*` classes. Brand guide says mechanical, deliberate motion — not playful.

3. **Remove** all `bg-gradient-to-br`, `bg-gradient-to-r` classes that survived 6B.

4. **Border-radius audit:** Confirm all `rounded-*` classes above `rounded-sm` are removed from marketing components. Platform/auth components (dashboard, vault, admin) can keep their current styling — they're not marketing pages.

### Validation
- `npm run build` exit 0
- No spring animations on marketing pages
- No rounded corners on marketing cards/sections
- No gradient backgrounds

### Commit
```bash
git commit -m "feat(design): remove gradients, rounded corners, spring animations — flat sharp mechanical"
```

---

## 6D — Safelist & Config Cleanup

### Steps

1. **Clean up tailwind safelist:** Remove all safelisted classes that reference old tokens (`text-navy-900`, `text-emerald-600`, `bg-emerald-600`, etc.). Add new brand tokens if needed for dynamic usage.

2. **Remove** the old `branding/tailwind.config.js` file (it references the old Figma brand sheet palette) or update it to match the new system.

3. **Update** `globals.css`:
   - Remove `.gradient-text` utility
   - Remove `.heading-primary` utility (replace with `font-display` usage)
   - Update `.input` class to use brand tokens (border-slate-grey, focus:border-forest-green)
   - Add brand-specific utilities:
     ```css
     .font-display { @apply font-display; }
     .text-data { @apply font-mono text-field-sage text-sm; }
     .surface-panel { @apply bg-command-navy border border-slate-grey/20; }
     .surface-deep { @apply bg-void; }
     ```

4. **Verify** the `ui/` component library (button, card, badge, input, etc.) uses the new tokens. These are the foundation components that everything else builds on.

### Validation
- `npm run build` exit 0
- `tailwind.config.js` has no references to old brand colors
- `globals.css` has no gradient or glass utilities

### Commit
```bash
git commit -m "chore(design): clean tailwind safelist, globals.css, ui tokens for new brand system"
```

---

## Execution Order

```
6A (fonts) → 6B (colors) → 6C (animations/surfaces) → 6D (config cleanup)
```

6A and 6B are the highest-impact steps. 6C and 6D are cleanup.

**Expected outcome after Phase 6:** The site will render with correct fonts and colors but layouts will look rough because component structures (hero patterns, card layouts, spacing) were designed for the old visual language. That's correct and expected — Phase 7 addresses component patterns.

## Key Brand Guide Rules to Enforce

- **No gradients.** Flat fills only. `bg-gradient-*` should not exist in marketing components after this phase.
- **No border-radius** above `rounded-sm` on marketing components. Sharp corners are the brand identity.
- **No shadows.** Use 1px borders for panel delineation.
- **No spring/bounce animations.** 200ms max transitions, hard cuts preferred.
- **No glow/neon/luminosity effects.** No `backdrop-blur`, no glass morphism.
- **Command Navy is the default canvas.** Not white. Not off-white. Dark is the primary surface.
- **Forest Green for CTAs and active states.** Not emerald-500, not teal, not cyan.
- **Font weight contrast is intentional.** Pair Clash Display 700 with 300 for visual tension.
- **IBM Plex Mono for anything that looks like system/data output.** Timestamps, pipeline stages, status labels.

## NOT in scope
- Component layout restructuring (Phase 7)
- New hero patterns or section designs (Phase 7)  
- Content changes
- `/proof` page
- Platform/app route styling (dashboard, vault, admin, auth)
