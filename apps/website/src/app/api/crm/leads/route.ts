import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Development mode bypass if Supabase not configured
    const hasSupabaseConfig = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url' &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!hasSupabaseConfig && process.env.NODE_ENV === 'development') {
      console.warn('[CRM] Supabase not configured; returning mock response');
      console.warn('[CRM] Lead data received:', JSON.stringify(body, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Lead created successfully (development mode - database not connected)',
        data: {
          id: `dev-lead-${Date.now()}`,
          email: body.email,
          stage: 'discovery',
          sequences_scheduled: 4
        },
        note: 'Apply database migrations to enable full CRM functionality'
      }, { status: 201 });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'business_stage', 'main_challenge', 'interested_tier'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Extract UTM parameters and referrer from headers/request
    const searchParams = request.nextUrl.searchParams;
    const headers = request.headers;
    
    const leadData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      passion_area: body.passion_area,
      business_stage: body.business_stage,
      main_challenge: body.main_challenge,
      time_commitment: body.time_commitment,
      success_goal: body.success_goal,
      interested_tier: body.interested_tier,
      utm_source: body.utm_source || searchParams.get('utm_source'),
      utm_medium: body.utm_medium || searchParams.get('utm_medium'),
      utm_campaign: body.utm_campaign || searchParams.get('utm_campaign'),
      referrer: body.referrer || headers.get('referer'),
      metadata: {
        user_agent: headers.get('user-agent'),
        ip_address: headers.get('x-forwarded-for') || headers.get('x-real-ip'),
        submitted_at: new Date().toISOString(),
        form_version: '7-step-discovery',
        ...body.metadata
      }
    };

    // Create the lead in database
    const lead = await db.createLead(leadData);

    // Schedule email sequences for the new lead
    try {
      const sequences = await db.scheduleEmailSequences(
        lead.id,
        lead.email,
        lead.name,
        lead.business_stage,
        lead.main_challenge
      );

      if (process.env.NODE_ENV === 'development') {
        console.warn(`Scheduled ${sequences.length} email sequences for lead ${lead.id}`);
      }
    } catch (emailError) {
      console.error('Failed to schedule email sequences:', emailError);
      // Don't fail the lead creation if email scheduling fails
    }

    // Log the email for the immediate confirmation
    try {
      await db.logEmail({
        recipient: lead.email,
        subject: 'Thanks for your discovery request - Let\'s schedule your call',
        template: 'discovery_confirmation',
        status: 'pending',
        metadata: {
          lead_id: lead.id,
          sequence_type: 'discovery_confirmation'
        }
      });
    } catch (logError) {
      console.error('Failed to log confirmation email:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      data: {
        id: lead.id,
        email: lead.email,
        stage: lead.stage,
        sequences_scheduled: 4 // Standard sequence count
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      stage: searchParams.get('stage') as any,
      business_stage: searchParams.get('business_stage') || undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      priority: searchParams.get('priority') ? parseInt(searchParams.get('priority')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const leads = await db.getLeads(filters);

    return NextResponse.json({
      success: true,
      data: leads,
      total: leads.length,
      filters: filters
    });

  } catch (error) {
    console.error('Lead retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve leads',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



