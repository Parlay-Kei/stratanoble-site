/**
 * DSLV Cold Calling Campaign Scheduler
 * 
 * Manages campaign creation, scheduling, execution, and tracking
 * for Data Solutions LV's internet, VoIP, security, and Cisco campaigns
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

export interface Campaign {
  id: string;
  name: string;
  type: 'internet' | 'voip' | 'security' | 'cisco';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  
  // Schedule
  start_date: Date;
  end_date?: Date;
  calling_hours: {
    start: string; // HH:MM format (e.g., "09:00")
    end: string;   // HH:MM format (e.g., "17:00")
    timezone: string; // e.g., "America/Los_Angeles"
    days_of_week: number[]; // 0-6 (Sunday-Saturday)
  };
  
  // Targeting
  target_leads: {
    list_name: string;
    filters?: {
      state?: string[];
      industry?: string[];
      company_size?: string;
      has_phone?: boolean;
      dnc_scrubbed?: boolean;
    };
    estimated_count: number;
  };
  
  // Call configuration
  call_config: {
    max_attempts: number; // e.g., 3
    retry_delay_hours: number; // e.g., 24
    concurrent_calls: number; // e.g., 5
    answering_machine_action: 'leave_message' | 'hangup' | 'detect_and_retry';
    call_recording_enabled: boolean;
  };
  
  // Performance
  metrics: {
    leads_total: number;
    leads_called: number;
    calls_connected: number;
    appointments_booked: number;
    opt_outs: number;
    conversion_rate: number;
    cost_total: number;
    roi_estimate: number;
  };
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CallSchedule {
  id: string;
  campaign_id: string;
  lead_id: string;
  
  // Scheduling
  scheduled_for: Date;
  timezone: string;
  attempt_number: number; // 1, 2, or 3
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  
  // Results (filled after call)
  call_sid?: string;
  connected: boolean;
  duration_seconds?: number;
  outcome?: 'qualified' | 'not_interested' | 'callback' | 'voicemail' | 'no_answer' | 'busy';
  qualification_score?: number; // 0-100
  next_action?: 'follow_up' | 'send_info' | 'schedule_callback' | 'no_action';
  
  // Cost tracking
  cost_per_call: number;
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Campaign Scheduler
 */
export class CampaignScheduler {
  /**
   * Create a new campaign
   */
  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: campaignData.name || 'Untitled Campaign',
      type: campaignData.type || 'internet',
      status: 'draft',
      start_date: campaignData.start_date || new Date(),
      calling_hours: campaignData.calling_hours || {
        start: '09:00',
        end: '17:00',
        timezone: 'America/Los_Angeles',
        days_of_week: [1, 2, 3, 4, 5], // Monday-Friday
      },
      target_leads: campaignData.target_leads || {
        list_name: 'default',
        estimated_count: 0,
      },
      call_config: campaignData.call_config || {
        max_attempts: 3,
        retry_delay_hours: 24,
        concurrent_calls: 5,
        answering_machine_action: 'leave_message',
        call_recording_enabled: true,
      },
      metrics: {
        leads_total: 0,
        leads_called: 0,
        calls_connected: 0,
        appointments_booked: 0,
        opt_outs: 0,
        conversion_rate: 0,
        cost_total: 0,
        roi_estimate: 0,
      },
      created_by: campaignData.created_by || 'system',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Save to database
    const { error } = await getSupabase()
      .from('campaigns')
      .insert(campaign);

    if (error) throw error;

