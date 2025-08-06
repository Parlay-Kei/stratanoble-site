import { NextRequest, NextResponse } from 'next/server';
import { assertUserWithTier, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Require admin access for analytics
    const user = await assertUserWithTier(request, 'any');
    
    // Check if user is admin (you may want to add admin role to your auth system)
    if (user.email !== process.env.ADMIN_EMAIL) {
      throw new ForbiddenError('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch key metrics in parallel
    const [
      totalOrdersResult,
      revenueResult,
      contactSubmissionsResult,
      emailMetricsResult,
      recentOrdersResult,
      conversionFunnelResult
    ] = await Promise.all([
      // Total orders and stats
      supabase
        .from('orders')
        .select('id, amount, status, created_at, package_type')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false }),
      
      // Revenue metrics
      supabase
        .from('orders')
        .select('amount, status, created_at')
        .eq('status', 'paid')
        .gte('created_at', startDate.toISOString()),
      
      // Contact submissions
      supabase
        .from('contact_submissions')
        .select('id, status, source, created_at')
        .gte('created_at', startDate.toISOString()),
      
      // Email metrics
      supabase
        .from('email_logs')
        .select('id, status, template, created_at')
        .gte('created_at', startDate.toISOString()),
      
      // Recent orders for timeline
      supabase
        .from('orders')
        .select('id, customer_name, customer_email, amount, status, package_type, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Conversion funnel data
      supabase
        .from('contact_submissions')
        .select('id, status, created_at')
        .gte('created_at', startDate.toISOString())
    ]);

    // Process the data
    const orders = totalOrdersResult.data || [];
    const revenue = revenueResult.data || [];
    const contacts = contactSubmissionsResult.data || [];
    const emails = emailMetricsResult.data || [];
    const recentOrders = recentOrdersResult.data || [];
    const funnelData = conversionFunnelResult.data || [];

    // Calculate metrics
    const totalRevenue = revenue.reduce((sum, order) => sum + Number(order.amount), 0);
    const avgOrderValue = revenue.length > 0 ? totalRevenue / revenue.length : 0;
    
    // Package breakdown
    const packageBreakdown = orders.reduce((acc, order) => {
      acc[order.package_type] = (acc[order.package_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily revenue trend
    const dailyRevenue = revenue.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(order.amount);
      return acc;
    }, {} as Record<string, number>);

    // Contact source breakdown
    const contactSources = contacts.reduce((acc, contact) => {
      acc[contact.source || 'unknown'] = (acc[contact.source || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Email metrics
    const emailStats = emails.reduce((acc, email) => {
      acc.total++;
      if (email.status === 'sent') acc.sent++;
      if (email.status === 'failed') acc.failed++;
      acc.templates[email.template] = (acc.templates[email.template] || 0) + 1;
      return acc;
    }, { total: 0, sent: 0, failed: 0, templates: {} as Record<string, number> });

    // Conversion funnel
    const funnelStats = funnelData.reduce((acc, contact) => {
      acc.total++;
      if (contact.status === 'contacted') acc.contacted++;
      if (contact.status === 'qualified') acc.qualified++;
      if (contact.status === 'closed') acc.closed++;
      return acc;
    }, { total: 0, contacted: 0, qualified: 0, closed: 0 });

    const response = {
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      metrics: {
        orders: {
          total: orders.length,
          paid: orders.filter(o => o.status === 'paid').length,
          pending: orders.filter(o => o.status === 'pending').length,
          failed: orders.filter(o => o.status === 'failed').length
        },
        revenue: {
          total: totalRevenue,
          average_order_value: avgOrderValue,
          daily_trend: Object.entries(dailyRevenue).map(([date, amount]) => ({
            date,
            amount
          }))
        },
        contacts: {
          total: contacts.length,
          by_source: contactSources,
          by_status: funnelStats
        },
        emails: {
          total: emailStats.total,
          sent: emailStats.sent,
          failed: emailStats.failed,
          success_rate: emailStats.total > 0 ? (emailStats.sent / emailStats.total) * 100 : 0,
          by_template: emailStats.templates
        },
        packages: packageBreakdown,
        conversion_funnel: {
          contacts: funnelStats.total,
          contacted: funnelStats.contacted,
          qualified: funnelStats.qualified,
          closed: funnelStats.closed,
          contact_rate: funnelStats.total > 0 ? (funnelStats.contacted / funnelStats.total) * 100 : 0,
          qualification_rate: funnelStats.contacted > 0 ? (funnelStats.qualified / funnelStats.contacted) * 100 : 0,
          close_rate: funnelStats.qualified > 0 ? (funnelStats.closed / funnelStats.qualified) * 100 : 0
        }
      },
      recent_activity: recentOrders.map(order => ({
        id: order.id,
        type: 'order',
        customer: order.customer_name,
        email: order.customer_email,
        amount: order.amount,
        package: order.package_type,
        status: order.status,
        created_at: order.created_at
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}