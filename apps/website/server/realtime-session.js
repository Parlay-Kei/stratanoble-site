const WebSocket = require('ws');\nconst { metrics } = require('./metrics');\nconst fs = require('fs');
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

// RealtimeSessionPatchMarker1\nclass RealtimeSession {\n  reconnectAttempts = 0;\n  reconnecting = false;\n  lastAppendAt = 0;\n  commitTimer = null;\n\n  scheduleCommit() {\n    if (this.commitTimer) return;\n    this.commitTimer = setTimeout(() => {\n      this.commitTimer = null;\n      this.commitAndRespond();\n    }, 600);\n  }\n\n  commitAndRespond() {\n    if (!this.openaiWs || this.openaiWs.readyState !== WebSocket.OPEN) return;\n    try {\n      this.openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));\n      this.openaiWs.send(JSON.stringify({ type: 'response.create', response: { instructions: 'Continue speaking naturally.' } }));\n    } catch (e) { console.error('[openai] commit/respond failed', e); }\n  }\n
  constructor(twilioWs, testName) {
    this.openaiWs = null;
    this.twilioWs = twilioWs;
    this.testName = testName;
    this.twilioStreamSid = null;
  }

  setTwilioStreamSid(streamSid) {
    this.twilioStreamSid = streamSid;
  }

  async connect() {
    const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview';
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`;

    this.openaiWs = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    this.openaiWs.on('open', () => {
      console.log('[openai] Connected for test:', this.testName);
      this.initializeSession();\n      // Request an opening response after session init\n      try {\n        this.openaiWs.send(JSON.stringify({ type: 'response.create', response: { instructions: 'You are connected to the caller. Continue the conversation naturally.' } }));\n      } catch (e) { console.error('[openai] response.create failed', e); }\n    });

    this.openaiWs.on('message', (data) => {
      this.handleOpenAIMessage(data);
    });

    this.openaiWs.on('error', (error) => {
      console.error('[openai] Error:', error);
    });

    this.openaiWs.on('close', () => {\n      console.log('[openai] Disconnected');\n      if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN && !this.reconnecting && this.reconnectAttempts < 3) {\n        this.reconnecting = true;\n        const delay = Math.pow(2, this.reconnectAttempts++) * 500;\n        setTimeout(() => { this.reconnecting = false; this.connect().catch(()=>{}); }, delay);\n      }\n    });
  }

  initializeSession() {
    const systemPrompt = this.getTestPrompt();

    this.openaiWs?.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: systemPrompt,
          voice: 'alloy',
          input_audio_format: 'g711_ulaw',
          output_audio_format: 'g711_ulaw',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          temperature: 0.8,
          max_response_output_tokens: 4096,
        },
      })
    );
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
      this.openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: audioBuffer.toString('base64') }));\n      this.lastAppendAt = Date.now();\n      this.scheduleCommit();
    }
  }

  handleOpenAIMessage(data) {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case 'session.created':
        console.log('[openai] Session created:', message.session?.id);
        break;
      case 'response.audio.delta': {
        if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
          const twilioMessage = {
            event: 'media',
            streamSid: this.twilioStreamSid || undefined,
            media: { payload: message.delta },
          };
          this.twilioWs.send(JSON.stringify(twilioMessage));\n        try { metrics.aiResponses += 1; } catch {}
        }
        break;
      }
      case 'response.audio_transcript.done':\n        console.log('[openai] AI said:', message.transcript); try { metrics.aiTranscriptAssistant += 1; } catch {} appendTranscript(this.testName, 'assistant', message.transcript);\n        break;
      case 'conversation.item.input_audio_transcription.completed':
        console.log('[openai] User said:', message.transcript); try { metrics.aiTranscriptUser += 1; } catch {} appendTranscript(this.testName, 'user', message.transcript);
        break;
      case 'error':
        console.error('[openai] Error:', message.error); try { metrics.aiErrors += 1; } catch {}
        break;
      default:
        break;
    }
  }

  disconnect() {
    this.openaiWs?.close();
  }
}

module.exports = { RealtimeSession };



