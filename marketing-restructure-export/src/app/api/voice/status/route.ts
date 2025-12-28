import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const ENABLE_SIGNATURE_CHECK = process.env.TWILIO_VALIDATE_SIGNATURE === 'true';

function appendJsonl(relPath: string, obj: any) {
  try {
    const base = process.cwd();
    const p = path.join(base, relPath);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.appendFileSync(p, JSON.stringify(obj) + '\n');
  } catch (e) {
    console.error('[voice/status] file write error', e);
  }
}

function verifyTwilioSignature(_req: NextRequest, _body: URLSearchParams) {
  if (!ENABLE_SIGNATURE_CHECK) return true;
  // Scaffold only; enable with proper implementation when Auth Token is finalized.
  if (!process.env.TWILIO_AUTH_TOKEN) {
    console.warn('[voice/status] signature check enabled but TWILIO_AUTH_TOKEN missing');
    return true;
  }
  // TODO: Implement X-Twilio-Signature validation (HMAC-SHA1 of URL + params)
  return true;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callSid = (formData.get('CallSid') as string) || '';
  const callStatus = (formData.get('CallStatus') as string) || '';
  const callDuration = (formData.get('CallDuration') as string) || '0';
  const from = (formData.get('From') as string) || '';
  const to = (formData.get('To') as string) || '';

  if (!verifyTwilioSignature(request, new URLSearchParams())) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    callSid,
    status: callStatus,
    duration: parseInt(callDuration) || 0,
    from,
    to,
  };

  console.log(`[voice/status] Call ${callSid}:`, logEntry);
  appendJsonl('apps/website/.data/call-status.jsonl', logEntry);

  return NextResponse.json({ received: true });
}
