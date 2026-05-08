'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Legacy component: weekly narratives have moved to /platform/systems
export function WeeklyNarrativesList() {
  const router = useRouter()
  useEffect(() => { router.replace('/platform/systems') }, [router])
  return null
}
