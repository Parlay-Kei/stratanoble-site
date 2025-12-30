/**
 * Mobile Analytics API Endpoint
 * Handles analytics events specifically from the mobile app
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Mobile analytics event interface
interface MobileAnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  platform: 'ios' | 'android';
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
    isTablet: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();

    // Validate required mobile fields
    if (!body.event || !body.sessionId || !body.timestamp || !body.platform) {
      return NextResponse.json(
        { error: 'Missing required fields: event, sessionId, timestamp, platform' },
        { status: 400 }
      );
    }

    // Extract mobile-specific data
    const mobileEvent: MobileAnalyticsEvent = {
      event: body.event,
      properties: body.properties || {},
      timestamp: body.timestamp,
      userId: body.userId,
      sessionId: body.sessionId,
      platform: body.platform,
      deviceInfo: body.deviceInfo || {
        platform: body.platform,
        version: 'unknown',
        model: 'unknown',
        isTablet: false
      }
    };

    // Store in Supabase with mobile-specific fields
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: mobileEvent.event,
        properties: {
          ...mobileEvent.properties,
          deviceInfo: mobileEvent.deviceInfo,
          sessionDuration: mobileEvent.properties.sessionDuration
        },
        timestamp: mobileEvent.timestamp,
        user_id: mobileEvent.userId,
        session_id: mobileEvent.sessionId,
        platform: 'mobile',
        user_agent: `Mobile-${mobileEvent.platform}-${mobileEvent.deviceInfo.version}`,
        ip_address: request.ip || 'mobile-app'
      });

    if (error) {
      console.error('Failed to store mobile analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to store mobile analytics event' },
        { status: 500 }
      );
    }

    // Process mobile-specific events
    await processMobileEvents(mobileEvent, supabase);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mobile analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Process mobile-specific events
async function processMobileEvents(event: MobileAnalyticsEvent, supabase: any) {
  try {
    const today = new Date().toISOString().split('T')[0];

    switch (event.event) {
      case 'mobile_app_launch':
        await updateMobileAppMetrics(event, supabase, today);
        break;

      case 'mobile_notification_engagement':
        await updateNotificationMetrics(event, supabase, today);
        break;

      case 'mobile_cross_platform_sync':
        await updateSyncMetrics(event, supabase, today);
        break;

      case 'mobile_feature_usage':
        await updateFeatureMetrics(event, supabase, today);
        break;

      case 'mobile_error_occurred':
      case 'mobile_app_crash':
        await updateErrorMetrics(event, supabase, today);
        break;

      case 'mobile_subscription_upgrade':
        await updateMobileRevenue(event, supabase, today);
        break;
    }
  } catch (error) {
    console.error('Failed to process mobile event:', error);
  }
}

// Update mobile app metrics
async function updateMobileAppMetrics(event: MobileAnalyticsEvent, supabase: any, today: string) {
  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      mobile_launches: 1,
      platform: event.platform,
      launch_type: event.properties.launchType || 'unknown'
    }, {
      onConflict: 'date,platform',
      ignoreDuplicates: false
    });
}

// Update notification metrics
async function updateNotificationMetrics(event: MobileAnalyticsEvent, supabase: any, today: string) {
  const isEngaged = event.properties.action === 'opened';
  
  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      notification_sent: 1,
      notification_engaged: isEngaged ? 1 : 0,
      notification_type: event.properties.notificationType || 'unknown'
    }, {
      onConflict: 'date,notification_type',
      ignoreDuplicates: false
    });
}

// Update sync metrics
async function updateSyncMetrics(event: MobileAnalyticsEvent, supabase: any, today: string) {
  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      sync_events: 1,
      sync_direction: event.properties.syncDirection || 'unknown',
      sync_success: event.properties.success !== false
    }, {
      onConflict: 'date,sync_direction',
      ignoreDuplicates: false
    });
}

// Update feature usage metrics
async function updateFeatureMetrics(event: MobileAnalyticsEvent, supabase: any, today: string) {
  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      feature_usage: event.properties.usageCount || 1,
      feature_name: event.properties.featureName || 'unknown'
    }, {
      onConflict: 'date,feature_name',
      ignoreDuplicates: false
    });
}

// Update error metrics
async function updateErrorMetrics(event: MobileAnalyticsEvent, supabase: any, today: string) {
  const isCrash = event.event === 'mobile_app_crash';
  
  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      mobile_errors: 1,
      mobile_crashes: isCrash ? 1 : 0,
      error_type: event.properties.context || 'unknown'
    }, {
      onConflict: 'date,error_type',
      ignoreDuplicates: false
    });
}

// Update mobile revenue metrics
async function updateMobileRevenue(event: MobileAnalyticsEvent, supabase: any, today: string) {
  const revenue = calculateTierRevenue(event.properties.fromTier, event.properties.toTier);
  
  await supabase
    .from('analytics_daily_metrics')
    .upsert({
      date: today,
      mobile_revenue: revenue,
      mobile_upgrades: 1,
      tier_from: event.properties.fromTier,
      tier_to: event.properties.toTier
    }, {
      onConflict: 'date,tier_to',
      ignoreDuplicates: false
    });
}

// Calculate revenue from tier upgrade
function calculateTierRevenue(fromTier: string, toTier: string): number {
  const tierPrices = {
    lite: 0,
    growth: 29,
    partner: 99,
    enterprise: 299
  };

  const fromPrice = tierPrices[fromTier as keyof typeof tierPrices] || 0;
  const toPrice = tierPrices[toTier as keyof typeof tierPrices] || 0;
  
  return Math.max(0, toPrice - fromPrice);
}

// Handle batch events for offline sync
export async function handleBatchEvents(request: NextRequest) {
  try {
    const { events } = await request.json();
    
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events must be an array' },
        { status: 400 }
      );
    }

    const results = [];
    
    for (const event of events) {
      try {
        // Process each event individually
        const response = await POST(new NextRequest(request.url, {
          method: 'POST',
          body: JSON.stringify(event),
          headers: request.headers
        }));
        
        results.push({ success: response.ok, event: event.event });
      } catch (error) {
        results.push({ 
          success: false, 
          event: event.event, 
          error: error.message 
        });
      }
    }

    return NextResponse.json({ 
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results 
    });

  } catch (error) {
    console.error('Batch mobile analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch events' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}