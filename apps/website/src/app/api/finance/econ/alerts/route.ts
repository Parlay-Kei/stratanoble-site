/**
 * CFO Agent API: Alerts Endpoint
 *
 * GET /finance/econ/alerts - Get active alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entity_id') || 'STRATANOBLE';
    const segmentId = searchParams.get('segment_id');
    const severity = searchParams.get('severity');
    const includeResolved = searchParams.get('include_resolved') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query
    let query = supabase
      .from('finance.alert_events')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (segmentId) {
      query = query.eq('segment_id', segmentId);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (!includeResolved) {
      query = query.is('resolved_at', null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by severity
    const grouped = {
      critical: data?.filter((a) => a.severity === 'critical') || [],
      high: data?.filter((a) => a.severity === 'high') || [],
      warning: data?.filter((a) => a.severity === 'warning') || [],
      info: data?.filter((a) => a.severity === 'info') || [],
    };

    return NextResponse.json({
      success: true,
      data,
      grouped,
      count: data?.length || 0,
      summary: {
        critical: grouped.critical.length,
        high: grouped.high.length,
        warning: grouped.warning.length,
        info: grouped.info.length,
      },
    });
  } catch (error) {
    console.error('[CFO Agent] Alerts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
