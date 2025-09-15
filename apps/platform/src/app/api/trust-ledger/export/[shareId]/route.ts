import { NextRequest, NextResponse } from 'next/server';
import { validateUUID, checkRateLimit } from '../../../../../lib/server-auth';
import { supabase } from '../../../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId;

    // Validate share ID format
    if (!validateUUID(shareId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid share ID format' },
        { status: 400 }
      );
    }

    // Rate limiting by IP (since this can be accessed without auth for shared links)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = checkRateLimit(`export_${clientIP}`, 5, 60000); // 5 requests per minute per IP

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Fetch and validate share details
    const { data: shareData, error: shareError } = await supabase
      .from('trust_ledger_shares')
      .select(`
        id,
        user_id,
        shared_with_email,
        access_level,
        expires_at,
        is_active,
        created_at
      `)
      .eq('id', shareId)
      .single();

    if (shareError || !shareData) {
      return NextResponse.json(
        { success: false, error: 'Share not found' },
        { status: 404 }
      );
    }

    // Validate share is active and not expired
    if (!shareData.is_active) {
      return NextResponse.json(
        { success: false, error: 'Share is no longer active' },
        { status: 403 }
      );
    }

    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Share has expired' },
        { status: 403 }
      );
    }

    // Fetch user data based on access level
    let userData: any = {};

    try {
      // Get basic user info
      const { data: clientData } = await supabase
        .from('clients')
        .select('email, tier, created_at')
        .eq('id', shareData.user_id)
        .single();

      if (clientData) {
        userData.email = clientData.email;
        userData.tier = clientData.tier;
        userData.joinedAt = clientData.created_at;
      }

      // Get data based on access level
      if (shareData.access_level === 'summary') {
        // Summary level: Just basic stats
        const { data: actionsCount } = await supabase
          .from('user_actions')
          .select('id', { count: 'exact' })
          .eq('user_id', shareData.user_id);

        userData.totalActions = actionsCount || 0;

      } else if (shareData.access_level === 'detailed') {
        // Detailed level: Include categories and phases
        const { data: actions } = await supabase
          .from('user_actions')
          .select('category, phase, logged_date, is_significant')
          .eq('user_id', shareData.user_id)
          .order('logged_date', { ascending: false });

        userData.actions = actions || [];
        userData.totalActions = actions?.length || 0;

      } else if (shareData.access_level === 'full') {
        // Full level: Include all data except sensitive original text
        const { data: actions } = await supabase
          .from('user_actions')
          .select('reframed_text, category, phase, logged_date, is_significant')
          .eq('user_id', shareData.user_id)
          .order('logged_date', { ascending: false });

        const { data: dreams } = await supabase
          .from('user_dreams')
          .select('dream_text, current_phase, is_active, created_at')
          .eq('user_id', shareData.user_id)
          .eq('is_active', true);

        const { data: narratives } = await supabase
          .from('weekly_narratives')
          .select('week_start, narrative_text, actions_count, key_insights')
          .eq('user_id', shareData.user_id)
          .order('week_start', { ascending: false })
          .limit(4); // Last 4 weeks

        userData.actions = actions || [];
        userData.dreams = dreams || [];
        userData.narratives = narratives || [];
        userData.totalActions = actions?.length || 0;
      }

    } catch (dbError) {
      console.error('Error fetching user data for export:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate export data' },
        { status: 500 }
      );
    }

    // Generate export content based on access level
    const exportContent = generateExportContent(shareData, userData);

    // Return as text for now (TODO: implement PDF generation)
    return new NextResponse(exportContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=trust-ledger-${shareId}.txt`,
      },
    });

  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateExportContent(shareData: any, userData: any): string {
  const lines = [
    '=== ACHIEVERY TRUST LEDGER EXPORT ===',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Share ID: ${shareData.id}`,
    `Access Level: ${shareData.access_level.toUpperCase()}`,
    `Shared with: ${shareData.shared_with_email}`,
    `Share created: ${new Date(shareData.created_at).toLocaleDateString()}`,
    '',
    '=== USER PROGRESS SUMMARY ===',
    '',
    `User: ${userData.email || 'Unknown'}`,
    `Subscription Tier: ${userData.tier || 'Unknown'}`,
    `Total Actions Logged: ${userData.totalActions || 0}`,
    `Member since: ${userData.joinedAt ? new Date(userData.joinedAt).toLocaleDateString() : 'Unknown'}`,
    ''
  ];

  if (shareData.access_level === 'summary') {
    lines.push('Note: This is a summary-level export with basic statistics only.');

  } else if (shareData.access_level === 'detailed') {
    lines.push('=== ACTION BREAKDOWN ===');
    lines.push('');

    if (userData.actions && userData.actions.length > 0) {
      const categoryCounts = userData.actions.reduce((acc: any, action: any) => {
        acc[action.category] = (acc[action.category] || 0) + 1;
        return acc;
      }, {});

      const phaseCounts = userData.actions.reduce((acc: any, action: any) => {
        acc[action.phase] = (acc[action.phase] || 0) + 1;
        return acc;
      }, {});

      lines.push('By Category:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        lines.push(`  ${category}: ${count} actions`);
      });

      lines.push('');
      lines.push('By Phase:');
      Object.entries(phaseCounts).forEach(([phase, count]) => {
        lines.push(`  ${phase}: ${count} actions`);
      });

      lines.push('');
      lines.push('Recent Activity:');
      userData.actions.slice(0, 10).forEach((action: any) => {
        lines.push(`  ${action.logged_date}: ${action.category} (${action.phase})`);
      });
    }

  } else if (shareData.access_level === 'full') {
    lines.push('=== COMPREHENSIVE PROGRESS REPORT ===');
    lines.push('');

    if (userData.dreams && userData.dreams.length > 0) {
      lines.push('Active Goals:');
      userData.dreams.forEach((dream: any) => {
        lines.push(`  • ${dream.dream_text} (${dream.current_phase} phase)`);
      });
      lines.push('');
    }

    if (userData.narratives && userData.narratives.length > 0) {
      lines.push('Recent Weekly Summaries:');
      userData.narratives.forEach((narrative: any) => {
        lines.push(`Week of ${narrative.week_start}:`);
        lines.push(`  ${narrative.narrative_text}`);
        if (narrative.key_insights && narrative.key_insights.length > 0) {
          lines.push(`  Key Insights: ${narrative.key_insights.join(', ')}`);
        }
        lines.push('');
      });
    }

    if (userData.actions && userData.actions.length > 0) {
      lines.push('Recent Actions (Professional Reframes):');
      userData.actions.slice(0, 20).forEach((action: any) => {
        if (action.reframed_text) {
          lines.push(`  ${action.logged_date}: ${action.reframed_text}`);
        }
      });
    }
  }

  lines.push('');
  lines.push('=== END OF REPORT ===');
  lines.push('');
  lines.push('This export was generated from the ACHIEVERY platform.');
  lines.push('For questions about this report, please contact the person who shared it with you.');

  return lines.join('\n');
}