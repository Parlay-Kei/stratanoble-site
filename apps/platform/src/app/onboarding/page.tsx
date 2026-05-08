'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers'
import { Container, Card, Button, Input } from '@strata-noble/ui'
import { Sparkles, ArrowRight, Target, Lightbulb, Zap } from 'lucide-react'

type ExecutionStage = 'diagnose' | 'build' | 'launch'

const stages: { id: ExecutionStage; title: string; description: string; icon: typeof Target; color: string }[] = [
  {
    id: 'diagnose',
    title: 'Diagnose',
    description: 'Assessment, gap analysis, and foundational setup',
    icon: Lightbulb,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    id: 'build',
    title: 'Build',
    description: 'Active creation, development, and iteration',
    icon: Target,
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  {
    id: 'launch',
    title: 'Launch',
    description: 'Deployment, go-live, and execution',
    icon: Zap,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [objective, setObjective] = useState('')
  const [selectedStage, setSelectedStage] = useState<ExecutionStage>('diagnose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const router = useRouter()

  const handleObjectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (objective.trim()) setStep(2)
  }

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectiveText: objective, phase: selectedStage }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to complete onboarding')
      }
      const params = new URLSearchParams(window.location.search)
      router.push(params.get('next') || '/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Achievery</h1>
          <p className="text-gray-600">Set up your engagement</p>
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">What is your engagement objective?</h2>
              <p className="text-gray-600">Describe the outcome you are working toward.</p>
            </div>
            <form onSubmit={handleObjectiveSubmit} className="space-y-6">
              <div>
                <Input
                  value={objective}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setObjective(e.target.value)}
                  placeholder="Stand up the client onboarding system by Q3..."
                  className="min-h-[120px] resize-none text-lg"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!objective.trim()}>
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Where is this engagement?</h2>
              <p className="text-gray-600">Choose the execution stage that best describes current status.</p>
            </div>
            <div className="space-y-4 mb-8">
              {stages.map((stage) => {
                const Icon = stage.icon
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedStage(stage.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedStage === stage.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${stage.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{stage.title}</h3>
                        <p className="text-gray-600 text-sm">{stage.description}</p>
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
            <Button onClick={handleComplete} disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </Card>
        )}
      </div>
    </Container>
  )
}
