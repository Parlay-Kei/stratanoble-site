/**
 * @jest-environment node
 */

describe('twiml builder', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.test';
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it('produces TwiML with redirect to conversation handler (GET)', async () => {
    const { GET } = await import('@/app/api/voice/twiml/route');
    const { NextRequest } = await import('next/server');

    const req = new NextRequest('https://example.test/api/voice/twiml?testName=Unit&campaignType=internet');
    const response = await GET(req);
    const xml = await response.text();

    expect(xml).toContain('<Response>');
    expect(xml).toContain('<Redirect>');
    expect(xml).toContain('https://example.test/api/voice/conversation?campaignType=internet');
  });

  it('produces voicemail TwiML when answered by machine (GET)', async () => {
    const { GET } = await import('@/app/api/voice/twiml/route');
    const { NextRequest } = await import('next/server');

    const req = new NextRequest('https://example.test/api/voice/twiml?testName=Unit&AnsweredBy=machine');
    const response = await GET(req);
    const xml = await response.text();

    expect(xml).toContain('<Response>');
    expect(xml).toContain('<Say>');
    expect(xml).toContain('<Hangup/>');
    expect(xml).not.toContain('<Redirect>');
  });

  it('handles POST requests for conversation (POST)', async () => {
    const { POST } = await import('@/app/api/voice/twiml/route');
    const { NextRequest } = await import('next/server');

    const req = new NextRequest('https://example.test/api/voice/twiml?campaignType=voip', {
      method: 'POST',
      body: new FormData(),
    });
    const response = await POST(req);
    const xml = await response.text();

    expect(xml).toContain('<Response>');
    expect(xml).toContain('<Redirect>');
    expect(xml).toContain('campaignType=voip');
  });
});
