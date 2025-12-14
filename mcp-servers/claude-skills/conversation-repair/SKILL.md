# Conversation Repair Skill

**Version**: 1.0.0  
**Last Updated**: November 16, 2025  
**Auto-Update**: Enabled  
**Progressive Disclosure**: Yes

## Overview

This skill enables Claude to diagnose and repair conversation flow issues, optimize prompts, select appropriate voice models, and fix event timing problems in real-time voice conversations.

## Core Capabilities

### 1. Conversation Flow Analysis
- Detect unnatural conversation patterns
- Identify when AI interrupts user
- Find instances where AI doesn't respond
- Measure conversation naturalness score

### 2. Prompt Optimization
- Analyze system prompt effectiveness
- Suggest improvements for clarity
- Fix common prompt anti-patterns
- Test prompt variations automatically

### 3. Voice Model Selection
- Compare voice model performance
- Recommend optimal voice for use case
- Detect voice quality issues
- Auto-switch voices if needed

### 4. Event Timing Optimization
- Analyze VAD timing patterns
- Optimize silence detection
- Fix premature speech cutoffs
- Reduce latency in responses

## Progressive Disclosure Sections

### Level 1: Quick Conversation Fixes

#### AI Not Responding to User
**Symptoms**: User speaks but AI remains silent
**Quick Checks**:
1. Check if VAD is detecting speech
2. Verify `input_audio_transcription` completing
3. Check if `response.create` is triggered
4. Verify `create_response: true` in VAD config

**Quick Fix**:
```javascript
// Ensure response creation on speech detection
turn_detection: {
  type: 'server_vad',
  threshold: 0.5,
  prefix_padding_ms: 300,
  silence_duration_ms: 500,
  create_response: true  // ← Must be true
}
```

#### AI Interrupts User
**Symptoms**: AI starts speaking before user finishes
**Quick Checks**:
1. Check `silence_duration_ms` setting
2. Verify `threshold` isn't too sensitive
3. Check for manual `response.create` calls

**Quick Fix**:
```javascript
// Increase silence duration to let user finish
turn_detection: {
  type: 'server_vad',
  threshold: 0.5,
  prefix_padding_ms: 300,
  silence_duration_ms: 800,  // ← Increased from 500ms
  create_response: true
}
```

#### Robotic or Unnatural Responses
**Symptoms**: AI sounds mechanical or repetitive
**Quick Checks**:
1. Review system prompt for overly structured language
2. Check if temperature is too low
3. Verify instructions aren't too rigid
4. Check for repetitive patterns in transcripts

**Quick Fix**:
```javascript
// Increase temperature for more natural responses
session: {
  temperature: 0.9,  // ← Increased from 0.8
  instructions: `Keep responses conversational and natural.
    Avoid robotic phrases like "I understand" or "Let me help you with that."
    Speak like a real person having a genuine conversation.`
}
```

### Level 2: Prompt Engineering

#### Prompt Analysis Framework
```javascript
function analyzePrompt(systemPrompt) {
  const issues = [];
  
  // Check for common anti-patterns
  if (systemPrompt.length > 2000) {
    issues.push({
      severity: 'warning',
      type: 'length',
      message: 'Prompt too long - may reduce response quality',
      fix: 'Reduce to <1500 characters, focus on core instructions'
    });
  }
  
  if (systemPrompt.includes('you must') || systemPrompt.includes('always')) {
    issues.push({
      severity: 'info',
      type: 'rigidity',
      message: 'Overly rigid instructions detected',
      fix: 'Use "typically" or "generally" for more natural responses'
    });
  }
  
  if (!systemPrompt.includes('brief') && !systemPrompt.includes('concise')) {
    issues.push({
      severity: 'warning',
      type: 'verbosity',
      message: 'No brevity instruction - AI may be too verbose',
      fix: 'Add: "Keep responses brief and conversational"'
    });
  }
  
  // Check for persona clarity
  if (!systemPrompt.match(/you are|you're|acting as/i)) {
    issues.push({
      severity: 'error',
      type: 'persona',
      message: 'No clear persona defined',
      fix: 'Start with "You are [persona name]..."'
    });
  }
  
  return issues;
}
```

#### Optimal Prompt Structure
```javascript
// ✓ BEST PRACTICE - Clear, concise, natural
const optimalPrompt = `You are Jake, a friendly sales rep for StrataNoble's connectivity services.

Your goal: Qualify leads for Internet, VoIP, and Security services.

Conversation flow:
1. Greet warmly: "Hi! This is Jake from StrataNoble. How's it going?"
2. Ask about their current services
3. Listen for pain points
4. Suggest relevant solutions briefly
5. Offer to schedule a quote if interested

