'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@strata-noble/ui'
import { PlatformNav } from '../layout/PlatformNav'
import type { SystemStage, TaskStatus } from '../../types/achievery'

interface ClientPortalProps {
  user: { id: string; email: string }
}

type HealthSignal = 'on_track' | 'needs_attention' | 'stalled'

interface LatestSummary {
  week_start: string
  content: string
  next_steps: string[]
  health_signal: HealthSignal
}

interface RecentAction {
  id: string
  entry_text: string
  actor_type: 'operator' | 'client'
  actor_user_id: string
  logged_at: string
  task_id: string | null
}

interface OpenBlocker {
  id: string
  description: string
  task_id: string | null
  created_at: string
}

interface ClientTask {
  id: string
  system_id: string
  title: string
  cadence: string
  assigned_to: string
  status: TaskStatus
}

interface ClientSystem {
  id: string
  name: string
  stage: SystemStage
  tasks: ClientTask[]
}

interface ClientEngagement {
  id: string
  title: string
  status: string
  systems: ClientSystem[]
  recent_actions: RecentAction[]
  open_blockers: OpenBlocker[]
  latest_summary: LatestSummary | null
}

const STAGE_CLASSES: Record<SystemStage, string> = {
  diagnose: 'bg-field-sage text-command-navy',
  build: 'bg-fault-amber text-command-navy',
  launch: 'bg-forest-green text-off-white',
  optimize: 'bg-command-navy text-off-white',
}

const HEALTH_LABEL: Record<HealthSignal, string> = {
  on_track: 'On track',
  needs_attention: 'Needs attention',
  stalled: 'Stalled',
}

const HEALTH_CLASSES: Record<HealthSignal, string> = {
  on_track: 'bg-forest-green text-off-white',
  needs_attention: 'bg-fault-amber text-command-navy',
  stalled: 'bg-command-navy text-off-white opacity-60',
}

const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  open: 'border border-gray-200 text-gray-600',
  complete: 'border border-gray-200 text-gray-400',
  blocked: 'border border-red-200 text-red-600',
}

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 172800) return 'Yesterday'
  return `${Math.floor(diff / 86400)} days ago`
}

function weekRange(weekStart: string): string {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

function ClientActionInput({
  engagementId,
  onSuccess,
}: {
  engagementId: string
  onSuccess: () => void
}) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/achievery/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagement_id: engagementId,
          note: text.trim(),
          visibility: 'shared',
        }),
      })
      if (res.ok) {
        setText('')
        onSuccess()
      } else {
        setError('Failed to save. Try again.')
      }
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What did you do or decide today?"
        required
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !text.trim()}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        {submitting ? 'Saving…' : 'Log action'}
      </button>
    </form>
  )
}

