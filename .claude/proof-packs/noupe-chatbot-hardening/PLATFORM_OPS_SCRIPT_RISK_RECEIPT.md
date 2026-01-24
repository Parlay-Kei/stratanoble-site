# Platform Ops: Script Risk Receipt

**Mission:** Strata Noble Noupe Chatbot Audit + Hardening
**Deliverable Type:** Platform Ops - Security Assessment
**Date:** 2026-01-23

---

## 1. Script Location & Implementation

### Component Location

```
apps/website/src/components/NoupeChat.tsx
```

### Integration Point

To be added to marketing layout or individual pages. Recommended approach:

```tsx
// In apps/website/src/app/(marketing)/layout.tsx
import dynamic from 'next/dynamic';

const NoupeChat = dynamic(
  () => import('@/components/NoupeChat'),
  { ssr: false }
);

// Then in the layout JSX:
<NoupeChat showDisclosure={true} loadDelay={3000} />
```

---

## 2. Rendering Impact Analysis

| Metric | Before | After (Implemented) |
|--------|--------|---------------------|
| Blocks Critical Render | N/A | **No** - Lazy loaded after 3s |
| First Contentful Paint | Baseline | No impact (deferred) |
| Largest Contentful Paint | Baseline | No impact (deferred) |
| Total Blocking Time | Baseline | No impact (async) |
| Script Loading Strategy | N/A | `lazyOnload` via Next.js Script |

### Loading Strategy

1. **Initial page load:** No chatbot scripts loaded
2. **After 3000ms:** Component mounts, disclosure shown
3. **After user consent:** Iframe loads chat widget
4. **Supporting scripts:** Loaded with `lazyOnload` strategy

---

## 3. External Domains Called at Runtime

### Primary Domains

| Domain | Purpose | Required |
|--------|---------|----------|
| `www.jotform.com` | Chat widget iframe source | Yes |
| `*.jotform.com` | API calls, assets | Yes |
| `cdn.jotfor.ms` | JavaScript/CSS assets | Yes |

### Potential Secondary Domains (Jotform dependencies)

| Domain | Purpose | Notes |
|--------|---------|-------|
| `fonts.googleapis.com` | Google Fonts | If used by widget |
| `fonts.gstatic.com` | Font files | If used by widget |

### Network Capture Methodology

To verify exact domains in production:

```bash
# Browser DevTools approach
1. Open DevTools > Network tab
2. Filter by "Domain" column
3. Load page with chat widget
4. Document all external requests

# Lighthouse audit approach
npx lighthouse https://stratanoble.com --output=json --output-path=./lighthouse-noupe.json
# Then analyze third-party summary
```

---

## 4. CSP Configuration

### Updated CSP Directives

Location: `apps/website/next.config.js`

```javascript
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://plausible.io https://cdn.jotfor.ms https://assets.calendly.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jotfor.ms https://assets.calendly.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.jotform.com https://*.googletagmanager.com https://assets.calendly.com",
  "frame-src 'self' https://*.jotform.com https://calendly.com",
  "connect-src 'self' https://*.jotform.com https://www.google-analytics.com https://plausible.io https://api.calendly.com",
  "media-src 'self' https://*.jotform.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.jotform.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');
```

### CSP Diff

```diff
- // Temporarily disabled CSP for debugging CSS issues
- // { key: 'Content-Security-Policy', value: "default-src 'self'" },
+ { key: 'Content-Security-Policy', value: cspDirectives },
```

### Permissions Policy

```diff
- { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
+ { key: 'Permissions-Policy', value: 'camera=(), microphone=(self "https://*.jotform.com"), geolocation=()' },
```

**Rationale:** Noupe may offer voice input features; microphone is explicitly allowed only for Jotform domains.

---

## 5. Security Guardrails Implemented

### Widget Security

| Control | Status | Notes |
|---------|--------|-------|
| Consent before load | ✅ | User must acknowledge disclosure |
| No sensitive data prompt | ✅ | Disclosure warns against SSN/passwords |
| Lazy loading | ✅ | 3-second delay, non-blocking |
| Iframe sandboxing | ⚠️ | Jotform controls iframe attributes |
| HTTPS only | ✅ | CSP enforces `upgrade-insecure-requests` |

### Data Flow

```
User → NoupeChat.tsx → Jotform iframe → Jotform servers → Email to Strata Noble
         ↓
    localStorage (consent only, no PII)
```

### LocalStorage Usage

| Key | Value | Purpose |
|-----|-------|---------|
| `noupe-chat-consent` | `'true'` | Remember user's privacy acknowledgment |

No PII stored in localStorage.

---

## 6. Lighthouse Summary (Projected)

### Before Implementation

```
Performance: [current baseline]
Accessibility: [current baseline]
Best Practices: [current baseline]
SEO: [current baseline]
```

### After Implementation (Expected)

```
Performance: No degradation (lazy load)
Accessibility: May need ARIA improvements on toggle button
Best Practices: CSP now enforced (improvement)
SEO: No impact
```

### Recommended Post-Deployment Audit

```bash
npx lighthouse https://stratanoble.com \
  --only-categories=performance,accessibility,best-practices \
  --output=html \
  --output-path=./lighthouse-post-noupe.html
```

---

## 7. Recommendations

### Must Do Before Production

1. **Test CSP in staging** - Verify all features work with new CSP
2. **Verify Jotform domains** - Run network capture to confirm exact domains
3. **Test consent flow** - Ensure disclosure displays correctly
4. **Mobile testing** - Verify chat widget is usable on mobile

### Consider

1. **Rate limiting** - If chat volume is high, implement rate limiting
2. **Bot detection** - Jotform may have built-in spam protection; verify
3. **Analytics integration** - Track chat conversions in GA/Plausible
4. **A/B test placement** - Bottom-right is standard; test alternatives

### Not Recommended

1. **Wildcards in CSP** - Avoided except for `*.jotform.com` subdomains
2. **Auto-open chat** - Keep user-initiated to avoid annoyance
3. **Storing transcripts client-side** - Let Jotform handle persistence

---

## Receipt Signature

```
PLATFORM_OPS_SCRIPT_RISK_RECEIPT_V1
Prepared: 2026-01-23
CSP_STATUS: IMPLEMENTED
LAZY_LOAD_STATUS: IMPLEMENTED
CONSENT_FLOW_STATUS: IMPLEMENTED
Ready for: Staging deployment and verification
```
