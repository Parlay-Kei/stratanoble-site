'use client'

import { User } from '@supabase/supabase-js'

interface SessionData {
  user: User | null
  canLogAction: boolean
  lastSync: Date | null
  preferences: UserPreferences
}

interface UserPreferences {
  preferredPhase: 'explore' | 'build' | 'launch'
  autoReframe: boolean
  notificationEnabled: boolean
  theme: 'light' | 'dark' | 'system'
}

const defaultSessionData: SessionData = {
  user: null,
  canLogAction: true,
  lastSync: null,
  preferences: {
    preferredPhase: 'explore',
    autoReframe: true,
    notificationEnabled: true,
    theme: 'system',
  },
}

class SessionStore {
  private data: SessionData = { ...defaultSessionData }
  private listeners: Set<(data: SessionData) => void> = new Set()
  private syncTimer: NodeJS.Timeout | null = null

  initialize() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem('achievery-session')
        if (stored) {
          const parsed = JSON.parse(stored)
          this.data = {
            ...defaultSessionData,
            ...parsed,
            lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
          }
        }
      } catch (error) {
        console.warn('Failed to restore session from storage:', error)
      }
    }
    this.startPeriodicSync()
  }

  getData(): SessionData {
    return { ...this.data }
  }

  updateData(updates: Partial<SessionData>) {
    this.data = { ...this.data, ...updates }
    this.notifyListeners()
    this.persistToStorage()
  }

  setUser(user: User | null) {
    this.updateData({ user })
  }

  getUser(): User | null {
    return this.data.user
  }

  setCanLogAction(canLog: boolean) {
    this.updateData({ canLogAction: canLog })
  }

  getCanLogAction(): boolean {
    return this.data.canLogAction
  }

  updatePreferences(updates: Partial<UserPreferences>) {
    const preferences = { ...this.data.preferences, ...updates }
    this.updateData({ preferences })
  }

  getPreferences(): UserPreferences {
    return { ...this.data.preferences }
  }

  markSynced() {
    this.updateData({ lastSync: new Date() })
  }

  getLastSync(): Date | null {
    return this.data.lastSync
  }

  needsSync(): boolean {
    if (!this.data.lastSync) return true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return this.data.lastSync < fiveMinutesAgo
  }

  subscribe(listener: (data: SessionData) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getData())
      } catch (error) {
        console.error('Session store listener error:', error)
      }
    })
  }

  private persistToStorage() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const toStore = {
          ...this.data,
          lastSync: this.data.lastSync?.toISOString(),
        }
        sessionStorage.setItem('achievery-session', JSON.stringify(toStore))
      } catch (error) {
        console.warn('Failed to persist session to storage:', error)
      }
    }
  }

  private startPeriodicSync() {
    if (this.syncTimer) return
    this.syncTimer = setInterval(() => {
      if (this.needsSync() && this.data.user) {
        this.notifyListeners()
      }
    }, 60000)
  }

  private stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  destroy() {
    this.stopPeriodicSync()
    this.listeners.clear()
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('achievery-session')
    }
  }

  reset() {
    this.data = { ...defaultSessionData }
    this.notifyListeners()
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('achievery-session')
    }
  }

  getSessionInfo() {
    return {
      hasUser: !!this.data.user,
      userEmail: this.data.user?.email,
      canLogAction: this.data.canLogAction,
      lastSync: this.data.lastSync,
      preferences: this.data.preferences,
    }
  }
}

export const sessionStore = new SessionStore()

if (typeof window !== 'undefined') {
  sessionStore.initialize()
}

import { useState, useEffect } from 'react'

export function useSessionStore(): SessionData & {
  updateData: (updates: Partial<SessionData>) => void
  reset: () => void
} {
  const [data, setData] = useState(() => sessionStore.getData())

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(setData)
    return unsubscribe
  }, [])

  return {
    ...data,
    updateData: (updates: Partial<SessionData>) => sessionStore.updateData(updates),
    reset: () => sessionStore.reset(),
  }
}

export function useSessionUser() {
  const { user } = useSessionStore()
  return user
}

export function useSessionPreferences() {
  const { preferences } = useSessionStore()
  return {
    preferences,
    updatePreferences: (updates: Partial<UserPreferences>) => sessionStore.updatePreferences(updates),
  }
}
