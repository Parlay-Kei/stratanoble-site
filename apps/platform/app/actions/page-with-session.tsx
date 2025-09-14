'use client'

import { useState } from 'react'
import { useAuth } from '../providers'
import { useSession } from '../../components/providers/SessionProvider'
import { Container, Card, Button, Input } from '@strata-noble/ui'
import { MobileNavigation } from '../../components/layout/MobileNavigation'
import { supabase } from '../../lib/supabase'
import { PlusCircle, BookOpen, Hammer, Users, RefreshCw, Clock, CheckCircle } from 'lucide-react'
import type { AchieveryActionCategory } from '../../types/platform'

const categories = [
  { id: 'learning' as AchieveryActionCategory, label: 'Learning', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { id: 'building' as AchieveryActionCategory, label: 'Building', icon: Hammer, color: 'bg-green-100 text-green-700' },
  { id: 'connecting' as AchieveryActionCategory, label: 'Connecting', icon: Users, color: 'bg-purple-100 text-purple-700' },
]

export default function ActionsPageWithSession() {
  const { user } = useAuth()
  const {
    userDream,
    todaysActions,
    addAction,
    canLogAction,
    isReframing,
    startReframing,
    refreshActionLimit,
    syncWithDatabase,
    lastSync,
    preferences
  } = useSession()

  const [actionText, setActionText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AchieveryActionCategory | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionText.trim() || !selectedCategory || !user) return

    if (!canLogAction) {
      alert('You have reached your weekly action limit. Upgrade to Pro for unlimited actions.')
      return
    }

    setLoading(true)

    try {
      // Determine phase based on user's dream or default to explore
      const phase = userDream?.current_phase || 'explore'

      // Save the action to database
      const { data: newAction, error } = await supabase
        .from('user_actions')
        .insert({
          user_id: user.id,
          dream_id: userDream?.id || null,
          original_text: actionText.trim(),
          category: selectedCategory,
          phase: phase,
        })
        .select()
        .single()

      if (error) throw error

      // Add to session store
      addAction(newAction)

      // Reset form
      setActionText('')
      setSelectedCategory(null)

      // Refresh action limit
      await refreshActionLimit()

      // If auto-reframe is enabled, start reframing
      if (preferences.autoReframe && newAction?.id) {
        startReframing(newAction.id)
      }

    } catch (error) {
      console.error('Error saving action:', error)
      alert('Failed to save action. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualReframe = (actionId: string) => {
    startReframing(actionId)
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
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header with sync status */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Log New Action
            </h1>
            <p className="text-gray-600">
              What did you do today that moved you forward?
            </p>
            
            {/* Sync status indicator */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              {lastSync ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Synced {new Date(lastSync).toLocaleTimeString()}</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>Syncing...</span>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={syncWithDatabase}
                className="ml-2 text-xs px-2 py-1"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Action Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Action Description */}
              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you did
                </label>
                <Input
                  id="action"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="I helped a friend with their resume..."
                  className="min-h-[100px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about what you actually did, not what you plan to do.
                </p>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of activity was this?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedCategory === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category.label}</h3>
                            <p className="text-sm text-gray-600">
                              {category.id === 'learning' && 'Acquiring new skills or knowledge'}
                              {category.id === 'building' && 'Creating, developing, or improving something'}
                              {category.id === 'connecting' && 'Building relationships or networking'}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !actionText.trim() || !selectedCategory}
                className="w-full"
              >
                {loading ? 'Logging Action...' : 'Log Action'}
              </Button>

            </form>
          </Card>

          {/* Today's Actions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Today's Actions ({todaysActions.length})
              </h2>
              {preferences.autoReframe && (
                <div className="text-xs text-blue-600 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Auto-reframe enabled</span>
                </div>
              )}
            </div>
            
            {!canLogAction && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-4">
                <p className="font-medium">Weekly limit reached</p>
                <p className="text-sm">Upgrade to ACHIEVERY Pro for unlimited actions.</p>
              </div>
            )}

            {todaysActions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PlusCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No actions logged today.</p>
                <p className="text-sm">Your first action will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysActions.map((action) => {
                  const category = categories.find(c => c.id === action.category)
                  const Icon = category?.icon || PlusCircle
                  const isActionReframing = isReframing(action.id)
                  
                  return (
                    <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {action.category} • {action.phase}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(action.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-gray-800">{action.original_text}</p>
                          
                          {/* Reframing in progress */}
                          {isActionReframing && (
                            <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <p className="text-sm text-yellow-800">Reframing to professional language...</p>
                              </div>
                            </div>
                          )}

                          {/* Completed reframe */}
                          {action.reframed_text && !isActionReframing && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-blue-800">Professional reframe:</p>
                                {action.is_significant && (
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                    Significant
                                  </span>
                                )}
                              </div>
                              <p className="text-blue-700">{action.reframed_text}</p>
                            </div>
                          )}

                          {/* Manual reframe button for actions without reframes */}
                          {!action.reframed_text && !isActionReframing && !preferences.autoReframe && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManualReframe(action.id)}
                                className="text-xs"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Get Professional Reframe
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}