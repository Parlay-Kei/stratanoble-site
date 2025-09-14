import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.task_title || !body.task_description) {
      return NextResponse.json(
        { error: 'Missing required fields: task_title, task_description' },
        { status: 400 }
      );
    }

    // Get the lead to verify it exists and get details
    const lead = await db.getLead(id);
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // If lead doesn't have an ACHIEVERY user yet, they need to be converted
    if (!lead.achievery_user_id) {
      return NextResponse.json({
        success: false,
        error: 'Lead must be converted to ACHIEVERY user first',
        action_required: 'convert_to_user',
        lead: {
          id: lead.id,
          email: lead.email,
          name: lead.name
        }
      }, { status: 400 });
    }

    // Create the ACHIEVERY task (this would integrate with ACHIEVERY's task system)
    // For now, we'll simulate this by updating the lead's task count
    const updatedLead = await db.updateLead(id, {
      assigned_tasks: lead.assigned_tasks + 1
    });

    // Schedule a post-call summary email if this is the first task
    if (lead.assigned_tasks === 0) {
      try {
        // Create a custom email sequence for task assignment notification
        const emailData = {
          recipient: lead.email,
          subject: `Your first ACHIEVERY task: ${body.task_title}`,
          template: 'task_assigned',
          status: 'pending' as const,
          metadata: {
            lead_id: lead.id,
            task_title: body.task_title,
            task_description: body.task_description,
            assigned_by: body.assigned_by || 'system'
          }
        };

        await db.logEmail(emailData);
      } catch (emailError) {
        console.error('Failed to schedule task assignment email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Task assigned successfully',
      data: {
        lead: updatedLead,
        task: {
          title: body.task_title,
          description: body.task_description,
          assigned_at: new Date().toISOString(),
          assigned_by: body.assigned_by || 'system'
        }
      }
    });

  } catch (error) {
    console.error('Task assignment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assign task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}