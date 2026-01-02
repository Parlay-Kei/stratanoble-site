import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { publicConfig } from './public-config';

const supabaseUrl = publicConfig.supabaseUrl;
const supabaseAnonKey = publicConfig.supabaseAnonKey;

// Client-side Supabase client (uses anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key for admin operations)
let _admin: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Validates that admin environment variables are configured correctly.
 * @returns Validation result with any errors found
 */
export function validateAdminEnvVars(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function getSupabaseAdmin(): Promise<ReturnType<typeof createClient<Database>>> {
  // Prevent client-side usage
  if (typeof window !== 'undefined') {
    throw new Error('supabase admin client is server-only');
  }

  // Return cached instance if available
  if (_admin) return _admin;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Production requires service role key
  if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations in production. ' +
      'This prevents privilege escalation attacks. Configure the service role key immediately.'
    );
  }

  // Development warning for missing service role key
  if (!serviceRoleKey) {
    console.warn(
      '[SECURITY WARNING] SUPABASE_SERVICE_ROLE_KEY not set in development. ' +
      'Using anon key for admin operations. This is ONLY acceptable in local development. ' +
      'DO NOT deploy to production without a service role key.'
    );
  }

  _admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return _admin;
}

// Database helper functions
export const db = {
  // Contact submissions
  async createContactSubmission(data: {
    name: string;
    email: string;
    phone?: string;
    topic?: string;
    message: string;
    source?: string;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: submission, error } = await (admin as any)
      .from('contact_submissions')
      .insert([
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          topic: data.topic,
          message: data.message,
          source: data.source || 'website',
          status: 'new',
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return submission;
  },

  // Orders
  async createOrder(data: {
    stripe_session_id: string;
    customer_name: string;
    customer_email: string;
    package_type: string;
    amount: number;
    status: string;
    metadata?: Record<string, unknown>;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: order, error } = await (admin as any)
      .from('orders')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return order;
  },

  async updateOrderStatus(stripeSessionId: string, status: string, metadata?: Record<string, unknown>) {
    const updateData: { status: string; metadata?: Record<string, unknown> } = { status };
    if (metadata) {
      updateData.metadata = metadata;
    }

    const admin = await getSupabaseAdmin();
    const { data: order, error } = await (admin as any)
      .from('orders')
      .update(updateData)
      .eq('stripe_session_id', stripeSessionId)
      .select()
      .single();

    if (error) throw error;
    return order;
  },

  async getOrderByStripeSession(stripeSessionId: string) {
    const admin = await getSupabaseAdmin();
    const { data: order, error } = await (admin as any)
      .from('orders')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .single();

    if (error) throw error;
    return order;
  },

  // Customers
  async upsertCustomer(data: {
    email: string;
    name: string;
    phone?: string;
    stripe_customer_id?: string;
    metadata?: Record<string, unknown>;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: customer, error } = await (admin as any)
      .from('customers')
      .upsert([data], { onConflict: 'email' })
      .select()
      .single();

    if (error) throw error;
    return customer;
  },

  // Webhook logs
  async logWebhook(data: {
    event_id: string;
    event_type: string;
    processed: boolean;
    error_message?: string;
    payload: Record<string, unknown>;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: log, error } = await (admin as any)
      .from('webhook_logs')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return log;
  },

  // Email logs
  async logEmail(data: {
    recipient: string;
    subject: string;
    template: string;
    status: 'sent' | 'failed' | 'pending';
    error_message?: string;
    metadata?: Record<string, unknown>;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: log, error } = await (admin as any)
      .from('email_logs')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return log;
  },

  // SaaS-specific functions
  async createClient(data: {
    id?: string;
    stripe_customer_id?: string;
    tier?: 'lite' | 'growth' | 'partner';
    status?: 'active' | 'cancelled' | 'suspended';
  }) {
    const insertData = {
      ...data,
      tier: data.tier || 'lite',
      status: data.status || 'active'
    };

    const admin = await getSupabaseAdmin();
    const { data: client, error } = await (admin as any)
      .from('clients')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return client;
  },

  async upsertSubscription(data: {
    client_id: string;
    stripe_subscription_id: string;
    status: string;
    current_period_start?: string;
    current_period_end?: string;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: subscription, error } = await (admin as any)
      .from('subscriptions')
      .upsert([data], { onConflict: 'stripe_subscription_id' })
      .select()
      .single();

    if (error) throw error;
    return subscription;
  },

  async updateClientTier(clientId: string, tier: 'lite' | 'growth' | 'partner') {
    const admin = await getSupabaseAdmin();
    const { data: client, error } = await (admin as any)
      .from('clients')
      .update({ tier })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    return client;
  },

  async upsertClientByStripeCustomerId(
    stripeCustomerId: string,
    updates: { tier?: 'lite' | 'growth' | 'partner'; status?: 'active' | 'cancelled' | 'suspended' } = {}
  ) {
    const insertData: Database['public']['Tables']['clients']['Insert'] = {
      stripe_customer_id: stripeCustomerId,
      tier: updates.tier ?? 'lite',
      status: updates.status ?? 'active',
    } as any;

    const admin = await getSupabaseAdmin();
    const { data: client, error } = await (admin as any)
      .from('clients')
      .upsert([insertData], { onConflict: 'stripe_customer_id' })
      .select()
      .single();

    if (error) throw error;
    return client;
  },

  async logStripeEvent(data: {
    event_id: string;
    type: string;
    handled?: boolean;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: log, error } = await (admin as any)
      .from('stripe_event_log')
      .upsert([{
        event_id: data.event_id,
        type: data.type,
        handled: data.handled || false,
        received_at: new Date().toISOString()
      }], { onConflict: 'event_id' })
      .select()
      .single();

    if (error) throw error;
    return log;
  },

  async getClientByStripeCustomerId(stripeCustomerId: string) {
    const admin = await getSupabaseAdmin();
    const { data: client, error } = await (admin as any)
      .from('clients')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (error) throw error;
    return client;
  },

  async getOfferings() {
    const admin = await getSupabaseAdmin();
    const { data: offerings, error } = await (admin as any)
      .from('offerings')
      .select('*')
      .order('monthly_price');

    if (error) throw error;
    return offerings;
  },

  async initializeOnboarding(clientId: string) {
    const admin = await getSupabaseAdmin();
    const { data: onboarding, error } = await (admin as any)
      .from('onboarding_status')
      .upsert([{
        client_id: clientId,
        has_airtable: false,
        has_geniuslink: false,
        welcome_email_sent: false
      }], { onConflict: 'client_id' })
      .select()
      .single();

    if (error) throw error;
    return onboarding;
  },

  // Lead management functions for Phase 3 CRM
  async createLead(data: {
    name: string;
    email: string;
    phone?: string;
    passion_area?: string;
    business_stage: string;
    main_challenge: string;
    time_commitment?: string;
    success_goal?: string;
    interested_tier: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
    metadata?: Record<string, unknown>;
  }) {
    const admin = await getSupabaseAdmin();

    const insertData = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      passion_area: data.passion_area || null,
      business_stage: data.business_stage,
      main_challenge: data.main_challenge,
      time_commitment: data.time_commitment || null,
      success_goal: data.success_goal || null,
      interested_tier: data.interested_tier,
      stage: 'discovery' as const,
      source: 'website',
      assigned_tasks: 0,
      completed_tasks: 0,
      priority: 0,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      referrer: data.referrer || null,
      metadata: data.metadata || null,
    };

    const { data: lead, error } = await (admin as any)
      .from('leads')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return lead;
  },

  async updateLead(leadId: string, updates: {
    stage?: 'discovery' | 'scheduled' | 'called' | 'qualified' | 'converted' | 'dormant';
    assigned_to?: string;
    notes?: string;
    priority?: number;
    achievery_user_id?: string;
    assigned_tasks?: number;
    completed_tasks?: number;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: lead, error } = await (admin as any)
      .from('leads')
      .update({
        ...updates,
        last_activity: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return lead;
  },

  async getLead(leadId: string) {
    const admin = await getSupabaseAdmin();
    const { data: lead, error } = await (admin as any)
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) throw error;
    return lead;
  },

  async getLeadByEmail(email: string) {
    const admin = await getSupabaseAdmin();
    const { data: lead, error } = await (admin as any)
      .from('leads')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return lead;
  },

  async getLeads(filters?: {
    stage?: 'discovery' | 'scheduled' | 'called' | 'qualified' | 'converted' | 'dormant';
    business_stage?: string;
    assigned_to?: string;
    priority?: number;
    limit?: number;
    offset?: number;
  }) {
    const admin = await getSupabaseAdmin();
    let query = (admin as any).from('leads').select('*');

    if (filters?.stage) {
      query = query.eq('stage', filters.stage);
    }
    if (filters?.business_stage) {
      query = query.eq('business_stage', filters.business_stage);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.priority !== undefined) {
      query = query.eq('priority', filters.priority);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    const { data: leads, error } = await query;
    if (error) throw error;
    return leads;
  },

  async scheduleEmailSequences(leadId: string, recipientEmail: string, leadName: string = '', businessStage: string = '', mainChallenge: string = '') {
    const admin = await getSupabaseAdmin();
    const { data: sequences, error } = await (admin as any)
      .rpc('schedule_email_sequences', {
        p_lead_id: leadId,
        p_recipient_email: recipientEmail,
        p_lead_name: leadName,
        p_business_stage: businessStage,
        p_main_challenge: mainChallenge
      });

    if (error) throw error;
    return sequences;
  },

  async getPendingEmailSequences() {
    const admin = await getSupabaseAdmin();
    const { data: sequences, error } = await (admin as any)
      .rpc('get_pending_email_sequences');

    if (error) throw error;
    return sequences;
  },

  async updateEmailSequenceStatus(sequenceId: string, status: 'sending' | 'sent' | 'failed' | 'cancelled', errorMessage?: string, emailProviderId?: string) {
    const admin = await getSupabaseAdmin();
    const updateData: any = {
      status,
      attempts: (admin as any).raw('attempts + 1')
    };

    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }
    if (emailProviderId) {
      updateData.email_provider_id = emailProviderId;
    }
    if (status === 'failed') {
      updateData.next_retry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Retry in 1 hour
    }

    const { data: sequence, error } = await (admin as any)
      .from('email_sequences')
      .update(updateData)
      .eq('id', sequenceId)
      .select()
      .single();

    if (error) throw error;
    return sequence;
  },

  // Early Access Signup functions
  async createEarlyAccessSignup(data: {
    name: string;
    email: string;
    role?: string | null;
    goals?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    referrer?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    const admin = await getSupabaseAdmin();
    const { data: signup, error } = await (admin as any)
      .from('early_access_signups')
      .insert([
        {
          name: data.name,
          email: data.email,
          role: data.role,
          goals: data.goals,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          referrer: data.referrer,
          metadata: data.metadata,
          status: 'active',
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return signup;
  },

  async getEarlyAccessSignup(email: string) {
    const admin = await getSupabaseAdmin();
    const { data: signup, error } = await (admin as any)
      .from('early_access_signups')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return signup;
  },

  async getEarlyAccessSignups(filters?: {
    status?: 'active' | 'converted' | 'unsubscribed';
    limit?: number;
    offset?: number;
  }) {
    const admin = await getSupabaseAdmin();
    let query = (admin as any).from('early_access_signups').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    const { data: signups, error } = await query;
    if (error) throw error;
    return signups;
  },

  async updateEarlyAccessSignupStatus(email: string, status: 'active' | 'converted' | 'unsubscribed') {
    const admin = await getSupabaseAdmin();
    const { data: signup, error } = await (admin as any)
      .from('early_access_signups')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    return signup;
  },

};

// Supabase Admin RPC function for handling Stripe events
export async function handleStripeEvent(event: Record<string, unknown>) {
  const admin = await getSupabaseAdmin();
  const { data, error } = await (admin as any)
    .rpc('handle_stripe_event', { event_data: event });

  if (error) throw error;
  return data;
}
