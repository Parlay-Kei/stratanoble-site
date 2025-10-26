import { buildTwiml } from '@/app/api/voice/twiml/route';

describe('twiml builder', () => {
  it('produces TwiML with greeting and stream URL (GET)', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.test';
    const req: any = { nextUrl: { searchParams: new URLSearchParams([['testName','Unit']]) } };
    const xml = buildTwiml(req);
    expect(xml).toContain('<Response>');
    expect(xml).toContain('<Say>');
    expect(xml).toContain('wss://example.test/api/media-stream?testName=Unit');
  });
});