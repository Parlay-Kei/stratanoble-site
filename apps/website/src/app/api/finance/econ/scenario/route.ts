/**
 * CFO Agent API: Scenario Planner
 *
 * POST /finance/econ/scenario - Run a scenario simulation
 * GET  /finance/econ/scenario - Get scenario history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// GET /finance/econ/scenario
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
    const entityId = searchParams.get('entity_id') || 'STRATANOBLE';
    const scenarioType = searchParams.get('scenario_type');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query
    let query = supabase
      .from('finance.scenario_runs')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (scenarioType) {
      query = query.eq('scenario_type', scenarioType);
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
    console.error('[CFO Agent] Scenario GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /finance/econ/scenario
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
      scenario_type,
      name,
      description,
      inputs,
      baseline_snapshot_id,
    } = body;

    // Validate required fields
    if (!scenario_type || !name || !inputs) {
      return NextResponse.json(
        { error: 'Missing required fields: scenario_type, name, inputs' },
        { status: 400 }
      );
    }

    // Validate scenario type
    const validTypes = ['pricing_change', 'marketing_spend', 'hiring', 'feature_launch'];
    if (!validTypes.includes(scenario_type)) {
      return NextResponse.json(
        { error: `Invalid scenario_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // TODO: Import and call the actual skill
    // import { runScenario } from '@/server/finance/econ/skills';
    // const result = await runScenario(entity_id, segment_id, scenario_type, name, inputs);

    // Placeholder scenario run
    const scenarioRun = {
      id: crypto.randomUUID(),
      entity_id,
      segment_id,
      scenario_type,
      name,
      description: description || `${scenario_type} scenario: ${name}`,
      inputs,
      outputs: {
        projected_revenue: [],
        projected_costs: [],
        projected_margin: [],
        runway_months: 0,
        payback_months: null,
        break_even_month: null,
        sensitivity_analysis: {},
      },
      assumptions: {
        placeholder: 'Scenario planner not yet fully implemented',
      },
      baseline_snapshot_id,
      policy_version: 'v1',
      created_at: new Date().toISOString(),
      created_by: 'cfo_agent',
    };

    // TODO: Persist to database
    // const supabase = createClient(...);
    // await supabase.from('finance.scenario_runs').insert(scenarioRun);

    return NextResponse.json(
      {
        success: true,
        data: scenarioRun,
        warnings: ['Scenario planner output is placeholder - full implementation pending'],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CFO Agent] Scenario POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
