'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@strata-noble/ui'
import { PlatformNav } from '../layout/PlatformNav'
import type {
  EngagementSummary,
  HealthSignal,
  SystemStage,
  TaskCadence,
  TaskAssignedTo,
  TaskStatus,
} from '../../types/achievery'

interface SystemManagerProps {
  user: { id: string; email: string }
}

const STAGE_CLASSES: Record<SystemStage, string> = {
  diagnose: 'bg-field-sage text-command-navy',
  build: 'bg-fault-amber text-command-navy',
  launch: 'bg-forest-green text-off-white',
  optimize: 'bg-command-navy text-off-white',
}

const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  open: 'border border-gray-200 text-gray-600',
  complete: 'border border-gray-200 text-gray-400',
  blocked: 'border border-red-200 text-red-600',
}

const TASK_STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  open: 'complete',
  complete: 'blocked',
  blocked: 'open',
}

const HEALTH_CLASSES: Record<HealthSignal, string> = {
  on_track: 'bg-forest-green text-off-white',
  needs_attention: 'bg-fault-amber text-command-navy',
  stalled: 'bg-command-navy text-off-white opacity-60',
}

const HEALTH_LABEL: Record<HealthSignal, string> = {
  on_track: 'On track',
  needs_attention: 'Needs attention',
  stalled: 'Stalled',
}

