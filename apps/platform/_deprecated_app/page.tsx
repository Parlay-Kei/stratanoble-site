'use client'

import { useAuth } from './providers'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Card } from '@strata-noble/ui'
import { supabase } from '../src/lib/supabase'

export default function PlatformHome() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    // Check if this is a preview request from the website
    const isPreview = searchParams.get('utm_campaign') === 'preview-platform' || 
                     searchParams.get('preview') === 'true'
    
    setIsPreviewMode(isPreview)

    const checkOnboardingAndRedirect = async () => {
      if (!loading && !isPreview) {
        if (user) {
          // Check if user has completed onboarding
          const { data: settings } = await supabase
            .from('user_platform_settings')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single()

          if (settings?.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        } else {
          router.push('/auth')
        }
      }
    }

    checkOnboardingAndRedirect()
  }, [user, loading, router, searchParams])

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ACHIEVERY Platform...</p>
        </div>
      </Container>
    )
  }

  // Show preview mode for visitors from the website
  if (isPreviewMode) {
    return (
      <Container className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              ACHIEVERY Platform Preview
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transform daily activities into meaningful progress
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => router.push('/auth')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => window.open('https://stratanoble.com/contact', '_blank')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Schedule Demo
              </button>
            </div>
          </div>

          {/* Feature Preview Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Pathfinder Onboarding</h3>
              <p className="text-gray-600 mb-4">Capture your dreams and get automated starter actions</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">Example: "I want to start a podcast"</div>
                <div className="text-gray-500 mt-1">→ Research podcast hosting platforms</div>
                <div className="text-gray-500">→ Define your target audience</div>
                <div className="text-gray-500">→ Create content calendar</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">AI Reframe Engine</h3>
              <p className="text-gray-600 mb-4">Transform daily activities into professional achievements</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">Input: "Made breakfast"</div>
                <div className="text-gray-500 mt-1">→ Demonstrated nutritional planning</div>
                <div className="text-gray-500">→ Executed morning routine optimization</div>
                <div className="text-gray-500">→ Applied time management skills</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Progress Dashboard</h3>
              <p className="text-gray-600 mb-4">Track your journey with visual progress indicators</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span>Weekly Actions</span>
                  <span className="font-medium">12/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Weekly Narratives</h3>
              <p className="text-gray-600 mb-4">AI-generated progress summaries delivered to your inbox</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">This Week's Highlights:</div>
                <div className="text-gray-500 mt-1">• Completed 3 strategic planning sessions</div>
                <div className="text-gray-500">• Advanced 2 key business initiatives</div>
                <div className="text-gray-500">• Demonstrated consistent growth mindset</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Trust Ledger</h3>
              <p className="text-gray-600 mb-4">Share progress with coaches and accountability partners</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">Shared with: Business Coach</div>
                <div className="text-gray-500 mt-1">• Weekly progress reports</div>
                <div className="text-gray-500">• Goal completion status</div>
                <div className="text-gray-500">• Achievement milestones</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-3xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Roadmap Visualization</h3>
              <p className="text-gray-600 mb-4">Three-phase journey from dreams to achievements</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-600">✓ Phase 1: Foundation</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600">→ Phase 2: Growth</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">○ Phase 3: Mastery</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Pricing Tiers */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Growth Path</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-4">$0<span className="text-lg text-gray-500">/month</span></div>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li>• 5 actions per week</li>
                  <li>• Basic AI reframing</li>
                  <li>• Personal dashboard</li>
                </ul>
              </Card>
              
              <Card className="p-6 border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-2">Growth</h3>
                <div className="text-3xl font-bold mb-4">$97<span className="text-lg text-gray-500">/month</span></div>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li>• Unlimited actions</li>
                  <li>• Advanced AI narratives</li>
                  <li>• Coach sharing</li>
                  <li>• Weekly email summaries</li>
                </ul>
              </Card>
              
              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-xl font-semibold mb-2">Partner</h3>
                <div className="text-3xl font-bold mb-4">$197<span className="text-lg text-gray-500">/month</span></div>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li>• Everything in Growth</li>
                  <li>• 1-on-1 coaching calls</li>
                  <li>• Custom roadmaps</li>
                  <li>• Priority support</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-6">
              Ready to transform your daily activities into meaningful progress?
            </p>
            <button 
              onClick={() => router.push('/auth')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors"
            >
              Start Your ACHIEVERY Journey
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Part of the Strata Noble ecosystem - leveraging existing infrastructure
            </p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900">
          ACHIEVERY Platform
        </h1>
        <p className="text-xl text-gray-600">
          Transform daily activities into meaningful progress
        </p>
        <Card className="p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            🚀 Platform Ready
          </h2>
          <div className="text-left space-y-2 text-gray-700">
            <p>✅ Integrated with Strata Noble monorepo</p>
            <p>✅ Connected to @strata-noble/ui & @strata-noble/utils</p>
            <p>✅ Authentication system migrated</p>
            <p>✅ Component migration in progress</p>
            <p>⏳ Extending Supabase schema for ACHIEVERY</p>
            <p>⏳ Building core platform features</p>
          </div>
        </Card>
        <p className="text-sm text-gray-500">
          Part of the Strata Noble ecosystem - leveraging existing infrastructure
        </p>
      </div>
    </Container>
  )
}
