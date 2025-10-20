import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER_PRIMARY as string;

if (!accountSid || !authToken) {
  // Do not throw at import-time to avoid build crashes; log for visibility
  console.warn('[twilio] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
}

const apiKey = process.env.TWILIO_API_KEY as string;
const apiSecret = process.env.TWILIO_API_SECRET as string;

let twilioClientLocal: ReturnType<typeof twilio> | null = null;
if (apiKey && apiSecret && accountSid) {
  // Prefer API Key/Secret when provided
  twilioClientLocal = twilio(apiKey, apiSecret, { accountSid });
} else {
  twilioClientLocal = twilio(accountSid, authToken);
}

export const twilioClient = twilioClientLocal as ReturnType<typeof twilio>;

export interface CallParams {
  to: string;
  testName?: string;
  metadata?: Record<string, any>;
}

export async function initiateTestCall(params: CallParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stratanoble.com';

  if (!phoneNumber) {
    throw new Error('Missing TWILIO_PHONE_NUMBER_PRIMARY');
  }

  try {
    const call = await (twilioClient as any).calls.create({
      to: params.to,
      from: phoneNumber,
      url: `${baseUrl}/api/voice/twiml?testName=${encodeURIComponent(params.testName || 'test')}`,
      statusCallback: `${baseUrl}/api/voice/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
    });

    console.log(`[twilio] Test call initiated: ${call.sid}`);
    return { success: true, callSid: call.sid };
  } catch (error: any) {
    console.error('[twilio] Call failed:', error?.message || error);
    throw error;
  }
}