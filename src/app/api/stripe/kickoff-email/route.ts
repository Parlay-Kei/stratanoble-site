import { NextRequest, NextResponse } from 'next/server';
import { sendKickoffEmail } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Send kickoff email
    const result = await sendKickoffEmail(sessionId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Kickoff email sent successfully',
        customer_email: result.customer_email,
        package_type: result.package_type
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send kickoff email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Kickoff email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
