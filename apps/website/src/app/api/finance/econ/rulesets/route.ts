/**
 * CFO Agent API: Rulesets Management
 *
 * GET /finance/econ/rulesets - Get all rulesets
 * PUT /finance/econ/rulesets - Update a ruleset (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// GET /finance/econ/rulesets
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
    const rulesetKey = searchParams.get('ruleset_key');
    const enabledOnly = searchParams.get('enabled_only') !== 'false';

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query
    let query = supabase.from('finance.rulesets').select('*');

    if (rulesetKey) {
      query = query.eq('ruleset_key', rulesetKey);
    }

    if (enabledOnly) {
      query = query.eq('enabled', true);
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
    console.error('[CFO Agent] Rulesets GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /finance/econ/rulesets
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
    const { ruleset_key, rules, description, version, enabled } = body;

    if (!ruleset_key) {
      return NextResponse.json(
        { error: 'Missing required field: ruleset_key' },
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

    if (rules !== undefined) updateData.rules = rules;
    if (description !== undefined) updateData.description = description;
    if (version !== undefined) updateData.version = version;
    if (enabled !== undefined) updateData.enabled = enabled;

    // Update ruleset
    const { data, error } = await supabase
      .from('finance.rulesets')
      .update(updateData)
      .eq('ruleset_key', ruleset_key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Ruleset "${ruleset_key}" updated successfully`,
    });
  } catch (error) {
    console.error('[CFO Agent] Rulesets PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
