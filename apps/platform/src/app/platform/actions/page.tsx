'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../providers'
import ActionLogForm from '../../../components/achievery/ActionLogForm'

export default function ActionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Actions</h1>
        <p className="text-gray-500 text-sm mt-1">Log what happened. Build the execution record.</p>
      </div>
      <ActionLogForm user={user} />
    </div>
  )
}
