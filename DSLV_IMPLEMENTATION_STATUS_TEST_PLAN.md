# DSLV Cold Calling Implementation - Status & Test Plan

**Date**: October 24, 2025, 9:28 PM PST  
**Status**: ✅ **READY FOR TESTING**

---

## 📋 Current Implementation Status

### Files Created/Found

#### ✅ In Root Directory (Need to Move)
1. **lib_call-evaluator.ts** (Complete)
   - GPT-4 powered call evaluation
   - Qualification and quality scoring
   - Real-time coaching system
   - Location: `c:/Dev/StrataNoble/lib_call-evaluator.ts`
   - **Action**: Move to `apps/website/src/lib/call-evaluator.ts`

2. **lib_campaign-scheduler.ts** (Complete)
   - Campaign creation and management
   - Call scheduling with timezone support
   - Retry logic and metrics tracking
   - Location: `c:/Dev/StrataNoble/lib_campaign-scheduler.ts`
   - **Action**: Move to `apps/website/src/lib/campaign-scheduler.ts`

3. **conversation_route.ts** (Complete - but needs update)
   - Conversation API endpoint
   - References `conversation-config` that needs proper Jake scripts
   - Location: `c:/Dev/StrataNoble/conversation_route.ts`
   - **Action**: Move to `apps/website/src/app/api/voice/conversation/route.ts` and update

#### ✅ Already in Correct Location
1. **conversation-config.ts** (Just Created)
   - Jake persona with natural speech
   - 4 DSLV campaign scripts (Internet, VoIP, Security, Cisco)
   - Qualification helpers
   - Location: `apps/website/src/lib/conversation-config.ts` ✅

#### ✅ Existing (Working)
1. **campaign-scheduler.js** (Basic version in server/)
   - Location: `apps/website/server/campaign-scheduler.js`
   - Status: Basic functionality exists
   - Note: TypeScript version is more complete

---

## 🎯 What Works vs What Needs Fixing

### ✅ What's Complete and Ready

1. **Jake Persona Scripts** ✅
   - 4 campaign-specific scripts (Internet, VoIP, Security, Cisco)
   - Natural conversation patterns
   - Professional objection handling
   - Location: `apps/website/src/lib/conversation-config.ts`

2. **Call Evaluator** ✅
   - GPT-4 analysis system
   - Scoring (0-100) for qualification and quality
   - Actionable recommendations
   - Real-time coaching
   - Location: Root (needs moving)

3. **Campaign Scheduler** ✅
   - Full campaign management
   - Timezone-aware scheduling
   - Retry logic (3 attempts, 24hr delays)
   - Metrics tracking
   - Location: Root (needs moving)

### ⚠️ What Needs Updating

1. **Conversation API Route** ⚠️
   - File exists but references old config interface
   - Needs to use new Jake scripts from conversation-config.ts
   - Location: Root (needs moving and updating)

2. **File Locations** ⚠️
   - Core TypeScript files are in root instead of proper locations
   - Need to move to apps/website/src/lib/

3. **Database Tables** ⚠️
   - Tables defined in specs but may not exist in Supabase yet
   - Need: campaigns, call_schedules, call_evaluations

---

## 🔧 Required Actions

### Step 1: Move Files to Correct Locations

```bash
# Move call evaluator (rename to remove underscore)
mv lib_call-evaluator.ts apps/website/src/lib/call-evaluator.ts

# Move campaign scheduler (rename to remove underscore)
mv lib_campaign-scheduler.ts apps/website/src/lib/campaign-scheduler.ts

# Move and update conversation route
mv conversation_route.ts apps/website/src/app/api/voice/conversation/route.ts
```

### Step 2: Update Conversation Route

The conversation route needs minor updates to use the new config properly:

**Changes Needed:**
- Import `getSystemPrompt` instead of `getConversationConfig`
- Use campaign types: 'internet' | 'voip' | 'security' | 'cisco'
- Import helpers from conversation-config

### Step 3: Create Database Tables

Run SQL to create required tables in Supabase:

```sql
-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internet', 'voip', 'security', 'cisco')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  calling_hours JSONB NOT NULL,
  target_leads JSONB NOT NULL,
  call_config JSONB NOT NULL,
  metrics JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call schedules table  
CREATE TABLE IF NOT EXISTS call_schedules (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  lead_id TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  timezone TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  call_sid TEXT,
  connected BOOLEAN DEFAULT FALSE,
  duration_seconds INTEGER,
  outcome TEXT CHECK (outcome IN ('qualified', 'not_interested', 'callback', 'voicemail', 'no_answer', 'busy')),
  qualification_score INTEGER,
  next_action TEXT CHECK (next_action IN ('follow_up', 'send_info', 'schedule_callback', 'no_action')),
  cost_per_call DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call evaluations table
CREATE TABLE IF NOT EXISTS call_evaluations (
  id TEXT PRIMARY KEY,
  call_sid TEXT UNIQUE NOT NULL,
  campaign_type TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  qualification_score INTEGER NOT NULL,
  conversation_quality_score INTEGER NOT NULL,
  qualification JSONB NOT NULL,
  quality_metrics JSONB NOT NULL,
  outcome JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  transcript JSONB NOT NULL,
  duration_seconds INTEGER NOT NULL,
  turn_count INTEGER NOT NULL,
  evaluated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_schedules_campaign ON call_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_call_schedules_scheduled ON call_schedules(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_call_evaluations_campaign ON call_evaluations(campaign_type);
CREATE INDEX IF NOT EXISTS idx_call_evaluations_score ON call_evaluations(overall_score);
```

