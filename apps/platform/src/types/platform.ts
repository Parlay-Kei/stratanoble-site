// Platform-specific types for ACHIEVERY
// These extend the base Strata Noble types for platform functionality

export type GoalCategory = 
  | 'fitness' 
  | 'career' 
  | 'learning' 
  | 'financial' 
  | 'creative' 
  | 'social'

export interface PlatformGoal {
  id: string
  user_id: string
  title: string
  category: GoalCategory
  target: number
  current: number
  unit: string
  streak: number
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlatformTask {
  id: string
  goal_id: string
  description: string
  value: number
  completed: boolean
  completed_at: string | null
  due_date: string | null
  created_at: string
}

export interface PlatformAchievement {
  id: string
  title: string
  description: string
  icon: string
  category: GoalCategory | null
  criteria: Record<string, any>
  created_at: string
}

export interface PlatformUserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  created_at: string
}

export interface WeeklyReflection {
  id: string
  user_id: string
  week_start: string
  content: string | null
  goals_summary: Record<string, any> | null
  insights: string | null
  mood_rating: number | null
  created_at: string
  updated_at: string
}

// Integration types with existing Strata Noble system
export interface PlatformUser {
  // Extends existing Strata Noble user with platform-specific fields
  platform_onboarded: boolean
  platform_tier: 'free' | 'pro' | 'enterprise'
  platform_settings: Record<string, any>
}

export interface PlatformSubscription {
  // Extends existing Strata Noble subscription for platform tiers
  platform_features: string[]
  goal_limit: number | null // null = unlimited
}