Keep it natural and conversational. Be brief - aim for 1-2 sentences per response.
If they're busy, respect their time. If interested, get their best callback time.`;

// ✗ BAD PRACTICE - Too rigid, too long
const badPrompt = `You are a sales representative and you must always follow these steps:
1. You must first greet the customer
2. You must then ask about their current service provider
3. You must identify their pain points by asking...
[continues for 500+ more words with rigid rules]`;
```

#### Campaign-Specific Prompts

**Internet Services**:
```javascript
const internetPrompt = `You are Jake from StrataNoble's Internet division.

You're calling because businesses in their area are upgrading to fiber.

Quick flow:
1. "Hi! Jake from StrataNoble. We're bringing fiber to [area]. Got a minute?"
2. Ask current speed/provider
3. Mention our speeds: "We offer up to 10 Gig symmetrical"
4. If interested: Schedule a quote

Be casual. If they're happy with current service, respect that.
Goal: Get appointment OR learn why they're not interested.`;
```

**VoIP Services**:
```javascript
const voipPrompt = `You are Jake from StrataNoble's VoIP team.

Calling about upgrading their phone system to modern VoIP.

Quick flow:
1. "Hi! Jake from StrataNoble. Heard you might be on an older phone system?"
2. Ask about current setup
3. Mention benefits: "VoIP cuts costs 40-60% typically"
4. If interested: Schedule demo

Keep it brief. Many businesses don't know they can save money on phones.`;
```

**Security Services**:
```javascript
const securityPrompt = `You are Jake from StrataNoble's Security division.

Following up on cybersecurity assessment request.

Quick flow:
1. "Hi! Jake from StrataNoble Security. You requested a security assessment?"
2. Confirm their interest
3. Explain: "Free 30-minute assessment of your network"
4. Schedule: "How's Tuesday or Wednesday?"

Emphasize this is complimentary. Focus on scheduling, not selling.`;
```

### Level 3: Voice Model Optimization

#### Voice Model Comparison
```javascript
const voiceModels = {
  alloy: {
    characteristics: 'Neutral, professional, clear',
    bestFor: 'Corporate calls, technical explanations',
    energy: 'Medium',
    warmth: 'Medium'
  },
  echo: {
    characteristics: 'Deep, authoritative, male',
    bestFor: 'Executive outreach, B2B sales',
    energy: 'Medium-High',
    warmth: 'Medium-Low'
  },
  fable: {
    characteristics: 'Warm, friendly, approachable',
    bestFor: 'SMB outreach, customer service',
    energy: 'High',
    warmth: 'High'
  },
  onyx: {
    characteristics: 'Deep, smooth, trustworthy',
    bestFor: 'Financial services, serious topics',
    energy: 'Low-Medium',
    warmth: 'Medium'
  },
  nova: {
    characteristics: 'Bright, energetic, engaging',
    bestFor: 'Sales, marketing, enthusiasm needed',
    energy: 'Very High',
    warmth: 'High'
  },
  shimmer: {
    characteristics: 'Young, friendly, casual',
    bestFor: 'Startup audience, informal settings',
    energy: 'High',
    warmth: 'Very High'
  }
};

function recommendVoice(campaignType, targetAudience) {
  const recommendations = {
    internet: {
      smb: 'fable',      // Warm and approachable for small businesses
      enterprise: 'echo', // Authoritative for large companies
      residential: 'nova' // Energetic for consumers
    },
    voip: {
      smb: 'alloy',      // Professional for phone system talks
      enterprise: 'onyx', // Trustworthy for cost discussions
      residential: 'shimmer' // Casual for home offices
    },
    security: {
      smb: 'onyx',       // Serious for security matters
      enterprise: 'echo', // Authoritative for compliance
      residential: 'alloy' // Clear for technical topics
    }
  };
  
  return recommendations[campaignType]?.[targetAudience] || 'alloy';
}
```

#### Voice Quality Monitoring
```javascript
async function monitorVoiceQuality(callSid) {
  const transcript = await getTranscript(callSid);
  
  const qualityMetrics = {
    clarity: analyzeClarity(transcript),
    naturalness: analyzeNaturalness(transcript),
    pacing: analyzePacing(transcript),
    engagement: analyzeEngagement(transcript)
  };
  
  // Flag issues
  if (qualityMetrics.clarity < 0.7) {
    console.warn(`[voice-quality] Low clarity on call ${callSid}`);
    suggestVoiceChange(callSid);
  }
  
  if (qualityMetrics.naturalness < 0.6) {
    console.warn(`[voice-quality] Unnatural speech on call ${callSid}`);
    suggestPromptRevision(callSid);
  }
  
  return qualityMetrics;
}
```

### Level 4: Event Timing Optimization

#### VAD Timing Analysis
```javascript
function analyzeVADTiming(callLogs) {
  const patterns = {
    falsePositives: 0,  // AI responds to silence/noise
    falseNegatives: 0,  // AI doesn't respond to speech
    interruptions: 0,    // AI cuts off user
    delays: 0           // AI responds too slowly
  };
  
  callLogs.forEach(log => {
    // Detect false positives
    if (log.userSpeechDetected && log.transcriptEmpty) {
      patterns.falsePositives++;
    }
    
    // Detect false negatives
    if (log.userSpoke && !log.aiResponded) {
      patterns.falseNegatives++;
    }
    
    // Detect interruptions
    if (log.aiStartedBeforeUserFinished) {
      patterns.interruptions++;
    }
    
    // Detect delays
    if (log.responseLatency > 2000) {
      patterns.delays++;
    }
  });
  
  return optimizeVADSettings(patterns);
}

