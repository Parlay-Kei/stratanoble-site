# XLNT! Ultra-Modern Landing Page Specification

**Agent:** Design Agent (ANX Framework)\
**Date:** 2026-02-10\
**Status:** Ready for Design / Implementation\
**Project:** XLNT! Landing Page (mdx.so style)

---

## 1. Canvas & Grid Configuration

### Frames

- **Desktop:** `1920x1080` (Full HD standard)
- **Mobile:** `375x812` (iPhone X/11/12/13 mini standard)

### Grid System

- **Base Unit:** `8pt`
- **Baseline Grid:** `16pt`
- **Gutters:** `24px`
- **Layout:** Full-bleed sections

---

## 2. Design System (Global Styles)

### Color Palette

| Token            | Color         | Hex       | Notes                |
| ---------------- | ------------- | --------- | -------------------- |
| `bg-primary`     | Soft Bone     | `#F8F7F5` | Main background      |
| `bg-secondary`   | Warm Espresso | `#2C1F1A` | Dark sections/footer |
| `text-primary`   | Warm Charcoal | `#1A150F` | Headings, main text  |
| `text-secondary` | Muted Slate   | `#5C4A3A` | Supporting text      |
| `accent-hover`   | Deep Ink      | `#3B2E24` | Hover states         |

### Typography

_Font Family: Inter (or similar humanist sans)_

| Style     | Role           | Details                                  |
| --------- | -------------- | ---------------------------------------- |
| **H1**    | Hero Headline  | `144px` / `1.1` Line Height / **Bold**   |
| **H2**    | Section Titles | `72px` / `1.2` Line Height / **Regular** |
| **H3**    | Product Names  | `32px` / `1.4` Line Height / **Medium**  |
| **Body**  | Descriptions   | `20px` / `1.6` Line Height / **Regular** |
| **Micro** | Nav/Labels     | `16px` / `1.6` Line Height / **Regular** |

### Components

#### Button Primary

- **Fill:** `#2C1F1A` (Espresso)
- **Text:** White, `16px`
- **Padding:** `16px` (all sides)
- **Corner Radius:** `4px`
- **Hover Interaction:** Change fill to `#3B2E24` + Scale `1.02`

#### Logo

- **Type:** Wordmark "XLNT!"
- **Height:** `120px`
- **Style:** Custom/Upgraded version

#### Product Card

- **Dimensions:** `400x500px`
- **Radius:** `24px`
- **Shadow:** `0 8px 32px rgba(0,0,0,0.08)` (Subtle drop shadow)
- **Content:** Image (`400x500`), Name (`32px` white overlay), "Shop" link
  (underline on hover)

---

## 3. Frame Structure (Desktop)

### Section 1: Hero (1920x100vh)

**Background:** Full bleed `#F8F7F5` gradient to `#F0EDE8` at bottom.\
**Texture:** Subtle fabric overlay (8% opacity).

- **Logo:** `x:80`, `y:120`, Height `120px`
- **Headline (H1):** "XLNT!", Absolute Center (`x:50%`, `y:300`)
- **Subtext (Micro):** "Resilience, felt daily." (`y:480`, opacity 80%)
- **Hero Image:** Right side (`x:1200`, `y:200`), `680x680px`, Ellipse Mask.
  Garment in soft motion.
- **CTA Button:** "Enter" (`x:1400`, `y:700`). Interaction: Opacity 0 → Fade in
  on scroll.

### Section 2: Product Moment (1920x80vh)

**Background:** Full `#F8F7F5`.

- **Product Image:** Left (`x:80`, `y:100`), `680x680px`.
  - _Mask:_ `24px` radius.
  - _Shadow:_ `12px` drop shadow.
  - _Interaction:_ Parallax tilt 2° on hover.
- **Heading (H2):** "Soft when it counts." (Center `x:50%`, `y:300`, **Charcoal
  `#1A150F`**)
- **Subtext (Micro):** "Strong when you need it." (`20px`, below H2).

### Section 3: Collection (1920x120vh)

**Background:** Charcoal `#2C1F1A`.

- **Layout:** 3 Product Cards in a sparse row with massive `200px` gutters.
  - **Card 1:** `x:120`, `y:200`
  - **Card 2:** `x:760`, `y:100` (Staggered up)
  - **Card 3:** `x:1400`, `y:200`
- **Card Content:** Image, Name (32px White), "Shop" link.

### Section 4: Story (1920x60vh)

**Background:** Bone `#F8F7F5` with subtle vertical fabric texture.

- **Layout:** Massive vertical space, `8px` left/right margins only.
- **Center Text (H2):** "Designed for days that test you." (`x:50%`, `y:200`)
- **Subtext (Micro):** "And the ones you quietly win."

### Section 5: Footer (1920x40vh)

**Background:** Charcoal `#2C1F1A`.

- **Nav Links:** Center Top. "Shop · Story · Contact" (`16px`, `48px` spacing).
- **Newsletter:** Center Bottom. `400px` wide container. Email Input + "Stay
  XLNT" Button.

---

## 4. Mobile Adaptation (375px)

_Stack everything vertically._

- **Grid:** `24px` Gutters.
- **Typography Adjustment:**
  - H1: `64px`
  - H2: `40px`
  - H3: `24px`
  - Body: `18px`
- **Components:**
  - Hero Product: `300x300px` Centered.
  - Products: Single column, `340x420px` cards.

---

## 5. Interactions & Prototyping

1. **Hero CTA:** Fade entire page to black → Reveal Frame 2 (Transition).
2. **Product Cards:** Hover Scale `1.02` + Color Overlay.
3. **Nav Links:** Custom cursor trail effect.
4. **Logo:** Parallax scroll effect (`-20px` vertical movement on scroll).

---

## 6. Export Specs

- **Assets:** Export all graphics as `2x PNG` and `SVG`.
- **Styles:** Export complete color (`.json`/`.scss`) and typography system.
- **Components:** Button and Product Card must be reusable symbols/components.
- **Prototype:** Deliver full scroll + hover interactions recording.
