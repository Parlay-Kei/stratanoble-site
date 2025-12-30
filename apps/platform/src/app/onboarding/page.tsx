'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers'
import { Container, Card, Button, Input } from '@strata-noble/ui'
import { Sparkles, ArrowRight, Target, Lightbulb } from 'lucide-react'
import type { DreamFormData, AchieveryPhase } from '../../types/platform'

const phases = [
  {
    id: 'explore' as AchieveryPhase,
    title: 'Explore Phase',
    description: 'Foundation building and skill development',
    icon: Lightbulb,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    id: 'build' as AchieveryPhase,
    title: 'Build Phase', 
    description: 'Active creation, testing, and iteration',
    icon: Target,
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  {
    id: 'launch' as AchieveryPhase,
    title: 'Launch Phase',
    description: 'Going live, marketing, and scaling',
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
]

const starterActionsByPhase = {
  explore: [
    'Research people doing what you want to do',
    'Watch tutorials or take a course in this area',
    'Join communities related to your interest',
    'Read articles and books about this topic',
    'Talk to someone who has experience in this field'
  ],
  build: [
    'Create your first prototype or draft',
    'Set up the basic tools and workspace you need',
    'Make a simple version to test your idea',
    'Share early work with trusted friends for feedback',
    'Document what you learn as you build'
  ],
  launch: [
    'Share your work publicly for the first time',
    'Get feedback from real users or customers',
    'Create a simple marketing plan',
    'Set up ways for people to find and contact you',
    'Track results and plan improvements'
  ],
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [dream, setDream] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<AchieveryPhase>('explore')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const router = useRouter()

  const handleDreamSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (dream.trim()) {
      setStep(2)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Call the complete onboarding API endpoint
      // This updates the auth-session cookie with onboardingCompleted: true
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamText: dream,
          phase: selectedPhase,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to complete onboarding')
      }

      // Get the 'next' query param to redirect back to intended destination
      const params = new URLSearchParams(window.location.search)
      const nextUrl = params.get('next') || '/dashboard'

      // Navigate to dashboard (or intended destination)
      router.push(nextUrl)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

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
    <Container className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ACHIEVERY
          </h1>
          <p className="text-gray-600">
            Let's set up your journey from activity to possibility
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className={`w-4 h-4 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} rounded`} />
            <div className={`w-4 h-4 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>
        </div>

        {step === 1 && (
          <Card className="p-8">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                What do you dream of doing?
              </h2>
              <p className="text-gray-600">
                Don't worry about being perfect. Just tell us what you're curious about or what you'd like to build.
              </p>
            </div>

            <form onSubmit={handleDreamSubmit} className="space-y-6">
              <div>
                <Input
                  value={dream}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDream(e.target.value)}
                  placeholder="I want to start a podcast about sustainability..."
                  className="min-h-[120px] resize-none text-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Examples: "Start a design agency", "Learn to play guitar", "Write a book about my experiences"
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!dream.trim()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Where are you in your journey?
              </h2>
              <p className="text-gray-600 mb-6">
                Choose the phase that best describes where you are right now.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {phases.map((phase) => {
                const Icon = phase.icon
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setSelectedPhase(phase.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedPhase === phase.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${phase.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{phase.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{phase.description}</p>
                        <div className="text-xs text-gray-500">
                          <p className="font-medium mb-1">Typical activities:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {starterActionsByPhase[phase.id].slice(0, 2).map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <Button
              onClick={handleComplete}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up your platform...' : 'Complete Setup'}
            </Button>
          </Card>
        )}

      </div>
    </Container>
  )
}
