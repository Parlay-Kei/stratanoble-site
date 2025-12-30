'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../providers'
import { Container, Card, Button } from '@strata-noble/ui'
import { MobileNavigation } from '../../src/components/layout/MobileNavigation'
import { supabase } from '../../lib/supabase'
import { 
  PlusIcon, 
  BarChart3Icon, 
  UserIcon, 
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Hammer,
  Users,
  Map,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { UserAction, UserDream, WeeklyNarrative } from '../../types/platform'

interface DashboardData {
  dream: UserDream | null
  todaysActions: UserAction[]
  weeklyActions: UserAction[]
  recentNarrative: WeeklyNarrative | null
  weeklyLimit: number
  canLogAction: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load user's primary dream
      const { data: dreams } = await supabase
        .from('user_dreams')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      const dream = dreams?.[0] || null

      // Load today's actions
      const today = new Date().toISOString().split('T')[0]
      const { data: todaysActions } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('logged_date', today)
        .order('created_at', { ascending: false })

      // Load this week's actions
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const { data: weeklyActions } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_date', weekStart.toISOString().split('T')[0])
        .order('created_at', { ascending: false })

      // Load most recent narrative
      const { data: narratives } = await supabase
        .from('weekly_narratives')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)

      // Check action limit
      const { data: canLog } = await supabase
        .rpc('can_log_action', { user_uuid: user.id })

      // Get user limit
      const { data: limit } = await supabase
        .rpc('get_user_action_limit', { user_uuid: user.id })

      setDashboardData({
        dream,
        todaysActions: todaysActions || [],
        weeklyActions: weeklyActions || [],
        recentNarrative: narratives?.[0] || null,
        weeklyLimit: limit || 5,
        canLogAction: canLog || false
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </Container>
    )
  }

  const categoryIcons = {
    learning: BookOpen,
    building: Hammer,
    connecting: Users
  }

  return (
    <>
      <Container className="min-h-screen py-8 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.name || 'there'}
          </h1>
          <p className="text-gray-600">
            Ready to transform today's activities into tomorrow's possibilities?
          </p>
        </div>

        {/* Dream Overview */}
        {dashboardData?.dream && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Dream</h2>
                <p className="text-gray-700 mb-3">{dashboardData.dream.dream_text}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
                    {dashboardData.dream.current_phase} Phase
                  </span>
                  <span className="text-gray-600">
                    {dashboardData.weeklyActions.length} actions this week
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Weekly Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">This Week's Progress</h2>
            <span className="text-sm text-gray-600">
              {dashboardData?.weeklyActions.length || 0} / {dashboardData?.weeklyLimit || 5} actions
            </span>
          </div>
          
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((dashboardData?.weeklyActions.length || 0) / (dashboardData?.weeklyLimit || 5)) * 100)}%` 
                }}
              />
            </div>
          </div>

          {!dashboardData?.canLogAction && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Weekly limit reached</p>
              <p className="text-sm">Upgrade to ACHIEVERY Pro for unlimited actions.</p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="primary" 
              className="h-16 flex items-center justify-center space-x-3"
              onClick={() => router.push('/actions')}
              disabled={!dashboardData?.canLogAction}
            >
              <PlusIcon className="w-5 h-5" />
              <span>Log Action</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex items-center justify-center space-x-3"
              onClick={() => router.push('/roadmap')}
            >
              <Map className="w-5 h-5" />
              <span>View Roadmap</span>
            </Button>
          </div>
        </Card>

        {/* Today's Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Today's Actions ({dashboardData?.todaysActions.length || 0})
          </h2>
          
          {!dashboardData?.todaysActions.length ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No actions logged today.</p>
              <p className="text-sm">Start by logging your first activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.todaysActions.slice(0, 3).map((action) => {
                const Icon = categoryIcons[action.category as keyof typeof categoryIcons] || BookOpen
                return (
                  <div key={action.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{action.original_text}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{action.category}</span>
                        <span className="text-xs text-gray-400">â€¢</span>
                        <span className="text-xs text-gray-500">
                          {new Date(action.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {dashboardData.todaysActions.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/actions')}
                  className="w-full"
                >
                  View all {dashboardData.todaysActions.length} actions
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Recent Insight */}
        {dashboardData?.recentNarrative && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Insight</h2>
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="text-sm text-gray-500 mb-2">
                Week of {new Date(dashboardData.recentNarrative.week_start).toLocaleDateString()}
              </div>
              <p className="text-gray-700">{dashboardData.recentNarrative.narrative_text}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/narratives')}
              className="mt-4"
            >
              View All Narratives
            </Button>
          </Card>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/trust-ledger')}
              className="w-full h-16 flex flex-col items-center justify-center space-y-2"
            >
              <Shield className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium">Trust Ledger</span>
            </Button>
          </Card>
          
          <Card className="p-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/narratives')}
              className="w-full h-16 flex flex-col items-center justify-center space-y-2"
            >
              <TrendingUp className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium">Weekly Insights</span>
            </Button>
          </Card>
        </div>

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}


