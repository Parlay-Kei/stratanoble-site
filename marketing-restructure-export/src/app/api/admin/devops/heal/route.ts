import { NextResponse } from 'next/server';
import { SelfHealingAgent } from '@/lib/self-healing-agent';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/devops/heal
 * Get last healing report
 */
export async function GET() {
  try {
    const agent = SelfHealingAgent.getInstance();
    const report = agent.getLastReport();

    if (!report) {
      return NextResponse.json(
        { error: 'No healing report available yet' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to get healing report:', error);
    return NextResponse.json(
      { error: 'Failed to get healing report' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/devops/heal
 * Trigger manual healing cycle
 */
export async function POST() {
  try {
    const agent = SelfHealingAgent.getInstance();
    const report = await agent.runHealingCycle();

    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to run healing cycle:', error);
    return NextResponse.json(
      { error: 'Failed to run healing cycle' },
      { status: 500 }
    );
  }
}
