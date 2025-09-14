export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string | null
          topic: string | null
          message: string
          source: string
          status: 'new' | 'contacted' | 'qualified' | 'closed'
          assigned_to: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone?: string | null
          topic?: string | null
          message: string
          source?: string
          status?: 'new' | 'contacted' | 'qualified' | 'closed'
          assigned_to?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string | null
          topic?: string | null
          message?: string
          source?: string
          status?: 'new' | 'contacted' | 'qualified' | 'closed'
          assigned_to?: string | null
          notes?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          phone: string | null
          stripe_customer_id: string | null
          total_spent: number
          order_count: number
          last_order_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          phone?: string | null
          stripe_customer_id?: string | null
          total_spent?: number
          order_count?: number
          last_order_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          phone?: string | null
          stripe_customer_id?: string | null
          total_spent?: number
          order_count?: number
          last_order_at?: string | null
          metadata?: Json | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          stripe_session_id: string
          customer_name: string
          customer_email: string
          package_type: string
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          fulfillment_status: 'pending' | 'processing' | 'completed' | 'cancelled'
          delivered_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          stripe_session_id: string
          customer_name: string
          customer_email: string
          package_type: string
          amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          fulfillment_status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          delivered_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          stripe_session_id?: string
          customer_name?: string
          customer_email?: string
          package_type?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          fulfillment_status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          delivered_at?: string | null
          metadata?: Json | null
        }
      }
      webhook_logs: {
        Row: {
          id: string
          created_at: string
          event_id: string
          event_type: string
          processed: boolean
          error_message: string | null
          payload: Json
          processed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          event_type: string
          processed?: boolean
          error_message?: string | null
          payload: Json
          processed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          event_type?: string
          processed?: boolean
          error_message?: string | null
          payload?: Json
          processed_at?: string | null
        }
      }
      email_logs: {
        Row: {
          id: string
          created_at: string
          recipient: string
          subject: string
          template: string
          status: 'sent' | 'failed' | 'pending'
          error_message: string | null
          sent_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          recipient: string
          subject: string
          template: string
          status?: 'sent' | 'failed' | 'pending'
          error_message?: string | null
          sent_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          recipient?: string
          subject?: string
          template?: string
          status?: 'sent' | 'failed' | 'pending'
          error_message?: string | null
          sent_at?: string | null
          metadata?: Json | null
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          stripe_customer_id: string | null
          tier: 'lite' | 'growth' | 'partner'
          status: 'active' | 'cancelled' | 'suspended'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          tier?: 'lite' | 'growth' | 'partner'
          status?: 'active' | 'cancelled' | 'suspended'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          tier?: 'lite' | 'growth' | 'partner'
          status?: 'active' | 'cancelled' | 'suspended'
        }
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          client_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          client_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          client_id?: string
          stripe_subscription_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
        }
      }
      offerings: {
        Row: {
          id: 'lite' | 'growth' | 'partner'
          created_at: string
          stripe_price_id: string
          nickname: string
          monthly_price: number
        }
        Insert: {
          id: 'lite' | 'growth' | 'partner'
          created_at?: string
          stripe_price_id: string
          nickname: string
          monthly_price: number
        }
        Update: {
          id?: 'lite' | 'growth' | 'partner'
          created_at?: string
          stripe_price_id?: string
          nickname?: string
          monthly_price?: number
        }
      }
      stripe_event_log: {
        Row: {
          id: number
          created_at: string
          event_id: string
          type: string
          received_at: string
          handled: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          event_id: string
          type: string
          received_at?: string
          handled?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          event_id?: string
          type?: string
          received_at?: string
          handled?: boolean
        }
      }
      onboarding_status: {
        Row: {
          client_id: string
          created_at: string
          updated_at: string
          has_airtable: boolean
          has_geniuslink: boolean
          welcome_email_sent: boolean
        }
        Insert: {
          client_id: string
          created_at?: string
          updated_at?: string
          has_airtable?: boolean
          has_geniuslink?: boolean
          welcome_email_sent?: boolean
        }
        Update: {
          client_id?: string
          created_at?: string
          updated_at?: string
          has_airtable?: boolean
          has_geniuslink?: boolean
          welcome_email_sent?: boolean
        }
      }
      metric_feed: {
        Row: {
          id: string
          created_at: string
          client_id: string
          source: 'youtube' | 'tiktok'
          payload: Json
          fetched_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          client_id: string
          source: 'youtube' | 'tiktok'
          payload: Json
          fetched_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          client_id?: string
          source?: 'youtube' | 'tiktok'
          payload?: Json
          fetched_at?: string
        }
      }
      metric_summary: {
        Row: {
          client_id: string
          date: string
          views: number
          watch_hours: number
          subs: number
          rpm: number
        }
        Insert: {
          client_id: string
          date: string
          views?: number
          watch_hours?: number
          subs?: number
          rpm?: number
        }
        Update: {
          client_id?: string
          date?: string
          views?: number
          watch_hours?: number
          subs?: number
          rpm?: number
        }
      }
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string | null
          passion_area: string | null
          business_stage: string
          main_challenge: string
          time_commitment: string | null
          success_goal: string | null
          interested_tier: string
          stage: 'discovery' | 'scheduled' | 'called' | 'qualified' | 'converted' | 'dormant'
          source: string
          achievery_user_id: string | null
          assigned_tasks: number
          completed_tasks: number
          assigned_to: string | null
          notes: string | null
          last_activity: string
          priority: number
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          referrer: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone?: string | null
          passion_area?: string | null
          business_stage: string
          main_challenge: string
          time_commitment?: string | null
          success_goal?: string | null
          interested_tier: string
          stage?: 'discovery' | 'scheduled' | 'called' | 'qualified' | 'converted' | 'dormant'
          source?: string
          achievery_user_id?: string | null
          assigned_tasks?: number
          completed_tasks?: number
          assigned_to?: string | null
          notes?: string | null
          last_activity?: string
          priority?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referrer?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string | null
          passion_area?: string | null
          business_stage?: string
          main_challenge?: string
          time_commitment?: string | null
          success_goal?: string | null
          interested_tier?: string
          stage?: 'discovery' | 'scheduled' | 'called' | 'qualified' | 'converted' | 'dormant'
          source?: string
          achievery_user_id?: string | null
          assigned_tasks?: number
          completed_tasks?: number
          assigned_to?: string | null
          notes?: string | null
          last_activity?: string
          priority?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referrer?: string | null
          metadata?: Json | null
        }
      }
      email_sequences: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          lead_id: string
          sequence_type: string
          sequence_day: number
          scheduled_for: string
          status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
          template_name: string
          recipient_email: string
          subject: string | null
          personalization_data: Json | null
          sent_at: string | null
          delivered_at: string | null
          opened_at: string | null
          clicked_at: string | null
          attempts: number
          max_attempts: number
          error_message: string | null
          next_retry: string | null
          email_provider_id: string | null
          email_log_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          lead_id: string
          sequence_type: string
          sequence_day?: number
          scheduled_for: string
          status?: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
          template_name: string
          recipient_email: string
          subject?: string | null
          personalization_data?: Json | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          attempts?: number
          max_attempts?: number
          error_message?: string | null
          next_retry?: string | null
          email_provider_id?: string | null
          email_log_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          lead_id?: string
          sequence_type?: string
          sequence_day?: number
          scheduled_for?: string
          status?: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
          template_name?: string
          recipient_email?: string
          subject?: string | null
          personalization_data?: Json | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          attempts?: number
          max_attempts?: number
          error_message?: string | null
          next_retry?: string | null
          email_provider_id?: string | null
          email_log_id?: string | null
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_stripe_event: {
        Args: {
          event_data: Json
        }
        Returns: Json
      }
      schedule_email_sequences: {
        Args: {
          p_lead_id: string
          p_recipient_email: string
          p_lead_name?: string
          p_business_stage?: string
          p_main_challenge?: string
        }
        Returns: {
          sequence_id: string
          sequence_type: string
          scheduled_for: string
        }[]
      }
      get_pending_email_sequences: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          lead_id: string
          sequence_type: string
          template_name: string
          recipient_email: string
          subject: string
          personalization_data: Json
          scheduled_for: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}