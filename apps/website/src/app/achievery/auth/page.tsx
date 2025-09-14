'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@strata-noble/utils'

export default function AchieveryAuthBridge() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check if user is already authenticated
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          // If there's an error, redirect to the existing auth page
          router.push('/auth/achievery')
          return
        }

        if (session) {
          // User is authenticated, redirect to ACHIEVERY with token
          const achieveryUrl = 'http://localhost:5173'
          const redirectUrl = `${achieveryUrl}?token=${session.access_token}`
          window.location.href = redirectUrl
        } else {
          // User not authenticated, redirect to auth page
          const redirectTo = searchParams?.get('redirectTo') || '/achievery'
          router.push(`/auth/achievery?redirectTo=${encodeURIComponent(redirectTo)}`)
        }
      } catch (error) {
        console.error('Auth bridge error:', error)
        router.push('/auth/achievery')
      }
    }

    checkAuthAndRedirect()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to ACHIEVERY...</p>
      </div>
    </div>
  )
}