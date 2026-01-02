/**
 * CFO Agent API: Schedules Management
 *
 * GET /finance/econ/schedules - Get all scheduled jobs
 * PUT /finance/econ/schedules - Update a schedule (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// GET /finance/econ/schedules
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const jobKey = searchParams.get('job_key');
    const enabledOnly = searchParams.get('enabled_only') !== 'false';

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query
    let query = supabase
      .from('finance.agent_schedules')
      .select('*')
      .order('cadence');

    if (jobKey) {
      query = query.eq('job_key', jobKey);
    }

    if (enabledOnly) {
      query = query.eq('enabled', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate next run times if not set
    const schedulesWithNextRun = data?.map((schedule) => ({
      ...schedule,
      is_overdue: schedule.next_run_at
        ? new Date(schedule.next_run_at) < new Date()
        : false,
    }));

    return NextResponse.json({
      success: true,
      data: schedulesWithNextRun,
      count: data?.length || 0,
      summary: {
        enabled: data?.filter((s) => s.enabled).length || 0,
        disabled: data?.filter((s) => !s.enabled).length || 0,
        overdue: schedulesWithNextRun?.filter((s) => s.is_overdue).length || 0,
      },
    });
  } catch (error) {
    console.error('[CFO Agent] Schedules GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /finance/econ/schedules
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    // Validate API key (admin only)
    const apiKey = request.headers.get('x-api-key');
    const adminKey = request.headers.get('x-admin-key');

    if (!apiKey || !adminKey) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { job_key, cadence, run_at_time, timezone, enabled } = body;

    if (!job_key) {
      return NextResponse.json(
        { error: 'Missing required field: job_key' },
        { status: 400 }
      );
    }

    // Validate cadence if provided
    const validCadences = ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'on_demand'];
    if (cadence && !validCadences.includes(cadence)) {
      return NextResponse.json(
        { error: `Invalid cadence. Must be one of: ${validCadences.join(', ')}` },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (cadence !== undefined) updateData.cadence = cadence;
    if (run_at_time !== undefined) updateData.run_at_time = run_at_time;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (enabled !== undefined) updateData.enabled = enabled;

    // Update schedule
    const { data, error } = await supabase
      .from('finance.agent_schedules')
      .update(updateData)
      .eq('job_key', job_key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Schedule "${job_key}" updated successfully`,
    });
  } catch (error) {
    console.error('[CFO Agent] Schedules PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
