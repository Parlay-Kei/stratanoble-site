export type EngagementStatus = 'active' | 'paused' | 'closed'
export type SystemStage = 'diagnose' | 'build' | 'launch' | 'optimize'
export type TaskCadence = 'daily' | 'weekly' | 'one-time'
export type TaskAssignedTo = 'operator' | 'client' | 'both'
export type TaskStatus = 'open' | 'complete' | 'blocked'
export type ActorType = 'operator' | 'client'
export type Visibility = 'internal' | 'shared'

export interface Engagement {
  id: string
  client_user_id: string | null
  operator_user_id: string
  title: string
  status: EngagementStatus
  created_at: string
}

export interface OperatingSystem {
  id: string
  engagement_id: string
  name: string
  description: string | null
  stage: SystemStage
}

export interface Task {
  id: string
  system_id: string
  engagement_id: string
  title: string
  cadence: TaskCadence
  assigned_to: TaskAssignedTo
  status: TaskStatus
}

export interface Action {
  id: string
  engagement_id: string
  task_id: string | null
  actor_type: ActorType
  actor_user_id: string
  entry_text: string
  visibility: Visibility
  logged_at: string
  operational_insight?: string | null
}

export interface Blocker {
  id: string
  engagement_id: string
  task_id: string | null
  reported_by: string
  description: string
  resolved: boolean
  created_at: string
}

export interface ProofEntry {
  id: string
  engagement_id: string
  action_id: string | null
  task_id: string | null
  note: string
  actor_type: ActorType
  visibility: Visibility
  uploaded_at: string
}

export type HealthSignal = 'on_track' | 'needs_attention' | 'stalled'

export interface WeeklySummary {
  id: string
  engagement_id: string
  week_start: string
  content: string
  next_steps: string[]
  health_signal: HealthSignal
  generated_by: string
  generated_at: string
}

export interface EngagementSummary extends Engagement {
  client_email: string | null
  systems: (OperatingSystem & { tasks: Task[] })[]
  open_blocker_count: number
  open_blockers: Blocker[]
  actions: Action[]
  actions_this_week: { operator: number; client: number }
  last_action_at: string | null
}