export default function SystemManager({ user }: SystemManagerProps) {
  const router = useRouter()

  const [engagements, setEngagements] = useState<EngagementSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [actor, setActor] = useState<'operator' | 'client' | undefined>(undefined)
  const [selectedEngId, setSelectedEngId] = useState<string | null>(null)

  // Narrow viewport panel navigation
  const [activePanel, setActivePanel] = useState<'list' | 'detail' | 'activity'>('list')

  // New engagement form
  const [showNewEng, setShowNewEng] = useState(false)
  const [newEngTitle, setNewEngTitle] = useState('')
  const [newEngEmail, setNewEngEmail] = useState('')
  const [creatingEng, setCreatingEng] = useState(false)

  // New system form (keyed by engagement id)
  const [showAddSystem, setShowAddSystem] = useState(false)
  const [sysName, setSysName] = useState('')
  const [sysDesc, setSysDesc] = useState('')
  const [sysStage, setSysStage] = useState<SystemStage>('diagnose')
  const [addingSystem, setAddingSystem] = useState(false)

  // New task form (keyed by system_id or null for engagement-level)
  const [taskFormSystemId, setTaskFormSystemId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskCadence, setTaskCadence] = useState<TaskCadence>('weekly')
  const [taskAssignedTo, setTaskAssignedTo] = useState<TaskAssignedTo>('operator')
  const [addingTask, setAddingTask] = useState(false)

  // Blocker form
  const [showAddBlocker, setShowAddBlocker] = useState(false)
  const [blockerDesc, setBlockerDesc] = useState('')
  const [blockerTaskId, setBlockerTaskId] = useState('')
  const [addingBlocker, setAddingBlocker] = useState(false)

  // Internal note
  const [internalNote, setInternalNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)

  // Weekly summary
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [lastSummary, setLastSummary] = useState<{
    content: string
    next_steps: string[]
    health_signal: HealthSignal
    week_start: string
  } | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const fetchEngagements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/achievery/systems')
      const json = await res.json()
      if (res.ok) {
        setEngagements(json.engagements ?? [])
        if (json.engagements?.length > 0) {
          setActor('operator')
        } else {
          // Not an operator on any engagement — redirect to actions
          setActor('client')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEngagements()
  }, [fetchEngagements])

  useEffect(() => {
    // Redirect clients silently
    if (!loading && actor === 'client') {
      router.push('/platform/actions')
    }
  }, [actor, loading, router])

  const selectedEng = engagements.find(e => e.id === selectedEngId) ?? null

  function selectEngagement(id: string) {
    setSelectedEngId(id)
    setActivePanel('detail')
    setShowAddSystem(false)
    setTaskFormSystemId(null)
    setShowAddBlocker(false)
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  async function createEngagement(e: React.FormEvent) {
    e.preventDefault()
    if (!newEngTitle.trim()) return
    setCreatingEng(true)
    const res = await fetch('/api/achievery/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newEngTitle.trim(), client_email: newEngEmail.trim() || undefined }),
    })
    if (res.ok) {
      setNewEngTitle('')
      setNewEngEmail('')
      setShowNewEng(false)
      await fetchEngagements()
    }
    setCreatingEng(false)
  }

  async function createSystem(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEngId || !sysName.trim()) return
    setAddingSystem(true)
    const res = await fetch(`/api/achievery/systems/${selectedEngId}/operating-systems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sysName.trim(), description: sysDesc.trim() || undefined, stage: sysStage }),
    })
    if (res.ok) {
      setSysName('')
      setSysDesc('')
      setSysStage('diagnose')
      setShowAddSystem(false)
      await fetchEngagements()
    }
    setAddingSystem(false)
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEngId || !taskTitle.trim()) return
    setAddingTask(true)
    const res = await fetch(`/api/achievery/systems/${selectedEngId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_id: taskFormSystemId || undefined,
        title: taskTitle.trim(),
        cadence: taskCadence,
        assigned_to: taskAssignedTo,
      }),
    })
    if (res.ok) {
      setTaskTitle('')
      setTaskCadence('weekly')
      setTaskAssignedTo('operator')
      setTaskFormSystemId(null)
      await fetchEngagements()
    }
    setAddingTask(false)
  }

  async function cycleTaskStatus(engId: string, taskId: string, current: TaskStatus) {
    const next = TASK_STATUS_CYCLE[current]
    await fetch(`/api/achievery/systems/${engId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    await fetchEngagements()
  }

  async function createBlocker(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEngId || !blockerDesc.trim()) return
    setAddingBlocker(true)
    const res = await fetch(`/api/achievery/systems/${selectedEngId}/blockers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: blockerDesc.trim(), task_id: blockerTaskId || undefined }),
    })
    if (res.ok) {
      setBlockerDesc('')
      setBlockerTaskId('')
      setShowAddBlocker(false)
      await fetchEngagements()
    }
    setAddingBlocker(false)
  }

  async function resolveBlocker(engId: string, blockerId: string) {
    await fetch(`/api/achievery/systems/${engId}/blockers/${blockerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: true }),
    })
    await fetchEngagements()
  }

  async function generateSummary() {
    if (!selectedEngId) return
    setGeneratingSummary(true)
    setSummaryError(null)
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1))
    const weekStart = monday.toISOString().split('T')[0]
    const res = await fetch('/api/achievery/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engagement_id: selectedEngId, week_start: weekStart }),
    })
    if (res.ok) {
      const json = await res.json()
      setLastSummary(json.summary)
    } else {
      const json = await res.json().catch(() => ({}))
      setSummaryError((json as { error?: string }).error ?? 'Failed to generate summary.')
    }
    setGeneratingSummary(false)
  }

  async function addInternalNote(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEngId || !internalNote.trim()) return
    setAddingNote(true)
    const res = await fetch('/api/achievery/proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engagement_id: selectedEngId,
        note: internalNote.trim(),
        visibility: 'internal',
      }),
    })
    if (res.ok) {
      setInternalNote('')
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 3000)
    }
    setAddingNote(false)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlatformNav actor={actor} />

      {/* Three-panel grid — collapses to single column on narrow viewports */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6 items-start">

          {/* ── Left panel: Engagement list ──────────────────────────────── */}
          <div className={`space-y-4 ${activePanel !== 'list' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Engagements</h2>
              <button
                onClick={() => setShowNewEng(!showNewEng)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + New
              </button>
            </div>

            {showNewEng && (
              <form onSubmit={createEngagement} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
                <input
                  value={newEngTitle}
                  onChange={e => setNewEngTitle(e.target.value)}
                  placeholder="Engagement title"
                  required
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={newEngEmail}
                  onChange={e => setNewEngEmail(e.target.value)}
                  placeholder="Client email (optional)"
                  type="email"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creatingEng || !newEngTitle.trim()}
                    className="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-medium disabled:opacity-40"
                  >
                    {creatingEng ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewEng(false)}
                    className="px-3 text-xs text-gray-500 border border-gray-200 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {engagements.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No engagements yet.</p>
            ) : (
              <div className="space-y-2">
                {engagements.map(eng => (
                  <button
                    key={eng.id}
                    onClick={() => selectEngagement(eng.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedEngId === eng.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{eng.title}</span>
                      <span className="text-xs px-2 py-0.5 border border-gray-200 text-gray-500 rounded capitalize ml-2 shrink-0">
                        {eng.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {eng.open_blocker_count > 0 && (
                        <span className="font-medium text-fault-amber">
                          {eng.open_blocker_count} blocker{eng.open_blocker_count !== 1 ? 's' : ''}
                        </span>
                      )}
                      {eng.last_action_at && (
                        <span>
                          {new Date(eng.last_action_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Center panel: Systems + tasks ────────────────────────────── */}
          <div className={`space-y-4 ${activePanel !== 'detail' ? 'hidden lg:block' : ''}`}>
            {!selectedEng ? (
              <div className="border border-gray-200 rounded-lg bg-white p-8 text-center text-sm text-gray-400">
                Select an engagement to view its systems and tasks.
              </div>
            ) : (
              <>
                {/* Mobile back */}
                <button
                  onClick={() => setActivePanel('list')}
                  className="lg:hidden text-xs text-blue-600 mb-2"
                >
                  ← Engagements
                </button>

                {/* Engagement header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {/* TODO: inline title editing — PATCH not required in 0150 */}
                      <CardTitle>{selectedEng.title}</CardTitle>
                      <span className="text-xs px-2 py-0.5 border border-gray-200 text-gray-500 rounded capitalize">
                        {selectedEng.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedEng.client_email ?? 'No client linked'}
                    </p>
                  </CardHeader>
                </Card>

                {/* Systems */}
                {selectedEng.systems.map(sys => (
                  <Card key={sys.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{sys.name}</CardTitle>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${STAGE_CLASSES[sys.stage as SystemStage]}`}>
                          {sys.stage}
                        </span>
                      </div>
                      {sys.description && (
                        <p className="text-xs text-gray-500 mt-1">{sys.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {sys.tasks.length === 0 ? (
                        <p className="text-xs text-gray-400">No tasks yet.</p>
                      ) : (
                        sys.tasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm text-gray-800 truncate">{task.title}</span>
                              <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
                                {task.cadence}
                              </span>
                              <span className="text-xs text-gray-400 shrink-0">{task.assigned_to}</span>
                            </div>
                            <button
                              onClick={() => cycleTaskStatus(selectedEng.id, task.id, task.status as TaskStatus)}
                              className={`text-xs px-2 py-0.5 rounded ml-2 shrink-0 ${TASK_STATUS_CLASSES[task.status as TaskStatus]}`}
                            >
                              {task.status}
                            </button>
                          </div>
                        ))
                      )}

                      {/* Add task to this system */}
                      {taskFormSystemId === sys.id ? (
                        <form onSubmit={createTask} className="pt-2 space-y-2 border-t border-gray-100 mt-2">
                          <input
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            placeholder="Task title"
                            required
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex gap-2">
                            <select
                              value={taskCadence}
                              onChange={e => setTaskCadence(e.target.value as TaskCadence)}
                              className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="one-time">One-time</option>
                            </select>
                            <select
                              value={taskAssignedTo}
                              onChange={e => setTaskAssignedTo(e.target.value as TaskAssignedTo)}
                              className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="operator">Operator</option>
                              <option value="client">Client</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={addingTask || !taskTitle.trim()}
                              className="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-medium disabled:opacity-40"
                            >
                              {addingTask ? 'Adding…' : 'Add task'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskFormSystemId(null)}
                              className="px-3 text-xs text-gray-500 border border-gray-200 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => { setTaskFormSystemId(sys.id); setShowAddSystem(false) }}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          + Add task
                        </button>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Add system */}
                {showAddSystem ? (
                  <form onSubmit={createSystem} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                    <p className="text-sm font-medium text-gray-700">New operating system</p>
                    <input
                      value={sysName}
                      onChange={e => setSysName(e.target.value)}
                      placeholder="System name"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={sysDesc}
                      onChange={e => setSysDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={sysStage}
                      onChange={e => setSysStage(e.target.value as SystemStage)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="diagnose">Diagnose</option>
                      <option value="build">Build</option>
                      <option value="launch">Launch</option>
                      <option value="optimize">Optimize</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addingSystem || !sysName.trim()}
                        className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium disabled:opacity-40"
                      >
                        {addingSystem ? 'Adding…' : 'Add system'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddSystem(false)}
                        className="px-4 text-sm text-gray-500 border border-gray-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => { setShowAddSystem(true); setTaskFormSystemId(null) }}
                    className="w-full border border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    + Add operating system
                  </button>
                )}

                {/* Mobile: view activity */}
                <button
                  onClick={() => setActivePanel('activity')}
                  className="lg:hidden w-full border border-gray-200 bg-white rounded-lg py-2.5 text-sm text-gray-600 text-center"
                >
                  View activity feed →
                </button>
              </>
            )}
          </div>

          {/* ── Right panel: Activity feed + blockers + internal note ─────── */}
          <div className={`space-y-4 ${activePanel !== 'activity' ? 'hidden lg:block' : ''}`}>
            {!selectedEng ? (
              <div className="border border-gray-200 rounded-lg bg-white p-6 text-center text-sm text-gray-400">
                Select an engagement.
              </div>
            ) : (
              <>
                {/* Mobile back */}
                <button
                  onClick={() => setActivePanel('detail')}
                  className="lg:hidden text-xs text-blue-600 mb-2"
                >
                  ← Systems
                </button>

                {/* Weekly summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Weekly summary</CardTitle>
                      <button
                        onClick={generateSummary}
                        disabled={generatingSummary}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-40"
                      >
                        {generatingSummary ? 'Generating…' : 'Generate'}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {summaryError && (
                      <p className="text-xs text-red-600 mb-2">{summaryError}</p>
                    )}
                    {lastSummary ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-400">{lastSummary.week_start}</p>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${HEALTH_CLASSES[lastSummary.health_signal]}`}>
                            {HEALTH_LABEL[lastSummary.health_signal]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">{lastSummary.content}</p>
                        {lastSummary.next_steps.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Next steps</p>
                            <ul className="space-y-1">
                              {lastSummary.next_steps.map((step, i) => (
                                <li key={i} className="flex gap-1.5 text-xs text-gray-700">
                                  <span className="text-gray-300 shrink-0">·</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : !summaryError ? (
                      <p className="text-xs text-gray-400">No summary generated. Click Generate to create one for the current week.</p>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Activity feed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedEng.actions.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">No actions logged yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedEng.actions.map(action => (
                          <div key={action.id} className="border-l-2 border-gray-200 pl-3">
                            <p className="text-xs text-gray-800 leading-relaxed">{action.entry_text}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-xs text-gray-500 font-medium">
                                {action.actor_user_id === user.id ? 'You' : action.actor_type === 'operator' ? 'Operator' : 'Client'}
                              </span>
                              <span className="text-xs text-gray-300">·</span>
                              <span className="text-xs text-gray-400">
                                {new Date(action.logged_at).toLocaleString('en-US', {
                                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                })}
                              </span>
                              {action.visibility === 'internal' && (
                                <>
                                  <span className="text-xs text-gray-300">·</span>
                                  <span className="text-xs text-gray-400">Internal</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Blockers */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Blockers
                        {selectedEng.open_blocker_count > 0 && (
                          <span className="ml-2 text-fault-amber">{selectedEng.open_blocker_count}</span>
                        )}
                      </CardTitle>
                      <button
                        onClick={() => setShowAddBlocker(!showAddBlocker)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {showAddBlocker && (
                      <form onSubmit={createBlocker} className="space-y-2 pb-3 border-b border-gray-100">
                        <input
                          value={blockerDesc}
                          onChange={e => setBlockerDesc(e.target.value)}
                          placeholder="Describe the blocker"
                          required
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {selectedEng.systems.flatMap(s => s.tasks).length > 0 && (
                          <select
                            value={blockerTaskId}
                            onChange={e => setBlockerTaskId(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">No linked task</option>
                            {selectedEng.systems.flatMap(s => s.tasks).map(t => (
                              <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={addingBlocker || !blockerDesc.trim()}
                            className="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-medium disabled:opacity-40"
                          >
                            {addingBlocker ? 'Saving…' : 'Report blocker'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddBlocker(false)}
                            className="px-2 text-xs text-gray-500 border border-gray-200 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {selectedEng.open_blockers.length === 0 ? (
                      <p className="text-xs text-gray-400">No open blockers.</p>
                    ) : (
                      selectedEng.open_blockers.map(blocker => (
                        <div key={blocker.id} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-800">{blocker.description}</p>
                            {blocker.task_id && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {selectedEng.systems.flatMap(s => s.tasks).find(t => t.id === blocker.task_id)?.title ?? ''}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => resolveBlocker(selectedEng.id, blocker.id)}
                            className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5 shrink-0 hover:border-gray-300"
                          >
                            Resolve
                          </button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Internal note */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Add internal note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addInternalNote} className="space-y-2">
                      <textarea
                        value={internalNote}
                        onChange={e => setInternalNote(e.target.value)}
                        placeholder="Internal note — visible to you only…"
                        rows={2}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={addingNote || !internalNote.trim()}
                        className="w-full bg-gray-700 text-white py-1.5 rounded text-xs font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
                      >
                        {addingNote ? 'Saving…' : 'Save note'}
                      </button>
                      {noteSaved && (
                        <p className="text-xs text-green-600">Saved.</p>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
