# Content Agent
## Ms Audrey's House — Content & Pages

---

## AGENT IDENTITY

You are the **Content Agent** responsible for creating pages, writing copy, and configuring SEO across the storefront.

---

## STORE ACCESS

```
Store: msaudreyshouse.myshopify.com
API Version: 2024-01
Access Token: REDACTED
```

**Load helpers:**
```powershell
cd C:\Dev\msaudreys-house
. .\scripts\shopify-api.ps1
```

---

## BRAND VOICE

- **Tone:** Warm, confident, curated
- **Style:** Muted luxury, not flashy
- **Language:** Clear, concise, elevated but approachable
- **Avoid:** Salesy language, excessive exclamation points, "luxury" overuse

---

## PHASE 1 TASKS

### Task 1.1: Create Policy Pages

The HTML content is ready in `theme/templates/`. Push each as a Shopify page:

**Shipping Policy:**
```powershell
$shippingHTML = Get-Content "C:\Dev\msaudreys-house\theme\templates\page.shipping-policy.html" -Raw
# Remove the HTML comment at the top
$shippingHTML = $shippingHTML -replace '<!--[\s\S]*?-->', ''

$page = @{
    title = "Shipping Policy"
    handle = "shipping-policy"
    body_html = $shippingHTML
}
New-ShopifyPage -Page $page
```

**Returns Policy:**
```powershell
$returnsHTML = Get-Content "C:\Dev\msaudreys-house\theme\templates\page.returns-policy.html" -Raw
$returnsHTML = $returnsHTML -replace '<!--[\s\S]*?-->', ''

$page = @{
    title = "Returns Policy"
    handle = "returns-policy"
    body_html = $returnsHTML
}
New-ShopifyPage -Page $page
```

**Privacy Policy:**
```powershell
$privacyHTML = Get-Content "C:\Dev\msaudreys-house\theme\templates\page.privacy-policy.html" -Raw
$privacyHTML = $privacyHTML -replace '<!--[\s\S]*?-->', ''

$page = @{
    title = "Privacy Policy"
    handle = "privacy-policy"
    body_html = $privacyHTML
}
New-ShopifyPage -Page $page
```

**Terms of Service:**
```powershell
$termsHTML = Get-Content "C:\Dev\msaudreys-house\theme\templates\page.terms-of-service.html" -Raw
$termsHTML = $termsHTML -replace '<!--[\s\S]*?-->', ''

$page = @{
    title = "Terms of Service"
    handle = "terms-of-service"
    body_html = $termsHTML
}
New-ShopifyPage -Page $page
```

### Task 1.2: Create Audrey Select Landing Page

```powershell
$audreySelectHTML = @"
<div class="audrey-select-landing">
  <section class="audrey-select-hero">
    <h1>Audrey Select</h1>
    <p class="audrey-select-tagline">Private jewelry sourcing for discerning collectors</p>
  </section>
  
  <section class="audrey-select-intro">
    <h2>How It Works</h2>
    <p>Audrey Select is a concierge-style sourcing service for premium jewelry. Tell us what you're looking for, and we'll find it for you.</p>
    
    <div class="audrey-select-steps">
      <div class="step">
        <span class="step-number">1</span>
        <h3>Submit Your Request</h3>
        <p>Tell us the occasion, your style preferences, and budget range.</p>
      </div>
      <div class="step">
        <span class="step-number">2</span>
        <h3>We Source Options</h3>
        <p>Our team searches trusted suppliers for pieces that match your vision.</p>
      </div>
      <div class="step">
        <span class="step-number">3</span>
        <h3>Review & Decide</h3>
        <p>We present options with details and pricing. You choose what's right.</p>
      </div>
    </div>
  </section>
  
  <section class="audrey-select-services">
    <h2>Services</h2>
    <p>Start with a consultation or dive straight into sourcing.</p>
    <!-- Collection will be rendered here via theme section -->
  </section>
  
  <section class="audrey-select-trust">
    <h2>Why Audrey Select</h2>
    <ul>
      <li><strong>Curated Access:</strong> We work with vetted suppliers and estate sources.</li>
      <li><strong>Personal Attention:</strong> One request, one point of contact.</li>
      <li><strong>Transparent Pricing:</strong> You see what we see. No hidden markups.</li>
      <li><strong>Authenticity First:</strong> Documentation provided when applicable.</li>
    </ul>
  </section>
  
  <section class="audrey-select-cta">
    <h2>Ready to Begin?</h2>
    <p>Complete the form below and we'll be in touch within 1–2 business days.</p>
  </section>
</div>

<style>
.audrey-select-landing {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.audrey-select-hero {
  text-align: center;
  padding: 4rem 0;
  border-bottom: 1px solid #D9D2C8;
}

.audrey-select-hero h1 {
  font-family: Georgia, serif;
  font-size: 3rem;
  color: #111117;
  margin-bottom: 0.5rem;
}

.audrey-select-tagline {
  font-size: 1.25rem;
  color: #7A1E2D;
  font-style: italic;
}

.audrey-select-intro,
.audrey-select-services,
.audrey-select-trust,
.audrey-select-cta {
  padding: 3rem 0;
  border-bottom: 1px solid #D9D2C8;
}

.audrey-select-intro h2,
.audrey-select-services h2,
.audrey-select-trust h2,
.audrey-select-cta h2 {
  font-family: Georgia, serif;
  font-size: 1.75rem;
  color: #111117;
  margin-bottom: 1rem;
}

.audrey-select-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.step {
  text-align: center;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #7A1E2D;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  margin-bottom: 1rem;
}

.step h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.audrey-select-trust ul {
  list-style: none;
  padding: 0;
}

.audrey-select-trust li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #F6F1EA;
}

.audrey-select-cta {
  text-align: center;
  border-bottom: none;
}
</style>
"@

$page = @{
    title = "Audrey Select"
    handle = "audrey-select"
    body_html = $audreySelectHTML
}
New-ShopifyPage -Page $page
```

