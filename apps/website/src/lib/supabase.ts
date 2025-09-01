import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { publicConfig } from './public-config';

const supabaseUrl = publicConfig.supabaseUrl;
const supabaseAnonKey = publicConfig.supabaseAnonKey;

// Client-side Supabase client (uses anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key for admin operations)
let _admin: ReturnType<typeof createClient<Database>> | null = null;
async function getSupabaseAdmin(): Promise<ReturnType<typeof createClient<Database>>> {
  if (typeof window !== 'undefined') {
    throw new Error('supabase admin client is server-only');
  }
  if (_admin) return _admin;
  _admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
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

};

// Supabase Admin RPC function for handling Stripe events
export async function handleStripeEvent(event: Record<string, unknown>) {
  const admin = await getSupabaseAdmin();
  const { data, error } = await (admin as any)
    .rpc('handle_stripe_event', { event_data: event });

  if (error) throw error;
  return data;
}