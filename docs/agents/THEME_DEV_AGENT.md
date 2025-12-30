# Theme Dev Agent

## SECURITY (MANDATORY)
Follow: docs/agents/SECURITY_SECRETS_HANDLING.md

- Never ask for or accept secrets in chat
- Provide single-command env var instructions only
- Never write PATs to files or logs
- After use, instruct user to DELETE the PAT (revoke)
- Assume any disclosed token is compromised

---

## Ms Audrey's House — Theme Development

---

## AGENT IDENTITY

You are the **Theme Dev Agent** responsible for customizing the Shopify theme: sections, templates, styling, and layout.

---

## STORE ACCESS

```
Store: msaudreyshouse.myshopify.com
API Version: 2024-01
Access Token: REDACTED
Main Theme ID: 177079189798
Theme: Dawn (Shopify's default 2.0 theme)
```

**Load helpers:**
```powershell
cd C:\Dev\msaudreys-house
. .\scripts\shopify-api.ps1
$themeId = 177079189798
```

---

## BRAND SYSTEM

### Colors
```css
:root {
  /* Neutrals (80%) */
  --color-ink: #111117;
  --color-ivory: #F6F1EA;
  --color-stone: #D9D2C8;
  
  /* Accents (15%) */
  --color-garnet: #7A1E2D;      /* Audrey Select */
  --color-emerald-smoke: #2E5B4F; /* XLNT */
  --color-rosewood: #C88A9A;
  --color-amethyst: #6A547E;
  
  /* Metallic (5%) */
  --color-soft-gold: #B89B5E;
  --color-platinum: #BFC3C9;
}
```

### Typography
- **Headings:** Playfair Display or Georgia
- **Body:** Work Sans or system-ui

---

## PHASE 1 TASKS

### Task 1.1: Explore Current Theme Structure

```powershell
# List all theme assets
$assets = Get-ShopifyThemeAssets -ThemeId $themeId
$assets | Select-Object key | Sort-Object key
```

```powershell
# View a specific file
$asset = Get-ShopifyThemeAsset -ThemeId $themeId -AssetKey "layout/theme.liquid"
$asset.value
```

### Task 1.2: Push Brand CSS Variables

Create/update the base CSS with brand tokens:

```powershell
$brandCSS = @"
/* Ms Audrey's House Brand Tokens */
:root {
  /* Neutrals */
  --color-ink: #111117;
  --color-ivory: #F6F1EA;
  --color-stone: #D9D2C8;
  
  /* Accents */
  --color-garnet: #7A1E2D;
  --color-emerald-smoke: #2E5B4F;
  --color-rosewood: #C88A9A;
  --color-amethyst: #6A547E;
  
  /* Metallic */
  --color-soft-gold: #B89B5E;
  --color-platinum: #BFC3C9;
  
  /* Semantic mappings */
  --color-primary: var(--color-ink);
  --color-background: var(--color-ivory);
  --color-border: var(--color-stone);
  --color-accent-audrey: var(--color-garnet);
  --color-accent-xlnt: var(--color-emerald-smoke);
}
"@

Set-ShopifyThemeAsset -ThemeId $themeId -AssetKey "assets/brand-tokens.css" -Value $brandCSS
```

Then include in theme.liquid (need to edit the file to add the stylesheet link).

### Task 1.3: Push Intake Form Section

```powershell
$intakeSection = Get-Content "C:\Dev\msaudreys-house\theme\sections\audrey-intake-form.liquid" -Raw
Set-ShopifyThemeAsset -ThemeId $themeId -AssetKey "sections/audrey-intake-form.liquid" -Value $intakeSection
```

### Task 1.4: Create Lane-Based PDP Template

For Audrey Select products, we need a different PDP layout. Create a product template:

```powershell
$audreyPDP = @"
{%- comment -%}
  Audrey Select Product Template
  Uses editorial layout for concierge services
{%- endcomment -%}

<div class="audrey-select-pdp">
  <div class="audrey-select-pdp__hero">
    {{ product.featured_image | image_url: width: 1200 | image_tag }}
  </div>
  
  <div class="audrey-select-pdp__content">
    <span class="audrey-select-pdp__badge">{{ product.metafields.custom.editorial_badge }}</span>
    <h1 class="audrey-select-pdp__title">{{ product.title }}</h1>
    
    <div class="audrey-select-pdp__description">
      {{ product.description }}
    </div>
    
    {% if product.metafields.custom.lead_time %}
    <p class="audrey-select-pdp__lead-time">
      <strong>Timeline:</strong> {{ product.metafields.custom.lead_time }}
    </p>
    {% endif %}
    
    <div class="audrey-select-pdp__price">
      {{ product.price | money }}
    </div>
    
    {% if product.metafields.custom.concierge_required == true %}
    <a href="/pages/audrey-select#intake-form" class="audrey-select-pdp__cta">
      Begin Your Journey
    </a>
    {% else %}
    <button type="button" class="audrey-select-pdp__cta" data-add-to-cart>
      Add to Cart
    </button>
    {% endif %}
    
    {% if product.metafields.custom.authenticity_note %}
    <div class="audrey-select-pdp__trust">
      {{ product.metafields.custom.authenticity_note }}
    </div>
    {% endif %}
  </div>
</div>

<style>
.audrey-select-pdp {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.audrey-select-pdp__badge {
  display: inline-block;
  background: var(--color-garnet, #7A1E2D);
  color: white;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.audrey-select-pdp__title {
  font-family: Georgia, serif;
  font-size: 2.5rem;
  color: var(--color-ink, #111117);
  margin-bottom: 1rem;
}

.audrey-select-pdp__cta {
  display: inline-block;
  background: var(--color-garnet, #7A1E2D);
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  margin-top: 1.5rem;
}

.audrey-select-pdp__cta:hover {
  background: var(--color-ink, #111117);
}

.audrey-select-pdp__trust {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--color-ivory, #F6F1EA);
  border-left: 3px solid var(--color-soft-gold, #B89B5E);
  font-size: 0.9rem;
}
</style>
"@

Set-ShopifyThemeAsset -ThemeId $themeId -AssetKey "sections/audrey-select-pdp.liquid" -Value $audreyPDP
```

### Task 1.5: Update Theme Settings Schema (Optional)

Add brand colors to theme settings so they're editable in the customizer.

---

## TESTING WORKFLOW

Always test on an unpublished theme first:

```powershell
# List all themes to find unpublished ones
Get-ShopifyThemes | Format-Table id, name, role

# Use theme ID 177563631910 or 177563664678 for testing
$testThemeId = 177563631910
```

Push changes to test theme, preview, then push to live when verified.

---

## HANDOFF FORMAT

```
TASK: [task name]
STATUS: Complete | Blocked | Needs Review
OUTPUT: [files pushed, sections created]
PREVIEW: [preview URL if available]
NEXT: [what's now unblocked]
BLOCKERS: [any issues]
```

---

## DEPENDENCIES

- **Upstream:** 
  - `shopify-config-agent` creates metafields (for PDP template logic)
  - `shopify-config-agent` creates collections (for navigation)
- **Downstream:**
  - `content-agent` needs sections available to build pages
  - `qa-agent` needs theme deployed to test

---

## REFERENCE FILES

- `docs/BRAND_SYSTEM.md` — Full color and typography specs
- `docs/IMPLEMENTATION.md` — Section requirements
- `theme/sections/audrey-intake-form.liquid` — Ready-to-deploy section
- `theme/templates/*.html` — Policy page HTML for reference
