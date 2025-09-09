'use client'

import { useAuth } from '../providers'
import { Container, Card, Button } from '@strata-noble/ui'
import { MobileNavigation } from '../../components/layout/MobileNavigation'
import { PlusIcon, BarChart3Icon, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

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
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.name || 'there'}
          </h1>
          <p className="text-gray-600">
            Ready to transform today's activities into tomorrow's possibilities?
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="default" 
              className="h-16 flex items-center justify-center space-x-3"
              onClick={() => router.push('/actions')}
            >
              <PlusIcon className="w-5 h-5" />
              <span>Log New Action</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex items-center justify-center space-x-3"
            >
              <BarChart3Icon className="w-5 h-5" />
              <span>View Progress</span>
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Today's Progress
          </h2>
          <div className="text-center py-8 text-gray-500">
            <BarChart3Icon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No actions logged today.</p>
            <p className="text-sm">Start by logging your first activity above.</p>
          </div>
        </Card>

        {/* Profile Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-8 h-8 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-800">ACHIEVERY Platform</h3>
                <p className="text-sm text-gray-600">Free Tier - 5 actions per week</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Upgrade to Pro
            </Button>
          </div>
        </Card>

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}