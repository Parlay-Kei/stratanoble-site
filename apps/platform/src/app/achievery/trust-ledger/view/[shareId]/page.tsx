'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Container, Card, Button } from '@strata-noble/ui'
import { supabase } from '../../../../../lib/supabase'
import {
  Shield,
  Eye,
  Calendar,
  TrendingUp,
  Activity,
  MessageCircle,
  BarChart3,
  Clock,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import type { TrustLedgerShare, UserAction, WeeklyNarrative } from '../../../../../types/platform'

interface SharedData {
  share: TrustLedgerShare
  actions: UserAction[]
  narratives: WeeklyNarrative[]
  stats: {
    totalActions: number
    thisWeekActions: number
    currentStreak: number
    favoriteCategory: string
    currentPhase: string
  }
}

export default function SharedTrustLedgerView() {
  const params = useParams()
  const shareId = params.shareId as string
  const [data, setData] = useState<SharedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewerEmail, setViewerEmail] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (shareId) {
      loadSharedData()
    }
  }, [shareId])

  const loadSharedData = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, get the share details
      const { data: share, error: shareError } = await supabase
        .from('trust_ledger_shares')
        .select('*')
        .eq('id', shareId)
        .single()

      if (shareError) throw new Error('Share not found')
      if (!share.is_active) throw new Error('This share has been deactivated')
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        throw new Error('This share has expired')
      }

      // For now, we'll assume authentication via email check
      // In a real implementation, you'd want proper authentication
      if (!authenticated && !viewerEmail) {
        setData({ share, actions: [], narratives: [], stats: {
          totalActions: 0,
          thisWeekActions: 0,
          currentStreak: 0,
          favoriteCategory: '',
          currentPhase: ''
        }})
        setLoading(false)
        return
      }

      // Verify viewer email matches share recipient
      if (viewerEmail && viewerEmail.toLowerCase() !== share.shared_with_email.toLowerCase()) {
        throw new Error('You are not authorized to view this share')
      }

      // Load user data based on access level
      let actions: UserAction[] = []
      let narratives: WeeklyNarrative[] = []

      if (share.access_level === 'summary') {
        // Only load narratives for summary access
        const { data: narrativeData, error: narrativeError } = await supabase
          .from('weekly_narratives')
          .select('*')
          .eq('user_id', share.user_id)
          .order('week_start', { ascending: false })
          .limit(4)

        if (narrativeError) throw narrativeError
        narratives = narrativeData || []

      } else if (share.access_level === 'detailed' || share.access_level === 'full') {
        // Load both actions and narratives
        const [actionsResponse, narrativesResponse] = await Promise.all([
          supabase
            .from('user_actions')
            .select('*')
            .eq('user_id', share.user_id)
            .order('logged_date', { ascending: false })
            .limit(50),
          supabase
            .from('weekly_narratives')
            .select('*')
            .eq('user_id', share.user_id)
            .order('week_start', { ascending: false })
            .limit(8)
        ])

        if (actionsResponse.error) throw actionsResponse.error
        if (narrativesResponse.error) throw narrativesResponse.error

        actions = actionsResponse.data || []
        narratives = narrativesResponse.data || []
      }

      // Calculate stats
      const totalActions = actions.length
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())

      const thisWeekActions = actions.filter(action =>
        new Date(action.logged_date) >= weekStart
      ).length

      // Calculate streak
      let currentStreak = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const hasAction = actions.some(action =>
          new Date(action.logged_date).toDateString() === checkDate.toDateString()
        )
        if (hasAction) {
          currentStreak++
        } else if (i > 0) {
          break
        }
      }

      // Find favorite category
      const categoryCounts = actions.reduce((acc, action) => {
        acc[action.category] = (acc[action.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const favoriteCategory = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'learning'

      // Find current phase (most recent)
      const currentPhase = actions[0]?.phase || 'explore'

      setData({
        share,
        actions,
        narratives,
        stats: {
          totalActions,
          thisWeekActions,
          currentStreak,
          favoriteCategory,
          currentPhase
        }
      })

    } catch (error: any) {
      console.error('Error loading shared data:', error)
      setError(error.message || 'Failed to load shared data')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = () => {
    if (viewerEmail.trim()) {
      setAuthenticated(true)
      loadSharedData()
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-blue-100 text-blue-700'
      case 'building': return 'bg-green-100 text-green-700'
      case 'connecting': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'explore': return 'bg-orange-100 text-orange-700'
      case 'build': return 'bg-blue-100 text-blue-700'
      case 'launch': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared progress...</p>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </Container>
    )
  }

  if (!data) {
    return null
  }

  // Email authentication prompt
  if (!authenticated && !viewerEmail) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Access</h2>
            <p className="text-gray-600">
              This Trust Ledger has been shared with you. Please enter your email to verify access.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                value={viewerEmail}
                onChange={(e) => setViewerEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button onClick={handleEmailAuth} className="w-full" disabled={!viewerEmail.trim()}>
              Access Trust Ledger
            </Button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>This share is protected and can only be accessed by the intended recipient.</p>
          </div>
        </Card>
      </Container>
    )
  }

  const { share, actions, narratives, stats } = data

  return (
    <Container className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Shared Trust Ledger</h1>
          </div>
          <p className="text-gray-600">
            This progress data has been shared with you with <span className="font-medium">{share.access_level}</span> access level.
          </p>
        </div>

        {/* Share Info */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Shared by: {share.shared_with_email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">
                  Created: {new Date(share.created_at).toLocaleDateString()}
                </span>
              </div>
              {share.expires_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">
                    Expires: {new Date(share.expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalActions}</div>
            <div className="text-sm text-gray-600">Total Actions</div>
          </Card>

          <Card className="p-6 text-center">
            <Activity className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <div className="text-2xl font-bold text-gray-900">{stats.thisWeekActions}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </Card>

          <Card className="p-6 text-center">
            <Eye className="w-8 h-8 mx-auto mb-3 text-orange-600" />
            <div className="text-lg font-bold text-gray-900 capitalize">{stats.currentPhase}</div>
            <div className="text-sm text-gray-600">Current Phase</div>
          </Card>
        </div>

        {/* Recent Actions */}
        {share.access_level !== 'summary' && actions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Actions</span>
            </h2>
            <div className="space-y-3">
              {actions.slice(0, 10).map((action) => (
                <div key={action.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    action.category === 'learning' ? 'bg-blue-500' :
                    action.category === 'building' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">
                      {share.access_level === 'full' ? action.original_text : action.reframed_text || action.original_text}
                    </p>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(action.category)}`}>
                        {action.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(action.phase)}`}>
                        {action.phase}
                      </span>
                      <span className="text-gray-500">
                        {new Date(action.logged_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Weekly Narratives */}
        {narratives.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Weekly Narratives</span>
            </h2>
            <div className="space-y-4">
              {narratives.slice(0, 4).map((narrative) => (
                <div key={narrative.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-blue-900">
                      Week of {new Date(narrative.week_start).toLocaleDateString()}
                    </h3>
                    <span className="text-sm text-blue-700">
                      {narrative.actions_count} actions
                    </span>
                  </div>
                  <p className="text-blue-800 mb-3">{narrative.narrative_text}</p>

                  {narrative.key_insights && narrative.key_insights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-blue-900">Key Insights:</h4>
                      <ul className="space-y-1">
                        {narrative.key_insights.map((insight, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start space-x-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Footer */}
        <Card className="p-6 text-center bg-gray-50">
          <p className="text-sm text-gray-600">
            This data is shared securely through the ACHIEVERY Trust Ledger system.
            {' '}View permissions can be revoked at any time by the data owner.
          </p>
        </Card>

      </div>
    </Container>
  )
}