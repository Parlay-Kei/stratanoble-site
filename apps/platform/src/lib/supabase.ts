// Local Supabase client for platform
import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Validate required environment variables in development
if (typeof window === 'undefined') { // Server-side only
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url') {
    console.warn('⚠️  ACHIEVERY Platform: Missing NEXT_PUBLIC_SUPABASE_URL - some features will not work')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
    console.warn('⚠️  ACHIEVERY Platform: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - database access will fail')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database type definitions
export type Database = {
  public: {
    Tables: {
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
    Enums: {
      achievery_action_category: 'learning' | 'building' | 'connecting'
      achievery_phase: 'explore' | 'build' | 'launch'
    }
  }
}

// Platform-specific Supabase configurations
export const PLATFORM_TABLES = {
  USER_DREAMS: 'user_dreams',
  USER_ACTIONS: 'user_actions',
  WEEKLY_NARRATIVES: 'weekly_narratives',
  TRUST_LEDGER_SHARES: 'trust_ledger_shares',
  USER_PLATFORM_SETTINGS: 'user_platform_settings',
} as const
