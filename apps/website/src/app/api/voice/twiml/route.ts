import { NextRequest, NextResponse } from 'next/server';

function voicemailTwiml(message: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${message}</Say>
  <Hangup/>
</Response>`;
}

function conversationTwiml(baseUrl: string, campaignType: string = 'internet') {
  // Use Twilio Say with GPT-4 conversation intelligence
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>${baseUrl}/api/voice/conversation?campaignType=${campaignType}</Redirect>
</Response>`;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const testName = sp.get('testName') || 'test';
  const campaignType = sp.get('campaignType') || 'internet';
  const answeredBy = sp.get('AnsweredBy') || '';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stratanoble.com';

  const twiml = answeredBy.toLowerCase() === 'machine'
    ? voicemailTwiml("Hello, this is StrataNoble. Sorry we missed you. We'll follow up soon. Goodbye.")
    : conversationTwiml(baseUrl, campaignType);

  return new NextResponse(twiml, { headers: { 'Content-Type': 'application/xml' } });
}

export async function POST(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const testName = sp.get('testName') || 'test';
  const campaignType = sp.get('campaignType') || 'internet';
  let answeredBy = sp.get('AnsweredBy') || '';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stratanoble.com';

  try {
    const form = await request.formData();
    const ab = form.get('AnsweredBy');
    if (typeof ab === 'string' && ab) answeredBy = ab;
  } catch {}

  const twiml = (answeredBy || '').toLowerCase() === 'machine'
    ? voicemailTwiml("Hello, this is StrataNoble. Sorry we missed you. We'll follow up soon. Goodbye.")
    : conversationTwiml(baseUrl, campaignType);

  return new NextResponse(twiml, { headers: { 'Content-Type': 'application/xml' } });
}
