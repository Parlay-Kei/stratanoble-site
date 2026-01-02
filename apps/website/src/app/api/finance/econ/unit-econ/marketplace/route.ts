/**
 * CFO Agent API: Marketplace Unit Economics
 *
 * POST /finance/econ/unit-econ/marketplace - Compute marketplace unit economics
 */

import { NextRequest, NextResponse } from 'next/server';

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
      segment_id,
      period,
      gmv,
      platform_take,
      completed_orders,
      refunds = 0,
      disputes = 0,
      processor_fees = 0,
      service_discounts = 0,
      fee_waivers = 0,
    } = body;

    // Validate required fields
    if (!segment_id || !period || gmv === undefined || platform_take === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: segment_id, period, gmv, platform_take',
        },
        { status: 400 }
      );
    }

    // TODO: Import and call the actual skill
    // import { computeMarketplaceUnitEcon } from '@/server/finance/econ/skills';
    // const result = await computeMarketplaceUnitEcon(segment_id, period, { ... });

    // Calculate unit economics (simplified for stub)
    const takeRate = gmv > 0 ? (platform_take / gmv) * 100 : 0;
    const refundRate = gmv > 0 ? (refunds / gmv) * 100 : 0;
    const disputeRate = gmv > 0 ? (disputes / gmv) * 100 : 0;
    const processorFeeRate = platform_take > 0 ? (processor_fees / platform_take) * 100 : 0;

    // Contribution per order (applying policies)
    // P2: fee_waivers are contra-revenue, service_discounts are marketing expense
    const netRevenue = platform_take - fee_waivers;
    const contribution = netRevenue - processor_fees - service_discounts;
    const contributionPerOrder = completed_orders > 0 ? contribution / completed_orders : 0;

    const unitEcon = {
      period,
      segment_id,
      gmv,
      platform_revenue: platform_take,
      take_rate: takeRate,
      completed_orders,
      contribution_per_order: contributionPerOrder,
      refund_rate: refundRate,
      dispute_rate: disputeRate,
      processor_fee_rate: processorFeeRate,
      promo_impact: {
        marketing_expense: service_discounts,
        contra_revenue: fee_waivers,
      },
      policy_version: 'v1',
      policies_applied: [
        'P1:marketplace_revenue_recognition',
        'P2:promo_classification',
      ],
    };

    return NextResponse.json({
      success: true,
      data: unitEcon,
      data_freshness: {
        stripe_lag_minutes: 0,
        bank_lag_hours: null,
        accounting_lag_hours: null,
      },
      warnings: [],
    });
  } catch (error) {
    console.error('[CFO Agent] Marketplace unit econ error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
