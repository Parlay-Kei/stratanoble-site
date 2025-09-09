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
      // ACHIEVERY Platform Tables
      user_dreams: {
        Row: {
          id: string
          user_id: string
          dream_text: string
          current_phase: 'explore' | 'build' | 'launch'
          starter_actions: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dream_text: string
          current_phase?: 'explore' | 'build' | 'launch'
          starter_actions?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dream_text?: string
          current_phase?: 'explore' | 'build' | 'launch'
          starter_actions?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_actions: {
        Row: {
          id: string
          user_id: string
          dream_id: string | null
          original_text: string
          reframed_text: string | null
          category: 'learning' | 'building' | 'connecting'
          phase: 'explore' | 'build' | 'launch'
          logged_date: string
          is_significant: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dream_id?: string | null
          original_text: string
          reframed_text?: string | null
          category: 'learning' | 'building' | 'connecting'
          phase: 'explore' | 'build' | 'launch'
          logged_date?: string
          is_significant?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dream_id?: string | null
          original_text?: string
          reframed_text?: string | null
          category?: 'learning' | 'building' | 'connecting'
          phase?: 'explore' | 'build' | 'launch'
          logged_date?: string
          is_significant?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      weekly_narratives: {
        Row: {
          id: string
          user_id: string
          week_start: string
          narrative_text: string
          actions_count: number
          phase_progression: string | null
          key_insights: string[]
          next_suggestions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          narrative_text: string
          actions_count?: number
          phase_progression?: string | null
          key_insights?: string[]
          next_suggestions?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          narrative_text?: string
          actions_count?: number
          phase_progression?: string | null
          key_insights?: string[]
          next_suggestions?: string[]
          created_at?: string
        }
      }
      trust_ledger_shares: {
        Row: {
          id: string
          user_id: string
          shared_with_email: string
          access_level: string
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shared_with_email: string
          access_level?: string
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shared_with_email?: string
          access_level?: string
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_platform_settings: {
        Row: {
          id: string
          user_id: string
          onboarding_completed: boolean
          weekly_narrative_email: boolean
          action_reminders: boolean
          preferred_phase: 'explore' | 'build' | 'launch'
          weekly_action_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          onboarding_completed?: boolean
          weekly_narrative_email?: boolean
          action_reminders?: boolean
          preferred_phase?: 'explore' | 'build' | 'launch'
          weekly_action_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          onboarding_completed?: boolean
          weekly_narrative_email?: boolean
          action_reminders?: boolean
          preferred_phase?: 'explore' | 'build' | 'launch'
          weekly_action_limit?: number
          created_at?: string
          updated_at?: string
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
      get_user_action_limit: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      can_log_action: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      generate_weekly_narrative: {
        Args: {
          user_uuid: string
          week_date: string
        }
        Returns: string
      }
    }
    Enums: {
      achievery_action_category: 'learning' | 'building' | 'connecting'
      achievery_phase: 'explore' | 'build' | 'launch'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}