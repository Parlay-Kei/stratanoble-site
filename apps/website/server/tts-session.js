const WebSocket = require('ws');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const { createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const { metrics } = require('./metrics');
const fs = require('fs');
const path = require('path');

/**
 * TTS Session Handler - OpenAI Realtime API Workaround
 *
 * Architecture:
 * 1. User speaks → Deepgram (STT) → Transcript
 * 2. Transcript → GPT-4 (text mode) → Response text
 * 3. Response text → ElevenLabs (TTS) → Audio
 * 4. Audio → Twilio → User hears AI
 *
 * Cost: ~$0.29/call (65% cheaper than OpenAI Realtime when working)
 * Latency: ~800ms (slightly higher than Realtime, but acceptable)
 */

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

function resolveApiKey(envVarName, fallbackPath = null) {
  // Check environment first
  if (process.env[envVarName] && process.env[envVarName].trim()) {
    return process.env[envVarName].trim();
  }

  // Check .env.local file
  if (fallbackPath) {
    try {
      const p = path.join(__dirname, fallbackPath);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const m = raw.match(new RegExp(`^${envVarName}=(.+)$`, 'm'));
        if (m) return m[1].trim();
      }
    } catch {}
  }

  return '';
}

class TtsSession {
  constructor(twilioWs, testName) {
    this.twilioWs = twilioWs;
    this.testName = testName;
    this.twilioStreamSid = null;

    // Conversation state
    this.conversationHistory = [];
    this.currentTranscript = '';
    this.isSpeaking = false;
    this.silenceTimer = null;

    // API clients
    this.openai = null;
    this.elevenlabs = null;
    this.deepgram = null;
    this.deepgramLive = null;

    // Audio buffer for Deepgram
    this.audioBuffer = [];
    this.lastAudioAt = 0;
  }

  setTwilioStreamSid(streamSid) {
    this.twilioStreamSid = streamSid;
  }

  async connect() {
    console.log('[tts] Initializing TTS session for test:', this.testName);

    // Initialize API clients
    const openaiKey = resolveApiKey('OPENAI_API_KEY', '../.env.local');
    const elevenLabsKey = resolveApiKey('ELEVENLABS_API_KEY', '../.env.local');
    const deepgramKey = resolveApiKey('DEEPGRAM_API_KEY', '../.env.local');

    if (!openaiKey) {
      console.error('[tts] Missing OPENAI_API_KEY');
      return;
    }

    if (!elevenLabsKey) {
      console.error('[tts] Missing ELEVENLABS_API_KEY');
      return;
    }

    if (!deepgramKey) {
      console.error('[tts] Missing DEEPGRAM_API_KEY');
      return;
    }

    this.openai = new OpenAI({ apiKey: openaiKey });
    this.elevenlabs = new ElevenLabsClient({ apiKey: elevenLabsKey });
    this.deepgram = createClient(deepgramKey);

    // Initialize Deepgram live transcription
    this.initializeDeepgram();

    // Initialize conversation with system prompt
    this.conversationHistory.push({
      role: 'system',
      content: this.getTestPrompt(),
    });

    // Start conversation with AI greeting
    await this.generateAndSendResponse('');
  }

  initializeDeepgram() {
    try {
      this.deepgramLive = this.deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,  // Required for utterance_end_ms
        utterance_end_ms: 1000,
        vad_events: true,
        encoding: 'mulaw',
        sample_rate: 8000,
      });

      this.deepgramLive.on('open', () => {
        console.log('[deepgram] Connection opened');
      });

