'use client'

import { useAuth } from '../../../providers'
import { Container } from '@strata-noble/ui'
import { MobileNavigation } from '../../../../src/components/layout/MobileNavigation'
import { CoachDashboard } from '../../../../src/components/achievery/CoachDashboard'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function CoachDashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access the Coach Dashboard and view shared Trust Ledger data.
          </p>
          <Link
            href="/achievery/auth"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <>
      <Container className="min-h-screen py-8 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header with Navigation */}
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/achievery/trust-ledger"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Trust Ledger
            </Link>
          </div>

          {/* Coach Dashboard Component */}
          <CoachDashboard user={user} />

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}