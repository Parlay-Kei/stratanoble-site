// NOTE: Twilio Media Streams require a WebSocket endpoint. Next.js route handlers
// do not automatically expose Node "upgrade" events in all deployments.
// This file provides a placeholder and logs the upgrade intent. For local dev,
// you may need to run a custom Node server to attach a `ws` WebSocketServer to the HTTP server.
//
// If your platform supports WebSocketPair (Edge), you can implement using that API instead.

import type { NextRequest } from 'next/server';
import { callManager } from '@/lib/call-manager';
import { RealtimeSession } from '@/lib/openai-realtime';

// Placeholder 101 response; not a real WebSocket upgrade.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testName = searchParams.get('testName') || 'test';
  console.log('[media-stream] Upgrade requested for:', testName);

  // This 101 response is NOT a functional WS upgrade in Next route handlers.
  // Implement actual WS handling with a custom server or Edge WebSocketPair.
  return new Response(null, {
    status: 101,
    headers: {
      Upgrade: 'websocket',
      Connection: 'Upgrade',
    },
  });
}

// Example server-side handler logic for a `ws` server (not active here):
//
// import { WebSocketServer, WebSocket } from 'ws';
// const wss = new WebSocketServer({ noServer: true });
//
// wss.on('connection', async (ws: WebSocket, request) => {
//   const url = new URL(request.url!, `http://${request.headers.host}`);
//   const testName = url.searchParams.get('testName') || 'test';
//   console.log(`[media-stream] WebSocket connected for test: ${testName}`);
//
//   const session = new RealtimeSession(ws as any, testName);
//   await session.connect();
//
//   ws.on('message', (raw) => {
//     const message = JSON.parse(raw.toString());
//     switch (message.event) {
//       case 'connected':
//         console.log('[media-stream] Twilio connected');
//         break;
//       case 'start':
//         console.log('[media-stream] Stream started:', message.streamSid);
//         callManager.setStreamSid(testName, message.streamSid);
//         session.setTwilioStreamSid(message.streamSid);
//         break;
//       case 'media': {
//         const audioBuffer = Buffer.from(message.media.payload, 'base64');
//         session.handleTwilioAudio(audioBuffer);
//         break; }
//       case 'stop':
//         console.log('[media-stream] Stream stopped');
//         session.disconnect();
//         break;
//     }
//   });
//
//   ws.on('close', () => {
//     console.log('[media-stream] Connection closed');
//     session.disconnect();
//   });
// });