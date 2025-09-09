// ACHIEVERY Platform Types
import { Database } from '@strata-noble/utils'

// Base types from database
export type UserDream = Database['public']['Tables']['user_dreams']['Row']
export type UserAction = Database['public']['Tables']['user_actions']['Row']
export type WeeklyNarrative = Database['public']['Tables']['weekly_narratives']['Row']
export type TrustLedgerShare = Database['public']['Tables']['trust_ledger_shares']['Row']
export type UserPlatformSettings = Database['public']['Tables']['user_platform_settings']['Row']

// Insert types for forms
export type UserDreamInsert = Database['public']['Tables']['user_dreams']['Insert']
export type UserActionInsert = Database['public']['Tables']['user_actions']['Insert']
export type UserPlatformSettingsInsert = Database['public']['Tables']['user_platform_settings']['Insert']

// Enums
export type AchieveryActionCategory = Database['public']['Enums']['achievery_action_category']
export type AchieveryPhase = Database['public']['Enums']['achievery_phase']

// Frontend-specific types
export interface PlatformUser {
  id: string
  email: string
  name: string
  tier: 'lite' | 'growth' | 'partner'
  status: 'active' | 'cancelled' | 'suspended'
  settings?: UserPlatformSettings
}

export interface ActionWithDream extends UserAction {
  dream?: UserDream
}

export interface DreamWithActions extends UserDream {
  actions: UserAction[]
  action_count: number
  last_action_date?: string
}

export interface WeeklyProgress {
  week_start: string
  actions_count: number
  categories: {
    learning: number
    building: number
    connecting: number
  }
  phases: {
    explore: number
    build: number
    launch: number
  }
  narrative?: WeeklyNarrative
}

export interface ActionFormData {
  original_text: string
  category: AchieveryActionCategory
  dream_id?: string
}

export interface DreamFormData {
  dream_text: string
  current_phase?: AchieveryPhase
}

export interface OnboardingData {
  dream: string
  phase: AchieveryPhase
  starter_actions: string[]
}

export interface ReframeResult {
  original_text: string
  reframed_text: string
  category: AchieveryActionCategory
  phase: AchieveryPhase
  significance_score: number
}

// API Response types
export interface PlatformResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface ActionLimitResponse {
  can_log_action: boolean
  current_count: number
  limit: number
  reset_date: string
}

export interface WeeklyNarrativeResponse {
  narrative: WeeklyNarrative
  generated_at: string
  insights: string[]
  suggestions: string[]
}

// Component prop types
export interface ActionCardProps {
  action: UserAction
  showDream?: boolean
  onEdit?: (action: UserAction) => void
  onDelete?: (actionId: string) => void
}

export interface DreamCardProps {
  dream: DreamWithActions
  onEdit?: (dream: UserDream) => void
  onAddAction?: (dreamId: string) => void
}

export interface ProgressChartProps {
  data: WeeklyProgress[]
  timeframe: 'week' | 'month' | 'year'
}

// Utility types
export type ActionsByCategory = {
  [K in AchieveryActionCategory]: UserAction[]
}

export type ActionsByPhase = {
  [K in AchieveryPhase]: UserAction[]
}

export interface PlatformStats {
  total_actions: number
  current_streak: number
  actions_this_week: number
  dreams_count: number
  favorite_category: AchieveryActionCategory
  current_phase: AchieveryPhase
}