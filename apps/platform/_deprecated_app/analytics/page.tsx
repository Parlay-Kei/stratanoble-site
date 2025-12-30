'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../providers'
import { Container, Card, Button } from '@strata-noble/ui'
import { MobileNavigation } from '../../../src/components/layout/MobileNavigation'
import { supabase } from '../../lib/supabase'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  Clock,
  Award,
  Zap,
  BookOpen,
  Hammer,
  Users,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import type { UserAction, UserDream, WeeklyNarrative, PlatformStats } from '../../types/platform'

interface AnalyticsData {
  stats: PlatformStats
  weeklyTrends: Array<{
    week: string
    actions: number
    learning: number
    building: number
    connecting: number
  }>
  monthlyComparison: {
    thisMonth: number
    lastMonth: number
    change: number
  }
  streakData: {
    current: number
    longest: number
    lastActive: string
  }
  categoryInsights: Array<{
    category: string
    count: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>
  phaseProgression: Array<{
    phase: string
    count: number
    percentage: number
    avgDuration: number
  }>
}

const categoryIcons = {
  learning: BookOpen,
  building: Hammer,
  connecting: Users
}

const categoryColors = {
  learning: 'bg-blue-500',
  building: 'bg-green-500',
  connecting: 'bg-purple-500'
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    if (user) {
      loadAnalyticsData()
    }
  }, [user, timeframe])

  const loadAnalyticsData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load all user actions
      const { data: actions } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_date', { ascending: false })

      // Load user dreams
      const { data: dreams } = await supabase
        .from('user_dreams')
        .select('*')
        .eq('user_id', user.id)

      if (!actions) {
        setAnalyticsData(null)
        return
      }

      // Calculate basic stats
      const totalActions = actions.length
      const actionsThisWeek = actions.filter(a => {
        const actionDate = new Date(a.logged_date)
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        return actionDate >= weekStart
      }).length

      // Calculate streak
      const sortedActions = actions.sort((a, b) => 
        new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime()
      )
      
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      let lastDate: Date | null = null

      for (const action of sortedActions) {
        const actionDate = new Date(action.logged_date)
        
        if (!lastDate) {
          tempStreak = 1
          lastDate = actionDate
        } else {
          const daysDiff = Math.floor((lastDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDiff === 1) {
            tempStreak++
          } else if (daysDiff > 1) {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
          
          lastDate = actionDate
        }
      }
      
      currentStreak = tempStreak
      longestStreak = Math.max(longestStreak, tempStreak)

      // Category breakdown
      const categoryCount = {
        learning: actions.filter(a => a.category === 'learning').length,
        building: actions.filter(a => a.category === 'building').length,
        connecting: actions.filter(a => a.category === 'connecting').length
      }

      const favoriteCategory = Object.entries(categoryCount).reduce((a, b) => 
        categoryCount[a[0] as keyof typeof categoryCount] > categoryCount[b[0] as keyof typeof categoryCount] ? a : b
      )[0] as keyof typeof categoryCount

      // Phase breakdown
      const phaseCount = {
        explore: actions.filter(a => a.phase === 'explore').length,
        build: actions.filter(a => a.phase === 'build').length,
        launch: actions.filter(a => a.phase === 'launch').length
      }

      const currentPhase = dreams?.[0]?.current_phase || 'explore'

      // Weekly trends (last 8 weeks)
      const weeklyTrends = []
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)

        const weekActions = actions.filter(a => {
          const actionDate = new Date(a.logged_date)
          return actionDate >= weekStart && actionDate <= weekEnd
        })

        weeklyTrends.push({
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          actions: weekActions.length,
          learning: weekActions.filter(a => a.category === 'learning').length,
          building: weekActions.filter(a => a.category === 'building').length,
          connecting: weekActions.filter(a => a.category === 'connecting').length
        })
      }

      // Monthly comparison
      const thisMonth = new Date()
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const thisMonthActions = actions.filter(a => {
        const actionDate = new Date(a.logged_date)
        return actionDate.getMonth() === thisMonth.getMonth() && 
               actionDate.getFullYear() === thisMonth.getFullYear()
      }).length

      const lastMonthActions = actions.filter(a => {
        const actionDate = new Date(a.logged_date)
        return actionDate.getMonth() === lastMonth.getMonth() && 
               actionDate.getFullYear() === lastMonth.getFullYear()
      }).length

      const monthlyChange = lastMonthActions > 0 ? 
        ((thisMonthActions - lastMonthActions) / lastMonthActions) * 100 : 0

      // Category insights with trends
      const categoryInsights = Object.entries(categoryCount).map(([category, count]) => {
        const percentage = totalActions > 0 ? (count / totalActions) * 100 : 0
        
        // Simple trend calculation (comparing first half vs second half of actions)
        const midpoint = Math.floor(actions.length / 2)
        const firstHalf = actions.slice(midpoint).filter(a => a.category === category).length
        const secondHalf = actions.slice(0, midpoint).filter(a => a.category === category).length
        
        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (secondHalf > firstHalf * 1.2) trend = 'up'
        else if (secondHalf < firstHalf * 0.8) trend = 'down'

        return {
          category,
          count,
          percentage,
          trend
        }
      })

      // Phase progression
      const phaseProgression = Object.entries(phaseCount).map(([phase, count]) => ({
        phase,
        count,
        percentage: totalActions > 0 ? (count / totalActions) * 100 : 0,
        avgDuration: 30 // Placeholder - would need more complex calculation
      }))

      const stats: PlatformStats = {
        total_actions: totalActions,
        current_streak: currentStreak,
        actions_this_week: actionsThisWeek,
        dreams_count: dreams?.length || 0,
        favorite_category: favoriteCategory,
        current_phase: currentPhase as any
      }

      setAnalyticsData({
        stats,
        weeklyTrends,
        monthlyComparison: {
          thisMonth: thisMonthActions,
          lastMonth: lastMonthActions,
          change: monthlyChange
        },
        streakData: {
          current: currentStreak,
          longest: longestStreak,
          lastActive: sortedActions[0]?.logged_date || ''
        },
        categoryInsights,
        phaseProgression
      })

    } catch (error) {
      console.error('Error loading analytics data:', error)
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
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </Container>
    )
  }

  if (!analyticsData) {
    return (
      <Container className="min-h-screen py-8 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet</h1>
          <p className="text-gray-600 mb-6">
            Start logging actions to see your analytics and insights.
          </p>
          <Button onClick={() => window.location.href = '/actions'}>
            Log Your First Action
          </Button>
        </div>
      </Container>
    )
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />
      default: return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <>
      <Container className="min-h-screen py-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            </div>
            <p className="text-gray-600">
              Deep insights into your progress and patterns
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.stats.total_actions}</div>
              <div className="text-sm text-gray-600">Total Actions</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.streakData.current}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.stats.actions_this_week}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.streakData.longest}</div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </Card>
          </div>

          {/* Monthly Comparison */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Progress</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {analyticsData.monthlyComparison.thisMonth}
                </div>
                <div className="text-sm text-gray-600">Actions this month</div>
              </div>
              <div className="text-right">
                <div className={`flex items-center space-x-1 ${
                  analyticsData.monthlyComparison.change > 0 ? 'text-green-600' : 
                  analyticsData.monthlyComparison.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analyticsData.monthlyComparison.change > 0 ? 
                    <ArrowUp className="w-4 h-4" /> : 
                    analyticsData.monthlyComparison.change < 0 ? 
                    <ArrowDown className="w-4 h-4" /> : 
                    <Minus className="w-4 h-4" />
                  }
                  <span className="font-medium">
                    {Math.abs(analyticsData.monthlyComparison.change).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">vs last month</div>
              </div>
            </div>
          </Card>

          {/* Weekly Trends Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Trends</h2>
            <div className="space-y-4">
              {analyticsData.weeklyTrends.map((week, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-600">{week.week}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{week.actions} actions</span>
                    </div>
                    <div className="flex space-x-1 h-2">
                      <div 
                        className="bg-blue-500 rounded-sm"
                        style={{ width: `${(week.learning / Math.max(week.actions, 1)) * 100}%` }}
                      />
                      <div 
                        className="bg-green-500 rounded-sm"
                        style={{ width: `${(week.building / Math.max(week.actions, 1)) * 100}%` }}
                      />
                      <div 
                        className="bg-purple-500 rounded-sm"
                        style={{ width: `${(week.connecting / Math.max(week.actions, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span className="text-sm text-gray-600">Learning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                <span className="text-sm text-gray-600">Building</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                <span className="text-sm text-gray-600">Connecting</span>
              </div>
            </div>
          </Card>

          {/* Category Insights */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="space-y-4">
              {analyticsData.categoryInsights.map((insight) => {
                const Icon = categoryIcons[insight.category as keyof typeof categoryIcons]
                const color = categoryColors[insight.category as keyof typeof categoryColors]
                
                return (
                  <div key={insight.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-').replace('-500', '-100')} ${color.replace('bg-', 'text-')}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{insight.category}</div>
                        <div className="text-sm text-gray-600">{insight.count} actions</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{insight.percentage.toFixed(1)}%</div>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(insight.trend)}
                          <span className="text-xs text-gray-500 capitalize">{insight.trend}</span>
                        </div>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${insight.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Phase Progression */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Phase Distribution</h2>
            <div className="space-y-4">
              {analyticsData.phaseProgression.map((phase) => (
                <div key={phase.phase} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      phase.phase === 'explore' ? 'bg-blue-500' :
                      phase.phase === 'build' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{phase.phase} Phase</div>
                      <div className="text-sm text-gray-600">{phase.count} actions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{phase.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}


