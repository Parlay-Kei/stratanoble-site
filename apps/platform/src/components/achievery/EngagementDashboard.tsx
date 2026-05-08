'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@strata-noble/ui'

type System = {
  id: string
  name: string
  stage: string
  open_task_count: number
}

type ActionsThisWeek = {
  operator: number
  client: number
}

type Engagement = {
  id: string
  title: string
  status: string
  systems: System[]
  actions_this_week: ActionsThisWeek
  open_blockers: number
  last_action_at: string | null
  internal_note_count?: number
}

type DashboardData = {
  actor: 'operator' | 'client'
  engagements: Engagement[]
}

interface EngagementDashboardProps {
  user: { id: string; email: string }
}

export default function EngagementDashboard({ user: _user }: EngagementDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/achievery/dashboard')
      .then(r => r.json())
      .then((json: DashboardData | { error: string }) => {
        if ('error' in json) {
          setError(json.error)
        } else {
          setData(json)
        }
      })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (!data || data.engagements.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-500">
          {data?.actor === 'operator'
            ? 'No engagements yet. Create one to get started.'
            : "Your operator hasn't set up your engagement yet."}
        </p>
      </div>
    )
  }

  const { actor, engagements } = data

  return (
    <div className="space-y-6">
      {engagements.map(eng => (
        <Card key={eng.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>{eng.title}</CardTitle>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 capitalize">
                {eng.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Systems */}
            {eng.systems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Systems</p>
                <div className="space-y-2">
                  {eng.systems.map(sys => (
                    <div key={sys.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800">{sys.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500">
                          {sys.stage}
                        </span>
                      </div>
                      {sys.open_task_count > 0 && (
                        <span className="text-xs text-gray-500">
                          {sys.open_task_count} open {sys.open_task_count === 1 ? 'task' : 'tasks'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity this week */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">This week</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {actor === 'operator' ? eng.actions_this_week.operator : eng.actions_this_week.client}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Your actions</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {actor === 'operator' ? eng.actions_this_week.client : eng.actions_this_week.operator}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {actor === 'operator' ? 'Client actions' : 'Operator actions'}
                  </p>
                </div>
              </div>
            </div>

            {/* Blockers + last action */}
            <div className="flex items-center gap-6 text-sm">
              <div className={eng.open_blockers > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                {eng.open_blockers} open {eng.open_blockers === 1 ? 'blocker' : 'blockers'}
              </div>
              {eng.last_action_at && (
                <div className="text-gray-400 text-xs">
                  Last action{' '}
                  {new Date(eng.last_action_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>

            {/* Operator-only: internal note count */}
            {actor === 'operator' && typeof eng.internal_note_count === 'number' && eng.internal_note_count > 0 && (
              <p className="text-xs text-gray-400">
                {eng.internal_note_count} internal {eng.internal_note_count === 1 ? 'note' : 'notes'}
              </p>
            )}

            {/* CTA */}
            <div>
              <Link
                href="/platform/actions"
                className="inline-flex items-center justify-center rounded-sm border-2 border-slate-grey px-4 py-2 text-sm font-semibold text-white hover:border-forest-green hover:text-field-sage transition-colors duration-200"
              >
                Log an action
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
