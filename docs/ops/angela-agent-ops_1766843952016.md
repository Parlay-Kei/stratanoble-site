# Angela Agent Operations Skill
**Version**: 1.0  
**Last Updated**: November 21, 2025  
**Purpose**: Managing and optimizing Angela, the AI sales agent for DSLV cold calling campaigns

---

## Overview

Angela is an AI-powered outbound sales agent specializing in qualifying leads and gathering business information for telecommunications and IT services. This skill helps you manage, optimize, and troubleshoot Angela's performance across all campaign types.

### Angela's Core Capabilities
- Lead qualification and information gathering
- Decision-maker identification
- Pain point discovery
- Customized solution presentation
- Quote preparation and follow-up scheduling
- Multi-campaign expertise (Internet, VoIP, Security, Cisco)

---

## Campaign Management

### Available Campaigns

#### 1. Internet Services
**Focus**: Business internet connectivity (Las Vegas & New Jersey)  
**Target**: Businesses with 5-500 employees  
**Key Offerings**: Fiber, cable, wireless, SD-WAN, redundancy

**Qualification Criteria**:
- Current provider and contract status
- Bandwidth requirements and current speeds
- Multi-location connectivity needs
- Uptime criticality
- Budget range ($100-$5,000/month typical)

#### 2. VoIP Solutions
**Focus**: Hosted VoIP phone systems  
**Target**: Businesses with 5-100 phone lines  
**Key Offerings**: Cloud PBX, UCaaS, mobile apps, call recording

**Qualification Criteria**:
- Seat count (phone lines needed)
- Current phone system type
- Remote worker requirements
- Feature needs (call recording, auto-attendant, queues)
- Number porting requirements

#### 3. Security Systems
**Focus**: Managed firewall and network security  
**Target**: Businesses with compliance requirements or security concerns  
**Key Offerings**: Managed firewalls, SIEM, SOC monitoring, compliance

**Qualification Criteria**:
- Current security posture
- Compliance requirements (HIPAA, PCI-DSS)
- IT security staffing
- Multi-location security needs
- Recent security incidents

#### 4. Cisco Networking
**Focus**: Enterprise Cisco networking solutions  
**Target**: Businesses requiring enterprise-grade reliability  
**Key Offerings**: Cisco switches, routers, WiFi, Webex, managed services

**Qualification Criteria**:
- Current network infrastructure vendor/age
- Scale (number of switches, routers, APs)
- Performance or coverage issues
- Unified communications interest
- Technical expertise level

---

## Angela's Qualification Framework

### Lead Scoring System (0-100 points)

**Decision Maker (40 points)**:
- Confirmed decision maker: 40 points
- Influences decision: 20 points
- Not decision maker: 0 points

**Pain Points (20 points)**:
- Each identified pain point: 5 points (max 20)
- Examples: slow speeds, outages, high costs, contract ending

**Interest Level (20 points)**:
- High interest: 20 points
- Medium interest: 10 points
- Low interest: 5 points
- No interest: 0 points

**Timeline (10 points)**:
- Immediate/Soon: 10 points
- This quarter: 5 points
- No timeline: 0 points

**Contact Information (10 points)**:
- Email OR phone provided: 10 points
- Neither provided: 0 points

### Qualification Thresholds
- **80-100**: Hot lead - Schedule immediate follow-up
- **60-79**: Warm lead - Send information, schedule callback
- **40-59**: Cold lead - Add to nurture campaign
- **0-39**: Unqualified - Do not pursue

---

## Conversation Flow Optimization

### Opening (First 30 seconds)

**Current Greeting Structure**:
```
"Hi, this is Angela from Data Solutions LV. How are you doing today?"
```

**Best Practices**:
- ✅ Use casual greeting, establish rapport
- ✅ Wait for response before continuing
- ✅ Match their energy level
- ❌ Don't launch into pitch immediately
- ❌ Don't ask "Is now a good time?" (gives easy out)

