'use client'

import { useAuth } from './providers'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Card } from '@strata-noble/ui'

export default function PlatformHome() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/auth')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ACHIEVERY Platform...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900">
          ACHIEVERY Platform
        </h1>
        <p className="text-xl text-gray-600">
          Transform daily activities into meaningful progress
        </p>
        <Card className="p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            🚀 Platform Ready
          </h2>
          <div className="text-left space-y-2 text-gray-700">
            <p>✅ Integrated with Strata Noble monorepo</p>
            <p>✅ Connected to @strata-noble/ui & @strata-noble/utils</p>
            <p>✅ Authentication system migrated</p>
            <p>✅ Component migration in progress</p>
            <p>⏳ Extending Supabase schema for ACHIEVERY</p>
            <p>⏳ Building core platform features</p>
          </div>
        </Card>
        <p className="text-sm text-gray-500">
          Part of the Strata Noble ecosystem - leveraging existing infrastructure
        </p>
      </div>
    </Container>
  )
}