      this.deepgramLive.on('Results', (data) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          console.log('[deepgram] User said:', transcript);
          this.currentTranscript += ' ' + transcript;
          this.scheduleProcessTranscript();
        }
      });

      this.deepgramLive.on('SpeechStarted', () => {
        console.log('[deepgram] Speech started');
        this.isSpeaking = true;
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      });

      this.deepgramLive.on('UtteranceEnd', () => {
        console.log('[deepgram] Utterance ended');
        this.isSpeaking = false;
        this.scheduleProcessTranscript();
      });

      this.deepgramLive.on('error', (error) => {
        console.error('[deepgram] Error:', error);
      });

      this.deepgramLive.on('close', () => {
        console.log('[deepgram] Connection closed');
      });

    } catch (error) {
      console.error('[deepgram] Initialization error:', error);
    }
  }

  scheduleProcessTranscript() {
    // Wait 500ms of silence before processing
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(() => {
      const transcript = this.currentTranscript.trim();
      if (transcript && !this.isSpeaking) {
        console.log('[tts] Processing complete utterance:', transcript);
        this.processUserSpeech(transcript);
        this.currentTranscript = '';
      }
    }, 500);
  }

  async processUserSpeech(transcript) {
    // Log user speech
    appendTranscript(this.testName, 'user', transcript);
    try {
      metrics.aiTranscriptUser = (metrics.aiTranscriptUser || 0) + 1;
    } catch {}

    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: transcript,
    });

    // Generate and send response
    await this.generateAndSendResponse(transcript);
  }

  async generateAndSendResponse(userMessage) {
    try {
      console.log('[gpt-4] Generating response...');

      // Call GPT-4 in text mode
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',  // GPT-4 Omni model
        messages: this.conversationHistory,
        temperature: 0.8,
        max_tokens: 150,
      });

      const responseText = completion.choices[0]?.message?.content;

      if (!responseText) {
        console.error('[gpt-4] No response generated');
        return;
      }

      console.log('[gpt-4] AI response:', responseText);

      // Add to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: responseText,
      });

      // Log AI response
      appendTranscript(this.testName, 'assistant', responseText);
      try {
        metrics.aiTranscriptAssistant = (metrics.aiTranscriptAssistant || 0) + 1;
      } catch {}

      // Convert to speech and send to Twilio
      await this.convertToSpeechAndSend(responseText);

    } catch (error) {
      console.error('[gpt-4] Error:', error.message);
      try {
        metrics.aiErrors = (metrics.aiErrors || 0) + 1;
      } catch {}
    }
  }

  async convertToSpeechAndSend(text) {
    try {
      console.log('[elevenlabs] Converting to speech...');

      const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Josh voice

      // Generate audio stream
      const audioStream = await this.elevenlabs.textToSpeech.convert(voiceId, {
        text,
        model_id: 'eleven_turbo_v2_5',  // Faster model for real-time
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
        output_format: 'pcm_16000', // �-law 8kHz - native Twilio format\!
      });

      console.log('[elevenlabs] Audio generated, streaming to Twilio...');

      // Stream audio to Twilio
      let chunkCount = 0;
      for await (const chunk of audioStream) {
        if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
          // Encode as base64 for Twilio media message
          const base64Audio = chunk.toString('base64');

          const twilioMessage = {
            event: 'media',
            streamSid: this.twilioStreamSid || undefined,
            media: {
              payload: base64Audio,
            },
          };

          this.twilioWs.send(JSON.stringify(twilioMessage));
          chunkCount++;

          try {
            metrics.aiResponses = (metrics.aiResponses || 0) + 1;
          } catch {}
        }
      }

      console.log(`[elevenlabs] Sent ${chunkCount} audio chunks to Twilio`);

    } catch (error) {
      console.error('[elevenlabs] Error:', error.message);
      try {
        metrics.aiErrors = (metrics.aiErrors || 0) + 1;
      } catch {}
    }
  }

  handleTwilioAudio(audioBuffer) {
    // Send audio to Deepgram for transcription
    if (this.deepgramLive && this.deepgramLive.getReadyState() === 1) {
      try {
        // Deepgram expects raw audio data
        this.deepgramLive.send(audioBuffer);
        this.lastAudioAt = Date.now();
      } catch (error) {
        console.error('[deepgram] Send error:', error.message);
      }
    }
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

Keep it natural and conversational. If they ask questions, answer briefly and stay on track.

IMPORTANT: Keep responses brief (1-2 sentences max). This is a phone call, not a chat.`;
  }

  disconnect() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    if (this.deepgramLive) {
      try {
        this.deepgramLive.finish();
      } catch {}
    }

    console.log('[tts] Session disconnected');
  }
}

module.exports = { TtsSession };