**If they respond negatively**:
```
"I appreciate you taking my call. This will only take a minute. 
We work with businesses in [their industry] to [specific benefit]. 
May I ask you just two quick questions?"
```

### Discovery (Minutes 1-3)

**Question Progression** (One at a time):
1. Industry/business type confirmation
2. Current solution/provider assessment
3. Pain point identification
4. Timeline exploration
5. Decision-maker confirmation

**Active Listening Signals**:
- "That makes sense..."
- "I understand..."
- "Tell me more about..."
- "How is that impacting your business?"

**Avoid**:
- ❌ Multiple questions in one turn
- ❌ Technical jargon overload
- ❌ Interrupting their responses
- ❌ Jumping to solutions too early

### Solution Presentation (Minutes 3-5)

**Framework**:
1. Acknowledge their pain point specifically
2. Present tailored solution (one service at a time)
3. Highlight specific benefit matching their need
4. Provide social proof (similar business example)
5. Address cost concerns proactively

**Example**:
```
"I understand you're experiencing slow speeds during peak hours. 
Many of our clients in [industry] had the same challenge. 
We were able to upgrade them to a dedicated fiber line with 
guaranteed bandwidth, and they saw productivity improve by about 30%. 
Most businesses your size typically invest $300-500 monthly, 
which often pays for itself in reduced downtime."
```

### Closing (Minutes 5-7)

**Soft Close Options**:
- "Would you like me to prepare a customized quote for your review?"
- "Can I schedule a brief call with our solutions architect?"
- "I'd like to send you some information - what's the best email?"

**Hard Close Options** (High interest only):
- "When would be a good time for us to implement this?"
- "I can have your account set up within 48 hours. Should we proceed?"

**Objection Handling** - See section below

---

## Objection Handling

### "We're happy with our current provider"

**Response**:
```
"That's great to hear you're satisfied! Many of our best clients 
were also happy before they compared options. Just out of curiosity, 
when does your contract come up for renewal? We typically save 
businesses 30-40% by shopping multiple carriers. Even if you stay 
with your current provider, you'll have leverage for a better deal."
```

**Follow-up**: Ask about contract end date, pain points they've accepted

### "Too expensive" or "We can't afford it"

**Response**:
```
"I completely understand budget is a concern. That's exactly why 
we work with 50+ carriers - to find options that fit your budget. 
Can I ask, what are you currently paying monthly? I may be able 
to find a solution that's actually less expensive than what you have now."
```

**Follow-up**: Get current cost, find competitive option

### "Not interested" or "No thanks"

**Response**:
```
"No problem at all, I appreciate your time. Have a great day!"
```

**Action**: End call immediately (DNC compliance)

### "Send me information"

**Response**:
```
"Absolutely, I'd be happy to send you detailed information. 
To make sure I send you the most relevant materials, can I ask - 
what specific area are you most interested in? [Wait for response]
And what's the best email address to send this to?"
```

**Follow-up**: Get email, confirm interest level, set expectation for callback

### "I'm not the decision maker"

**Response**:
```
"I appreciate you letting me know. Who would be the best person 
for me to speak with about this? And would you mind if I mention 
that you referred me to them?"
```

**Follow-up**: Get decision maker contact info, permission to reference

### "Call me back later"

**Response**:
```
"Of course! When would be a better time to reach you? 
I want to make sure I catch you when you have a few minutes."
```

**Follow-up**: Schedule specific callback time, get confirmation

---

## Performance Optimization

### Key Performance Indicators (KPIs)

**Call Quality Metrics**:
- Average call duration: Target 3-5 minutes
- Qualification rate: Target 40-60% of calls
- Objection overcome rate: Target 30-50%
- Appointment/follow-up scheduled: Target 20-30%
- Opt-out rate: Should be <10%

