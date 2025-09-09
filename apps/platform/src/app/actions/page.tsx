'use client'

import { useState } from 'react'
import { useAuth } from '../providers'
import { Container, Card, Button, Input } from '@strata-noble/ui'
import { MobileNavigation } from '../../components/layout/MobileNavigation'
import { PlusCircle, BookOpen, Hammer, Users } from 'lucide-react'

const categories = [
  { id: 'learning', label: 'Learning', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { id: 'building', label: 'Building', icon: Hammer, color: 'bg-green-100 text-green-700' },
  { id: 'connecting', label: 'Connecting', icon: Users, color: 'bg-purple-100 text-purple-700' },
]

export default function ActionsPage() {
  const { user } = useAuth()
  const [actionText, setActionText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionText.trim() || !selectedCategory) return

    setLoading(true)
    
    // TODO: Save to database
    console.log('Saving action:', { actionText, selectedCategory })
    
    // Reset form
    setActionText('')
    setSelectedCategory(null)
    setLoading(false)
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
    <>
      <Container className="min-h-screen py-8 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Log New Action
            </h1>
            <p className="text-gray-600">
              What did you do today that moved you forward?
            </p>
          </div>

          {/* Action Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Action Description */}
              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you did
                </label>
                <Input
                  id="action"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="I helped a friend with their resume..."
                  className="min-h-[100px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about what you actually did, not what you plan to do.
                </p>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of activity was this?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedCategory === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category.label}</h3>
                            <p className="text-sm text-gray-600">
                              {category.id === 'learning' && 'Acquiring new skills or knowledge'}
                              {category.id === 'building' && 'Creating, developing, or improving something'}
                              {category.id === 'connecting' && 'Building relationships or networking'}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !actionText.trim() || !selectedCategory}
                className="w-full"
              >
                {loading ? 'Logging Action...' : 'Log Action'}
              </Button>

            </form>
          </Card>

          {/* Today's Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Today's Actions
            </h2>
            <div className="text-center py-8 text-gray-500">
              <PlusCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No actions logged today.</p>
              <p className="text-sm">Your first action will appear here.</p>
            </div>
          </Card>

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}