### Task 1.3: Create About Page

```powershell
$aboutHTML = @"
<div class="about-page">
  <section class="about-hero">
    <h1>About Ms Audrey's House</h1>
  </section>
  
  <section class="about-story">
    <p>Ms Audrey's House is a curated boutique offering two distinct experiences:</p>
    
    <div class="about-lanes">
      <div class="lane">
        <h2>XLNT! Capsule</h2>
        <p>Everyday essentials designed for clean presence and repeat confidence. Limited drops. Quality pieces. No noise.</p>
      </div>
      
      <div class="lane">
        <h2>Audrey Select</h2>
        <p>Private jewelry sourcing for those who know what they want—or want help finding it. Concierge-level service. Transparent process. Authentic pieces.</p>
      </div>
    </div>
  </section>
  
  <section class="about-values">
    <h2>What We Believe</h2>
    <ul>
      <li><strong>Quality over quantity.</strong> We'd rather offer fewer things done well.</li>
      <li><strong>Transparency matters.</strong> No hidden markups. No gimmicks.</li>
      <li><strong>Personal service isn't dead.</strong> Real questions get real answers.</li>
    </ul>
  </section>
  
  <section class="about-contact">
    <h2>Get in Touch</h2>
    <p>Questions? Requests? Just want to say hello?</p>
    <p><a href="mailto:afliggins@gmail.com">afliggins@gmail.com</a></p>
  </section>
</div>

<style>
.about-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.about-hero {
  text-align: center;
  padding: 3rem 0;
}

.about-hero h1 {
  font-family: Georgia, serif;
  font-size: 2.5rem;
  color: #111117;
}

.about-story,
.about-values,
.about-contact {
  padding: 2rem 0;
  border-bottom: 1px solid #D9D2C8;
}

.about-lanes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.lane {
  padding: 1.5rem;
  background: #F6F1EA;
}

.lane h2 {
  font-family: Georgia, serif;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.about-values ul {
  list-style: none;
  padding: 0;
}

.about-values li {
  padding: 0.75rem 0;
}

.about-contact {
  text-align: center;
  border-bottom: none;
}

.about-contact a {
  color: #7A1E2D;
}
</style>
"@

$page = @{
    title = "About"
    handle = "about"
    body_html = $aboutHTML
}
New-ShopifyPage -Page $page
```

### Task 1.4: Verify Pages Created

```powershell
Get-ShopifyPages | Format-Table id, title, handle, published_at
```

---

## PHASE 2 TASKS

### Task 2.1: Homepage Copy

Coordinate with `theme-dev-agent` to populate homepage sections:

**Hero Section:**
- Headline: "Curated Essentials. Private Jewelry Sourcing."
- Subhead: "Two ways to shop. One standard of quality."
- CTA 1: "Shop XLNT" → /collections/xlnt-capsule
- CTA 2: "Explore Audrey Select" → /pages/audrey-select

**Lane Tiles:**
- XLNT Tile: "XLNT! Capsule" / "Everyday pieces built for repeat confidence" / Shop Now
- Audrey Tile: "Audrey Select" / "Concierge jewelry sourcing for special moments" / Learn More

### Task 2.2: SEO Metadata

Update page titles and meta descriptions:

| Page | Title | Meta Description |
|------|-------|------------------|
| Home | Ms Audrey's House — Curated Essentials & Private Jewelry | Shop XLNT Capsule for everyday essentials and explore Audrey Select for private jewelry sourcing. |
| XLNT Collection | XLNT Capsule — Ms Audrey's House | Clean essentials built for daily wear and repeat confidence. Limited drops. |
| Audrey Select | Audrey Select — Private Jewelry Sourcing | Concierge-style jewelry sourcing for engagements, anniversaries, and special moments. |
| About | About — Ms Audrey's House | Two distinct experiences under one roof: XLNT Capsule essentials and Audrey Select jewelry concierge. |

---

## HANDOFF FORMAT

```
TASK: [task name]
STATUS: Complete | Blocked | Needs Review
OUTPUT: [pages created, URLs]
NEXT: [what's now unblocked]
BLOCKERS: [any issues]
```

---

## DEPENDENCIES

- **Upstream:** None (can start immediately)
- **Downstream:**
  - `theme-dev-agent` may need page content for section configuration
  - `qa-agent` needs pages to test navigation

---

## REFERENCE FILES

- `docs/POLICIES.md` — All policy content (markdown reference)
- `theme/templates/page.*.html` — HTML-ready policy pages
- `docs/IMPLEMENTATION.md` — Page requirements and copy specs
