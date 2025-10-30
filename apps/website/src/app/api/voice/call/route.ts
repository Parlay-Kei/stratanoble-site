import { NextRequest, NextResponse } from 'next/server';
import { initiateTestCall } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, testName, metadata } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    const campaignType = metadata?.campaign_type || 'internet';

    const result = await initiateTestCall({
      to: phoneNumber,
      testName: testName || 'StrataNoble Test Call',
      campaignType: campaignType,
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      callSid: result.callSid,
      message: 'Test call initiated',
      campaignType,
    });
  } catch (error: any) {
    console.error('[voice/call] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}