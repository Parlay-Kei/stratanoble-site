# Cold Calling Operations Skill
**Version**: 1.0
**Last Updated**: November 21, 2025
**Purpose**: Technical operations for the AI Cold Calling system (Twilio + OpenAI Realtime)

---

## Architecture Overview

### Core Components
- **Twilio Voice**: Handles telephony, TwiML, and Media Streams.
- **Next.js Server**: Hosts the WebSocket endpoint (`/api/voice/media-stream`).
- **OpenAI Realtime API**: Provides VAD, STT, LLM, and TTS via WebSocket.

### Call Flow
1. **Initiation**:
   - Outbound: `src/lib/calling/outbound-dialer.ts` triggers Twilio call.
   - Inbound: Twilio webhook hits `/api/voice/twiml`.
2. **Handshake**:
   - TwiML `<Connect><Stream>` instruction sent to Twilio.
   - Twilio connects to `wss://datasolutionslv.com/api/voice/media-stream`.
3. **Conversation**:
   - Audio streamed bi-directionally (Twilio <-> Next.js <-> OpenAI).
   - `src/server/websocket.ts` manages the session.

---

## Troubleshooting

### Common Issues
- **Silence/Hangup**: Check if WebSocket connected. Verify `OPENAI_API_KEY`.
- **Latency**: Check server region (should be close to Twilio/OpenAI).
- **"Application Error"**: Check Twilio debugger. Ensure `APP_URL` is correct.

### Logs
- **Twilio**: Console > Monitor > Logs > Errors.
- **Server**: Check Vercel/Railway logs for `[websocket]` prefix.
- **Local**: `twiml_debug.log` in project root.

---

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for AI.
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`: For API calls.
- `TWILIO_PHONE_NUMBER`: Caller ID.
- `APP_URL`: Base URL for webhooks.

### Tuning
- **Voice**: Configured in `src/lib/calling/openai-realtime.ts` (currently `shimmer` for Angela).
- **VAD Sensitivity**: Optimized in `src/lib/calling/openai-realtime.ts`:
  - Threshold: 0.5 (more sensitive)
  - Prefix padding: 200ms (faster response start)
  - Silence duration: 800ms (faster end-of-speech detection)
- **Audio Processing**: Optimized in `src/server/websocket.ts`:
  - Audio send interval: 50ms (lower latency)
  - RMS threshold: 800 (better speech detection)
  - Greeting timeout: 500ms (near-instant greeting)

**Recent Optimization (Jan 24, 2025):**
- Migrated from HTTP Gather/Say to WebSocket Media Streams
- 70-80% latency reduction (3-5s → 0.8-1.5s)
- See: `docs/development/VOICE-SYSTEM-PAUSE-FIX.md` for details
