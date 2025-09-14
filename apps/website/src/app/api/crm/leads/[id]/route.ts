import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const lead = await db.getLead(id);
    
    return NextResponse.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Lead retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Lead not found',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json();
    
    // Validate allowed update fields
    const allowedFields = [
      'stage', 'assigned_to', 'notes', 'priority', 'achievery_user_id',
      'assigned_tasks', 'completed_tasks'
    ];
    
    const updates: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    const lead = await db.updateLead(id, updates);

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });

  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}