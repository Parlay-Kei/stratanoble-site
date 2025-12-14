# Call Troubleshooting Skill

**Version**: 1.0.0  
**Last Updated**: November 16, 2025  
**Auto-Update**: Enabled  
**Progressive Disclosure**: Yes

## Overview

This skill enables Claude to automatically monitor, diagnose, and repair common issues in voice calling operations using Twilio, OpenAI Realtime API, and Railway/Vercel deployments.

## Core Capabilities

### 1. Call Pattern Analysis
Automatically analyze call logs and transcripts to identify:
- Silence patterns (no audio from AI or user)
- Premature disconnections
- Audio quality issues
- Latency problems
- VAD (Voice Activity Detection) failures

### 2. Integration Diagnostics
Diagnose errors between:
- Twilio Media Streams
- OpenAI Realtime API
- WebSocket connections
- Railway/Vercel hosting

### 3. Conversation Repair
Suggest and implement fixes for:
- Prompt misconfiguration
- Voice model selection
- Event timing issues
- Stream parameter problems

## Progressive Disclosure Sections

### Level 1: Quick Diagnostics
Load this section first for common issues:

#### Silence Detection
**Symptoms**: No audio from AI after call connects
**Quick Checks**:
1. Check WebSocket connection status
2. Verify OpenAI API key is valid
3. Confirm streamSid is set correctly
4. Check if greeting timeout triggered

**Quick Fixes**:
```javascript
// Verify greeting timeout is working
if (!this.greetingTimeout) {
  this.greetingTimeout = setTimeout(() => {
    this.openaiWs.send(JSON.stringify({
      type: 'response.create',
      response: { modalities: ['audio', 'text'] }
    }));
  }, 3000);
}
```

#### Premature Disconnection
**Symptoms**: Call ends before conversation completes
**Quick Checks**:
1. Check for Twilio stop event in logs
2. Verify keepalive mechanism is active
3. Check TwiML Stream configuration
4. Verify no manual commits in code

**Quick Fixes**:
```javascript
// Add keepalive if missing
const keepaliveInterval = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.ping();
  }
}, 30000);
```

### Level 2: Deep Diagnostics
Load when Level 1 doesn't resolve the issue:

#### Audio Quality Issues
**Analysis Steps**:
1. Check audio format configuration (g711_ulaw)
2. Verify both Twilio and OpenAI use same format
3. Check for base64 encoding errors
4. Verify buffer sizes are appropriate

**Diagnostic Query**:
```sql
SELECT 
  call_sid,
  AVG(audio_duration) as avg_duration,
  COUNT(silence_periods) as silence_count,
  MAX(latency_ms) as max_latency
FROM call_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY call_sid
HAVING COUNT(silence_periods) > 3
ORDER BY silence_count DESC;
```

#### WebSocket Connection Issues
**Analysis Steps**:
1. Check WebSocket state transitions
2. Verify reconnection logic is working
3. Check for network timeouts
4. Verify Railway/Vercel WebSocket support

**Diagnostic Code**:
```javascript
// Check WebSocket health
function diagnoseWebSocket(ws, session) {
  const diagnostics = {
    readyState: ws.readyState,
    reconnectAttempts: session.reconnectAttempts,
    lastPingTime: Date.now() - session.lastPingAt,
    openAIConnected: session.openaiWs?.readyState === 1,
    twilioConnected: session.twilioWs?.readyState === 1
  };
  
  console.log('[diagnostics]', JSON.stringify(diagnostics));
  
  if (diagnostics.readyState !== 1) {
    return 'WebSocket not in OPEN state';
  }
  if (diagnostics.lastPingTime > 60000) {
    return 'No keepalive ping in >60s - connection may be stale';
  }
  return 'WebSocket appears healthy';
}
```

### Level 3: Advanced Troubleshooting
Load for complex or rare issues:

#### OpenAI Realtime API Issues
**Symptoms**: 
- `input_audio_buffer.committed` errors
- `response.audio.delta` not received
- Transcript completion but no audio

