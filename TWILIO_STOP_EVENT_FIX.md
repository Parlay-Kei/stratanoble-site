# Twilio Stop Event Fix

## Date: November 16, 2025

## Problem
Twilio was sending a "stop" event prematurely, ending the media stream and cutting off Jake before the conversation completed. This caused:
- Conversations ending mid-sentence
- Poor user experience
- Incomplete call evaluations

## Root Cause
1. **Missing Stream Parameters**: The TwiML `<Stream>` tag lacked proper track configuration
2. **No Keepalive Mechanism**: Without periodic pings, Twilio's default timeout would disconnect idle streams
3. **Insufficient Logging**: Unable to determine why Twilio was sending stop events

## Solutions Implemented

### 1. Enhanced TwiML Configuration
**File**: `apps/website/src/app/api/voice/twiml/route.ts`

**Changes**:
- Added `track="both_tracks"` attribute to `<Stream>` tag to capture bidirectional audio
- Added `<Parameter>` tags to pass campaign and callSid metadata
- Improved stream configuration for better stability

```xml
<Stream url="${wsUrl}/media-stream?campaign=${campaignType}&callSid=${callSid}" track="both_tracks">
  <Parameter name="campaign" value="${campaignType}" />
  <Parameter name="callSid" value="${callSid}" />
</Stream>
```

### 2. WebSocket Keepalive Mechanism
**File**: `apps/website/server/server.js`

**Changes**:
- Added 30-second keepalive ping interval to maintain connection
- Properly cleanup interval on connection close or stop event
- Prevents Twilio from timing out inactive streams

```javascript
const keepaliveInterval = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.ping();
    logger.debug('[media-stream] keepalive ping sent');
  }
}, 30000); // Ping every 30 seconds
```

### 3. Enhanced Stop Event Logging
**File**: `apps/website/server/server.js`

**Changes**:
- Added detailed logging when Twilio sends stop event
- Captures reason, streamSid, accountSid, and callSid
- Helps diagnose future issues

```javascript
logger.info({ 
  streamSid: message.streamSid, 
  reason: message.stop?.reason || 'unknown',
  accountSid: message.accountSid,
  callSid: message.callSid
}, '[media-stream] stream stopped by Twilio');
```

## Testing Checklist

- [ ] Test calls complete without premature disconnection
- [ ] Keepalive pings appear in logs every 30 seconds
- [ ] Stop event logging shows proper reason codes
- [ ] Connection stays stable during long pauses
- [ ] Multiple concurrent calls work correctly
- [ ] Railway deployment successful
- [ ] Production calls complete normally

## Deployment Steps

1. **Commit Changes**
```bash
git add apps/website/src/app/api/voice/twiml/route.ts apps/website/server/server.js
git commit -m "fix: Add keepalive and enhanced TwiML for Twilio stream stability"
```

2. **Push to GitHub**
```bash
git push origin main
```

3. **Verify Railway Deployment**
- Check Railway dashboard for successful deployment
- Monitor deployment logs for any errors
- Verify server restarts successfully

4. **Test Production Call**
```bash
node apps/website/scripts/twilio-test-call.js
```

5. **Monitor Logs**
```bash
# Check Railway logs for:
# - Keepalive ping messages
# - Stop event details (if any)
# - No premature disconnections
```

## Expected Outcomes

✅ **Before Fix**: Calls would end prematurely with "stream stopped" log  
✅ **After Fix**: Calls complete naturally, keepalive maintains connection  

## Monitoring

Watch for these log patterns in Railway:
- `[media-stream] keepalive ping sent` every 30 seconds
- `[media-stream] stream stopped by Twilio` with reason details
- No unexpected stop events during active conversations

## Rollback Plan

If issues occur:
1. Revert to commit before this fix: `git revert HEAD`
2. Push to trigger Railway redeploy
3. Previous behavior will resume (though with original issue)

## Next Steps

1. Monitor production calls for 24 hours
2. Verify no premature disconnections
3. Analyze stop event reasons from logs
4. Consider adding call duration metrics
5. Implement automatic reconnection if needed

## Related Files
- `apps/website/src/app/api/voice/twiml/route.ts`
- `apps/website/server/server.js`
- `apps/website/server/realtime-session.js`

## Commit Hash
- Current changes (not yet committed)
