# Get Your ElevenLabs API Key - 2 Minute Guide

**Your Credentials:**
- Email: `steve.hubbard@stratanoble.com`
- Password: `Anewday4Me2day!`

---

## ⚡ Quick Method (2 minutes)

### Step 1: Login (30 seconds)
1. Go to: https://elevenlabs.io/sign-in
2. Enter email: `steve.hubbard@stratanoble.com`
3. Enter password: `Anewday4Me2day!`
4. Click "Sign In"

### Step 2: Navigate to API Keys (30 seconds)
1. Click your profile icon (top right)
2. Click "Profile Settings" or "Profile + API Keys"
3. Click the "API Keys" tab

### Step 3: Get Your Key (1 minute)
1. If you see existing keys, **copy any one of them**
2. If no keys exist, click "Create API Key"
   - Name it: "StrataNoble Voice AI"
   - Click "Create"
3. **Copy the key** (starts with `sk_...`)

### Step 4: Run Configuration Script (30 seconds)
Open PowerShell in this directory and run:
```powershell
$apiKey = Read-Host "Paste your ElevenLabs API key"
node apps/website/scripts/configure-tts-env.mjs $apiKey
```

**That's it!** The script will automatically update your `.env.local` file.

---

## 🚀 Alternative: Direct .env.local Edit

If you prefer manual configuration:

1. Open: `apps/website/.env.local`
2. Add these lines at the end:

```env
# --- TTS Mode Configuration ---
USE_TTS_MODE=true
ELEVENLABS_API_KEY=sk_your_key_here_paste_it
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_VOICE_NAME=Josh
```

3. Replace `sk_your_key_here_paste_it` with your actual key
4. Save the file

---

## ✅ Verify Configuration

Run this command to verify:
```bash
node apps/website/scripts/setup-elevenlabs.mjs
```

You should see:
```
✅ Found API key: sk_XXXXXX...
✅ API key is valid
✅ Found X voices
⭐ RECOMMENDED Josh (voice_id)
```

---

## 🎯 What's Next?

After you have your ElevenLabs API key configured, you still need:

1. **Deepgram API Key** (for speech-to-text)
   - Go to: https://console.deepgram.com/
   - Sign up (free $200 credit)
   - Create API Key
   - Add to `.env.local`: `DEEPGRAM_API_KEY=your_key_here`

2. **Start TTS Gateway**
   ```bash
   cd apps/website
   node server/server-tts.js
   ```

3. **Make Test Call**
   ```bash
   curl -X POST http://localhost:3000/api/voice/call \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+17027073168","testName":"TTS Test"}'
   ```

4. **HEAR YOUR AI SPEAK!** 🎉

---

## 🆘 Troubleshooting

### "Invalid API Key"
- Make sure you copied the entire key (starts with `sk_`)
- Check for extra spaces or line breaks
- Verify you're signed into the correct account

### "No API Keys Found"
- Click "Create API Key" button
- Name it anything (e.g., "StrataNoble Voice AI")
- Copy the key immediately (it's only shown once)

### Still Stuck?
Just paste your API key in chat and I'll configure everything for you automatically.

---

*Time to working voice AI: 5 minutes from this point* ⏱️
