'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../providers'
import { Container, Card, Button, Input } from '@strata-noble/ui'
import { MobileNavigation } from '../../../src/components/layout/MobileNavigation'
import { TrustLedgerSharing } from '../../../src/components/achievery/TrustLedgerSharing'
import { supabase } from '../../../src/lib/supabase'
import { Shield, Share2, Users, BarChart3, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { TrustLedgerShare, UserAction, WeeklyNarrative } from '../../../src/types/platform'

export default function AchieveryTrustLedgerPage() {
  const { user } = useAuth()
  const [shares, setShares] = useState<TrustLedgerShare[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalActions: 0,
    thisWeekActions: 0,
    activeShares: 0,
    weeklyNarratives: 0
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load shares
      const { data: sharesData, error: sharesError } = await supabase
        .from('trust_ledger_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (sharesError) throw sharesError

      // Load user stats
      const [actionsResponse, narrativesResponse] = await Promise.all([
        supabase
          .from('user_actions')
          .select('id, logged_date')
          .eq('user_id', user.id),
        supabase
          .from('weekly_narratives')
          .select('id')
          .eq('user_id', user.id)
      ])

      const actions = actionsResponse.data || []
      const narratives = narrativesResponse.data || []

      // Calculate this week's actions
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
      const thisWeekActions = actions.filter(action =>
        new Date(action.logged_date) >= weekStart
      ).length

      setShares(sharesData || [])
      setStats({
        totalActions: actions.length,
        thisWeekActions,
        activeShares: sharesData?.filter(share => share.is_active &&
          (!share.expires_at || new Date(share.expires_at) > new Date())).length || 0,
        weeklyNarratives: narratives.length
      })

    } catch (error) {
      console.error('Error loading trust ledger data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShareUpdate = (updatedShares: TrustLedgerShare[]) => {
    setShares(updatedShares)
    setStats(prev => ({
      ...prev,
      activeShares: updatedShares.filter(share => share.is_active &&
        (!share.expires_at || new Date(share.expires_at) > new Date())).length
    }))
  }

  if (!user) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Container>
    )
  }

  return (
    <>
      <Container className="min-h-screen py-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header with Navigation */}
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/achievery"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Trust Ledger</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Share your ACHIEVERY progress securely with coaches, mentors, or accountability partners.
              Control exactly what gets shared and maintain complete privacy.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalActions}</div>
              <div className="text-sm text-gray-600">Total Actions</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.thisWeekActions}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeShares}</div>
              <div className="text-sm text-gray-600">Active Shares</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
                <Share2 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.weeklyNarratives}</div>
              <div className="text-sm text-gray-600">Narratives</div>
            </Card>
          </div>

          {/* Privacy Notice */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Your Privacy is Protected</h3>
                <p className="text-sm text-blue-800 mb-3">
                  You have complete control over your data sharing. All shares use granular permissions,
                  can be paused or revoked instantly, and include automatic expiration options.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-xs text-blue-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Granular permissions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Instant revocation</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Trust Ledger Sharing Component */}
          {loading ? (
            <Card className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading sharing options...</p>
              </div>
            </Card>
          ) : (
            <TrustLedgerSharing
              user={user}
              shares={shares}
              onSharesUpdate={handleShareUpdate}
            />
          )}

          {/* Coach Dashboard Access */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-green-900 mb-2">Are you a coach or mentor?</h3>
                <p className="text-sm text-green-800 mb-4">
                  Access shared Trust Ledgers from your clients and gain insights into their progress.
                  View analytics, weekly narratives, and provide targeted guidance.
                </p>
                <Link
                  href="/achievery/trust-ledger/coach-dashboard"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Access Coach Dashboard
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </Card>

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}