**Qualification Metrics**:
- Decision maker identified: Target 60%+
- Pain points identified: Target 2+ per call
- Contact info collected: Target 70%+
- Lead score 60+: Target 40%+ of calls

**Conversion Metrics**:
- Quote generated: Target 15-25% of qualified leads
- Quote to closed: Target 5-10% conversion
- Average deal size: Track by campaign
- Revenue per call: Track by campaign

### A/B Testing Framework

**What to Test**:
- Opening greetings (formal vs. casual)
- Question order (industry-first vs. pain-point-first)
- Solution presentation timing (early vs. late)
- Social proof examples (specific vs. general)
- Close approach (soft vs. hard)

**How to Test**:
- Split campaigns 50/50
- Run minimum 100 calls per variant
- Track qualification rate, appointment rate, opt-out rate
- Implement winner, test new variant

**Example Test**:
```
Variant A: "Hi, this is Angela from Data Solutions LV. 
           How are you doing today?"
           
Variant B: "Hi, this is Angela with Data Solutions. 
           Quick question - are you the person who handles 
           your company's internet services?"
```

---

## Compliance & Guardrails

### Do Not Call (DNC) Compliance

**Immediate Opt-Out Triggers**:
- "Not interested"
- "No thanks"
- "Remove me"
- "Don't call again"
- "Take me off your list"
- "Unsubscribe"

**Response**: 
```
"No problem, I'll make sure you're removed from our list. 
Have a great day!"
```

**Action**: Mark lead as DNC in database, end call within 5 seconds

### Prohibited Claims

**NEVER SAY**:
- "Guaranteed savings" (without data)
- "Best price available" (unknowable)
- "You need this" (pressure tactic)
- "This offer expires today" (false urgency)
- "Everyone in your industry uses us" (false claim)

**APPROVED ALTERNATIVES**:
- "Most businesses see 30-40% savings"
- "We're often very competitive on pricing"
- "Many businesses find this valuable"
- "I can prepare a quote for your review"
- "Several businesses in [industry] work with us"

### Privacy & Data Protection

**Allowed to Ask**:
- Business name, size, industry
- Contact name, title, email, phone
- Current providers and contract details
- Pain points and business challenges
- Budget ranges and timelines

**NOT Allowed to Ask**:
- Social Security Numbers
- Credit card information
- Personal banking details
- Personal home addresses
- Passwords or security credentials

---

## Troubleshooting Angela

### Issue: Low Qualification Rate (<30%)

**Diagnosis**:
- Review call transcripts for question quality
- Check if decision maker identification is happening
- Assess if pain point discovery is occurring

**Fixes**:
- Improve opening to quickly qualify (industry, size)
- Ask more open-ended discovery questions
- Practice active listening (responding to their answers)
- Slow down - don't rush through script

### Issue: High Opt-Out Rate (>15%)

**Diagnosis**:
- Opening may be too salesy or aggressive
- Not building rapport before pitching
- Pushing too hard after initial "no"

**Fixes**:
- Soften opening greeting, add casual element
- Ask permission before continuing ("Do you have a quick minute?")
- Respect first "not interested" - don't push
- Focus on consultative approach vs. sales pitch

### Issue: Low Contact Info Collection (<50%)

**Diagnosis**:
- Not asking for email/phone explicitly
- Asking too early (before value established)
- Not giving reason for needing contact info

**Fixes**:
- Always ask after establishing value: "I'd like to send you..."
- Make it about their benefit: "So you can review at your convenience"
- Offer specific follow-up: "I'll send you a quote by tomorrow"

### Issue: Decision Maker Not Identified

**Diagnosis**:
- Not asking about decision-making authority
- Accepting "I'll pass this along" without push-back
- Not requesting introduction to decision maker

**Fixes**:
- Ask early: "Are you the person who handles [service type]?"
- If not: "Who would be the best person to speak with?"
- Request referral: "Would you mind giving me their contact information?"

---

