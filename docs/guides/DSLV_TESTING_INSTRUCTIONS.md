# DSLV Cold Calling - Testing Instructions

**Date**: October 27, 2025  
**Status**: ✅ **READY FOR TESTING**

---

## ✅ Environment Configured

The following credentials have been added to `.env.local`:

- ✅ `OPENAI_API_KEY` - GPT-4 for conversations
- ✅ `TWILIO_ACCOUNT_SID` - Account identifier  
- ✅ `TWILIO_AUTH_TOKEN` - Authentication token
- ✅ `TWILIO_PHONE_NUMBER_PRIMARY` - Phone number for outbound calls
- ✅ `NEXT_PUBLIC_APP_URL` - Local development URL

---

## 🚀 Quick Start

### Step 1: Start Dev Server

```bash
cd apps/website
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

### Step 2: Test a Call

You have **3 options**:

#### Option A: Use the Interactive Test Script (Recommended)

```bash
cd apps/website
node scripts/test-cold-calling.js
```

This will:
1. Prompt for your phone number
2. Ask which campaign to test
3. Make the call automatically
4. Provide instructions

#### Option B: Use cURL

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+YOUR_NUMBER\",\"testName\":\"Internet Test\",\"metadata\":{\"campaign_type\":\"internet\"}}"
```

**Replace `+YOUR_NUMBER` with your actual phone number in E.164 format** (e.g., `+17021234567`)

#### Option C: Direct API Call in Browser

```
http://localhost:3000/api/voice/twiml?campaignType=internet
```

This will show the TwiML response (for verification only)

---

## 📞 Test All 4 Campaigns

### Internet Services Campaign

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+YOUR_NUMBER\",\"testName\":\"Internet\",\"metadata\":{\"campaign_type\":\"internet\"}}"
```

**Expected**: Jake asks about internet service, speed, reliability

### VoIP Solutions Campaign

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+YOUR_NUMBER\",\"testName\":\"VoIP\",\"metadata\":{\"campaign_type\":\"voip\"}}"
```

**Expected**: Jake discusses phone systems, cost savings, remote work

### Security Systems Campaign

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+YOUR_NUMBER\",\"testName\":\"Security\",\"metadata\":{\"campaign_type\":\"security\"}}"
```

**Expected**: Jake offers security review (trust-building, no fear tactics)

### Cisco Networking Campaign

```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+YOUR_NUMBER\",\"testName\":\"Cisco\",\"metadata\":{\"campaign_type\":\"cisco\"}}"
```

**Expected**: Jake discusses infrastructure, networking, Cisco expertise

---

## ✅ What to Expect

### During the Call:

1. **Phone Rings** (5-10 seconds after API call)
2. **Jake Greets**: "Hi, this is Jake from Data Solutions. How are you doing today?"
3. **Natural Conversation**:
   - Campaign-specific questions
   - Natural fillers: "So...", "I hear you", "That makes sense"
   - Active listening and rapport building
4. **Qualification**:
   - Jake extracts pain points
   - Identifies decision maker
   - Assesses interest level
   - Captures contact info if provided
5. **Professional Ending** after 8-12 exchanges

### In Console Logs:

```
[twilio] Test call initiated: CA123... for campaign: internet
[conversation] Starting internet conversation for call CA123...
[conversation] Call CA123... [internet]: User said "yes, we need faster internet"
Interest level: high
Pain points: slow_speed
Decision maker: true
Qualification score: 75/100
```

---

## 🐛 Troubleshooting

### "Call failed to connect"

- Check Twilio credentials in `.env.local`
- Verify phone number format: `+1XXXXXXXXXX` (E.164)
- Ensure Twilio account has credit
- Check dev server is running on port 3000

### "OpenAI API error"

- Verify `OPENAI_API_KEY` in `.env.local`
- Check key starts with `sk-`
- Ensure OpenAI account has credits
- Restart dev server after changing .env.local

### "No audio / Jake doesn't speak"

- Check console for response text
- System uses Twilio TTS (Polly.Matthew voice)
- Verify Twilio credentials
- Check logs for any errors

### "Environment variables not found"

- Verify `.env.local` exists in `apps/website/`
- Check file contains all required variables
- **Restart dev server** after editing .env.local
- Dev server only loads env vars on startup

---

## 📊 Verification Checklist

Before making test calls, verify:

- [ ] Dev server running on `http://localhost:3000`
- [ ] `.env.local` file exists with all credentials
- [ ] OpenAI key is valid (`sk-...` prefix)
- [ ] Twilio credentials are correct
- [ ] Phone number is in E.164 format (`+1XXXXXXXXXX`)
- [ ] You can access the API (curl or browser)

---

## 🎯 Success Indicators

The system is working correctly when:

1. ✅ API call returns success response with `callSid`
2. ✅ Phone rings within 5-10 seconds
3. ✅ Jake greets naturally (not robotic)
4. ✅ Campaign-specific questions asked
5. ✅ Natural conversation flow maintained
6. ✅ Console shows qualification data
7. ✅ No errors in logs
8. ✅ Call ends professionally after conversation

---

## 📚 Next Steps After Testing

Once you've tested successfully:

1. **Listen to Recordings** (if enabled)
2. **Review Console Logs** for qualification data
3. **Adjust Scripts** based on real conversations
4. **Create First Campaign** with real leads
5. **Scale to Production** deployment

---

## 💡 Pro Tips

**For Best Results:**
- Test during business hours (9am-5pm PST)
- Answer enthusiastically to test rapport
- Throw objections to test handling
- Try being a non-decision maker
- Provide realistic business information
- Let Jake finish speaking before responding

**Natural Conversation:**
- Don't answer too quickly (test pacing)
- Use realistic business responses
- Test objections: "We're happy with current provider"
- Test interest: "Tell me more about that"
- Test decision maker: "I'm not the person who handles this"

---

## 📞 Support

**Issues?** Check:
- Environment variables configured
- Dev server restarted after env changes
- Twilio account has credit
- OpenAI account has credits
- Phone number format correct

**Documentation:**
- `DSLV_DEVELOPMENT_STATUS_2025-10-27.md` - Current development status
- `DSLV_COLD_CALLING_COMPLETE_GUIDE.md` - Full implementation guide
- `apps/website/scripts/test-cold-calling.js` - Test script

---

**Ready to test!** 🚀


