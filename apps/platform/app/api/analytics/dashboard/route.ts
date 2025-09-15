/**
 * Analytics Dashboard API Endpoint
 * Provides aggregated analytics data for the dashboard component
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Analytics data aggregation
interface DashboardData {
  week1Metrics: {
    mobileDownloads: number;
    crossPlatformUsage: number;
    notificationEngagement: number;
    appStoreRating: number;
  };
  month1Metrics: {
    totalDownloads: number;
    dailyActiveRetention: number;
    coachConsultations: number;
    revenueIncrease: number;
  };
  recentActivity: Array<{
    date: string;
    webUsers: number;
    mobileUsers: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
  }>;
  conversionFunnel: Array<{
    step: string;
    users: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';
    const supabase = createClient();

    // Calculate date ranges
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get Week 1 Metrics
    const week1Metrics = await getWeek1Metrics(supabase, weekAgo, now);

    // Get Month 1 Metrics
    const month1Metrics = await getMonth1Metrics(supabase, monthAgo, now);

    // Get Recent Activity
    const recentActivity = await getRecentActivity(supabase, range);

    // Get Performance Metrics
    const performanceMetrics = await getPerformanceMetrics(supabase);

    // Get Conversion Funnel
    const conversionFunnel = await getConversionFunnel(supabase);

    const dashboardData: DashboardData = {
      week1Metrics,
      month1Metrics,
      recentActivity,
      performanceMetrics,
      conversionFunnel
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Week 1 Success Metrics
async function getWeek1Metrics(supabase: any, weekAgo: Date, now: Date) {
  try {
    // Mobile Downloads
    const { data: downloads } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'mobile_app_download')
      .gte('timestamp', weekAgo.toISOString())
      .lte('timestamp', now.toISOString());

    // Cross-Platform Usage (users using both web and mobile)
    const { data: crossPlatformUsers } = await supabase
      .from('analytics_events')
      .select('user_id, platform')
      .in('event_name', ['session_start', 'mobile_session_start'])
      .gte('timestamp', weekAgo.toISOString())
      .not('user_id', 'is', null);

    const userPlatforms = new Map();
    crossPlatformUsers?.forEach(event => {
      const userId = event.user_id;
      if (!userPlatforms.has(userId)) {
        userPlatforms.set(userId, new Set());
      }
      userPlatforms.get(userId).add(event.platform);
    });

    const crossPlatformCount = Array.from(userPlatforms.values())
      .filter(platforms => platforms.size > 1).length;
    const totalUsers = userPlatforms.size;
    const crossPlatformUsage = totalUsers > 0 ? (crossPlatformCount / totalUsers) * 100 : 0;

    // Notification Engagement
    const { data: notifications } = await supabase
      .from('analytics_events')
      .select('id, properties')
      .eq('event_name', 'mobile_notification_engagement')
      .gte('timestamp', weekAgo.toISOString());

    const engagementRate = notifications ? 
      (notifications.filter(n => n.properties?.action === 'opened').length / Math.max(notifications.length, 1)) * 100 : 0;

    return {
      mobileDownloads: downloads?.length || 0,
      crossPlatformUsage: Math.round(crossPlatformUsage),
      notificationEngagement: Math.round(engagementRate),
      appStoreRating: 4.6 // Mock data - would integrate with app store APIs
    };
  } catch (error) {
    console.error('Error fetching week 1 metrics:', error);
    return {
      mobileDownloads: 0,
      crossPlatformUsage: 0,
      notificationEngagement: 0,
      appStoreRating: 0
    };
  }
}

// Month 1 Success Metrics
async function getMonth1Metrics(supabase: any, monthAgo: Date, now: Date) {
  try {
    // Total Downloads
    const { data: totalDownloads } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'mobile_app_download')
      .gte('timestamp', monthAgo.toISOString());

    // Daily Active Retention (users active in last 7 days)
    const { data: activeUsers } = await supabase
      .from('analytics_events')
      .select('user_id')
      .in('event_name', ['action_logged', 'mobile_action_logged'])
      .gte('timestamp', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .not('user_id', 'is', null);

    const { data: allUsers } = await supabase
      .from('analytics_events')
      .select('user_id')
      .in('event_name', ['session_start', 'mobile_session_start'])
      .gte('timestamp', monthAgo.toISOString())
      .not('user_id', 'is', null);

    const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size;
    const uniqueAllUsers = new Set(allUsers?.map(u => u.user_id) || []).size;
    const retentionRate = uniqueAllUsers > 0 ? (uniqueActiveUsers / uniqueAllUsers) * 100 : 0;

    // Coach Consultations
    const { data: consultations } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'coach_dashboard_access')
      .gte('timestamp', monthAgo.toISOString());

    // Revenue Increase (from tier conversions)
    const { data: conversions } = await supabase
      .from('analytics_events')
      .select('properties')
      .in('event_name', ['tier_conversion', 'mobile_subscription_upgrade'])
      .gte('timestamp', monthAgo.toISOString());

    const revenueIncrease = conversions?.reduce((sum, conv) => {
      return sum + (conv.properties?.revenue || 0);
    }, 0) || 0;

    return {
      totalDownloads: totalDownloads?.length || 0,
      dailyActiveRetention: Math.round(retentionRate),
      coachConsultations: consultations?.length || 0,
      revenueIncrease: Math.round(revenueIncrease / 1000) // Convert to K
    };
  } catch (error) {
    console.error('Error fetching month 1 metrics:', error);
    return {
      totalDownloads: 0,
      dailyActiveRetention: 0,
      coachConsultations: 0,
      revenueIncrease: 0
    };
  }
}

// Recent Activity Data
async function getRecentActivity(supabase: any, range: string) {
  try {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activity = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // Get web users
      const { data: webSessions } = await supabase
        .from('analytics_events')
        .select('user_id')
        .eq('event_name', 'session_start')
        .eq('platform', 'web')
        .gte('timestamp', dayStart.toISOString())
        .lte('timestamp', dayEnd.toISOString())
        .not('user_id', 'is', null);

      // Get mobile users
      const { data: mobileSessions } = await supabase
        .from('analytics_events')
        .select('user_id')
        .eq('event_name', 'mobile_session_start')
        .gte('timestamp', dayStart.toISOString())
        .lte('timestamp', dayEnd.toISOString())
        .not('user_id', 'is', null);

      activity.push({
        date: date.toISOString().split('T')[0],
        webUsers: new Set(webSessions?.map(s => s.user_id) || []).size,
        mobileUsers: new Set(mobileSessions?.map(s => s.user_id) || []).size
      });
    }

    return activity;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Performance Metrics
async function getPerformanceMetrics(supabase: any) {
  try {
    const { data: pageLoads } = await supabase
      .from('analytics_events')
      .select('properties')
      .eq('event_name', 'page_load')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: apiCalls } = await supabase
      .from('analytics_events')
      .select('properties')
      .eq('event_name', 'api_call')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const avgPageLoad = pageLoads?.reduce((sum, p) => sum + (p.properties?.loadTime || 0), 0) / Math.max(pageLoads?.length || 1, 1);
    const avgApiCall = apiCalls?.reduce((sum, a) => sum + (a.properties?.duration || 0), 0) / Math.max(apiCalls?.length || 1, 1);

    return [
      { metric: 'Page Load (ms)', value: Math.round(avgPageLoad || 0) },
      { metric: 'API Response (ms)', value: Math.round(avgApiCall || 0) },
      { metric: 'Error Rate (%)', value: 0.5 }, // Mock data
      { metric: 'Uptime (%)', value: 99.9 } // Mock data
    ];
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return [];
  }
}

// Conversion Funnel
async function getConversionFunnel(supabase: any) {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Website visitors
    const { data: visitors } = await supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'session_start')
      .gte('timestamp', weekAgo.toISOString());

    // Early access signups
    const { data: signups } = await supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'onboarding_completed')
      .gte('timestamp', weekAgo.toISOString());

    // Platform access
    const { data: platformAccess } = await supabase
      .from('analytics_events')
      .select('user_id')
      .in('event_name', ['session_start', 'mobile_session_start'])
      .gte('timestamp', weekAgo.toISOString())
      .not('user_id', 'is', null);

    // Mobile downloads
    const { data: downloads } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_name', 'mobile_app_download')
      .gte('timestamp', weekAgo.toISOString());

    return [
      { step: 'Website Visitors', users: new Set(visitors?.map(v => v.session_id) || []).size },
      { step: 'Early Access Signups', users: new Set(signups?.map(s => s.session_id) || []).size },
      { step: 'Platform Access', users: new Set(platformAccess?.map(p => p.user_id) || []).size },
      { step: 'Mobile App Downloads', users: new Set(downloads?.map(d => d.user_id) || []).size }
    ];
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}