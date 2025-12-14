# Cold Calling Agent - Quick Start Guide

**Status**: Installing dependencies... ⏳

---

## 🚀 Getting Started (After Install Completes)

### Step 1: Start the Server

Once `npm install` completes, run:

```bash
cd apps/website
npm run dev
```

If you get a "cross-env not found" error, run:
```bash
npm install cross-env
npm run dev
```

### Step 2: Access the Dashboard

Open your browser and go to:
```
http://localhost:3000/cold-calling
```

You should see:
- **Manual Calling** tab (default) with a big "CALL NOW" button
- **Campaign Scheduler** tab

### Step 3: Make Your First Test Call

1. **Enter your phone number**: `+17021234567` (your actual number)
2. **Select campaign type**: Click "Internet Services"
3. **Click the big "CALL NOW" button**
4. **Answer your phone** when it rings (5-10 seconds)
5. **Talk to Jake** - have a natural conversation

---

## 🎯 What You'll See

### Manual Calling Tab
```
┌──────────────────────────────────────┐
│     📞 Make a Call Now               │
│                                      │
│  Phone Number: [+17021234567]       │
│                                      │
│  Campaign Type:                      │
│  [🌐 Internet] [📱 VoIP]            │
│  [🔒 Security] [🔧 Cisco]           │
│                                      │
│     [📞 CALL NOW Button]            │
└──────────────────────────────────────┘
```

### Campaign Scheduler Tab
```
┌──────────────────────────────────────┐
│  📅 Automated Campaigns              │
│                                      │
│  [+ New Campaign Button]             │
│                                      │
│  (Campaign list will show here)      │
└──────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### Issue: Port 3000 Already in Use

**Error**: "Port 3000 is already in use"

**Solution**:
```bash
# Kill the process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Then try again
npm run dev
```

### Issue: Module Not Found

**Error**: "Cannot find module 'xyz'"

**Solution**:
```bash
npm install
npm run dev
```

### Issue: cross-env Error

**Error**: "'cross-env' is not recognized"

**Solution**:
```bash
npm install cross-env
npm run dev
```

---

## 📞 System Components

**Currently Installed**:
✅ Dashboard UI (`/cold-calling/page.tsx`)
✅ Push Button Interface (Manual Calling)
✅ Campaign Scheduler Interface
✅ Backend APIs (call, twiml, conversation, status)
✅ Jake AI Agent (4 campaign scripts)
✅ Twilio Integration
✅ OpenAI GPT-4 Integration

**Environment**:
✅ All credentials configured in `.env.local`
✅ Twilio phone: +17027668008
✅ OpenAI API key configured
✅ Ngrok webhook URL set

---

## 🎬 Quick Test Script

If you prefer to test via command line:

```bash
cd apps/website
node scripts/test-cold-calling.js
```

This interactive script will:
1. Prompt for your phone number
2. Let you select campaign type
3. Initiate the call
4. Show you the results

---

## 📍 File Locations

**Dashboard**: `apps/website/src/app/cold-calling/page.tsx`
**APIs**: `apps/website/src/app/api/voice/`
**Jake Scripts**: `apps/website/src/lib/conversation-config.ts`
**Environment**: `apps/website/.env.local`

---

## ⏭️ Next Steps

1. ✅ Wait for `npm install` to complete
2. ▶️ Run `npm run dev`
3. 🌐 Open `http://localhost:3000/cold-calling`
4. 📞 Click "CALL NOW" to test
5. 🎉 Talk to Jake!

---

## 💡 Pro Tips

- **Test First**: Call yourself before calling prospects
- **All 4 Campaigns**: Try each campaign type to hear different scripts
- **Natural Conversations**: Jake responds better to natural speech
- **Qualification**: Watch the score (0-100) after each call
- **Mobile**: Dashboard works on mobile too

---

## 📚 Full Documentation

- `CCA_CLIENT_USAGE_GUIDE.md` - Complete usage instructions
- `CCA_DEPLOYMENT_MIGRATION_GUIDE.md` - Deployment & migration
- `DSLV_COLD_CALLING_START_TO_FINISH.md` - Technical deep dive

---

**Status**: Waiting for installation to complete...  
**Next**: Run `npm run dev` when ready  
**Access**: `http://localhost:3000/cold-calling`

🚀 **You're almost there!**
