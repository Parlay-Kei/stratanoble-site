'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { sessionStore, useSessionStore } from '../../lib/session-store'
import { supabase } from '../../lib/supabase'

interface SessionContextType {
  user: User | null
  canLogAction: boolean
  refreshActionLimit: () => Promise<void>
  syncWithDatabase: () => Promise<void>
  lastSync: Date | null
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

  useEffect(() => {
    if (user !== sessionData.user) {
      sessionStore.setUser(user)
      if (user) {
        refreshActionLimit().then(() => sessionStore.markSynced())
      } else {
        sessionStore.reset()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionData.user])

  const refreshActionLimit = async () => {
    if (!user) return
    try {
      const { data: canLog } = await supabase.rpc('can_log_action', { user_uuid: user.id })
      sessionStore.setCanLogAction(canLog || false)
    } catch {
      sessionStore.setCanLogAction(true)
    }
  }

  const syncWithDatabase = async () => {
    if (!user) return
    await refreshActionLimit()
    sessionStore.markSynced()
  }

  const updatePreferences = (updates: Partial<SessionContextType['preferences']>) => {
    sessionStore.updatePreferences(updates)
  }

  const contextValue: SessionContextType = {
    user: sessionData.user,
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
