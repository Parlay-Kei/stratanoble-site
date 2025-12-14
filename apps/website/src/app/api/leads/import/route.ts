/**
 * Lead Import API
 * 
 * Imports leads from CSV upload, validates phone numbers,
 * performs DNC scrubbing, and auto-schedules calls for campaign
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { campaignScheduler } from '@/lib/campaign-scheduler';
import { normalizePhone } from '@/lib/core/phone-utils';
import { checkDNC } from '@/lib/calling/dnc-checker';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { leads, campaignId, autoSchedule = true } = await request.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads provided' },
        { status: 400 }
      );
    }

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    console.log(`[import] Processing ${leads.length} leads for campaign ${campaignId}`);

    // Validate and clean leads
    const validated = [];
    const errors = [];
    const dncBlocked = [];

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      
      try {
        // Validate required fields
        if (!lead.name && !lead.company) {
          errors.push({ row: i + 1, error: 'Missing name or company' });
          continue;
        }

        if (!lead.phone) {
          errors.push({ row: i + 1, error: 'Missing phone number' });
          continue;
        }

        // Normalize phone to E.164
        const phone = normalizePhone(lead.phone);
        if (!phone) {
          errors.push({ 
            row: i + 1, 
            error: `Invalid phone format: ${lead.phone}` 
          });
          continue;
        }

        // DNC check
        const isDNC = await checkDNC(phone);
        if (isDNC) {
          dncBlocked.push({ row: i + 1, phone, name: lead.name });
          continue;
        }

        // Build validated lead object
        const validatedLead = {
          name: lead.name || lead.company || 'Unknown',
          email: lead.email || null,
          phone,
          company: lead.company || null,
          
          // Business data
          business_stage: lead.business_stage || 'unknown',
          main_challenge: lead.main_challenge || '',
          interested_tier: lead.interested_tier || 'discovery',
          
          // Pipeline
          stage: 'discovery',
          source: 'csv_import',
          
          // TCPA compliance
          tcpa_consent: true,
          tcpa_consent_date: new Date().toISOString(),
          tcpa_consent_method: 'csv_import',
          
          // Metadata
          metadata: {
            imported_at: new Date().toISOString(),
            campaign_id: campaignId,
            original_row: i + 1,
            ...lead, // Include all original fields
          },
        };

        validated.push(validatedLead);

      } catch (error) {
        errors.push({ 
          row: i + 1, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    console.log(`[import] Validated: ${validated.length}/${leads.length}`);
    console.log(`[import] DNC blocked: ${dncBlocked.length}`);
    console.log(`[import] Errors: ${errors.length}`);

    if (validated.length === 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        scheduled: 0,
        errors,
        dncBlocked,
        message: 'No valid leads to import',
      });
    }

    // Insert into database
    const { data: inserted, error: insertError } = await supabase
      .from('leads')
      .insert(validated)
      .select();

    if (insertError) {
      console.error('[import] Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save leads', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`[import] Saved ${inserted?.length || 0} leads to database`);

    // Auto-schedule calls if requested
    let schedules = [];
    if (autoSchedule && inserted && inserted.length > 0) {
      try {
        schedules = await campaignScheduler.scheduleCallsForCampaign(
          campaignId,
          inserted
        );
        console.log(`[import] Scheduled ${schedules.length} calls`);
      } catch (scheduleError) {
        console.error('[import] Scheduling error:', scheduleError);
        // Don't fail the import, just log the error
      }
    }

    // Return summary
    return NextResponse.json({
      success: true,
      imported: inserted?.length || 0,
      scheduled: schedules.length,
      total: leads.length,
      errors: errors.length > 0 ? errors : undefined,
      dncBlocked: dncBlocked.length > 0 ? dncBlocked : undefined,
      summary: {
        total_submitted: leads.length,
        successfully_imported: inserted?.length || 0,
        dnc_blocked: dncBlocked.length,
        validation_errors: errors.length,
        calls_scheduled: schedules.length,
      },
    });

  } catch (error) {
    console.error('[import] Fatal error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
