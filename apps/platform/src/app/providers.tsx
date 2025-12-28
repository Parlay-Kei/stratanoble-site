'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { SessionProvider } from '../components/providers/SessionProvider'

// Modular auth integration planned - UI calls API routes per SOP architecture
// Types would be imported from modular contracts when path resolution is configured

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle sign in event - create user profile if needed
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if user profile exists in clients table (Strata Noble pattern)
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('id', user.id)
        .single()

      // Create client profile if it doesn't exist
      if (!existingClient) {
        const { error } = await supabase
          .from('clients')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata.name || user.email!.split('@')[0],
            tier: 'lite', // Default tier for platform users
            status: 'active'
          })

        if (error) {
          console.error('Error creating client profile:', error)
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword
      }}
    >
      <SessionProvider user={user}>
        {children}
      </SessionProvider>
    </AuthContext.Provider>
  )
}
