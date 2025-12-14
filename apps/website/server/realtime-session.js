const WebSocket = require('ws');
const { metrics } = require('./metrics');
const fs = require('fs');
const path = require('path');

function appendTranscript(testName, role, text) {
  try {
    const base = process.cwd();
    const p = path.join(base, 'apps/website/.data/transcripts.jsonl');
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const rec = { timestamp: new Date().toISOString(), testName, role, text };
    fs.appendFileSync(p, JSON.stringify(rec) + '\n');
  } catch (e) {
    console.error('[transcript] write error', e.message);
  }
}

function resolveOpenAIKey() {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) return process.env.OPENAI_API_KEY.trim();
  try {
    const p = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      const m = raw.match(/^OPENAI_API_KEY=(.+)$/m);
      if (m) return m[1].trim();
    }
  } catch {}
  return '';
}

class RealtimeSession {
  reconnectAttempts = 0;
  reconnecting = false;
  lastAppendAt = 0;
  commitTimer = null;
  greetingTimeout = null;

  constructor(twilioWs, testName) {
    this.openaiWs = null;
    this.twilioWs = twilioWs;
    this.testName = testName;
    this.twilioStreamSid = null;
  }

  setTwilioStreamSid(streamSid) { this.twilioStreamSid = streamSid; }

  scheduleCommit() {
    if (this.commitTimer) return;
    this.commitTimer = setTimeout(() => {
      this.commitTimer = null;
      this.commitAndRespond();
    }, 600);
  }

  commitAndRespond() {
    if (!this.openaiWs || this.openaiWs.readyState !== WebSocket.OPEN) return;
    try {
      this.openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      this.openaiWs.send(JSON.stringify({ type: 'response.create', response: { instructions: 'Continue speaking naturally.' } }));
    } catch (e) { console.error('[openai] commit/respond failed', e); }
  }

  async connect() {
    const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview';
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`;

    const apiKey = resolveOpenAIKey();

    this.openaiWs = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    this.openaiWs.on('open', () => {
      console.log('[openai] Connected for test:', this.testName);
      this.initializeSession();
      
      // ✅ FIX: Wait for caller to speak first before Jake responds
      // Server VAD will auto-trigger response when user speaks
      // 3-second fallback in case caller is silent
      this.greetingTimeout = setTimeout(() => {
        console.log('[openai] Caller silent - sending fallback greeting');
        try {
          this.openaiWs.send(JSON.stringify({
            type: 'response.create',
            response: {
              modalities: ['audio', 'text']
            }
          }));
        } catch (e) { console.error('[openai] fallback greeting failed', e); }
      }, 3000);
    });

    this.openaiWs.on('message', (data) => { this.handleOpenAIMessage(data); });

    this.openaiWs.on('error', (error) => { console.error('[openai] Error:', error); });

    this.openaiWs.on('close', () => {
      console.log('[openai] Disconnected');
      if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN && !this.reconnecting && this.reconnectAttempts < 3) {
        this.reconnecting = true;
        const delay = Math.pow(2, this.reconnectAttempts++) * 500;
        setTimeout(() => { this.reconnecting = false; this.connect().catch(()=>{}); }, delay);
      }
    });
  }

  initializeSession() {
    const systemPrompt = this.getTestPrompt();
    this.openaiWs?.send(JSON.stringify({
      type: 'session.update',
      session: {
        modalities: ['audio', 'text'],  // Audio first for voice responses, text for transcripts
        instructions: systemPrompt,
        voice: 'alloy',
        input_audio_format: 'g711_ulaw',
        output_audio_format: 'g711_ulaw',
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { 
          type: 'server_vad', 
          threshold: 0.5, 
          prefix_padding_ms: 300, 
          silence_duration_ms: 500,
          create_response: true  // ✅ Auto-generate responses when VAD detects speech
        },
        temperature: 0.8,
        max_response_output_tokens: 4096,
      },
    }));
  }

  getTestPrompt() {
    return `You are a friendly AI assistant testing a voice calling system for StrataNoble.

Your goal: Have a brief, natural conversation to test the system.

Script:
1. Greet: "Hi! This is a test call from StrataNoble's AI system. Can you hear me clearly?"
2. Wait for response
3. Ask: "Great! How's the audio quality on your end?"
4. Wait for response
5. Confirm: "Perfect! This was just a quick test. The system is working well. Have a great day!"
6. End call

Keep it natural and conversational. If they ask questions, answer briefly and stay on track.`;
  }

  handleTwilioAudio(audioBuffer) {
    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      this.openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: audioBuffer.toString('base64') }));
      // Server-side VAD will automatically detect speech and trigger responses
      // No need to manually commit - it causes "buffer too small" errors
    }
  }

  handleOpenAIMessage(data) {
    const message = JSON.parse(data.toString());

    // Log all message types for debugging
    console.log('[openai] Event:', message.type);

    switch (message.type) {
      case 'session.created':
        console.log('[openai] Session created:', message.session?.id);
        break;
      case 'session.updated':
        console.log('[openai] Session updated successfully');
        break;
      case 'response.created':
        console.log('[openai] Response created:', message.response?.id);
        break;
      case 'response.done':
        console.log('[openai] Response completed:', message.response?.id);
        break;
      case 'response.audio.delta': {
        if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
          const twilioMessage = { event: 'media', streamSid: this.twilioStreamSid || undefined, media: { payload: message.delta } };
          this.twilioWs.send(JSON.stringify(twilioMessage));
          try { metrics.aiResponses += 1; } catch {}
        }
        break; }
      case 'response.audio_transcript.done':
        console.log('[openai] AI said:', message.transcript); try { metrics.aiTranscriptAssistant += 1; } catch {}
        appendTranscript(this.testName, 'assistant', message.transcript);
        break;
      case 'input_audio_buffer.speech_stopped':
        console.log('[openai] Speech stopped detected');
        // Manually trigger response if auto-response isn't working
        try {
          this.openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
          this.openaiWs.send(JSON.stringify({ 
            type: 'response.create',
            response: { modalities: ['audio', 'text'] }
          }));
        } catch (e) { console.error('[openai] manual response trigger failed', e); }
        break;
      case 'conversation.item.input_audio_transcription.completed':
        console.log('[openai] User said:', message.transcript); try { metrics.aiTranscriptUser += 1; } catch {}
        appendTranscript(this.testName, 'user', message.transcript);
        // Cancel fallback greeting since user spoke
        if (this.greetingTimeout) {
          clearTimeout(this.greetingTimeout);
          this.greetingTimeout = null;
        }
        break;
      case 'error':
        console.error('[openai] Error:', message.error); try { metrics.aiErrors += 1; } catch {}
        break;
      default:
        // Log unknown message types
        if (message.type && !message.type.includes('audio.delta')) {
          console.log('[openai] Unhandled event:', message.type);
        }
        break;
    }
  }

  disconnect() { 
    if (this.greetingTimeout) {
      clearTimeout(this.greetingTimeout);
      this.greetingTimeout = null;
    }
    this.openaiWs?.close(); 
  }
}

module.exports = { RealtimeSession };