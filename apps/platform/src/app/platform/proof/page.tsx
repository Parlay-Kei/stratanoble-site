'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../providers'
import ProofLedger from '../../../components/achievery/ProofLedger'

type DashboardData = {
  actor: 'operator' | 'client'
  engagements: { id: string; title: string; status: string }[]
}

export default function ProofPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/achievery/dashboard')
      .then(r => r.json())
      .then((json: DashboardData | { error: string }) => {
        if (!('error' in json)) setDashboard(json)
      })
      .finally(() => setFetching(false))
  }, [user])

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return null

  if (!dashboard || dashboard.engagements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">No active engagement found.</p>
      </div>
    )
  }

  const engagement = dashboard.engagements[0]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Proof Ledger</h1>
        <p className="text-gray-500 text-sm mt-1">
          The execution record. What proof exists that this business is moving?
        </p>
        <p className="text-xs text-gray-400 mt-1">{engagement.title}</p>
      </div>
      <ProofLedger
        user={{ id: user.id, email: user.email ?? '' }}
        engagementId={engagement.id}
        actor={dashboard.actor}
      />
    </div>
  )
}
