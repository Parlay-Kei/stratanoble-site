# Growth Ops Deliverables: Noupe Chatbot Conversation Flow

**Mission:** Strata Noble Noupe Chatbot Audit + Hardening
**Deliverable Type:** Growth Ops - Lead Routing Conversion Script
**Date:** 2026-01-23

---

## Conversation Flow Design

### Brand Voice Guidelines

- **Tone:** Professional but warm, no-nonsense, solution-focused
- **Style:** Direct questions, acknowledge pain points, route to action
- **Avoid:** Jargon, pushy sales language, over-promising
- **Use:** "We help service businesses..." framing

---

## Bot Script: Three-Question Lead Qualification

### Opening Message (After Privacy Acknowledgment)

```text
Hey! I'm here to help you figure out if Strata Noble is the right fit.

Quick question to point you in the right direction:

What's the main thing you're trying to fix right now?
• Leads (getting more, or not losing the ones you have)
• Scheduling (booking calls, managing appointments)
• Follow-up (staying in touch without it falling through the cracks)
• Website (not converting visitors into leads)
```

---

### Question 1 Responses & Follow-ups

#### If: "Leads"

```text
Got it—lead problems are painful.

Are you:
A) Getting leads but losing them before they convert?
B) Not getting enough leads in the first place?
C) Both?
```

**Route:**
- A → Lead Rescue offer
- B → Website/Funnel consultation
- C → Full Pipeline assessment

---

#### If: "Scheduling"

```text
Scheduling chaos = lost deals. Let's fix that.

What's the biggest headache?
A) No-shows and last-minute cancellations
B) Back-and-forth trying to find times
C) Managing multiple calendars/team schedules
```

**Route:**
- A → Automated reminders + deposit systems
- B → Calendly/booking link setup
- C → Team scheduling consultation

---

#### If: "Follow-up"

```text
Following up is where 80% of deals get lost. You're not alone.

What's happening?
A) Leads go cold because no one reaches out in time
B) We follow up but nothing is tracked
C) Don't have time to follow up consistently
```

**Route:**
- A → 48-Hour Lead Rescue
- B → CRM/pipeline setup
- C → Automation sequence buildout

---

#### If: "Website"

```text
A website that doesn't convert is just an expensive brochure.

What's the issue?
A) People visit but don't contact us
B) Forms/CTAs aren't clear
C) Not sure what's wrong, just not getting leads
```

**Route:**
- A → Conversion audit
- B → Quick wins consultation
- C → Full website/funnel review

---

### Question 2: Urgency

```text
Thanks for sharing that. How urgent is this?

• Today — It's hurting us right now
• This week — Need to solve it soon
• This month — Planning ahead
```

**Routing Logic:**
- "Today" → Fast-track to call booking with urgency flag
- "This week" → Standard booking flow
- "This month" → Nurture sequence + content offer

---

### Question 3: Contact Preference

```text
Last one—what's the best way to reach you?

• Email — I'll read it when I can
• Phone call — Let's talk live
• Text — Quick and easy
```

**Then:**

```text
Perfect. Drop your [email/phone] below and we'll reach out within [timeframe based on urgency]:

[Email/Phone input field]

□ I agree to receive communications from Strata Noble. You can opt out anytime.
```

---

## Route Mapping: Question → CTA Page

| Problem Area | Sub-issue | Urgency | Route To |
|--------------|-----------|---------|----------|
| Leads | Losing before convert | Today | `/lead-rescue` + urgent flag |
| Leads | Not enough | Any | `/contact?source=chat&need=acquisition` |
| Scheduling | No-shows | Today | `/contact?source=chat&need=scheduling` |
| Follow-up | Leads go cold | Today | `/lead-rescue` |
| Follow-up | Nothing tracked | Any | `/contact?source=chat&need=crm` |
| Website | Not converting | Any | `/contact?source=chat&need=website` |

---

## Transcript Examples

### Example 1: Lead Loss → Lead Rescue (Urgent)