    return campaign;
  }

  /**
   * Schedule calls for a campaign
   * Distributes calls across available time slots
   */
  async scheduleCallsForCampaign(
    campaignId: string,
    leads: any[]
  ): Promise<CallSchedule[]> {
    const campaign = await this.getCampaign(campaignId);
    const schedules: CallSchedule[] = [];

    const { calling_hours, call_config } = campaign;
    
    // Calculate available calling windows
    const windows = this.calculateCallingWindows(
      campaign.start_date,
      campaign.end_date || this.addDays(campaign.start_date, 30),
      calling_hours
    );

    // Distribute leads across windows
    const leadsPerWindow = Math.ceil(leads.length / windows.length);
    let windowIndex = 0;
    let leadsInWindow = 0;

    for (const lead of leads) {
      // Move to next window if current is full
      if (leadsInWindow >= leadsPerWindow && windowIndex < windows.length - 1) {
        windowIndex++;
        leadsInWindow = 0;
      }

      const window = windows[windowIndex];
      
      // Schedule within the window (distribute evenly)
      const minutesInWindow = this.getMinutesBetween(window.start, window.end);
      const intervalMinutes = Math.floor(minutesInWindow / leadsPerWindow);
      const scheduledTime = this.addMinutes(
        window.start,
        intervalMinutes * leadsInWindow
      );

      const schedule: CallSchedule = {
        id: `sched_${Date.now()}_${lead.id}`,
        campaign_id: campaignId,
        lead_id: lead.id,
        scheduled_for: scheduledTime,
        timezone: calling_hours.timezone,
        attempt_number: 1,
        status: 'pending',
        connected: false,
        cost_per_call: 0.025, // $0.025 per call
        created_at: new Date(),
        updated_at: new Date(),
      };

      schedules.push(schedule);
      leadsInWindow++;
    }

    // Save schedules to database
    const { error } = await getSupabase()
      .from('call_schedules')
      .insert(schedules);

    if (error) throw error;

    console.log(`[scheduler] Scheduled ${schedules.length} calls for campaign ${campaignId}`);
    
    return schedules;
  }

  /**
   * Get next batch of calls to execute
   * Returns calls scheduled for current time window
   */
  async getNextCallBatch(limit: number = 10): Promise<CallSchedule[]> {
    const now = new Date();
    const fiveMinutesFromNow = this.addMinutes(now, 5);

    const { data, error } = await getSupabase()
      .from('call_schedules')
      .select('*')
      .eq('status', 'pending')
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', fiveMinutesFromNow.toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return data as CallSchedule[];
  }

  /**
   * Update call result after completion
   */
  async updateCallResult(
    scheduleId: string,
    result: {
      call_sid: string;
      connected: boolean;
      duration_seconds: number;
      outcome: CallSchedule['outcome'];
      qualification_score?: number;
      next_action?: CallSchedule['next_action'];
    }
  ): Promise<void> {
    const { error } = await getSupabase()
      .from('call_schedules')
      .update({
        status: 'completed',
        call_sid: result.call_sid,
        connected: result.connected,
        duration_seconds: result.duration_seconds,
        outcome: result.outcome,
        qualification_score: result.qualification_score,
        next_action: result.next_action,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId);

    if (error) throw error;

    // Update campaign metrics
    await this.updateCampaignMetrics(scheduleId);
  }

  /**
   * Schedule retry for failed/no-answer calls
   */
  async scheduleRetry(scheduleId: string): Promise<CallSchedule | null> {
    const { data: schedule } = await getSupabase()
      .from('call_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (!schedule) return null;

    const { data: campaign } = await getSupabase()
      .from('campaigns')
      .select('*')
      .eq('id', schedule.campaign_id)
      .single();

    if (!campaign) return null;

    // Check if we've exceeded max attempts
    if (schedule.attempt_number >= campaign.call_config.max_attempts) {
      console.log(`[scheduler] Max attempts reached for schedule ${scheduleId}`);
      return null;
    }

    // Create new schedule for retry
    const retrySchedule: CallSchedule = {
      ...schedule,
      id: `sched_${Date.now()}_retry_${schedule.lead_id}`,
      scheduled_for: this.addHours(
        new Date(),
        campaign.call_config.retry_delay_hours
      ),
      attempt_number: schedule.attempt_number + 1,
      status: 'pending',
      call_sid: undefined,
      connected: false,
      duration_seconds: undefined,
      outcome: undefined,
      qualification_score: undefined,
      next_action: undefined,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { error } = await getSupabase()
      .from('call_schedules')
      .insert(retrySchedule);

    if (error) throw error;

    console.log(`[scheduler] Retry scheduled for lead ${schedule.lead_id} (attempt ${retrySchedule.attempt_number})`);
    
    return retrySchedule;
  }

  /**
   * Pause campaign (stop scheduling new calls)
   */
  async pauseCampaign(campaignId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('campaigns')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (error) throw error;

    console.log(`[scheduler] Campaign ${campaignId} paused`);
  }

  /**
   * Resume paused campaign
   */
  async resumeCampaign(campaignId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('campaigns')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (error) throw error;

    console.log(`[scheduler] Campaign ${campaignId} resumed`);
  }

  /**
   * Get campaign by ID
   */
  private async getCampaign(campaignId: string): Promise<Campaign> {
    const { data, error } = await getSupabase()
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) throw error;
    return data as Campaign;
  }

  /**
   * Update campaign metrics after call completion
   */
  private async updateCampaignMetrics(scheduleId: string): Promise<void> {
    const { data: schedule } = await getSupabase()
      .from('call_schedules')
      .select('campaign_id, connected, outcome, cost_per_call')
      .eq('id', scheduleId)
      .single();

    if (!schedule) return;

    // Get current campaign metrics
    const { data: campaign } = await getSupabase()
      .from('campaigns')
      .select('metrics')
      .eq('id', schedule.campaign_id)
      .single();

    if (!campaign) return;

    const metrics = campaign.metrics;
    metrics.leads_called++;
    
    if (schedule.connected) {
      metrics.calls_connected++;
    }
    
    if (schedule.outcome === 'qualified') {
      metrics.appointments_booked++;
    }

    metrics.cost_total += schedule.cost_per_call;
    metrics.conversion_rate = (metrics.appointments_booked / metrics.leads_called) * 100;

    // Update campaign
    const { error } = await getSupabase()
      .from('campaigns')
      .update({ metrics, updated_at: new Date().toISOString() })
      .eq('id', schedule.campaign_id);

    if (error) console.error('[scheduler] Error updating metrics:', error);
  }

  /**
   * Calculate available calling windows
   */
  private calculateCallingWindows(
    startDate: Date,
    endDate: Date,
    calling_hours: Campaign['calling_hours']
  ): Array<{ start: Date; end: Date }> {
    const windows: Array<{ start: Date; end: Date }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      
      if (calling_hours.days_of_week.includes(dayOfWeek)) {
        const [startHour, startMin] = calling_hours.start.split(':').map(Number);
        const [endHour, endMin] = calling_hours.end.split(':').map(Number);
        
        const windowStart = new Date(current);
        windowStart.setHours(startHour, startMin, 0, 0);
        
        const windowEnd = new Date(current);
        windowEnd.setHours(endHour, endMin, 0, 0);
        
        windows.push({ start: windowStart, end: windowEnd });
      }
      
      current.setDate(current.getDate() + 1);
    }

    return windows;
  }

  /**
   * Helper: Add days to date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Helper: Add hours to date
   */
  private addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Helper: Add minutes to date
   */
  private addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Helper: Get minutes between two dates
   */
  private getMinutesBetween(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / 60000;
  }
}

// Export singleton instance
export const campaignScheduler = new CampaignScheduler();