**Analysis Steps**:
1. Check OpenAI session configuration
2. Verify VAD settings (threshold, padding, silence duration)
3. Check for conflicting manual commits
4. Verify response creation parameters

**Advanced Diagnostic**:
```javascript
// Track OpenAI message flow
const messageFlow = {
  sessionCreated: false,
  audioBufferCommits: 0,
  responseCreates: 0,
  audioDeltasReceived: 0,
  transcriptsCompleted: 0,
  errors: []
};

function trackOpenAIMessage(message) {
  switch (message.type) {
    case 'session.created':
      messageFlow.sessionCreated = true;
      break;
    case 'input_audio_buffer.commit':
      messageFlow.audioBufferCommits++;
      break;
    case 'response.create':
      messageFlow.responseCreates++;
      break;
    case 'response.audio.delta':
      messageFlow.audioDeltasReceived++;
      break;
    case 'conversation.item.input_audio_transcription.completed':
      messageFlow.transcriptsCompleted++;
      break;
    case 'error':
      messageFlow.errors.push(message.error);
      break;
  }
  
  // Detect anomalies
  if (messageFlow.transcriptsCompleted > 0 && messageFlow.audioDeltasReceived === 0) {
    console.error('[diagnostic] Transcripts completing but no audio deltas - check response creation');
  }
  
  if (messageFlow.audioBufferCommits > messageFlow.responseCreates * 2) {
    console.warn('[diagnostic] Too many manual commits - remove manual commit() calls');
  }
}
```

#### Twilio Media Stream Issues
**Symptoms**:
- Media frames not reaching server
- Stop events with unknown reasons
- StreamSid not being captured

