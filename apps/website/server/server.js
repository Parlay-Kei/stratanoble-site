const http = require('http');
const next = require('next');
const pino = require('pino');
const WebSocket = require('ws');
const url = require('url');
const { RealtimeSession } = require('./realtime-session');
const { metrics } = require('./metrics');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    if (req.url && req.url.startsWith('/healthz')) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok', metrics }));
      return;
    }
    if (req.url && req.url.startsWith('/readyz')) {
      const ready = Boolean(process.env.OPENAI_API_KEY);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ready, checks: { openaiKey: ready } }));
      return;
    }
    if (req.url && req.url.startsWith('/metrics')) {
      const up = Math.floor((Date.now() - (metrics.startedAt || Date.now())) / 1000);
      const svc = process.env.SERVICE_NAME || 'voice';
      const env = process.env.NODE_ENV || 'development';
      const lines = [
        '# HELP voice_ws_connections Total WebSocket connections',
        '# TYPE voice_ws_connections counter',
        `voice_ws_connections{service="${svc}",env="${env}"} ${metrics.wsConnections || 0}`,
        '# HELP voice_ws_messages Total WebSocket messages received',
        '# TYPE voice_ws_messages counter',
        `voice_ws_messages{service="${svc}",env="${env}"} ${metrics.wsMessages || 0}`,
        '# HELP voice_ws_media_frames Total media frames received',
        '# TYPE voice_ws_media_frames counter',
        `voice_ws_media_frames{service="${svc}",env="${env}"} ${metrics.wsMediaFrames || 0}`,
        '# HELP voice_ws_errors Total WebSocket parse errors',
        '# TYPE voice_ws_errors counter',
        `voice_ws_errors{service="${svc}",env="${env}"} ${metrics.wsErrors || 0}`,
        '# HELP voice_ai_responses Total AI audio responses',
        '# TYPE voice_ai_responses counter',
        `voice_ai_responses{service="${svc}",env="${env}"} ${metrics.aiResponses || 0}`,
        '# HELP voice_ai_errors Total AI errors',
        '# TYPE voice_ai_errors counter',
        `voice_ai_errors{service="${svc}",env="${env}"} ${metrics.aiErrors || 0}`,
        '# HELP voice_ai_transcripts_user User transcription count',
        '# TYPE voice_ai_transcripts_user counter',
        `voice_ai_transcripts_user{service="${svc}",env="${env}"} ${metrics.aiTranscriptUser || 0}`,
        '# HELP voice_ai_transcripts_assistant Assistant transcript count',
        '# TYPE voice_ai_transcripts_assistant counter',
        `voice_ai_transcripts_assistant{service="${svc}",env="${env}"} ${metrics.aiTranscriptAssistant || 0}`,
        '# HELP voice_jobs_queued Total jobs enqueued',
        '# TYPE voice_jobs_queued counter',
        `voice_jobs_queued{service="${svc}",env="${env}"} ${metrics.jobsQueued || 0}`,
        '# HELP voice_jobs_started Total jobs started',
        '# TYPE voice_jobs_started counter',
        `voice_jobs_started{service="${svc}",env="${env}"} ${metrics.jobsStarted || 0}`,
        '# HELP voice_jobs_completed Total jobs completed',
        '# TYPE voice_jobs_completed counter',
        `voice_jobs_completed{service="${svc}",env="${env}"} ${metrics.jobsCompleted || 0}`,
        '# HELP voice_jobs_failed Total jobs failed',
        '# TYPE voice_jobs_failed counter',
        `voice_jobs_failed{service="${svc}",env="${env}"} ${metrics.jobsFailed || 0}`,
        '# HELP voice_jobs_retried Total jobs retried',
        '# TYPE voice_jobs_retried counter',
        `voice_jobs_retried{service="${svc}",env="${env}"} ${metrics.jobsRetried || 0}`,
        '# HELP voice_jobs_suppressed Total jobs suppressed by DNC or window',
        '# TYPE voice_jobs_suppressed counter',
        `voice_jobs_suppressed{service="${svc}",env="${env}"} ${metrics.jobsSuppressed || 0}`,        '# HELP voice_cps_current Current CPS observed by worker',
        '# TYPE voice_cps_current gauge',
        `voice_cps_current{service="${svc}",env="${env}"} ${metrics.cpsCurrent || 0}`,
        '# HELP voice_uptime_seconds Voice server uptime in seconds',
        '# TYPE voice_uptime_seconds gauge',
        `voice_uptime_seconds{service="${svc}",env="${env}"} ${up}`,
      ].join('\n');
      res.setHeader('Content-Type', 'text/plain; version=0.0.4');
      res.end(lines + '\n');
      return;
    }
    handle(req, res);
  });

  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', async (ws, request) => {
    const { query } = url.parse(request.url, true);
    const testName = query.testName || 'test';

    metrics.wsConnections = (metrics.wsConnections || 0) + 1;
    logger.info({ testName }, '[media-stream] ws connected');

    const session = new RealtimeSession(ws, testName);
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
            break;
          }
          case 'media': {
            metrics.wsMediaFrames = (metrics.wsMediaFrames || 0) + 1;
            const audioBuffer = Buffer.from(message.media.payload, 'base64');
            session.handleTwilioAudio(audioBuffer);
            break;
          }
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

  server.listen(port, () => {
    logger.info({ port }, 'voice dev ready');
  });
});
