# Voice AI Calling Service

**Type**: Service (V14)
**Operator**: DSLV GM

---

## Purpose

Voice calling stack integration and readiness.

## Stack Components

| Component | Provider |
|-----------|----------|
| Voice | Twilio |
| Speech-to-Text | Deepgram |
| LLM | OpenAI |
| Text-to-Speech | ElevenLabs |

## Call Flow

```
1. Inbound call received (Twilio)
2. Greeting played (TTS)
3. Listen for speech (STT)
4. Process with LLM
5. Generate response (TTS)
6. Continue conversation
7. End call / transfer
```

## Twilio Configuration

```javascript
// Webhook for incoming calls
POST /api/voice/incoming
Content-Type: application/x-www-form-urlencoded

// Response with TwiML
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello, how can I help?</Say>
  <Gather input="speech" action="/api/voice/process" />
</Response>
```

## Performance Targets

| Metric | Target |
|--------|--------|
| First response | <2s |
| Turn latency | <1s |
| Transcription accuracy | >95% |
| Call completion | >90% |

## Error Handling

| Error | Fallback |
|-------|----------|
| STT failure | "Sorry, I didn't catch that" |
| LLM timeout | Canned response |
| TTS failure | Transfer to human |
| Connection drop | Callback offer |

## Testing

```bash
# Test call flow
twilio api:core:calls:create \
  --from "+1XXXXXXXXXX" \
  --to "+1YYYYYYYYYY" \
  --url "https://[domain]/api/voice/test"
```

## Monitoring

| Metric | Alert |
|--------|-------|
| Call failures | >5% |
| Avg call duration | Anomaly |
| Transfer rate | >20% |

## Incidents

| Issue | Resolution |
|-------|------------|
| High latency | Check each component |
| Poor transcription | Adjust STT settings |
| Unnatural voice | Tune TTS parameters |
