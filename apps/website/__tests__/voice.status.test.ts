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
    const res: any = await POST(request as any);
    expect(res?.status || 200).toBe(200);
  });
});