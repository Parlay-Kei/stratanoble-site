const WebSocket = require('ws');

function muLawSilenceFrame(bytes = 160) {
  // PCMU silence can be 0xFF bytes
  return Buffer.alloc(bytes, 0xFF);
}

function base64Frame() {
  return muLawSilenceFrame().toString('base64');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const url = process.env.EMU_WS_URL || 'ws://127.0.0.1:3000/api/media-stream?testName=Emulator';
  const streamSid = 'EMULATOR_STREAM_SID';
  const ws = new WebSocket(url);

  ws.on('open', async () => {
    console.log('[emu] Connected to', url);
    // Send connected + start like Twilio
    ws.send(JSON.stringify({ event: 'connected', protocol: 'Call' }));
    ws.send(JSON.stringify({ event: 'start', streamSid }));

    // Send a few media frames
    for (let i = 0; i < 50; i++) {
      ws.send(JSON.stringify({
        event: 'media',
        streamSid,
        media: { payload: base64Frame() }
      }));
      await sleep(20);
    }

    console.log('[emu] Sent media frames, sending stop');
    ws.send(JSON.stringify({ event: 'stop', streamSid }));
    await sleep(100);
    ws.close();
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log('[emu] <-', data);
    } catch {
      // ignore
    }
  });

  ws.on('error', (e) => console.error('[emu] WS error', e.message));
  ws.on('close', () => console.log('[emu] Closed'));
}

run().catch((e) => {
  console.error('[emu] Fatal', e);
  process.exit(1);
});