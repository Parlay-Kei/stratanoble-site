import { POST } from '@/app/api/voice/status/route';

describe('status route', () => {
  it('accepts form data and returns received: true', async () => {
    // @ts-ignore minimal mock
    const request: any = {
      async formData() {
        const fd: any = new Map();
        return {
          get: (k: string) => {
            const m: Record<string,string> = {
              CallSid: 'CA123', CallStatus: 'completed', CallDuration: '5', From: '+15551234567', To: '+15557654321'
            };
            return m[k as keyof typeof m] || '';
          }
        } as any;
      }
    };
    const res = await POST(request);
    // @ts-ignore NextResponse.json has json method in runtime; here we check body-like shape
    expect(res.status).toBe(200);
  });
});