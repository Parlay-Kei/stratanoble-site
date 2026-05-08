'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { Card } from '@strata-noble/ui'

type HealthSignal = 'on_track' | 'needs_attention' | 'stalled'

type EngagementView = {
  id: string
  title: string
  status: string
  client_email: string | null
  systems: {
    id: string
    name: string
    stage: string
    tasks: { id: string; title: string; status: string; assigned_to: string }[]
  }[]
  recent_actions: {
    id: string
    entry_text: string
    actor_type: string
    visibility: string
    logged_at: string
  }[]
  open_blockers: { id: string; description: string }[]
  latest_summary: { week_start: string; content: string; health_signal: HealthSignal } | null
}

const HEALTH_LABEL: Record<HealthSignal, string> = {
  on_track: 'On track',
  needs_attention: 'Needs attention',
  stalled: 'Stalled',
}

const HEALTH_CLASSES: Record<HealthSignal, string> = {
  on_track: 'bg-green-100 text-green-800',
  needs_attention: 'bg-amber-100 text-amber-800',
  stalled: 'bg-red-100 text-red-800',
}

export function ClientSuccessDashboard({ user: _user, engagementId }: { user: User; engagementId: string }) {
  const [data, setData] = useState<EngagementView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/achievery/client?operator_view=true&engagement_id=${engagementId}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setData(json.engagement)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [engagementId])

  if (loading) return <div className="py-8 text-center text-gray-500 text-sm">Loading engagement…</div>
  if (error) return <div className="py-8 text-center text-red-500 text-sm">{error}</div>
  if (!data) return null

  const totalTasks = data.systems.reduce((n, s) => n + s.tasks.length, 0)
  const completedTasks = data.systems.reduce((n, s) => n + s.tasks.filter(t => t.status === 'complete').length, 0)

  return (
    <div className="space-y-5">
      {/* Engagement header */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{data.title}</h2>
            {data.client_email && <p className="text-sm text-gray-500 mt-0.5">{data.client_email}</p>}
          </div>
          <div className="flex items-center gap-3">
            {data.latest_summary && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${HEALTH_CLASSES[data.latest_summary.health_signal]}`}>
                {HEALTH_LABEL[data.latest_summary.health_signal]}
              </span>
            )}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${data.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {data.status}
            </span>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Tasks</span>
            <p className="font-semibold text-gray-900">{completedTasks} / {totalTasks} complete</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Open blockers</span>
            <p className={`font-semibold ${data.open_blockers.length > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
              {data.open_blockers.length}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Systems</span>
            <p className="font-semibold text-gray-900">{data.systems.length}</p>
          </div>
        </div>
      </Card>

      {/* Systems */}
      {data.systems.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Systems</h3>
          <div className="space-y-4">
            {data.systems.map(sys => (
              <div key={sys.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{sys.name}</span>
                  <span className="text-xs text-gray-400">{sys.stage}</span>
                </div>
                {sys.tasks.length > 0 && (
                  <div className="space-y-1 pl-3 border-l border-gray-200">
                    {sys.tasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{t.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          t.status === 'complete' ? 'bg-green-100 text-green-700' :
                          t.status === 'blocked' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Open blockers */}
      {data.open_blockers.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">Open blockers</h3>
          <div className="space-y-2">
            {data.open_blockers.map(b => (
              <div key={b.id} className="text-sm text-gray-800 bg-amber-50 px-3 py-2 rounded">{b.description}</div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent activity */}
      {data.recent_actions.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Recent activity</h3>
          <div className="space-y-3">
            {data.recent_actions.map(a => (
              <div key={a.id} className="border-l-2 border-gray-200 pl-3">
                <p className="text-sm text-gray-800">{a.entry_text}</p>
                <div className="flex gap-2 mt-0.5 text-xs text-gray-400">
                  <span>{new Date(a.logged_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  <span>· {a.actor_type}</span>
                  {a.visibility === 'internal' && <span>· internal</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Latest summary */}
      {data.latest_summary && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Weekly summary — {new Date(data.latest_summary.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed">{data.latest_summary.content}</p>
        </Card>
      )}
    </div>
  )
}
