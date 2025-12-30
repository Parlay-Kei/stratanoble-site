'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../providers'
import { Container, Card, Button, Input } from '@strata-noble/ui'
import { MobileNavigation } from '../../../src/components/layout/MobileNavigation'
import { supabase } from '../../lib/supabase'
import { Shield, Share2, Eye, EyeOff, Plus, Trash2, Clock } from 'lucide-react'
import type { TrustLedgerShare } from '../../types/platform'

const accessLevels = [
  { id: 'summary', label: 'Summary Only', description: 'Weekly narratives and progress overview' },
  { id: 'detailed', label: 'Detailed View', description: 'Actions and reframes, but not raw entries' },
  { id: 'full', label: 'Full Access', description: 'Complete access to all activities and insights' },
]

export default function TrustLedgerPage() {
  const { user } = useAuth()
  const [shares, setShares] = useState<TrustLedgerShare[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newShareEmail, setNewShareEmail] = useState('')
  const [newShareLevel, setNewShareLevel] = useState<'summary' | 'detailed' | 'full'>('summary')
  const [newShareExpiry, setNewShareExpiry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      loadShares()
    }
  }, [user])

  const loadShares = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('trust_ledger_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setShares(data || [])
    } catch (error) {
      console.error('Error loading shares:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newShareEmail.trim()) return

    setSubmitting(true)
    try {
      const shareData: any = {
        user_id: user.id,
        shared_with_email: newShareEmail.trim().toLowerCase(),
        access_level: newShareLevel,
        is_active: true,
      }

      if (newShareExpiry) {
        shareData.expires_at = new Date(newShareExpiry).toISOString()
      }

      const { data, error } = await supabase
        .from('trust_ledger_shares')
        .insert(shareData)
        .select()
        .single()

      if (error) throw error

      setShares(prev => [data, ...prev])
      setNewShareEmail('')
      setNewShareLevel('summary')
      setNewShareExpiry('')
      setShowAddForm(false)
    } catch (error: any) {
      console.error('Error adding share:', error)
      if (error.code === '23505') {
        alert('You have already shared with this email address.')
      } else {
        alert('Failed to add share. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleShare = async (shareId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('trust_ledger_shares')
        .update({ is_active: !currentStatus })
        .eq('id', shareId)

      if (error) throw error

      setShares(prev => 
        prev.map(share => 
          share.id === shareId 
            ? { ...share, is_active: !currentStatus }
            : share
        )
      )
    } catch (error) {
      console.error('Error toggling share:', error)
      alert('Failed to update share status.')
    }
  }

  const handleDeleteShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to permanently delete this share?')) return

    try {
      const { error } = await supabase
        .from('trust_ledger_shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error

      setShares(prev => prev.filter(share => share.id !== shareId))
    } catch (error) {
      console.error('Error deleting share:', error)
      alert('Failed to delete share.')
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
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
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Trust Ledger</h1>
            </div>
            <p className="text-gray-600">
              Privately share your progress with coaches, mentors, or accountability partners
            </p>
          </div>

          {/* Privacy Notice */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Your Privacy is Protected</h3>
                <p className="text-sm text-blue-800">
                  You control exactly what gets shared and with whom. Shares can be paused, 
                  modified, or revoked at any time. Recipients only see what you explicitly allow.
                </p>
              </div>
            </div>
          </Card>

          {/* Add New Share */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Active Shares</h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Share</span>
              </Button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddShare} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={newShareEmail}
                    onChange={(e) => setNewShareEmail(e.target.value)}
                    placeholder="coach@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <div className="space-y-2">
                    {accessLevels.map((level) => (
                      <label key={level.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="accessLevel"
                          value={level.id}
                          checked={newShareLevel === level.id}
                          onChange={(e) => setNewShareLevel(e.target.value as any)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{level.label}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <Input
                    id="expiry"
                    type="date"
                    value={newShareExpiry}
                    onChange={(e) => setNewShareExpiry(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank for permanent access (can be revoked anytime)
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" disabled={submitting} size="sm">
                    {submitting ? 'Adding...' : 'Add Share'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Shares List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading shares...</p>
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No shares created yet.</p>
                <p className="text-sm">Add your first share to start collaborating.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shares.map((share) => {
                  const expired = isExpired(share.expires_at)
                  const accessLevel = accessLevels.find(l => l.id === share.access_level)
                  
                  return (
                    <div key={share.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {share.shared_with_email}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              share.is_active && !expired
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {expired ? 'Expired' : share.is_active ? 'Active' : 'Paused'}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">{accessLevel?.label}</span>
                            {share.expires_at && (
                              <span className="ml-2 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Expires {new Date(share.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-500">
                            Created {new Date(share.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleShare(share.id, share.is_active)}
                            disabled={expired}
                            className="flex items-center space-x-1"
                          >
                            {share.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{share.is_active ? 'Pause' : 'Resume'}</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteShare(share.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

        </div>
      </Container>

      <MobileNavigation />
    </>
  )
}


