'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../providers'
import { Container, Card, Button } from '@strata-noble/ui'
import { MobileNavigation } from '../../../src/components/layout/MobileNavigation'
import { supabase } from '../../lib/supabase'
import { 
  Map, 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Circle, 
  ArrowRight,
  BookOpen,
  Hammer,
  Users,
  Lightbulb
} from 'lucide-react'
import type { UserAction, UserDream, WeeklyNarrative } from '../../types/platform'

interface RoadmapData {
  dream: UserDream | null
  totalActions: number
  weeklyActions: UserAction[]
  recentNarratives: WeeklyNarrative[]
  phaseProgress: {
    explore: number
    build: number
    launch: number
  }
  categoryBreakdown: {
    learning: number
    building: number
    connecting: number
  }
}

const phaseInfo = {
  explore: {
    title: 'Explore Phase',
    description: 'Foundation building and skill development',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    milestones: [
      'Define your dream clearly',
      'Identify key skills needed',
      'Build learning habits',
      'Connect with mentors'
    ]
  },
  build: {
    title: 'Build Phase', 
    description: 'Active creation and iteration',
    icon: Hammer,
    color: 'bg-green-100 text-green-700 border-green-200',
    milestones: [
      'Create first prototype/version',
      'Test with real users',
      'Iterate based on feedback',
      'Build core features'
    ]
  },
  launch: {
    title: 'Launch Phase',
    description: 'Going live and scaling',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    milestones: [
      'Public launch/release',
      'Marketing and promotion',
      'Scale operations',
      'Measure success metrics'
    ]
  }
}

const categoryIcons = {
  learning: BookOpen,
  building: Hammer,
  connecting: Users
}

export default function RoadmapPage() {
  const { user } = useAuth()
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month')

  useEffect(() => {
    if (user) {
      loadRoadmapData()
    }
  }, [user, selectedTimeframe])

  const loadRoadmapData = async () => {
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

      // Calculate date range based on timeframe
      const now = new Date()
      let startDate: Date
      
      switch (selectedTimeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
      }

      // Load actions in timeframe
      const { data: actions } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_date', startDate.toISOString().split('T')[0])
        .order('logged_date', { ascending: false })

      // Load recent narratives
      const { data: narratives } = await supabase
        .from('weekly_narratives')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(4)

      // Calculate phase progress
      const phaseProgress = {
        explore: 0,
        build: 0,
        launch: 0
      }

      const categoryBreakdown = {
        learning: 0,
        building: 0,
        connecting: 0
      }

      if (actions) {
        actions.forEach(action => {
          phaseProgress[action.phase as keyof typeof phaseProgress]++
          categoryBreakdown[action.category as keyof typeof categoryBreakdown]++
        })
      }

      setRoadmapData({
        dream,
        totalActions: actions?.length || 0,
        weeklyActions: actions || [],
        recentNarratives: narratives || [],
        phaseProgress,
        categoryBreakdown
      })

    } catch (error) {
      console.error('Error loading roadmap data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPhase = () => {
    if (!roadmapData) return 'explore'
    return roadmapData.dream?.current_phase || 'explore'
  }

  const getPhaseCompletion = (phase: 'explore' | 'build' | 'launch') => {
    if (!roadmapData) return 0
    const total = roadmapData.totalActions
    if (total === 0) return 0
    return Math.round((roadmapData.phaseProgress[phase] / total) * 100)
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
          <p className="mt-4 text-gray-600">Loading your roadmap...</p>
        </div>
      </Container>
    )
  }

  const currentPhase = getCurrentPhase()
  const CurrentPhaseIcon = phaseInfo[currentPhase as keyof typeof phaseInfo].icon

  return (
    <>
      <Container className="min-h-screen py-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Map className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Your Roadmap</h1>
            </div>
            <p className="text-gray-600">
              Track your journey from dream to reality
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['week', 'month', 'quarter'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {timeframe === 'week' ? 'This Week' : 
                   timeframe === 'month' ? 'This Month' : 'This Quarter'}
                </button>
              ))}
            </div>
          </div>

          {/* Dream Overview */}
          {roadmapData?.dream && (
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${phaseInfo[currentPhase as keyof typeof phaseInfo].color}`}>
                  <CurrentPhaseIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Dream</h2>
                  <p className="text-gray-700 mb-3">{roadmapData.dream.dream_text}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${phaseInfo[currentPhase as keyof typeof phaseInfo].color}`}>
                      {phaseInfo[currentPhase as keyof typeof phaseInfo].title}
                    </span>
                    <span className="text-gray-500">
                      {roadmapData.totalActions} actions logged
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Phase Progress */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Phase Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(phaseInfo).map(([phase, info]) => {
                const Icon = info.icon
                const completion = getPhaseCompletion(phase as 'explore' | 'build' | 'launch')
                const isCurrent = phase === currentPhase
                const actionCount = roadmapData?.phaseProgress[phase as 'explore' | 'build' | 'launch'] || 0
                
                return (
                  <div key={phase} className={`border-2 rounded-lg p-4 ${
                    isCurrent ? info.color : 'border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${info.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{info.title}</h3>
                        {isCurrent && (
                          <span className="text-xs text-blue-600 font-medium">Current Phase</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{actionCount} actions</span>
                        <span className="text-gray-600">{completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            phase === 'explore' ? 'bg-blue-500' :
                            phase === 'build' ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      {info.milestones.slice(0, 2).map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                          <Circle className="w-3 h-3" />
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Activity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Breakdown */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Types</h2>
              <div className="space-y-4">
                {Object.entries(roadmapData?.categoryBreakdown || {}).map(([category, count]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons]
                  const percentage = roadmapData?.totalActions ? 
                    Math.round((count / roadmapData.totalActions) * 100) : 0
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Recent Insights */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h2>
              {roadmapData?.recentNarratives.length ? (
                <div className="space-y-3">
                  {roadmapData.recentNarratives.slice(0, 3).map((narrative) => (
                    <div key={narrative.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Week of {new Date(narrative.week_start).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {narrative.narrative_text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No insights yet.</p>
                  <p className="text-xs">Keep logging actions to generate insights.</p>
                </div>
              )}
            </Card>

          </div>

          {/* Next Steps */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggested Next Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Focus on {currentPhase} activities</h3>
                  <p className="text-sm text-blue-700">
                    {phaseInfo[currentPhase as keyof typeof phaseInfo].description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900">Maintain consistency</h3>
                  <p className="text-sm text-green-700">
                    Log at least one action daily to build momentum
                  </p>
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