function optimizeVADSettings(patterns) {
  const recommendations = {
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 500
  };
  
  // Too many false positives = increase threshold
  if (patterns.falsePositives > patterns.falseNegatives) {
    recommendations.threshold = 0.6;
    recommendations.silence_duration_ms = 600;
  }
  
  // Too many false negatives = decrease threshold
  if (patterns.falseNegatives > patterns.falsePositives) {
    recommendations.threshold = 0.4;
    recommendations.silence_duration_ms = 400;
  }
  
  // Too many interruptions = increase silence duration
  if (patterns.interruptions > 5) {
    recommendations.silence_duration_ms = 800;
  }
  
  return recommendations;
}
```

#### Response Latency Optimization
```javascript
function measureResponseLatency() {
  const timestamps = {
    speechDetected: null,
    transcriptComplete: null,
    responseCreated: null,
    audioStarted: null
  };
  
  return {
    totalLatency: timestamps.audioStarted - timestamps.speechDetected,
    transcriptionLatency: timestamps.transcriptComplete - timestamps.speechDetected,
    generationLatency: timestamps.responseCreated - timestamps.transcriptComplete,
    streamingLatency: timestamps.audioStarted - timestamps.responseCreated
  };
}

function optimizeLatency(latencyMetrics) {
  const optimizations = [];
  
  if (latencyMetrics.transcriptionLatency > 800) {
    optimizations.push({
      area: 'transcription',
      issue: 'Slow speech-to-text',
      fix: 'Check audio quality, reduce background noise'
    });
  }
  
  if (latencyMetrics.generationLatency > 1000) {
    optimizations.push({
      area: 'generation',
      issue: 'Slow AI response',
      fix: 'Simplify prompt, reduce max_tokens, check API load'
    });
  }
  
  if (latencyMetrics.streamingLatency > 500) {
    optimizations.push({
      area: 'streaming',
      issue: 'Slow audio delivery',
      fix: 'Check network, verify WebSocket health'
    });
  }
  
  return optimizations;
}
```

## Automated Conversation Repairs

### Auto-Repair 1: Fix Robotic Responses
**Trigger**: Conversation naturalness score < 0.6  
**Action**: Inject naturalness improvements into prompt

```javascript
function repairRoboticConversation(systemPrompt) {
  const naturalityAddons = `

Additional guidelines for natural conversation:
- Use contractions: "I'm" not "I am", "you're" not "you are"
- Vary your responses - avoid starting sentences the same way
- Use casual language: "Hey" not "Hello", "got it" not "I understand"
- Show personality: humor, empathy, enthusiasm
- Don't be overly formal or polite
- React naturally: "Oh really?" "That's interesting!" "Makes sense"
`;

  return systemPrompt + naturalityAddons;
}
```

### Auto-Repair 2: Reduce Interruptions
**Trigger**: >10% of calls have AI interruptions  
**Action**: Automatically adjust VAD settings

```javascript
function reduceInterruptions(currentSettings) {
  return {
    ...currentSettings,
    silence_duration_ms: currentSettings.silence_duration_ms + 200,
    prefix_padding_ms: Math.min(currentSettings.prefix_padding_ms + 100, 500)
  };
}
```

### Auto-Repair 3: Fix Non-Responsive AI
**Trigger**: AI doesn't respond after user speaks  
**Action**: Add explicit response triggering

```javascript
function fixNonResponsive(session) {
  // Monitor for speech_stopped without response
  session.openaiWs.on('message', (data) => {
    const message = JSON.parse(data);
    
    if (message.type === 'input_audio_buffer.speech_stopped') {
      // Ensure response is triggered
      setTimeout(() => {
        if (!session.responseInProgress) {
          console.log('[auto-repair] Triggering delayed response');
          session.openaiWs.send(JSON.stringify({
            type: 'response.create',
            response: { modalities: ['audio', 'text'] }
          }));
        }
      }, 1000);
    }
    
    if (message.type === 'response.created') {
      session.responseInProgress = true;
    }
    
    if (message.type === 'response.done') {
      session.responseInProgress = false;
    }
  });
}
```

### Auto-Repair 4: Optimize Voice Selection
**Trigger**: Low engagement scores for current voice  
**Action**: Test alternative voices and select best performer

```javascript
async function optimizeVoiceSelection(campaign) {
  const voices = ['alloy', 'echo', 'fable', 'nova'];
  const results = [];
  
  for (const voice of voices) {
    // Run test calls with this voice
    const testCalls = await runTestCalls(campaign, voice, 10);
    const metrics = analyzeTestCalls(testCalls);
    
    results.push({
      voice,
      engagementScore: metrics.engagement,
      qualifiedLeadRate: metrics.qualifiedRate,
      conversationQuality: metrics.quality
    });
  }
  
  // Select best performer
  const bestVoice = results.sort((a, b) => 
    b.engagementScore - a.engagementScore
  )[0];
  
  console.log(`[auto-repair] Switching to ${bestVoice.voice} for ${campaign.name}`);
  return bestVoice.voice;
}
```

## Conversation Quality Scoring

### Quality Metrics
```javascript
function scoreConversation(transcript, callMetadata) {
  const scores = {
    naturalness: scoreNaturalness(transcript),
    engagement: scoreEngagement(transcript, callMetadata),
    effectiveness: scoreEffectiveness(transcript, callMetadata),
    clarity: scoreClarity(transcript),
    overall: 0
  };
  
  // Weighted average
  scores.overall = (
    scores.naturalness * 0.3 +
    scores.engagement * 0.3 +
    scores.effectiveness * 0.3 +
    scores.clarity * 0.1
  );
  
  return scores;
}

