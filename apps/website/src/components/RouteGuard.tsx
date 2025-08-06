'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { checkRouteAccess, getUserTier, type UserTier } from '@/lib/auth-guard'
import { supabase } from '@/lib/supabase'

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function checkAccess() {
      try {
        // Check if this is a public route first - no auth needed
        const publicRoutes = ['/', '/pricing', '/contact', '/about', '/services']
        if (publicRoutes.includes(pathname)) {
          setAccessDenied(null)
          setLoading(false)
          return
        }

        // Only check auth for protected routes
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // If there's an error with Supabase (like missing env vars), allow access to public routes
        if (error) {
          console.warn('Supabase auth error:', error.message)
          if (publicRoutes.includes(pathname)) {
            setAccessDenied(null)
            setLoading(false)
            return
          }
          // For protected routes, show error
          setAccessDenied('Authentication service unavailable. Please try again later.')
          setLoading(false)
          return
        }
        
        let tier: UserTier | null = null
        if (session?.user) {
          try {
            tier = await getUserTier(session.user.id)
          } catch (error) {
            console.warn('Error getting user tier:', error)
            // Continue without tier info
          }
        }

        // Check route access
        const accessResult = checkRouteAccess(pathname, tier)
        
        if (!accessResult.hasAccess) {
          if (accessResult.redirectTo) {
            router.push(accessResult.redirectTo)
            return
          } else if (accessResult.message) {
            setAccessDenied(accessResult.message)
            setLoading(false)
            return
          }
        }

        setAccessDenied(null)
      } catch (error) {
        console.error('Route guard error:', error)
        // For public routes, allow access even if there's an error
        const publicRoutes = ['/', '/pricing', '/contact', '/about', '/services']
        if (publicRoutes.includes(pathname)) {
          setAccessDenied(null)
        } else {
          setAccessDenied('An error occurred while checking access.')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-[#C0C0C0] mb-6">{accessDenied}</p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-[#50C878] hover:bg-[#3DB067] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
