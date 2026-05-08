'use client'

import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

type Engagement = {
  id: string
  title: string
  actor_type: 'operator' | 'client'
}

type Task = {
  id: string
  title: string
  cadence: 'daily' | 'weekly' | 'one-time'
}

type RecentAction = {
  id: string
  entry_text: string
  visibility: 'shared' | 'internal'
  actor_type: 'operator' | 'client'
  logged_at: string
}

type Insight = {
  operationalInsight: string
  impactRating: number
  insights: string[]
  nextSteps: string[]
}

export default function ActionLogForm({ user }: { user: User }) {
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [recentActions, setRecentActions] = useState<RecentAction[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [entryText, setEntryText] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [visibility, setVisibility] = useState<'shared' | 'internal'>('shared')
  const [markComplete, setMarkComplete] = useState(false)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    // Determine actor type by checking engagement membership
    const { data: opRows } = await supabase
      .from('achievery_engagements')
      .select('id, title')
      .eq('operator_user_id', user.id)
      .eq('status', 'active')
      .limit(1)

    let eng: Engagement | null = null

    if (opRows && opRows.length > 0) {
      eng = { id: opRows[0].id, title: opRows[0].title, actor_type: 'operator' }
    } else {
      const { data: clientRows } = await supabase
        .from('achievery_engagements')
        .select('id, title')
        .eq('client_user_id', user.id)
        .eq('status', 'active')
        .limit(1)
      if (clientRows && clientRows.length > 0) {
        eng = { id: clientRows[0].id, title: clientRows[0].title, actor_type: 'client' }
      }
    }

    setEngagement(eng)

    if (!eng) {
      setLoading(false)
      return
    }

    const assignedFilter = eng.actor_type === 'operator'
      ? ['operator', 'both']
      : ['client', 'both']

    const [{ data: taskRows }, { data: actionRows }] = await Promise.all([
      supabase
        .from('achievery_tasks')
        .select('id, title, cadence')
        .eq('engagement_id', eng.id)
        .eq('status', 'open')
        .in('assigned_to', assignedFilter),
      supabase
        .from('achievery_actions')
        .select('id, entry_text, visibility, actor_type, logged_at')
        .eq('engagement_id', eng.id)
        .order('logged_at', { ascending: false })
        .limit(5),
    ])

    setTasks(taskRows ?? [])
    setRecentActions(actionRows ?? [])
    setLoading(false)
  }, [user.id])

  useEffect(() => { loadData() }, [loadData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!entryText.trim() || !engagement) return

    setSubmitting(true)
    setError(null)
    setInsight(null)
    setSaved(false)

    const { error: insertErr } = await supabase
      .from('achievery_actions')
      .insert({
        engagement_id: engagement.id,
        task_id: selectedTaskId || null,
        actor_type: engagement.actor_type,
        actor_user_id: user.id,
        entry_text: entryText.trim(),
        visibility,
      })

    if (insertErr) {
      setError('Failed to save. Please try again.')
      setSubmitting(false)
      return
    }

    if (selectedTaskId && markComplete) {
      await supabase
        .from('achievery_tasks')
        .update({ status: 'complete' })
        .eq('id', selectedTaskId)
        .eq('engagement_id', engagement.id)
    }

    // Operational insight — shared entries only
    if (visibility === 'shared') {
      try {
        const res = await fetch('/api/reframe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalText: entryText.trim(),
            category: 'building',
            executionStage: 'launch',
            userId: user.id,
          }),
        })
        if (res.ok) {
          const json = await res.json()
          setInsight(json.data ?? null)
        }
      } catch {
        // Non-blocking — insight failure doesn't prevent save
      }
    }

    setEntryText('')
    setSelectedTaskId('')
    setMarkComplete(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
    await loadData()
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!engagement) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">No active engagement found.</p>
        <p className="text-gray-400 text-xs mt-1">Contact your operator to get started.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Engagement header */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Active engagement</p>
          <p className="font-semibold text-gray-900">{engagement.title}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          engagement.actor_type === 'operator'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}>
          {engagement.actor_type === 'operator' ? 'Operator' : 'Client'}
        </span>
      </div>

      {/* Log form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Log an action</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">What did you do?</label>
          <textarea
            value={entryText}
            onChange={e => setEntryText(e.target.value)}
            placeholder="Describe what you did..."
            required
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {tasks.length > 0 && (
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Link to a task (optional)</label>
            <select
              value={selectedTaskId}
              onChange={e => { setSelectedTaskId(e.target.value); setMarkComplete(false) }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} · {t.cadence}</option>
              ))}
            </select>
            {selectedTaskId && (
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markComplete}
                  onChange={e => setMarkComplete(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Mark this task complete</span>
              </label>
            )}
          </div>
        )}

        {/* Visibility toggle — operators only can set internal */}
        {engagement.actor_type === 'operator' && (
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !entryText.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving…' : 'Log action'}
        </button>
      </form>

      {/* Operational insight */}
      {insight && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-3">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Operational insight</p>
          <p className="text-sm text-blue-900 leading-relaxed">{insight.operationalInsight}</p>
          {insight.insights.length > 0 && (
            <ul className="space-y-1.5">
              {insight.insights.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-blue-800">
                  <span className="text-blue-400 shrink-0 mt-0.5">·</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {insight.nextSteps.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1.5">Next</p>
              <ul className="space-y-1">
                {insight.nextSteps.map((step, i) => (
                  <li key={i} className="text-sm text-blue-800">{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {saved && !insight && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          Action logged.
        </div>
      )}

      {/* Recent actions */}
      {recentActions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent</p>
          <div className="space-y-4">
            {recentActions.map(action => (
              <div key={action.id} className="border-l-2 border-gray-200 pl-3">
                <p className="text-sm text-gray-800 leading-relaxed">{action.entry_text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(action.logged_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                  {action.visibility === 'internal' && (
                    <span className="text-xs text-gray-400">· internal</span>
                  )}
                  <span className="text-xs text-gray-400">· {action.actor_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
