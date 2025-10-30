const http = require('http');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const WebSocket = require('ws');
const url = require('url');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { RealtimeSession } = require('./realtime-session');
const { TtsSession } = require('./tts-session');
const { metrics } = require('./metrics');

// Mode selection: TTS workaround or OpenAI Realtime API
const USE_TTS_MODE = process.env.USE_TTS_MODE === 'true';

console.log(`\n🎙️  Voice AI Gateway Mode: ${USE_TTS_MODE ? 'TTS WORKAROUND (Deepgram + GPT-4 + ElevenLabs)' : 'OPENAI REALTIME API'}\n`);

function getOpenAIKey() {
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) return process.env.OPENAI_API_KEY.trim();
    const keyFile = path.join(__dirname, 'openai.key');
    if (fs.existsSync(keyFile)) {
      const k = fs.readFileSync(keyFile, 'utf8').trim();
      if (k) return k;
    }
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8');
      const m = raw.match(/^OPENAI_API_KEY=(.+)$/m);
      if (m && m[1]) return m[1].trim();
    }
  } catch {}
  return '';
}

// Propagate key to env for downstream usage
try {
  const k = getOpenAIKey();
  if (k) process.env.OPENAI_API_KEY = k;
} catch {}

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const NEXT_TARGET = process.env.NEXT_TARGET || 'http://127.0.0.1:3000';
const PORT = Number(process.env.PORT || 4000);

function proxyToNext(req, res) {
  const target = new URL(NEXT_TARGET);
  const options = {
    hostname: target.hostname,
    port: target.port || 80,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: target.host },
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (err) => {
    logger.error({ err }, 'proxy error');
    res.statusCode = 502;
    res.end('Bad Gateway');
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.url && req.url.startsWith('/healthz')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', mode: USE_TTS_MODE ? 'tts' : 'realtime', metrics }));
    return;
  }
  if (req.url && req.url.startsWith('/readyz')) {
    const ready = Boolean(getOpenAIKey());
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ready, mode: USE_TTS_MODE ? 'tts' : 'realtime', checks: { openaiKey: ready } }));
    return;
  }
  if (req.url && req.url.startsWith('/metrics')) {
    const up = Math.floor((Date.now() - (metrics.startedAt || Date.now())) / 1000);
    const svc = process.env.SERVICE_NAME || 'voice';
    const env = process.env.NODE_ENV || 'development';
    const lines = [
      '# HELP voice_ws_connections Total WebSocket connections',
      '# TYPE voice_ws_connections counter',
      `voice_ws_connections{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.wsConnections || 0}`,
      '# HELP voice_ws_messages Total WebSocket messages received',
      '# TYPE voice_ws_messages counter',
      `voice_ws_messages{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.wsMessages || 0}`,
      '# HELP voice_ws_media_frames Total media frames received',
      '# TYPE voice_ws_media_frames counter',
      `voice_ws_media_frames{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.wsMediaFrames || 0}`,
      '# HELP voice_ws_errors Total WebSocket parse errors',
      '# TYPE voice_ws_errors counter',
      `voice_ws_errors{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.wsErrors || 0}`,
      '# HELP voice_ai_responses Total AI audio responses',
      '# TYPE voice_ai_responses counter',
      `voice_ai_responses{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.aiResponses || 0}`,
      '# HELP voice_ai_errors Total AI errors',
      '# TYPE voice_ai_errors counter',
      `voice_ai_errors{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.aiErrors || 0}`,
      '# HELP voice_ai_transcripts_user User transcription count',
      '# TYPE voice_ai_transcripts_user counter',
      `voice_ai_transcripts_user{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.aiTranscriptUser || 0}`,
      '# HELP voice_ai_transcripts_assistant Assistant transcript count',
      '# TYPE voice_ai_transcripts_assistant counter',
      `voice_ai_transcripts_assistant{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${metrics.aiTranscriptAssistant || 0}`,
      '# HELP voice_uptime_seconds Voice server uptime in seconds',
      '# TYPE voice_uptime_seconds gauge',
      `voice_uptime_seconds{service="${svc}",env="${env}",mode="${USE_TTS_MODE ? 'tts' : 'realtime'}"} ${up}`,
    ].join('\n');
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.end(lines + '\n');
    return;
  }
  proxyToNext(req, res);
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', async (ws, request) => {
  const { query } = url.parse(request.url, true);
  const testName = query.testName || 'test';
  metrics.wsConnections = (metrics.wsConnections || 0) + 1;
  logger.info({ testName, mode: USE_TTS_MODE ? 'tts' : 'realtime' }, '[media-stream] ws connected');

  // Choose session type based on mode
  const session = USE_TTS_MODE
    ? new TtsSession(ws, testName)
    : new RealtimeSession(ws, testName);

  await session.connect();

  ws.on('message', (raw) => {
    metrics.wsMessages = (metrics.wsMessages || 0) + 1;
    try {
      const message = JSON.parse(raw.toString());
      switch (message.event) {
        case 'connected':
          logger.info('[media-stream] twilio connected');
          break;
        case 'start': {
          const sid = message.streamSid || message.start?.streamSid;
          if (sid) {
            logger.info({ streamSid: sid }, '[media-stream] stream started');
            session.setTwilioStreamSid(sid);
          }
          break; }
        case 'media': {
          metrics.wsMediaFrames = (metrics.wsMediaFrames || 0) + 1;
          const audioBuffer = Buffer.from(message.media.payload, 'base64');
          session.handleTwilioAudio(audioBuffer);
          break; }
        case 'stop':
          logger.info('[media-stream] stream stopped');
          session.disconnect();
          break;
      }
    } catch (err) {
      metrics.wsErrors = (metrics.wsErrors || 0) + 1;
      logger.error({ err }, '[media-stream] ws message parse error');
    }
  });

  ws.on('close', () => {
    logger.info('[media-stream] ws closed');
    session.disconnect();
  });
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = url.parse(request.url);
  if (pathname && pathname.startsWith('/api/media-stream')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  logger.info({
    port: PORT,
    next: NEXT_TARGET,
    mode: USE_TTS_MODE ? 'TTS WORKAROUND' : 'OPENAI REALTIME',
    architecture: USE_TTS_MODE
      ? 'Deepgram STT → GPT-4 → ElevenLabs TTS'
      : 'OpenAI Realtime API (voice-to-voice)',
  }, 'voice gateway ready');

  if (USE_TTS_MODE) {
    console.log('\n✅ TTS Mode Active:');
    console.log('   - Speech-to-Text: Deepgram');
    console.log('   - Conversation: GPT-4 Turbo');
    console.log('   - Text-to-Speech: ElevenLabs');
    console.log('   - Cost: ~$0.29/call\n');
  } else {
    console.log('\n⚠️  Realtime API Mode (currently broken due to OpenAI bug)');
    console.log('   - To enable TTS mode: USE_TTS_MODE=true in .env.local\n');
  }
});