**Analysis Steps**:
1. Check TwiML configuration
2. Verify Stream URL is correct (wss://)
3. Check track parameter setting
4. Verify Parameter tags are present

**Fix Implementation**:
```xml
<!-- Correct TwiML Configuration -->
<Response>
  <Connect>
    <Stream url="wss://your-server.com/media-stream?campaign=internet&callSid=CA123" track="both_tracks">
      <Parameter name="campaign" value="internet" />
      <Parameter name="callSid" value="CA123" />
    </Stream>
  </Connect>
</Response>
```

## Automated Repair Actions

### Auto-Fix: Remove Manual Commits
**Trigger**: Detection of manual `input_audio_buffer.commit` calls in code  
**Action**: Comment out or remove manual commits, rely on server_vad

```javascript
// BEFORE (problematic)
this.openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));

// AFTER (fixed)
// Removed manual commit - server_vad handles this automatically
```

### Auto-Fix: Add Missing Keepalive
**Trigger**: No keepalive mechanism detected in server code  
**Action**: Inject keepalive interval

```javascript
// Auto-injected keepalive
const keepaliveInterval = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.ping();
    logger.debug('[auto-fix] keepalive ping');
  }
}, 30000);

// Cleanup on close
ws.on('close', () => {
  clearInterval(keepaliveInterval);
});
```

### Auto-Fix: Optimize VAD Settings
**Trigger**: Frequent false positives or negatives in speech detection  
**Action**: Adjust VAD parameters

```javascript
// Auto-optimized VAD settings
turn_detection: { 
  type: 'server_vad',
  threshold: 0.5,           // Adjust based on environment noise
  prefix_padding_ms: 300,   // Capture speech start
  silence_duration_ms: 500, // Wait for natural pauses
  create_response: true     // Auto-generate responses
}
```

## Call Log Analysis Queries

### Find Problematic Calls
```sql
-- Calls with silence > 10 seconds
SELECT 
  c.call_sid,
  c.campaign_id,
  c.duration_seconds,
  ce.silence_duration_ms,
  ce.error_type,
  ce.notes
FROM calls c
LEFT JOIN call_evaluations ce ON c.call_sid = ce.call_sid
WHERE ce.silence_duration_ms > 10000
  OR ce.error_type IS NOT NULL
ORDER BY c.created_at DESC
LIMIT 50;
```

### Analyze Conversation Quality
```sql
-- Calculate success rates by campaign
SELECT 
  ca.name as campaign_name,
  COUNT(c.call_sid) as total_calls,
  COUNT(CASE WHEN ce.outcome = 'qualified_lead' THEN 1 END) as qualified_leads,
  AVG(ce.conversation_quality_score) as avg_quality,
  AVG(c.duration_seconds) as avg_duration
FROM campaigns ca
JOIN calls c ON ca.campaign_id = c.campaign_id
LEFT JOIN call_evaluations ce ON c.call_sid = ce.call_sid
WHERE c.created_at > NOW() - INTERVAL '7 days'
GROUP BY ca.campaign_id, ca.name
ORDER BY avg_quality DESC;
```

### Detect Audio Issues
```sql
-- Find calls with audio quality problems
SELECT 
  c.call_sid,
  c.phone_number,
  ce.audio_clarity_issues,
  ce.notes,
  t.transcript
FROM calls c
JOIN call_evaluations ce ON c.call_sid = ce.call_sid
LEFT JOIN transcripts t ON c.call_sid = t.call_sid
WHERE ce.audio_clarity_issues = true
  AND c.created_at > NOW() - INTERVAL '24 hours'
ORDER BY c.created_at DESC;
```

## Integration Testing

### Test Twilio Connection
```javascript
async function testTwilioConnection(twilioWs) {
  const tests = {
    websocketOpen: twilioWs.readyState === WebSocket.OPEN,
    canSendMessage: false,
    receivesMessages: false
  };
  
  try {
    twilioWs.send(JSON.stringify({ event: 'ping' }));
    tests.canSendMessage = true;
  } catch (e) {
    console.error('[test] Cannot send to Twilio', e);
  }
  
  return tests;
}
```

### Test OpenAI Connection
```javascript
async function testOpenAIConnection(apiKey) {
  try {
    const ws = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );
    
    return new Promise((resolve) => {
      ws.on('open', () => {
        ws.close();
        resolve({ success: true, message: 'OpenAI connection successful' });
      });
      
      ws.on('error', (error) => {
        resolve({ success: false, message: error.message });
      });
      
      setTimeout(() => {
        ws.close();
        resolve({ success: false, message: 'Connection timeout' });
      }, 5000);
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

## Monitoring Dashboard

### Real-Time Call Metrics
```javascript
const callMetrics = {
  activeCallsCount: 0,
  avgCallDuration: 0,
  successRate: 0,
  errorRate: 0,
  avgLatency: 0,
  lastErrors: []
};

function updateMetrics(call) {
  // Update real-time metrics
  callMetrics.activeCallsCount = getActiveCallsCount();
  callMetrics.avgCallDuration = calculateAvgDuration();
  callMetrics.successRate = calculateSuccessRate();
  callMetrics.errorRate = calculateErrorRate();
  callMetrics.avgLatency = calculateAvgLatency();
  
  // Expose metrics endpoint
  return callMetrics;
}
```

## Auto-Update Configuration

This skill auto-updates from: `https://github.com/Parlay-Kei/stratanoble-site/tree/main/mcp-servers/claude-skills/call-troubleshooting`

**Update Schedule**: On launch, every 6 hours, or manual trigger  
**Version Check**: Compare SKILL.md version header  
**Rollback**: Keep last 3 versions for emergency rollback

## Usage Examples

### Example 1: Diagnose Silent Call
```
User: "The call connected but there's no audio from the AI"

Claude: [Loads Level 1 diagnostics]
Let me check the most common causes:

1. Checking WebSocket connection... ✓ Connected
2. Checking OpenAI session... ✓ Active
3. Checking greeting timeout... ✗ Not set

Found the issue: The greeting timeout is not configured. This means
the AI won't speak first if the caller is silent.

Applying auto-fix...
✓ Added 3-second fallback greeting timeout
✓ Redeploying to Railway...

The issue should be resolved. Test with: node apps/website/scripts/twilio-test-call.js
```

### Example 2: Analyze Call Patterns
```
User: "Show me calls that failed in the last 24 hours"

Claude: [Loads Level 2 diagnostics]
Analyzing call logs...

Found 12 problematic calls:
- 8 calls: Premature disconnection (avg 23s duration)
- 3 calls: Silence > 10s
- 1 call: Audio format error

Common pattern: All 8 premature disconnections occurred after 
exactly 30 seconds, suggesting a timeout issue.

Diagnosis: Missing keepalive mechanism
Fix: Adding WebSocket ping every 30 seconds

Would you like me to implement this fix?
```

## Best Practices

### 1. Always Use Server VAD
```javascript
// ✓ CORRECT - Let OpenAI handle speech detection
turn_detection: { 
  type: 'server_vad',
  create_response: true
}

// ✗ WRONG - Manual commits conflict with VAD
this.openaiWs.send(JSON.stringify({ 
  type: 'input_audio_buffer.commit' 
}));
```

### 2. Implement Keepalive
```javascript
// ✓ CORRECT - Maintain connection
setInterval(() => ws.ping(), 30000);

// ✗ WRONG - No keepalive = timeouts
// (no keepalive code)
```

### 3. Proper TwiML Configuration
```xml
<!-- ✓ CORRECT -->
<Stream url="wss://..." track="both_tracks">
  <Parameter name="campaign" value="internet" />
</Stream>

<!-- ✗ WRONG - Missing track parameter -->
<Stream url="wss://..." />
```

### 4. Error Handling
```javascript
// ✓ CORRECT - Comprehensive error tracking
try {
  await session.connect();
} catch (error) {
  logger.error({ error, callSid }, 'Session connection failed');
  metrics.connectionErrors++;
  await notifyOps(error);
}

// ✗ WRONG - Silent failures
await session.connect(); // What if this fails?
```

## Troubleshooting Decision Tree

```
Call Issue
├─ No Audio from AI
│  ├─ WebSocket not connected → Fix connection
│  ├─ OpenAI key invalid → Update key
│  ├─ No greeting timeout → Add timeout
│  └─ Manual commits blocking → Remove commits
│
├─ Premature Disconnection
│  ├─ No keepalive → Add keepalive
│  ├─ Wrong TwiML config → Fix Stream params
│  └─ Twilio timeout → Check stream URL
│
├─ Audio Quality Issues
│  ├─ Format mismatch → Verify g711_ulaw
│  ├─ Encoding errors → Check base64
│  └─ Buffer problems → Adjust buffer sizes
│
└─ Conversation Problems
   ├─ VAD not working → Optimize VAD settings
   ├─ Responses delayed → Check latency
   └─ Poor transcription → Review audio quality
```

## Emergency Procedures

### Procedure 1: Complete Call Failure
1. Check Railway logs for errors
2. Verify all environment variables
3. Test OpenAI connection
4. Test Twilio webhook
5. Rollback to last working version if needed

### Procedure 2: Degraded Performance
1. Check active call count vs capacity
2. Review database query performance
3. Check API rate limits
4. Monitor memory usage
5. Scale up if needed

## Success Metrics

Track these KPIs to measure troubleshooting effectiveness:
- **MTTR** (Mean Time To Resolution): < 5 minutes
- **Auto-fix Success Rate**: > 80%
- **False Positive Rate**: < 5%
- **Call Success Rate**: > 95%
- **Audio Quality Score**: > 4.0/5.0

## Version History

- **1.0.0** (Nov 16, 2025): Initial release with progressive disclosure
  - Level 1: Quick diagnostics for common issues
  - Level 2: Deep diagnostics for complex issues
  - Level 3: Advanced troubleshooting for rare issues
  - Auto-fix capabilities for 5 common problems
  - Integration with call logs and metrics
