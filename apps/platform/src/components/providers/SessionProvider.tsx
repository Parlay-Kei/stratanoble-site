'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { sessionStore, useSessionStore } from '../../lib/session-store'
import { supabase } from '../../lib/supabase'
import type { UserAction, UserDream } from '../../types/platform'

interface SessionContextType {
  // User data
  user: User | null
  userDream: UserDream | null
  
  // Actions
  todaysActions: UserAction[]
  addAction: (action: UserAction) => void
  updateAction: (actionId: string, updates: Partial<UserAction>) => void
  removeAction: (actionId: string) => void
  
  // Reframing
  isReframing: (actionId: string) => boolean
  startReframing: (actionId: string) => void
  finishReframing: (actionId: string, reframedData: { reframed_text: string; is_significant: boolean }) => void
  
  // Action limits
  canLogAction: boolean
  refreshActionLimit: () => Promise<void>
  
  // Sync
  syncWithDatabase: () => Promise<void>
  lastSync: Date | null
  
  // Preferences
  preferences: {
    preferredPhase: 'explore' | 'build' | 'launch'
    autoReframe: boolean
    notificationEnabled: boolean
    theme: 'light' | 'dark' | 'system'
  }
  updatePreferences: (updates: Partial<SessionContextType['preferences']>) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const sessionData = useSessionStore()

  // Sync user when it changes
  useEffect(() => {
    if (user !== sessionData.user) {
      sessionStore.setUser(user)
      if (user) {
        // Load user data when user logs in
        loadUserData(user)
      } else {
        // Clear session when user logs out
        sessionStore.reset()
      }
    }
  }, [user, sessionData.user])

  const loadUserData = async (user: User) => {
    try {
      // Load user's primary dream
      const { data: dreams } = await supabase
        .from('user_dreams')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (dreams && dreams.length > 0) {
        sessionStore.setUserDream(dreams[0])
      }

      // Load today's actions
      const today = new Date().toISOString().split('T')[0]
      const { data: actions } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('logged_date', today)
        .order('created_at', { ascending: false })

      if (actions) {
        sessionStore.setTodaysActions(actions)
      }

      // Check action limit
      await refreshActionLimit()

      // Mark as synced
      sessionStore.markSynced()
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const addAction = async (action: UserAction) => {
    // Add to session immediately for optimistic UI
    sessionStore.addAction(action)
    
    // If auto-reframe is enabled, start reframing
    if (sessionData.preferences.autoReframe && action.id) {
      startReframing(action.id)
    }
  }

  const updateAction = (actionId: string, updates: Partial<UserAction>) => {
    sessionStore.updateAction(actionId, updates)
  }

  const removeAction = (actionId: string) => {
    sessionStore.removeAction(actionId)
  }

  const isReframing = (actionId: string): boolean => {
    return sessionStore.isReframing(actionId)
  }

  const startReframing = async (actionId: string) => {
    const action = sessionData.todaysActions.find(a => a.id === actionId)
    if (!action || !user) return

    sessionStore.addToReframingQueue(actionId)

    try {
      const response = await fetch('/api/reframe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: action.original_text,
          category: action.category,
          phase: action.phase,
          userDream: sessionData.userDream?.dream_text,
          userId: user.id,
          actionId: actionId,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()
        finishReframing(actionId, {
          reframed_text: data.reframedText,
          is_significant: data.significanceScore >= 7
        })
      } else {
        throw new Error('Reframe request failed')
      }
    } catch (error) {
      console.error('Error reframing action:', error)
      sessionStore.removeFromReframingQueue(actionId)
    }
  }

  const finishReframing = (actionId: string, reframedData: { reframed_text: string; is_significant: boolean }) => {
    sessionStore.updateAction(actionId, reframedData)
    sessionStore.removeFromReframingQueue(actionId)
  }

  const refreshActionLimit = async () => {
    if (!user) return

    try {
      const { data: canLog } = await supabase
        .rpc('can_log_action', { user_uuid: user.id })
      
      sessionStore.setCanLogAction(canLog || false)
    } catch (error) {
      console.error('Error checking action limit:', error)
      sessionStore.setCanLogAction(false)
    }
  }

  const syncWithDatabase = async () => {
    if (!user) return

    try {
      await loadUserData(user)
    } catch (error) {
      console.error('Error syncing with database:', error)
    }
  }

  const updatePreferences = (updates: Partial<SessionContextType['preferences']>) => {
    sessionStore.updatePreferences(updates)
  }

  const contextValue: SessionContextType = {
    user: sessionData.user,
    userDream: sessionData.userDream,
    todaysActions: sessionData.todaysActions,
    addAction,
    updateAction,
    removeAction,
    isReframing,
    startReframing,
    finishReframing,
    canLogAction: sessionData.canLogAction,
    refreshActionLimit,
    syncWithDatabase,
    lastSync: sessionData.lastSync,
    preferences: sessionData.preferences,
    updatePreferences,
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}