function scoreNaturalness(transcript) {
  let score = 1.0;
  
  // Deduct for robotic phrases
  const roboticPhrases = [
    'I understand',
    'Let me help you with that',
    'Thank you for your patience',
    'Is there anything else',
    'I apologize for the inconvenience'
  ];
  
  roboticPhrases.forEach(phrase => {
    const occurrences = (transcript.match(new RegExp(phrase, 'gi')) || []).length;
    score -= occurrences * 0.1;
  });
  
  // Deduct for repetition
  const sentences = transcript.split(/[.!?]+/);
  const uniqueSentences = new Set(sentences);
  const repetitionRate = 1 - (uniqueSentences.size / sentences.length);
  score -= repetitionRate * 0.3;
  
  return Math.max(0, Math.min(1, score));
}

function scoreEngagement(transcript, metadata) {
  const indicators = {
    userParticipation: metadata.userTurnCount / metadata.totalTurnCount,
    backAndForth: metadata.turnTransitions / metadata.totalTurnCount,
    userInterest: countInterestSignals(transcript),
    conversationLength: Math.min(metadata.duration / 120, 1) // Optimal ~2 min
  };
  
  return (
    indicators.userParticipation * 0.3 +
    indicators.backAndForth * 0.3 +
    indicators.userInterest * 0.2 +
    indicators.conversationLength * 0.2
  );
}
```

### Transcript Analysis
```javascript
function analyzeTranscript(transcript) {
  const analysis = {
    userTurns: 0,
    aiTurns: 0,
    avgUserResponseLength: 0,
    avgAIResponseLength: 0,
    interestSignals: [],
    objections: [],
    questions: []
  };
  
  // Parse turns
  const turns = transcript.split('\n');
  turns.forEach(turn => {
    if (turn.startsWith('User:')) {
      analysis.userTurns++;
      const text = turn.substring(5).trim();
      
      // Detect interest signals
      if (text.match(/interested|tell me more|sounds good|yes/i)) {
        analysis.interestSignals.push(text);
      }
      
      // Detect objections
      if (text.match(/not interested|busy|no thanks|remove|stop/i)) {
        analysis.objections.push(text);
      }
      
      // Detect questions
      if (text.includes('?')) {
        analysis.questions.push(text);
      }
    }
    
    if (turn.startsWith('Assistant:')) {
      analysis.aiTurns++;
    }
  });
  
  return analysis;
}
```

## Real-Time Conversation Monitoring

### Live Quality Dashboard
```javascript
const conversationMonitor = {
  activeConversations: new Map(),
  
  trackConversation(callSid, event) {
    if (!this.activeConversations.has(callSid)) {
      this.activeConversations.set(callSid, {
        startTime: Date.now(),
        turns: [],
        qualityAlerts: []
      });
    }
    
    const conversation = this.activeConversations.get(callSid);
    conversation.turns.push(event);
    
    // Real-time quality checks
    if (conversation.turns.length >= 3) {
      const recentQuality = this.assessRecentQuality(conversation);
      
      if (recentQuality.score < 0.5) {
        this.triggerIntervention(callSid, recentQuality.issues);
      }
    }
  },
  
  assessRecentQuality(conversation) {
    const recentTurns = conversation.turns.slice(-5);
    const issues = [];
    
    // Check for repetition
    const aiResponses = recentTurns
      .filter(t => t.role === 'assistant')
      .map(t => t.text);
    
    if (new Set(aiResponses).size < aiResponses.length * 0.7) {
      issues.push('High repetition detected');
    }
    
    // Check for engagement
    const userResponses = recentTurns.filter(t => t.role === 'user');
    if (userResponses.every(r => r.text.split(' ').length < 3)) {
      issues.push('User giving minimal responses');
    }
    
    return {
      score: issues.length === 0 ? 1.0 : 0.5,
      issues
    };
  },
  
  triggerIntervention(callSid, issues) {
    console.log(`[monitor] Quality intervention for ${callSid}:`, issues);
    
    // Could dynamically adjust prompt mid-conversation
    // Or flag for human review
    // Or trigger specific repair actions
  }
};
```

## A/B Testing Framework

### Prompt Testing
```javascript
async function runPromptABTest(campaignId, variantA, variantB, numCalls = 50) {
  const results = {
    variantA: { calls: [], metrics: {} },
    variantB: { calls: [], metrics: {} }
  };
  
  // Run calls with each variant
  for (let i = 0; i < numCalls / 2; i++) {
    const callA = await makeTestCall(campaignId, variantA);
    const callB = await makeTestCall(campaignId, variantB);
    
    results.variantA.calls.push(callA);
    results.variantB.calls.push(callB);
  }
  
  // Analyze results
  results.variantA.metrics = calculateMetrics(results.variantA.calls);
  results.variantB.metrics = calculateMetrics(results.variantB.calls);
  
  // Determine winner
  const winner = results.variantA.metrics.qualifiedLeadRate > 
                 results.variantB.metrics.qualifiedLeadRate 
                 ? 'variantA' : 'variantB';
  
  console.log(`[a/b-test] Winner: ${winner}`);
  console.log('Variant A:', results.variantA.metrics);
  console.log('Variant B:', results.variantB.metrics);
  
  return { winner, results };
}
```

## Best Practices

### 1. Natural Language Patterns
```javascript
// ✓ GOOD - Natural and conversational
"Hey! This is Jake from StrataNoble. How's it going?"
"Gotcha. So you're looking for faster internet?"
"Makes sense. Most businesses in your area are upgrading to fiber."

