'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, Button, Input } from '@strata-noble/ui'
import { supabase } from '../../lib/supabase'
import {
  Users,
  Eye,
  BarChart3,
  Calendar,
  TrendingUp,
  Award,
  MessageCircle,
  Download,
  Filter,
  Search,
  Clock,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import type { TrustLedgerShare, UserAction, WeeklyNarrative } from '../../types/platform'

interface CoachDashboardProps {
  user: User
}

interface SharedUserData {
  share: TrustLedgerShare
  userEmail: string
  stats: {
    totalActions: number
    thisWeekActions: number
    currentStreak: number
    lastActivity: string | null
  }
  recentActions: UserAction[]
  latestNarrative: WeeklyNarrative | null
}

interface FilterOptions {
  accessLevel: string
  timeframe: string
  activity: string
}

export function CoachDashboard({ user }: CoachDashboardProps) {
  const [sharedUsers, setSharedUsers] = useState<SharedUserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    accessLevel: 'all',
    timeframe: 'week',
    activity: 'all'
  })
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      loadSharedUsers()
    }
  }, [user])

  const loadSharedUsers = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get all shares where the current user is the recipient
      const { data: shares, error: sharesError } = await supabase
        .from('trust_ledger_shares')
        .select('*')
        .eq('shared_with_email', user.email)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (sharesError) throw sharesError

      if (!shares || shares.length === 0) {
        setSharedUsers([])
        setLoading(false)
        return
      }

      // Load data for each shared user
      const userData: SharedUserData[] = []

      for (const share of shares) {
        // Check if share is not expired
        if (share.expires_at && new Date(share.expires_at) < new Date()) {
          continue
        }

        try {
          // Get user actions
          const { data: actions, error: actionsError } = await supabase
            .from('user_actions')
            .select('*')
            .eq('user_id', share.user_id)
            .order('logged_date', { ascending: false })
            .limit(10)

          if (actionsError) throw actionsError

          // Get latest narrative
          const { data: narratives, error: narrativesError } = await supabase
            .from('weekly_narratives')
            .select('*')
            .eq('user_id', share.user_id)
            .order('week_start', { ascending: false })
            .limit(1)

          if (narrativesError) throw narrativesError

          // Calculate stats
          const allActions = actions || []
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())

          const thisWeekActions = allActions.filter(action =>
            new Date(action.logged_date) >= weekStart
          ).length

          // Calculate streak (simplified - consecutive days with actions)
          let currentStreak = 0
          const today = new Date()
          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today)
            checkDate.setDate(checkDate.getDate() - i)
            const hasAction = allActions.some(action =>
              new Date(action.logged_date).toDateString() === checkDate.toDateString()
            )
            if (hasAction) {
              currentStreak++
            } else if (i > 0) {
              break
            }
          }

          userData.push({
            share,
            userEmail: share.shared_with_email,
            stats: {
              totalActions: allActions.length,
              thisWeekActions,
              currentStreak,
              lastActivity: allActions[0]?.logged_date || null
            },
            recentActions: allActions.slice(0, 5),
            latestNarrative: narratives?.[0] || null
          })

        } catch (error) {
          console.error('Error loading data for user:', share.user_id, error)
        }
      }

      setSharedUsers(userData)
    } catch (error) {
      console.error('Error loading shared users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportUserData = async (userId: string) => {
    try {
      // This would call a backend function to generate export
      const response = await fetch(`/api/coach-dashboard/export/${userId}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `client-progress-${userId}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Export feature coming soon!')
    }
  }

  const toggleCardExpansion = (shareId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(shareId)) {
      newExpanded.delete(shareId)
    } else {
      newExpanded.add(shareId)
    }
    setExpandedCards(newExpanded)
  }

  const filteredUsers = sharedUsers.filter(userData => {
    // Search filter
    if (searchQuery && !userData.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Access level filter
    if (filters.accessLevel !== 'all' && userData.share.access_level !== filters.accessLevel) {
      return false
    }

    // Activity filter
    if (filters.activity === 'active') {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      if (!userData.stats.lastActivity || new Date(userData.stats.lastActivity) < lastWeek) {
        return false
      }
    } else if (filters.activity === 'inactive') {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      if (userData.stats.lastActivity && new Date(userData.stats.lastActivity) >= lastWeek) {
        return false
      }
    }

    return true
  })

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'summary': return 'text-blue-600 bg-blue-100'
      case 'detailed': return 'text-purple-600 bg-purple-100'
      case 'full': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActivityStatus = (lastActivity: string | null) => {
    if (!lastActivity) return { label: 'No activity', color: 'text-gray-500' }

    const daysAgo = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))

    if (daysAgo === 0) return { label: 'Active today', color: 'text-green-600' }
    if (daysAgo === 1) return { label: 'Active yesterday', color: 'text-yellow-600' }
    if (daysAgo <= 7) return { label: `${daysAgo} days ago`, color: 'text-orange-600' }
    return { label: `${daysAgo} days ago`, color: 'text-red-600' }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared progress data...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header and Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <span>Coach Dashboard</span>
            </h2>
            <p className="text-gray-600 mt-1">
              View and analyze progress from clients who have shared their Trust Ledger with you
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{sharedUsers.length}</div>
            <div className="text-sm text-gray-600">Active Shares</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {sharedUsers.reduce((sum, user) => sum + user.stats.totalActions, 0)}
            </div>
            <div className="text-sm text-green-700">Total Actions</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {sharedUsers.reduce((sum, user) => sum + user.stats.thisWeekActions, 0)}
            </div>
            <div className="text-sm text-blue-700">This Week</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {sharedUsers.filter(user => {
                const lastWeek = new Date()
                lastWeek.setDate(lastWeek.getDate() - 7)
                return user.stats.lastActivity && new Date(user.stats.lastActivity) >= lastWeek
              }).length}
            </div>
            <div className="text-sm text-purple-700">Active Clients</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(sharedUsers.reduce((sum, user) => sum + user.stats.currentStreak, 0) / Math.max(sharedUsers.length, 1))}
            </div>
            <div className="text-sm text-orange-700">Avg Streak</div>
          </div>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <select
              value={filters.accessLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, accessLevel: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Access Levels</option>
              <option value="summary">Summary Only</option>
              <option value="detailed">Detailed View</option>
              <option value="full">Full Access</option>
            </select>

            <select
              value={filters.activity}
              onChange={(e) => setFilters(prev => ({ ...prev, activity: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Clients</option>
              <option value="active">Active This Week</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Client Cards */}
      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No shared data found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {sharedUsers.length === 0
              ? "You don't have any clients sharing their Trust Ledger with you yet."
              : "No clients match your current filters."
            }
          </p>
          {sharedUsers.length === 0 && (
            <p className="text-sm text-gray-500">
              Ask your clients to share their Trust Ledger with your email address: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.email}</span>
            </p>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((userData) => {
            const { share, stats, recentActions, latestNarrative } = userData
            const activityStatus = getActivityStatus(stats.lastActivity)
            const isExpanded = expandedCards.has(share.id)

            return (
              <Card key={share.id} className="overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userData.userEmail}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getAccessLevelColor(share.access_level)}`}>
                          {share.access_level}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={activityStatus.color}>
                          <Clock className="w-4 h-4 inline mr-1" />
                          {activityStatus.label}
                        </span>
                        {share.expires_at && (
                          <span>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Expires {new Date(share.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCardExpansion(share.id)}
                      >
                        {isExpanded ? 'Less' : 'More'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportUserData(share.user_id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{stats.totalActions}</div>
                      <div className="text-xs text-blue-700">Total Actions</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{stats.thisWeekActions}</div>
                      <div className="text-xs text-green-700">This Week</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">{stats.currentStreak}</div>
                      <div className="text-xs text-purple-700">Day Streak</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        {latestNarrative ? '✓' : '—'}
                      </div>
                      <div className="text-xs text-orange-700">Weekly Review</div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 pt-4 space-y-4">

                      {/* Recent Actions */}
                      {share.access_level !== 'summary' && recentActions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                            <Activity className="w-4 h-4" />
                            <span>Recent Actions</span>
                          </h4>
                          <div className="space-y-2">
                            {recentActions.slice(0, 3).map((action) => (
                              <div key={action.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-3 h-3 rounded-full mt-1 ${
                                  action.category === 'learning' ? 'bg-blue-500' :
                                  action.category === 'building' ? 'bg-green-500' :
                                  'bg-purple-500'
                                }`}></div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">
                                    {share.access_level === 'full' ? action.original_text : action.reframed_text || action.original_text}
                                  </p>
                                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                    <span>{action.category}</span>
                                    <span>{action.phase}</span>
                                    <span>{new Date(action.logged_date).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Latest Narrative */}
                      {latestNarrative && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4" />
                            <span>Latest Weekly Narrative</span>
                          </h4>
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-900">
                                Week of {new Date(latestNarrative.week_start).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-blue-700">
                                {latestNarrative.actions_count} actions
                              </span>
                            </div>
                            <p className="text-sm text-blue-800 mb-3">
                              {latestNarrative.narrative_text.substring(0, 200)}
                              {latestNarrative.narrative_text.length > 200 && '...'}
                            </p>
                            {latestNarrative.key_insights && latestNarrative.key_insights.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-blue-900">Key Insights:</div>
                                {latestNarrative.key_insights.slice(0, 2).map((insight, index) => (
                                  <div key={index} className="text-xs text-blue-700 flex items-start space-x-2">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                    <span>{insight}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

    </div>
  )
}