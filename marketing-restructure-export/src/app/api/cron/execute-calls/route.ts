/**
 * Cron Worker: Execute Scheduled Calls
 *
 * Runs every 5 minutes to process pending call schedules
 * Initiates Twilio calls for leads scheduled in the current time window
 *
 * Triggered by Vercel Cron: every 5 minutes (schedule: 0/5 * * * *)
 */

import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { campaignScheduler } from '@/lib/campaign-scheduler';
import { initiateTestCall } from '@/lib/twilio';

// Lazy-load Supabase client to avoid build-time errors when env vars aren't set
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase credentials not configured');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[cron] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[cron] ===== Starting call execution worker =====');

    // Get next batch of scheduled calls (max 10 concurrent)
    const batch = await campaignScheduler.getNextCallBatch(10);
    
    if (batch.length === 0) {
      console.log('[cron] No calls scheduled in current window');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No calls scheduled',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[cron] Found ${batch.length} calls to process`);

    // Process each scheduled call
    const results = await Promise.allSettled(
      batch.map(async (schedule) => {
        try {
          console.log(`[cron] Processing schedule ${schedule.id} for lead ${schedule.lead_id}`);

          // Get lead details
          const { data: lead, error: leadError } = await getSupabase()
            .from('leads')
            .select('*')
            .eq('id', schedule.lead_id)
            .single();

          if (leadError || !lead) {
            throw new Error(`Lead ${schedule.lead_id} not found: ${leadError?.message}`);
          }

          if (!lead.phone) {
            throw new Error(`Lead ${schedule.lead_id} missing phone number`);
          }

          // Get campaign details
          const { data: campaign, error: campaignError } = await getSupabase()
            .from('campaigns')
            .select('*')
            .eq('id', schedule.campaign_id)
            .single();

          if (campaignError || !campaign) {
            throw new Error(`Campaign ${schedule.campaign_id} not found: ${campaignError?.message}`);
          }

          // Check campaign is active
          if (campaign.status !== 'active') {
            console.log(`[cron] Skipping - campaign ${campaign.id} is ${campaign.status}`);
            
            // Cancel this schedule
            await getSupabase()
              .from('call_schedules')
              .update({ status: 'cancelled' })
              .eq('id', schedule.id);
            
            return { 
              scheduleId: schedule.id, 
              skipped: true, 
              reason: `Campaign ${campaign.status}` 
            };
          }

          // Mark schedule as in-progress
          await getSupabase()
            .from('call_schedules')
            .update({ 
              status: 'in_progress',
              updated_at: new Date().toISOString(),
            })
            .eq('id', schedule.id);

          console.log(`[cron] Initiating call to ${lead.phone} for ${campaign.name}`);

          // Initiate Twilio call
          const call = await initiateTestCall({
            to: lead.phone,
            testName: `${campaign.name} - ${lead.name || 'Unknown'}`,
            campaignType: campaign.type as 'internet' | 'voip' | 'security' | 'cisco',
            metadata: {
              campaign_id: schedule.campaign_id,
              schedule_id: schedule.id,
              lead_id: lead.id,
              campaign_type: campaign.type,
              campaign_name: campaign.name,
              lead_name: lead.name || '',
              lead_company: lead.company || '',
            },
          });

          // Update schedule with call SID
          await getSupabase()
            .from('call_schedules')
            .update({ 
              call_sid: call.callSid,
              updated_at: new Date().toISOString(),
            })
            .eq('id', schedule.id);

          console.log(`[cron] ✅ Call initiated: ${call.callSid} for schedule ${schedule.id}`);

          return { 
            scheduleId: schedule.id, 
            callSid: call.callSid,
            leadName: lead.name,
            campaignName: campaign.name,
            success: true,
          };

        } catch (error) {
          console.error(`[cron] ❌ Error processing schedule ${schedule.id}:`, error);
          
          // Mark schedule as failed
          await getSupabase()
            .from('call_schedules')
            .update({ 
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', schedule.id);

          throw error;
        }
      })
    );

    // Tally results
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const skipped = results.filter(
      r => r.status === 'fulfilled' && (r.value as any).skipped
    ).length;

    const executionTime = Date.now() - startTime;

    console.log(`[cron] ===== Execution complete =====`);
    console.log(`[cron] Processed: ${batch.length}`);
    console.log(`[cron] Succeeded: ${succeeded}`);
    console.log(`[cron] Failed: ${failed}`);
    console.log(`[cron] Skipped: ${skipped}`);
    console.log(`[cron] Execution time: ${executionTime}ms`);

    // Log failures for debugging
    if (failed > 0) {
      const failures = results
        .filter(r => r.status === 'rejected')
        .map((r: any) => r.reason?.message || r.reason);
      
      console.error('[cron] Failures:', failures);
    }

    return NextResponse.json({
      success: true,
      processed: batch.length,
      succeeded,
      failed,
      skipped,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString(),
      details: results.map(r => 
        r.status === 'fulfilled' 
          ? r.value 
          : { error: (r as any).reason?.message || String((r as any).reason) }
      ),
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[cron] Fatal error in call execution worker:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
}
