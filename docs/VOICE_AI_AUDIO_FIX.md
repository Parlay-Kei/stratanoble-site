# Voice AI Audio Fix - Twilio Media Stream Format Issue

**Problem**: ElevenLabs audio not playing through Twilio media stream
**Root Cause**: Format mismatch - Twilio requires mu-law 8kHz, ElevenLabs outputs different formats

## Current Status

✅ **Working:**
- Twilio call connection
- WebSocket streaming
- Deepgram transcription
- GPT-4o responses
- ElevenLabs TTS generation

❌ **Not Working:**
- Audio playback through Twilio media stream

## Solution Options

### Option 1: Use Twilio <Play> with Audio URLs (RECOMMENDED - Quick Fix)

Instead of streaming audio through WebSocket, serve ElevenLabs audio via HTTP and use `<Play>`:

```xml
<Response>
  <Play>https://your-server.com/api/audio/greeting.mp3</Play>
</Response>
```

**Advantages:**
- Works immediately
- No audio format conversion needed
- ElevenLabs supports MP3/WAV natively

**Implementation:** 30 minutes

### Option 2: Add Audio Format Conversion (Complex)

Convert ElevenLabs PCM → mu-law 8kHz for Twilio:

**Requires:**
- `ffmpeg` or audio conversion library
- Real-time audio processing
- Buffer management

**Implementation:** 2-3 hours

### Option 3: Switch to Different TTS (Not Recommended)

Use a TTS service that outputs mu-law directly.

**Downsides:**
- Voice quality may be lower
- Additional integration time

## Recommended Fix: Hybrid Approach

**For Initial Greeting:**
Use `<Say>` with Twilio's built-in TTS (immediate, no changes needed)

**For Dynamic Responses:**
1. Generate audio with ElevenLabs
2. Save to temporary file
3. Serve via Express endpoint
4. Use `<Gather>` with `<Play>` for playback
5. Process user speech with Deepgram

## Quick Test

Change TwiML to use Twilio's built-in TTS for now:

```typescript
function streamTwiml(testName: string, wsUrl: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="3" speechTimeout="auto">
    <Say voice="Polly.Matthew">
      Hi! This is a test call from StrataNoble's AI system. Can you hear me clearly?
    </Say>
  </Gather>
  <Connect>
    <Stream url="${wsUrl}/api/media-stream?testName=${encodeURIComponent(testName)}">
      <Parameter name="testName" value="${testName}" />
    </Stream>
  </Connect>
</Response>`;
}
```

This will at least get voice output working while we implement proper audio streaming.

## Next Steps

1. ✅ Test with Twilio `<Say>` for immediate voice
2. Implement audio file serving endpoint
3. Update TTS session to save + serve files
4. Test full conversation flow
5. Optimize for production

**Time to working voice:** 15 minutes with `<Say>`, 1-2 hours with full ElevenLabs integration
