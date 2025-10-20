import { NextRequest, NextResponse } from 'next/server';

export function buildTwiml(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testName = searchParams.get('testName') || 'test';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stratanoble.com';
  const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hi! This is a StrataNoble test call. Connecting you to our AI.</Say>
  <Connect>
    <Stream url="${wsUrl}/api/media-stream?testName=${encodeURIComponent(testName)}">
      <Parameter name="testName" value="${testName}" />
    </Stream>
  </Connect>
</Response>`;
  return twiml;
}

export async function GET(request: NextRequest) {
  const twiml = buildTwiml(request);
  return new NextResponse(twiml, { headers: { 'Content-Type': 'application/xml' } });
}

export async function POST(request: NextRequest) {
  const twiml = buildTwiml(request);
  return new NextResponse(twiml, { headers: { 'Content-Type': 'application/xml' } });
}

