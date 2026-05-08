'use client'

import { useAuth } from '../providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Container, Button } from '@strata-noble/ui'
import EngagementDashboard from '../../components/achievery/EngagementDashboard'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: force redirect even if sign out fails
      router.push('/auth')
    }
  }

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
      {/* Header with sign out button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="text-gray-600 hover:text-gray-800"
        >
          Sign out
        </Button>
      </div>

      <EngagementDashboard user={{ id: user.id, email: user.email ?? '' }} />
    </Container>
  )
}
