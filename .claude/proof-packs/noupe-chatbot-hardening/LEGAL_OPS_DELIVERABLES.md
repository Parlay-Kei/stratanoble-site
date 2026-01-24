# Legal Ops Deliverables: Noupe Chatbot Disclosure & Privacy

**Mission:** Strata Noble Noupe Chatbot Audit + Hardening
**Deliverable Type:** Legal Ops
**Date:** 2026-01-23

---

## 1. Disclosure Block (Footer/Chatbot Opening)

### Option A: Chatbot Opening Message Disclosure

```text
👋 Welcome to Strata Noble!

Before we chat, a quick note:
• This chat is powered by Noupe (a Jotform service)
• Please don't share sensitive personal information (SSN, passwords, credit card numbers)
• Your conversation may be transmitted to Jotform servers and delivered to our team via email

What are you trying to fix today?
```

### Option B: Footer Disclosure Block

**Recommended Placement:** Above copyright line in site footer

```html
<div class="text-xs text-gray-500 mt-4 border-t pt-4">
  <p>
    <strong>Chat Support:</strong> Our chat feature is powered by
    <a href="https://www.jotform.com/ai/agents/" target="_blank" rel="noopener noreferrer">Noupe</a>,
    a Jotform service. Chat conversations are processed by Jotform and
    delivered to Strata Noble via email. Please avoid sharing sensitive
    personal information in chat.
    <a href="/privacy">Privacy Policy</a>
  </p>
</div>
```

### Option C: Inline Component (React)

Already implemented in `NoupeChat.tsx` as the consent dialog before chat loads.

---

## 2. Privacy Policy Update

### Section to Add: "Third-Party Chat Services"

**Recommended Placement:** After "Third-Party Services" or "Data Processors" section

```markdown
### Chat Support (Noupe by Jotform)

We use Noupe, a conversational AI service provided by Jotform Inc., to power
our website chat feature.

**What data is collected:**
- Messages you type in the chat widget
- Timestamp of your conversation
- Browser/device type (for technical support)
- IP address (for fraud prevention)

**How data is processed:**
- Chat conversations are processed by Jotform's servers (located in the United States)
- Conversations are delivered to Strata Noble team members via email
- Jotform may use anonymized conversation data to improve their AI models

**Data retention:**
- Chat transcripts are retained for 90 days in Jotform's system
- Strata Noble retains relevant conversations for customer support purposes

**Your rights:**
- You may request deletion of your chat history by contacting privacy@stratanoble.com
- You may opt out of chat by simply not using the chat feature

**Jotform's privacy practices:**
For more information about how Jotform handles your data, please review
[Jotform's Privacy Policy](https://www.jotform.com/privacy/).

**Important:** Please do not submit sensitive personal information such as:
- Social Security Numbers
- Financial account numbers
- Passwords or authentication credentials
- Protected health information

We recommend using our secure contact form or direct phone line for
conversations involving sensitive data.
```

---

## 3. Recommended Service Provider Listing

Add to "Service Providers" or "Subprocessors" section:

| Provider | Purpose | Data Processed | Location |
|----------|---------|----------------|----------|
| Jotform Inc. (Noupe) | Chat support widget | Chat messages, IP address, device info | United States |

---

## 4. Cookie/Tracking Disclosure

If site uses a cookie banner, add:

```text
Chat Support Cookies (Jotform):
- Purpose: Remember your chat session and preferences
- Type: Functional
- Duration: Session
- Provider: Jotform Inc.
```

---

## Implementation Checklist

- [ ] Add footer disclosure block to `SiteShell` or footer component
- [ ] Update `/privacy` page with new "Chat Support" section
- [ ] Update cookie policy if applicable
- [ ] Review with legal counsel before production deployment
- [ ] Test disclosure flow in staging environment

---

## Receipt Signature

```
LEGAL_OPS_NOUPE_DISCLOSURE_V1
Prepared: 2026-01-23
Status: READY_FOR_REVIEW
Requires: Legal counsel approval before production
```
