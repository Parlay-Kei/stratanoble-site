/**
 * CFO Agent API: Snapshot Endpoint
 *
 * GET  /finance/econ/snapshot - Get latest snapshot for a segment
 * POST /finance/econ/snapshot - Create new snapshot
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// GET /finance/econ/snapshot
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
    const segmentId = searchParams.get('segment_id') || 'direct_cuts_marketplace';
    const period = searchParams.get('period');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query
    let query = supabase
      .from('finance.metric_snapshots')
      .select('*')
      .eq('segment_id', segmentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (period) {
      query = query.eq('period', period);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('[CFO Agent] Snapshot GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /finance/econ/snapshot
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      entity_id = 'STRATANOBLE',
      segment_id,
      period,
      period_type = 'daily',
    } = body;

    // Validate required fields
    if (!segment_id) {
      return NextResponse.json(
        { error: 'Missing required field: segment_id' },
        { status: 400 }
      );
    }

    if (!period) {
      return NextResponse.json(
        { error: 'Missing required field: period' },
        { status: 400 }
      );
    }

    // TODO: Import and call the actual skill
    // import { composeSnapshot } from '@/server/finance/econ/skills';
    // const result = await composeSnapshot(entity_id, segment_id, period, period_type);

    // Placeholder response
    const snapshot = {
      id: crypto.randomUUID(),
      entity_id,
      segment_id,
      period,
      period_type,
      metrics: {},
      policy_version: 'v1',
      ruleset_version: 'v1',
      data_quality: {
        stripe_sync_lag_minutes: null,
        bank_sync_lag_hours: null,
        accounting_sync_lag_hours: null,
        missing_feeds: ['stripe', 'bank', 'accounting'],
        warnings: ['Snapshot composer not yet integrated'],
      },
      is_closed: false,
      confidence: 'low',
      created_at: new Date().toISOString(),
      created_by: 'cfo_agent',
    };

    return NextResponse.json(
      {
        success: true,
        data: snapshot,
        warnings: ['CFO Agent skills pending integration'],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CFO Agent] Snapshot POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
