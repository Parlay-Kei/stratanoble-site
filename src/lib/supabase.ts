import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only throw error at runtime, not during build
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables');
}

// Provide defaults for build time
const defaultUrl = supabaseUrl || 'https://placeholder.supabase.co';
const defaultAnonKey = supabaseAnonKey || 'placeholder-key';

// Client-side Supabase client (uses anon key)
export const supabase = createClient<Database>(defaultUrl, defaultAnonKey);

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient<Database>(
  defaultUrl,
  supabaseServiceRoleKey || defaultAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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
    const { data: submission, error } = await supabaseAdmin
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
        },
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
    const { data: order, error } = await supabaseAdmin
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

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('stripe_session_id', stripeSessionId)
      .select()
      .single();

    if (error) throw error;
    return order;
  },

  async getOrderByStripeSession(stripeSessionId: string) {
    const { data: order, error } = await supabaseAdmin
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
    const { data: customer, error } = await supabaseAdmin
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
    const { data: log, error } = await supabaseAdmin
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
    const { data: log, error } = await supabaseAdmin
      .from('email_logs')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return log;
  },
};