---

## 🧪 Testing Plan

### Test 1: Jake Persona - Internet Campaign

**Objective**: Verify Jake sounds natural with Internet script

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+YOUR_NUMBER",
    "testName": "DSLV Internet Test",
    "metadata": { "campaign_type": "internet" }
  }'
```

**Expected Behavior:**
- Jake greets: "Hi, this is Jake from Data Solutions. How are you doing today?"
- Natural conversation flow with "So...", "I hear you", etc.
- Asks about current internet service
- Handles objections professionally
- Offers consultation if interested

**Success Criteria:**
- ✅ Natural speech patterns evident
- ✅ Appropriate internet-specific questions asked
- ✅ Professional objection handling
- ✅ Clear next steps provided

### Test 2: VoIP Campaign

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+YOUR_NUMBER",
    "testName": "DSLV VoIP Test",
    "metadata": { "campaign_type": "voip" }
  }'
```

**Expected Behavior:**
- VoIP-specific opening about phone systems
- Questions about current system and remote work
- Cost savings messaging
- Technical but accessible language

### Test 3: Security Campaign

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+YOUR_NUMBER",
    "testName": "DSLV Security Test",
    "metadata": { "campaign_type": "security" }
  }'
```

**Expected Behavior:**
- Courtesy review positioning (not fear-based)
- Trust-building approach
- Questions about current security
- Free assessment offer

### Test 4: Cisco Campaign

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+YOUR_NUMBER",
    "testName": "DSLV Cisco Test",
    "metadata": { "campaign_type": "cisco" }
  }'
```

**Expected Behavior:**
- Technical but accessible
- IT decision maker identification
- Cisco expertise positioning
- Infrastructure focus

### Test 5: Call Evaluation

**After each test call**, verify evaluation works:

```typescript
import { callEvaluator } from '@/lib/call-evaluator';

const evaluation = await callEvaluator.evaluateCall(
  callSid,
  'internet',
  conversationMessages,
  durationSeconds
);

console.log(`Score: ${evaluation.overall_score}/100`);
console.log(`Recommendations:`, evaluation.recommendations);
```

**Success Criteria:**
- ✅ Overall score calculated (0-100)
- ✅ Qualification score makes sense
- ✅ Quality metrics populated
- ✅ 3-5 actionable recommendations provided

### Test 6: Campaign Creation

```typescript
import { campaignScheduler } from '@/lib/campaign-scheduler';

const campaign = await campaignScheduler.createCampaign({
  name: 'Nevada Internet - Test',
  type: 'internet',
  start_date: new Date(),
  calling_hours: {
    start: '09:00',
    end: '17:00',
    timezone: 'America/Los_Angeles',
    days_of_week: [1, 2, 3, 4, 5],
  },
  target_leads: {
    list_name: 'test_leads',
    estimated_count: 10,
  },
});

console.log(`Campaign created: ${campaign.id}`);
```

**Success Criteria:**
- ✅ Campaign created in database
- ✅ ID generated
- ✅ Status set to 'draft'
- ✅ Default metrics initialized

---

## 📊 Expected Results

### Per Campaign (100 Leads)
- **Calls**: 300 (3 attempts per lead)
- **Connections**: 225 (75% connect rate)
- **Qualified**: 33 (15% of connections)
- **Appointments**: 23 (70% show rate)
- **Deals**: 4 (20% close rate)
- **Cost**: $7.50 (300 × $0.025)
- **Revenue**: $8,000 (4 × $2,000)
- **ROI**: 106,566%

### Quality Metrics Targets
- **Overall Score**: 70+ average
- **Qualification Score**: 65+ average
- **Quality Score**: 70+ average
- **Conversion Rate**: 10-20%
- **Opt-out Rate**: <5%

---

## 🚨 Known Issues & Limitations

### Current Issues

1. **File Locations** ⚠️
   - TypeScript files in root need to be moved
   - Simple mv commands will fix this

2. **Database Tables** ⚠️
   - May not exist in Supabase yet
   - Need to run SQL migrations

3. **conversation_route.ts Interface Mismatch** ⚠️
   - References old config interface
   - Needs update to use new getSystemPrompt function

### Not Yet Implemented

1. **CRM Integration** 🔜
   - Qualified leads export to CRM
   - Follow
