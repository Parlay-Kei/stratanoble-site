'use client'

// TODO 0153: Export to PDF via wkhtmltopdf when proof ledger has production data.

import { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@strata-noble/ui'
import { supabase } from '../../lib/supabase'

interface ProofEntry {
  id: string
  engagement_id: string
  action_id: string | null
  task_id: string | null
  note: string
  actor_type: 'operator' | 'client'
  visibility: 'internal' | 'shared'
  uploaded_at: string
  action_text?: string | null
  task_title?: string | null
}

type ActorFilter = 'all' | 'operator' | 'client'
type DateFilter = 'week' | 'month' | 'all'

interface RecentAction {
  id: string
  entry_text: string
}

interface OpenTask {
  id: string
  title: string
}

export interface ProofLedgerProps {
  user: { id: string; email: string }
  engagementId: string
  actor: 'operator' | 'client'
}

function getFromDate(filter: DateFilter): string | null {
  if (filter === 'all') return null
  const now = new Date()
  if (filter === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - (day === 0 ? 6 : day - 1)
    const monday = new Date(now)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString()
  }
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return firstOfMonth.toISOString()
}

export default function ProofLedger({ user, engagementId, actor }: ProofLedgerProps) {
  const [entries, setEntries] = useState<ProofEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [actorFilter, setActorFilter] = useState<ActorFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')

  const [note, setNote] = useState('')
  const [selectedActionId, setSelectedActionId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [visibility, setVisibility] = useState<'shared' | 'internal'>('shared')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [recentActions, setRecentActions] = useState<RecentAction[]>([])
  const [openTasks, setOpenTasks] = useState<OpenTask[]>([])

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ engagement_id: engagementId })
    if (actor === 'operator' && actorFilter !== 'all') params.set('actor', actorFilter)
    const from = getFromDate(dateFilter)
    if (from) params.set('from', from)

    try {
      const res = await fetch(`/api/achievery/proof?${params}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to load entries.')
      } else {
        setEntries(json.entries ?? [])
      }
    } catch {
      setError('Failed to load entries.')
    } finally {
      setLoading(false)
    }
  }, [engagementId, actor, actorFilter, dateFilter])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  useEffect(() => {
    // Load form dropdowns
    Promise.all([
      supabase
        .from('achievery_actions')
        .select('id, entry_text')
        .eq('engagement_id', engagementId)
        .order('logged_at', { ascending: false })
        .limit(20),
      supabase
        .from('achievery_tasks')
        .select('id, title')
        .eq('engagement_id', engagementId)
        .eq('status', 'open'),
    ]).then(([actionsRes, tasksRes]) => {
      setRecentActions(actionsRes.data ?? [])
      setOpenTasks(tasksRes.data ?? [])
    })
  }, [engagementId, user.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() || note.trim().length < 10) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/achievery/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagement_id: engagementId,
          note: note.trim(),
          action_id: selectedActionId || undefined,
          task_id: selectedTaskId || undefined,
          visibility,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSubmitError(json.error ?? 'Failed to save.')
      } else {
        setNote('')
        setSelectedActionId('')
        setSelectedTaskId('')
        setVisibility('shared')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        await fetchEntries()
      }
    } catch {
      setSubmitError('Failed to save.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters — operator only */}
      {actor === 'operator' && (
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-1">
            {(['all', 'operator', 'client'] as ActorFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setActorFilter(f)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  actorFilter === f
                    ? 'border-gray-700 bg-gray-700 text-white'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {([['week', 'This week'], ['month', 'This month'], ['all', 'All time']] as [DateFilter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setDateFilter(val)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  dateFilter === val
                    ? 'border-gray-700 bg-gray-700 text-white'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add entry form */}
      <Card>
        <CardHeader>
          <CardTitle>Add proof entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Describe what was done, decided, or delivered..."
                required
                minLength={10}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {note.trim().length > 0 && note.trim().length < 10 && (
                <p className="text-xs text-red-500 mt-1">Minimum 10 characters.</p>
              )}
            </div>

            {recentActions.length > 0 && (
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Link to an action (optional)</label>
                <select
                  value={selectedActionId}
                  onChange={e => setSelectedActionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {recentActions.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.entry_text.length > 80 ? a.entry_text.slice(0, 80) + '…' : a.entry_text}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {openTasks.length > 0 && (
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Link to a task (optional)</label>
                <select
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {openTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            )}

            {actor === 'operator' && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">Visibility</label>
                <div className="flex gap-2">
                  {(['shared', 'internal'] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibility(v)}
                      className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                        visibility === v
                          ? v === 'shared'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-700 text-white border-gray-700'
                          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {v === 'shared' ? 'Shared' : 'Internal only'}
                    </button>
                  ))}
                </div>
                {visibility === 'internal' && (
                  <p className="text-xs text-gray-400 mt-1.5">Only you will see this entry.</p>
                )}
              </div>
            )}

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <button
              type="submit"
              disabled={submitting || note.trim().length < 10}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving…' : 'Add proof entry'}
            </button>
          </form>

          {saved && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-md px-4 py-2 text-sm text-green-700">
              Entry saved.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry list */}
      <Card>
        <CardHeader>
          <CardTitle>Proof record</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 py-4">{error}</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No proof entries yet. Log an action or add a proof note to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div key={entry.id} className="border-l-2 border-gray-200 pl-4 py-1">
                  <p className="text-sm text-gray-800 leading-relaxed">{entry.note}</p>

                  {(entry.action_text || entry.task_title) && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {entry.action_text && (
                        <span className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5">
                          Action: {entry.action_text.length > 60
                            ? entry.action_text.slice(0, 60) + '…'
                            : entry.action_text}
                        </span>
                      )}
                      {entry.task_title && (
                        <span className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5">
                          Task: {entry.task_title}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {new Date(entry.uploaded_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">
                      {entry.actor_type === actor ? 'You' : entry.actor_type.charAt(0).toUpperCase() + entry.actor_type.slice(1)}
                    </span>
                    {actor === 'operator' && entry.visibility === 'internal' && (
                      <>
                        <span className="text-xs text-gray-400">·</span>
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
    </div>
  )
}
