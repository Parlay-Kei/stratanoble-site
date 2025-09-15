/**
 * Analytics Tracking API Endpoint
 * Handles analytics events from both web and mobile platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateApiInput, checkRateLimit } from '@/lib/server-auth';

// Analytics event storage interface
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  platform: 'web' | 'mobile';
  userAgent?: string;
  ip?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Extract IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting - more lenient for analytics but still protected
    const rateLimitResult = checkRateLimit(`analytics_${clientIP}`, 100, 60000); // 100 requests per minute per IP
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json().catch(() => null);
    const inputValidation = validateApiInput(body, ['event', 'sessionId', 'timestamp']);

    if (!inputValidation.success) {
      return NextResponse.json(
        { error: inputValidation.error },
        { status: 400 }
      );
    }

    const { event, sessionId, timestamp, properties, userId, platform } = inputValidation.sanitizedData!;

    // Additional validation for analytics-specific fields
    if (typeof event !== 'string' || event.length > 100) {
      return NextResponse.json(
        { error: 'Invalid event name' },
        { status: 400 }
      );
    }

    if (typeof sessionId !== 'string' || sessionId.length > 50) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Validate timestamp
    const eventTimestamp = new Date(timestamp);
    if (isNaN(eventTimestamp.getTime())) {
      return NextResponse.json(
        { error: 'Invalid timestamp format' },
        { status: 400 }
      );
    }

    // Reject events more than 1 hour old or from the future
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (eventTimestamp < oneHourAgo || eventTimestamp > fiveMinutesFromNow) {
      return NextResponse.json(
        { error: 'Event timestamp out of acceptable range' },
        { status: 400 }
      );
    }

    // Validate platform
    if (platform && !['web', 'mobile'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform value' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Extract IP and User Agent
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Prepare analytics event
    const analyticsEvent: AnalyticsEvent = {
      event: body.event,
      properties: body.properties || {},
      timestamp: body.timestamp,
      userId: body.userId,
      sessionId: body.sessionId,
      platform: body.platform || 'web',
      userAgent,
      ip
    };

    // Store in Supabase
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: analyticsEvent.event,
        properties: analyticsEvent.properties,
        timestamp: analyticsEvent.timestamp,
        user_id: analyticsEvent.userId,
        session_id: analyticsEvent.sessionId,
        platform: analyticsEvent.platform,
        user_agent: analyticsEvent.userAgent,
        ip_address: analyticsEvent.ip
      });

    if (error) {
      console.error('Failed to store analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics event' },
        { status: 500 }
      );
    }

    // Process special events for real-time metrics
    await processSpecialEvents(analyticsEvent, supabase);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Process events that require immediate action or aggregation
async function processSpecialEvents(event: AnalyticsEvent, supabase: any) {
  try {
    switch (event.event) {
      case 'mobile_app_download':
        await updateMobileDownloadMetrics(event, supabase);
        break;

      case 'action_logged':
      case 'mobile_action_logged':
        await updateActionMetrics(event, supabase);
        break;

      case 'tier_conversion':
      case 'mobile_subscription_upgrade':
        await updateRevenuMetrics(event, supabase);
        break;

      case 'coach_dashboard_access':
        await updateCoachMetrics(event, supabase);
        break;

      case 'cross_platform_sync':
      case 'mobile_cross_platform_sync':
        await updateCrossPlatformMetrics(event, supabase);
        break;
    }
  } catch (error) {
    console.error('Failed to process special event:', error);
  }
}

// Update mobile download metrics
async function updateMobileDownloadMetrics(event: AnalyticsEvent, supabase: any) {
  const today = new Date().toISOString().split('T')[0];

  // Upsert daily metrics
  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      mobile_downloads: 1,
      platform: event.properties.platform || 'unknown'
    }, {
      onConflict: 'date,platform',
      ignoreDuplicates: false
    });
}

// Update action logging metrics
async function updateActionMetrics(event: AnalyticsEvent, supabase: any) {
  const today = new Date().toISOString().split('T')[0];

  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      actions_logged: 1,
      category: event.properties.category || 'unknown'
    }, {
      onConflict: 'date,category',
      ignoreDuplicates: false
    });
}

// Update revenue metrics
async function updateRevenuMetrics(event: AnalyticsEvent, supabase: any) {
  if (event.properties.revenue) {
    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('analytics_daily_metrics')
      .upsert({
        date: today,
        revenue: event.properties.revenue,
        tier_conversions: 1
      }, {
        onConflict: 'date',
        ignoreDuplicates: false
      });
  }
}

// Update coach engagement metrics
async function updateCoachMetrics(event: AnalyticsEvent, supabase: any) {
  const today = new Date().toISOString().split('T')[0];

  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      coach_access_count: 1
    }, {
      onConflict: 'date',
      ignoreDuplicates: false
    });
}

// Update cross-platform usage metrics
async function updateCrossPlatformMetrics(event: AnalyticsEvent, supabase: any) {
  const today = new Date().toISOString().split('T')[0];

  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      cross_platform_syncs: 1,
      sync_type: event.properties.syncType || 'unknown'
    }, {
      onConflict: 'date,sync_type',
      ignoreDuplicates: false
    });
}

// Handle mobile analytics specifically
export async function handleMobileAnalytics(request: NextRequest) {
  // Mobile-specific analytics processing
  return POST(request);
}