// ✗ BAD - Robotic and formal
"Hello. This is Jake calling from StrataNoble company."
"I understand your requirements. Let me help you with that."
"Thank you for your time. Is there anything else I can assist you with today?"
```

### 2. Response Length
```javascript
// ✓ GOOD - Brief and focused
"We offer speeds up to 10 Gig. What are you using now?"

// ✗ BAD - Too verbose
"Our company provides a wide range of internet services including speeds that can reach up to 10 Gigabits per second which is significantly faster than most residential connections and we would be happy to discuss your current internet service provider and help you understand what options might be available in your area."
```

### 3. Handling Objections
```javascript
// ✓ GOOD - Acknowledge and move on
"I totally get it - bad timing. Mind if I call back next month?"

// ✗ BAD - Pushy or defensive
"I understand you're busy, but this will only take a minute and it could save you a lot of money so let me just quickly..."
```

## Success Metrics

Track these KPIs for conversation quality:
- **Naturalness Score**: > 0.8
- **Engagement Score**: > 0.7
- **User Turn Ratio**: 0.4-0.6 (balanced conversation)
- **Qualified Lead Rate**: > 3%
- **Conversation Completion**: > 85%

## Version History

- **1.0.0** (Nov 16, 2025): Initial release
  - Progressive disclosure for conversation diagnostics
  - Prompt optimization framework
  - Voice model selection system
  - Event timing optimization
  - Real-time quality monitoring
  - A/B testing capabilities
