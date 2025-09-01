import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];
type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
type EmailLog = Database['public']['Tables']['email_logs']['Row'];
type WebhookLog = Database['public']['Tables']['webhook_logs']['Row'];

export async function GET(request: NextRequest) {
  try {
    // Require admin role for analytics access
    const { user, profile } = await assertAdmin(request);

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Fetch performance data
    const [
      currentPeriodOrders,
      previousPeriodOrders,
      currentPeriodContacts,
      previousPeriodContacts,
      currentPeriodEmails,
      previousPeriodEmails,
      webhookLogs
    ] = await Promise.all([
      // Current period orders
      supabase
        .from('orders')
        .select('id, amount, status, created_at, package_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString()),
      
      // Previous period orders (for comparison)
      supabase
        .from('orders')
        .select('id, amount, status, created_at, package_type')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString()),
      
      // Current period contacts
      supabase
        .from('contact_submissions')
        .select('id, status, source, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString()),
      
      // Previous period contacts
      supabase
        .from('contact_submissions')
        .select('id, status, source, created_at')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString()),
      
      // Current period emails
      supabase
        .from('email_logs')
        .select('id, status, template, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString()),
      
      // Previous period emails
      supabase
        .from('email_logs')
        .select('id, status, template, created_at')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString()),
      
      // System performance - webhook processing
      supabase
        .from('webhook_logs')
        .select('id, processed, error_message, created_at, processed_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    // Calculate metrics
    const currentOrders = (currentPeriodOrders.data as Order[]) || [];
    const previousOrders = (previousPeriodOrders.data as Order[]) || [];
    const currentContacts = (currentPeriodContacts.data as ContactSubmission[]) || [];
    const previousContacts = (previousPeriodContacts.data as ContactSubmission[]) || [];
    const currentEmails = (currentPeriodEmails.data as EmailLog[]) || [];
    const previousEmails = (previousPeriodEmails.data as EmailLog[]) || [];
    const webhooks = (webhookLogs.data as WebhookLog[]) || [];

    // Revenue metrics
    const currentRevenue = currentOrders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + Number(o.amount), 0);
    const previousRevenue = previousOrders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + Number(o.amount), 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Order metrics
    const currentOrderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;
    const orderGrowth = previousOrderCount > 0 
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 
      : 0;

    // Conversion metrics
    const currentConversionRate = currentContacts.length > 0 
      ? (currentOrders.filter(o => o.status === 'paid').length / currentContacts.length) * 100 
      : 0;
    const previousConversionRate = previousContacts.length > 0 
      ? (previousOrders.filter(o => o.status === 'paid').length / previousContacts.length) * 100 
      : 0;

    // Email performance
    const currentEmailSuccess = currentEmails.length > 0 
      ? (currentEmails.filter(e => e.status === 'sent').length / currentEmails.length) * 100 
      : 0;
    const previousEmailSuccess = previousEmails.length > 0 
      ? (previousEmails.filter(e => e.status === 'sent').length / previousEmails.length) * 100 
      : 0;

    // System performance metrics
    const webhookSuccessRate = webhooks.length > 0 
      ? (webhooks.filter(w => w.processed && !w.error_message).length / webhooks.length) * 100 
      : 100;

    const avgProcessingTime = webhooks
      .filter(w => w.processed_at && w.created_at)
      .reduce((acc, w) => {
        const processingTime = new Date(w.processed_at!).getTime() - new Date(w.created_at).getTime();
        return acc + processingTime;
      }, 0) / Math.max(webhooks.filter(w => w.processed_at).length, 1);

    // Daily trends
    const dailyOrderTrend = currentOrders.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { orders: 0, revenue: 0 };
      acc[date].orders++;
      if (order.status === 'paid') {
        acc[date].revenue += Number(order.amount);
      }
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    const dailyContactTrend = currentContacts.reduce((acc, contact) => {
      const date = new Date(contact.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Package performance
    const packagePerformance = currentOrders.reduce((acc, order) => {
      if (!acc[order.package_type]) {
        acc[order.package_type] = { count: 0, revenue: 0, conversion_rate: 0 };
      }
      acc[order.package_type].count++;
      if (order.status === 'paid') {
        acc[order.package_type].revenue += Number(order.amount);
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number; conversion_rate: number }>);

    // Calculate conversion rates for packages
    const contactsByPackage = currentContacts.reduce((acc, _contact) => {
      // This would need to be enhanced based on how you track package interest in contacts
      const packageInterest = 'general'; // placeholder
      acc[packageInterest] = (acc[packageInterest] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.keys(packagePerformance).forEach(pkg => {
      const inquiries = contactsByPackage[pkg] || 1; // avoid division by zero
      packagePerformance[pkg].conversion_rate = (packagePerformance[pkg].count / inquiries) * 100;
    });

    const response = {
      timeframe,
      period: {
        current: { start: startDate.toISOString(), end: now.toISOString() },
        previous: { start: previousStartDate.toISOString(), end: startDate.toISOString() }
      },
      metrics: {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
          trend: Object.entries(dailyOrderTrend).map(([date, data]) => ({
            date,
            revenue: data.revenue
          }))
        },
        orders: {
          current: currentOrderCount,
          previous: previousOrderCount,
          growth: orderGrowth,
          trend: Object.entries(dailyOrderTrend).map(([date, data]) => ({
            date,
            orders: data.orders
          }))
        },
        conversion: {
          current_rate: currentConversionRate,
          previous_rate: previousConversionRate,
          improvement: currentConversionRate - previousConversionRate
        },
        email_performance: {
          current_success_rate: currentEmailSuccess,
          previous_success_rate: previousEmailSuccess,
          improvement: currentEmailSuccess - previousEmailSuccess
        },
        system_performance: {
          webhook_success_rate: webhookSuccessRate,
          avg_processing_time_ms: avgProcessingTime
        }
      },
      trends: {
        daily_orders: Object.entries(dailyOrderTrend).map(([date, data]) => ({
          date,
          orders: data.orders,
          revenue: data.revenue
        })),
        daily_contacts: Object.entries(dailyContactTrend).map(([date, count]) => ({
          date,
          count
        }))
      },
      package_performance: packagePerformance
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

    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}