```
BOT: Hey! I'm here to help you figure out if Strata Noble is the right fit.
     What's the main thing you're trying to fix right now?

USER: Leads

BOT: Got it—lead problems are painful.
     Are you:
     A) Getting leads but losing them before they convert?
     B) Not getting enough leads in the first place?
     C) Both?

USER: A - losing them

BOT: That's exactly what our 48-Hour Lead Rescue is built for.
     How urgent is this?

USER: Today — It's hurting us right now

BOT: I hear you. We've helped businesses plug those leaks fast.
     What's the best way to reach you?

USER: Phone call

BOT: Drop your phone number below and someone will call you within the hour:

USER: 702-555-1234

BOT: Got it! You'll hear from us shortly. In the meantime, here's what
     Lead Rescue includes: [link to /lead-rescue]

     Talk soon!

[INTERNAL: Flag as HOT LEAD, route to sales queue, trigger immediate callback]
```

---

### Example 2: Follow-up → Pipeline Buildout (This Week)

```
BOT: What's the main thing you're trying to fix right now?

USER: Follow-up

BOT: Following up is where 80% of deals get lost. What's happening?

USER: Don't have time to follow up consistently

BOT: Totally get it. That's where automation shines.
     How urgent is this?

USER: This week

BOT: Perfect timing. What's the best way to reach you?

USER: Email

BOT: Drop your email below:

USER: sarah@example.com

BOT: Thanks Sarah! You'll get an email from our team by tomorrow with
     some options for automating your follow-up.

     Quick tip while you wait: the first 5 minutes after a lead comes in
     is when they're most likely to respond. Food for thought!

[INTERNAL: Add to CRM, trigger "Pipeline Interest" email sequence]
```

---

### Example 3: Website → Nurture (This Month)

```
BOT: What's the main thing you're trying to fix right now?

USER: Website

BOT: A website that doesn't convert is just an expensive brochure.
     What's the issue?

USER: Not sure what's wrong, just not getting leads

BOT: That's actually pretty common. Usually it's one of three things:
     unclear messaging, weak CTAs, or wrong traffic. Worth investigating.
     How urgent is this?

USER: This month

BOT: Smart to plan ahead. What's the best way to reach you?

USER: Email

BOT: Drop your email and I'll send you our free "Website Conversion Checklist"
     — 10 quick things to audit on your own:

USER: mike@company.com

BOT: Sent! Check your inbox in a few minutes.

     If you want a professional eye on it later, just reply to that email
     and we'll set up a review call.

[INTERNAL: Add to nurture sequence, send checklist, 7-day follow-up]
```

---

## Noupe Configuration Requirements

### Bot Personality Settings

```json
{
  "name": "Strata Noble Assistant",
  "personality": "professional, helpful, direct",
  "fallback_message": "I want to make sure I help you correctly. Could you rephrase that, or would you prefer to speak with someone directly? You can call us at 702-721-3566.",
  "out_of_scope_response": "That's outside what I can help with in chat, but our team can definitely assist. Want me to have someone reach out?"
}
```

### Lead Capture Fields

| Field | Required | Validation |
|-------|----------|------------|
| Problem Area | Yes | Select from list |
| Sub-issue | Yes | Select from list |
| Urgency | Yes | Select from list |
| Contact Method | Yes | Select: email/phone/text |
| Contact Info | Yes | Email or phone format |
| Consent | Yes | Checkbox |

### Email Notification Template

```
Subject: [CHAT LEAD] {{urgency}} - {{problem_area}}

New lead from website chat:

Problem: {{problem_area}} → {{sub_issue}}
Urgency: {{urgency}}
Preferred Contact: {{contact_method}}
Contact: {{contact_info}}

Conversation transcript:
{{full_transcript}}

---
Route: {{suggested_cta_page}}
Source: Noupe Chatbot
```

---

## Receipt Signature

```
GROWTH_OPS_NOUPE_FLOW_V1
Prepared: 2026-01-23
Status: READY_FOR_NOUPE_CONFIGURATION
Next: Configure in Jotform AI Agent dashboard
```
