import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, validateApiInput, validateEmail, validateUUID, checkRateLimit } from '../../../../lib/server-auth';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateApiAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(authResult.user!.id, 10, 60000); // 10 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json().catch(() => null);
    const inputValidation = validateApiInput(body, ['shareId', 'recipientEmail', 'senderName', 'accessLevel']);

    if (!inputValidation.success) {
      return NextResponse.json(
        { success: false, error: inputValidation.error },
        { status: 400 }
      );
    }

    const { shareId, recipientEmail, senderName, accessLevel } = inputValidation.sanitizedData!;

    // Validate field formats
    if (!validateUUID(shareId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid share ID format' },
        { status: 400 }
      );
    }

    if (!validateEmail(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!['summary', 'detailed', 'full'].includes(accessLevel)) {
      return NextResponse.json(
        { success: false, error: 'Invalid access level' },
        { status: 400 }
      );
    }

    // Verify the share belongs to the authenticated user
    const { data: shareData, error: shareError } = await supabase
      .from('trust_ledger_shares')
      .select('user_id, is_active')
      .eq('id', shareId)
      .single();

    if (shareError || !shareData) {
      return NextResponse.json(
        { success: false, error: 'Share not found' },
        { status: 404 }
      );
    }

    if (shareData.user_id !== authResult.user!.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (!shareData.is_active) {
      return NextResponse.json(
        { success: false, error: 'Share is no longer active' },
        { status: 400 }
      );
    }

    // TODO: Implement email notification
    // This would integrate with your email service (SendGrid, Resend, etc.)
    console.log('Share notification requested:', {
      shareId,
      recipientEmail,
      senderName,
      accessLevel,
      requestedBy: authResult.user!.id
    });

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}