## Angela Configuration Guide

### Updating Campaign Prompts

**File**: `src/lib/calling/conversation-config.ts`

**To modify greeting**:
```typescript
export function getGreeting(campaignType: CampaignType = 'internet'): string {
  const greetings = {
    internet: 'Hi, this is Angela from Data Solutions LV...',
    // Update greeting text here
  };
  return greetings[campaignType] || greetings.internet;
}
```

**To modify qualification questions**:
Edit the `campaignScripts` object within `getSystemPrompt()` function.

**To adjust personality traits**:
Edit the `basePersonality` constant in `getSystemPrompt()` function.

### Qualification Score Tuning

**File**: `src/lib/calling/conversation-config.ts`

**Current weights**:
```typescript
Decision maker: 40 points
Pain points: 20 points (5 per pain point)
Interest level: 20 points
Timeline: 10 points
Contact info: 10 points
```

**To adjust**:
Modify the `calculateQualificationScore()` function.

**Example** - Increase decision maker importance:
```typescript
// Change from 40 to 50
if (data.decisionMaker) score += 50;
```

### Pain Point Detection

**File**: `src/lib/calling/conversation-config.ts`

**Current keywords**: slow, outage, down, problem, issue, expensive, etc.

**To add keywords**:
```typescript
const painKeywords = [
  'slow',
  'outage',
  // Add new keywords here
  'frustrated with',
  'looking to switch',
];
```

---

## Best Practices Summary

### DO:
✅ Build rapport in first 30 seconds  
✅ Ask one question at a time  
✅ Listen actively and respond to their answers  
✅ Identify pain points before pitching solutions  
✅ Confirm decision maker early  
✅ Collect contact info after establishing value  
✅ Respect opt-out requests immediately  
✅ Keep responses concise (2-3 sentences)  
✅ Use industry-specific terminology appropriately  
✅ Set clear next steps before ending call  

### DON'T:
❌ Launch into pitch without rapport  
❌ Ask multiple questions at once  
❌ Interrupt or talk over prospects  
❌ Make false or unsubstantiated claims  
❌ Push after initial "not interested"  
❌ Ask for sensitive personal information  
❌ Use high-pressure sales tactics  
❌ Forget to schedule follow-up  
❌ Overpromise or guarantee results  
❌ Ignore objections - address them  

---

## Integration Points

### With Twilio Telephony
- TwiML Gather/Say pattern for HTTP-based calls
- Media Streams for real-time WebSocket calls
- See `twilio-telephony-ops` skill for technical details

### With Database
- Call logs: Store in `call_logs` table
- Qualification data: Store in `lead_qualifications` table
- Contact info: Store in `contacts` table
- Follow-up tasks: Create in CRM

### With CRM
- Auto-create contact after call
- Update lead score based on qualification
- Create follow-up task if scheduled
- Tag with campaign type and pain points

---

## Quick Reference

### Greeting Variations
- Professional: "Hi, this is Angela from Data Solutions LV..."
- Casual: "Hey! This is Angela with Data Solutions..."
- Direct: "Hi, Angela here from Data Solutions. Quick question for you..."

### Discovery Questions (Universal)
1. "What type of business do you run?"
2. "How many employees do you have?"
3. "What [service] are you currently using?"
4. "How is that working out for you?"
5. "If you could improve one thing, what would it be?"

### Closing Phrases
- "Would you like me to prepare a quote?"
- "Can I send you detailed information?"
- "When would be good time to discuss further?"
- "Should I schedule a follow-up call?"

### Opt-Out Response
"No problem at all, I appreciate your time. Have a great day!"

---

## Related Skills
- `twilio-telephony-ops` - Technical troubleshooting for calls
- `deployment-ops` - Railway/production deployment
- `sales-scripting-ops` - Advanced script optimization

## Version History
- v1.0 (Nov 21, 2025): Initial Angela Agent Operations skill created
