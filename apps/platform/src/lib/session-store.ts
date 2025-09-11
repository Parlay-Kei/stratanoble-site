'use client'

import { User } from '@supabase/supabase-js'
import type { UserAction, UserDream } from '../types/platform'

// Session data structure
interface SessionData {
  user: User | null
  userDream: UserDream | null
  todaysActions: UserAction[]
  reframingQueue: string[] // Action IDs being reframed
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

// Default session data
const defaultSessionData: SessionData = {
  user: null,
  userDream: null,
  todaysActions: [],
  reframingQueue: [],
  canLogAction: true,
  lastSync: null,
  preferences: {
    preferredPhase: 'explore',
    autoReframe: true,
    notificationEnabled: true,
    theme: 'system'
  }
}

class SessionStore {
  private data: SessionData = { ...defaultSessionData }
  private listeners: Set<(data: SessionData) => void> = new Set()
  private syncTimer: NodeJS.Timeout | null = null

  // Initialize session store
  initialize() {
    // Try to restore from sessionStorage if available
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem('achievery-session')
        if (stored) {
          const parsed = JSON.parse(stored)
          this.data = { 
            ...defaultSessionData, 
            ...parsed,
            lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null
          }
        }
      } catch (error) {
        console.warn('Failed to restore session from storage:', error)
      }
    }

    // Start periodic sync
    this.startPeriodicSync()
  }

  // Get current session data
  getData(): SessionData {
    return { ...this.data }
  }

  // Update session data
  updateData(updates: Partial<SessionData>) {
    this.data = { ...this.data, ...updates }
    this.notifyListeners()
    this.persistToStorage()
  }

  // User management
  setUser(user: User | null) {
    this.updateData({ user })
  }

  getUser(): User | null {
    return this.data.user
  }

  // Dream management
  setUserDream(dream: UserDream | null) {
    this.updateData({ userDream: dream })
  }

  getUserDream(): UserDream | null {
    return this.data.userDream
  }

  // Action management
  addAction(action: UserAction) {
    const todaysActions = [action, ...this.data.todaysActions]
    this.updateData({ todaysActions })
  }

  updateAction(actionId: string, updates: Partial<UserAction>) {
    const todaysActions = this.data.todaysActions.map(action =>
      action.id === actionId ? { ...action, ...updates } : action
    )
    this.updateData({ todaysActions })
  }

  removeAction(actionId: string) {
    const todaysActions = this.data.todaysActions.filter(action => action.id !== actionId)
    this.updateData({ todaysActions })
  }

  setTodaysActions(actions: UserAction[]) {
    this.updateData({ todaysActions: actions })
  }

  getTodaysActions(): UserAction[] {
    return [...this.data.todaysActions]
  }

  // Reframing queue management
  addToReframingQueue(actionId: string) {
    const reframingQueue = [...this.data.reframingQueue, actionId]
    this.updateData({ reframingQueue })
  }

  removeFromReframingQueue(actionId: string) {
    const reframingQueue = this.data.reframingQueue.filter(id => id !== actionId)
    this.updateData({ reframingQueue })
  }

  isReframing(actionId: string): boolean {
    return this.data.reframingQueue.includes(actionId)
  }

  // Action limits
  setCanLogAction(canLog: boolean) {
    this.updateData({ canLogAction: canLog })
  }

  getCanLogAction(): boolean {
    return this.data.canLogAction
  }

  // Preferences
  updatePreferences(updates: Partial<UserPreferences>) {
    const preferences = { ...this.data.preferences, ...updates }
    this.updateData({ preferences })
  }

  getPreferences(): UserPreferences {
    return { ...this.data.preferences }
  }

  // Sync management
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

  // Event listeners
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

  // Storage persistence
  private persistToStorage() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const toStore = {
          ...this.data,
          lastSync: this.data.lastSync?.toISOString()
        }
        sessionStorage.setItem('achievery-session', JSON.stringify(toStore))
      } catch (error) {
        console.warn('Failed to persist session to storage:', error)
      }
    }
  }

  // Periodic sync
  private startPeriodicSync() {
    if (this.syncTimer) return

    this.syncTimer = setInterval(() => {
      if (this.needsSync() && this.data.user) {
        // Trigger a sync notification for components to handle
        this.notifyListeners()
      }
    }, 60000) // Check every minute
  }

  private stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  // Cleanup
  destroy() {
    this.stopPeriodicSync()
    this.listeners.clear()
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('achievery-session')
    }
  }

  // Reset session (on logout)
  reset() {
    this.data = { ...defaultSessionData }
    this.notifyListeners()
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('achievery-session')
    }
  }

  // Bulk operations for performance
  batchUpdate(updates: Array<{ type: string; data: any }>) {
    let newData = { ...this.data }

    updates.forEach(update => {
      switch (update.type) {
        case 'ADD_ACTION':
          newData.todaysActions = [update.data, ...newData.todaysActions]
          break
        case 'UPDATE_ACTION':
          newData.todaysActions = newData.todaysActions.map(action =>
            action.id === update.data.id ? { ...action, ...update.data.updates } : action
          )
          break
        case 'SET_USER':
          newData.user = update.data
          break
        case 'SET_DREAM':
          newData.userDream = update.data
          break
        case 'SET_CAN_LOG':
          newData.canLogAction = update.data
          break
        default:
          console.warn('Unknown batch update type:', update.type)
      }
    })

    this.data = newData
    this.notifyListeners()
    this.persistToStorage()
  }

  // Debug helpers
  getSessionInfo() {
    return {
      hasUser: !!this.data.user,
      userEmail: this.data.user?.email,
      actionsCount: this.data.todaysActions.length,
      reframingCount: this.data.reframingQueue.length,
      canLogAction: this.data.canLogAction,
      lastSync: this.data.lastSync,
      preferences: this.data.preferences
    }
  }
}

// Singleton instance
export const sessionStore = new SessionStore()

// Initialize on first import
if (typeof window !== 'undefined') {
  sessionStore.initialize()
}

// React hook for using session store
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
    reset: () => sessionStore.reset()
  }
}

// Specific hooks for common use cases
export function useSessionUser() {
  const { user } = useSessionStore()
  return user
}

export function useSessionActions() {
  const { todaysActions } = useSessionStore()
  return todaysActions
}

export function useSessionReframing() {
  const { reframingQueue } = useSessionStore()
  return {
    isReframing: (actionId: string) => reframingQueue.includes(actionId),
    addToQueue: (actionId: string) => sessionStore.addToReframingQueue(actionId),
    removeFromQueue: (actionId: string) => sessionStore.removeFromReframingQueue(actionId)
  }
}

export function useSessionPreferences() {
  const { preferences } = useSessionStore()
  return {
    preferences,
    updatePreferences: (updates: Partial<UserPreferences>) => sessionStore.updatePreferences(updates)
  }
}