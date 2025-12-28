import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    if (status === 'pending') {
      // Get pending email sequences ready to send
      const pendingSequences = await db.getPendingEmailSequences();
      
      return NextResponse.json({
        success: true,
        data: pendingSequences,
        total: pendingSequences.length
      });
    }

    // For now, return empty array for other status requests
    // This would be expanded to handle other sequence queries
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      message: 'Email sequence filtering not implemented for this status'
    });

  } catch (error) {
    console.error('Email sequence retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve email sequences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.sequence_id || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: sequence_id, status' },
        { status: 400 }
      );
    }

    const allowedStatuses = ['sending', 'sent', 'failed', 'cancelled'];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedSequence = await db.updateEmailSequenceStatus(
      body.sequence_id,
      body.status,
      body.error_message,
      body.email_provider_id
    );

    return NextResponse.json({
      success: true,
      message: 'Email sequence status updated',
      data: updatedSequence
    });

  } catch (error) {
    console.error('Email sequence update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update email sequence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}