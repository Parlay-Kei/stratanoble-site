'use client'

import { useAuth } from '../providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Container } from '@strata-noble/ui'
import AnalyticsDashboard from '../../components/achievery/AnalyticsDashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </Container>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <Container className="py-8">
      <AnalyticsDashboard />
    </Container>
  )
}