export default function ClientPortal({ user }: ClientPortalProps) {
  const router = useRouter()
  const [engagement, setEngagement] = useState<ClientEngagement | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  // Blocker form
  const [showAddBlocker, setShowAddBlocker] = useState(false)
  const [blockerDesc, setBlockerDesc] = useState('')
  const [blockerTaskId, setBlockerTaskId] = useState('')
  const [addingBlocker, setAddingBlocker] = useState(false)

  const fetchEngagement = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/achievery/client')
      const json = await res.json()
      if (!res.ok) { setEngagement(null); return }
      if (json.is_operator) { router.push('/dashboard'); return }
      setEngagement(json.engagement ?? null)
    } catch {
      setEngagement(null)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchEngagement() }, [fetchEngagement])

  async function toggleTaskStatus(taskId: string, current: TaskStatus) {
    if (!engagement) return
    const next: TaskStatus = current === 'open' ? 'complete' : current === 'complete' ? 'blocked' : 'open'
    await fetch(`/api/achievery/systems/${engagement.id}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    await fetchEngagement()
  }

  async function resolveBlocker(blockerId: string) {
    if (!engagement) return
    await fetch(`/api/achievery/systems/${engagement.id}/blockers/${blockerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: true }),
    })
    await fetchEngagement()
  }

  async function addBlocker(e: React.FormEvent) {
    e.preventDefault()
    if (!engagement || !blockerDesc.trim()) return
    setAddingBlocker(true)
    const res = await fetch(`/api/achievery/systems/${engagement.id}/blockers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: blockerDesc.trim(), task_id: blockerTaskId || undefined }),
    })
    if (res.ok) {
      setBlockerDesc('')
      setBlockerTaskId('')
      setShowAddBlocker(false)
      await fetchEngagement()
    }
    setAddingBlocker(false)
  }

  if (loading || engagement === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (engagement === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PlatformNav actor="client" />
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-gray-500">Your operator hasn&apos;t set up your engagement yet.</p>
        </div>
      </div>
    )
  }

  const allTasks = engagement.systems.flatMap(s => s.tasks)

  return (
    <div className="min-h-screen bg-gray-50">
      <PlatformNav actor="client" />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{engagement.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {engagement.systems.slice(0, 3).map(s => (
              <span
                key={s.id}
                className={`text-xs px-2 py-0.5 rounded font-medium ${STAGE_CLASSES[s.stage]}`}
              >
                {s.name} · {s.stage}
              </span>
            ))}
            {engagement.systems.length > 3 && (
              <span className="text-xs text-gray-400">+{engagement.systems.length - 3} more</span>
            )}
            {engagement.latest_summary && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${HEALTH_CLASSES[engagement.latest_summary.health_signal]}`}>
                {HEALTH_LABEL[engagement.latest_summary.health_signal]}
              </span>
            )}
          </div>
        </div>

        {/* Your tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Your tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {engagement.systems.filter(s => s.tasks.length > 0).length === 0 ? (
              <p className="text-sm text-gray-400">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-5">
                {engagement.systems.filter(s => s.tasks.length > 0).map(sys => (
                  <div key={sys.id}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {sys.name}
                    </p>
                    <div className="space-y-2">
                      {sys.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm text-gray-800 truncate">{task.title}</span>
                            <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
                              {task.cadence}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleTaskStatus(task.id, task.status)}
                            className={`text-xs px-2 py-0.5 rounded ml-2 shrink-0 ${TASK_STATUS_CLASSES[task.status]}`}
                          >
                            {task.status}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log an action */}
        <Card>
          <CardHeader>
            <CardTitle>Log an action</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientActionInput
              engagementId={engagement.id}
              onSuccess={fetchEngagement}
            />
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {engagement.recent_actions.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet. Log your first action above.</p>
            ) : (
              <div className="space-y-4">
                {engagement.recent_actions.map(action => {
                  const taskTitle = allTasks.find(t => t.id === action.task_id)?.title
                  const actorLabel = action.actor_user_id === user.id ? 'You' : 'Strata Noble'
                  return (
                    <div key={action.id} className="border-l-2 border-gray-200 pl-3">
                      <p className="text-sm text-gray-800 leading-relaxed">{action.entry_text}</p>
                      {taskTitle && (
                        <p className="text-xs text-gray-400 mt-0.5 border border-gray-200 rounded px-1.5 py-0.5 inline-block">
                          {taskTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-medium text-gray-600">{actorLabel}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{relativeTime(action.logged_at)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blockers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Blockers</CardTitle>
              <button
                onClick={() => setShowAddBlocker(!showAddBlocker)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Report
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showAddBlocker && (
              <form onSubmit={addBlocker} className="space-y-2 pb-3 border-b border-gray-100">
                <input
                  value={blockerDesc}
                  onChange={e => setBlockerDesc(e.target.value)}
                  placeholder="Describe what's blocking you"
                  required
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {allTasks.length > 0 && (
                  <select
                    value={blockerTaskId}
                    onChange={e => setBlockerTaskId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No linked task</option>
                    {allTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addingBlocker || !blockerDesc.trim()}
                    className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm font-medium disabled:opacity-40"
                  >
                    {addingBlocker ? 'Saving…' : 'Report blocker'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBlocker(false)}
                    className="px-3 text-sm text-gray-500 border border-gray-200 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {engagement.open_blockers.length === 0 ? (
              <p className="text-sm text-gray-400">No open blockers.</p>
            ) : (
              engagement.open_blockers.map(blocker => (
                <div key={blocker.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">{blocker.description}</p>
                    {blocker.task_id && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {allTasks.find(t => t.id === blocker.task_id)?.title ?? ''}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => resolveBlocker(blocker.id)}
                    className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5 shrink-0 hover:border-gray-300"
                  >
                    Report resolved
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weekly summary */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly summary</CardTitle>
          </CardHeader>
          <CardContent>
            {engagement.latest_summary ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">{weekRange(engagement.latest_summary.week_start)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${HEALTH_CLASSES[engagement.latest_summary.health_signal]}`}>
                    {HEALTH_LABEL[engagement.latest_summary.health_signal]}
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {engagement.latest_summary.content}
                </p>
                {engagement.latest_summary.next_steps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Next steps</p>
                    <ul className="space-y-1">
                      {engagement.latest_summary.next_steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-gray-300 shrink-0">·</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Your weekly summary will appear here after your first week.
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
