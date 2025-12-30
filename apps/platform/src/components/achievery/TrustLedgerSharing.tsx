'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, Button, Input } from '@strata-noble/ui'
import { supabase } from '../../lib/supabase'
import {
  Shield,
  Share2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Clock,
  Settings,
  Copy,
  ExternalLink,
  Download,
  Bell,
  Calendar
} from 'lucide-react'
import type { TrustLedgerShare } from '../../types/platform'

interface TrustLedgerSharingProps {
  user: User
  shares: TrustLedgerShare[]
  onSharesUpdate: (shares: TrustLedgerShare[]) => void
}

const accessLevels = [
  {
    id: 'summary',
    label: 'Summary Only',
    description: 'Weekly narratives and progress overview',
    features: ['Weekly narratives', 'Progress statistics', 'Goal tracking'],
    icon: Eye
  },
  {
    id: 'detailed',
    label: 'Detailed View',
    description: 'Actions and reframes, but not raw entries',
    features: ['All summary features', 'Action categories', 'Phase progression', 'Reframed insights'],
    icon: Settings
  },
  {
    id: 'full',
    label: 'Full Access',
    description: 'Complete access to all activities and insights',
    features: ['All detailed features', 'Raw action entries', 'Personal reflections', 'Complete history'],
    icon: ExternalLink
  },
]

const quickTimeframes = [
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
]

export function TrustLedgerSharing({ user, shares, onSharesUpdate }: TrustLedgerSharingProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newShareEmail, setNewShareEmail] = useState('')
  const [newShareLevel, setNewShareLevel] = useState<'summary' | 'detailed' | 'full'>('summary')
  const [newShareExpiry, setNewShareExpiry] = useState('')
  const [newShareNotifications, setNewShareNotifications] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedShare, setSelectedShare] = useState<string | null>(null)

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
        // notifications_enabled: newShareNotifications, // TODO: Add to database schema
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

      const updatedShares = [data, ...shares]
      onSharesUpdate(updatedShares)

      // Reset form
      setNewShareEmail('')
      setNewShareLevel('summary')
      setNewShareExpiry('')
      setNewShareNotifications(true)
      setShowAddForm(false)

      // Send notification email (would be handled by a backend function)
      await sendShareNotification(data)

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

      const updatedShares = shares.map(share =>
        share.id === shareId
          ? { ...share, is_active: !currentStatus }
          : share
      )
      onSharesUpdate(updatedShares)
    } catch (error) {
      console.error('Error toggling share:', error)
      alert('Failed to update share status.')
    }
  }

  const handleDeleteShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to permanently delete this share? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('trust_ledger_shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error

      const updatedShares = shares.filter(share => share.id !== shareId)
      onSharesUpdate(updatedShares)
    } catch (error) {
      console.error('Error deleting share:', error)
      alert('Failed to delete share.')
    }
  }

  const handleExtendShare = async (shareId: string, days: number) => {
    try {
      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + days)

      const { error } = await supabase
        .from('trust_ledger_shares')
        .update({ expires_at: newExpiry.toISOString() })
        .eq('id', shareId)

      if (error) throw error

      const updatedShares = shares.map(share =>
        share.id === shareId
          ? { ...share, expires_at: newExpiry.toISOString() }
          : share
      )
      onSharesUpdate(updatedShares)
    } catch (error) {
      console.error('Error extending share:', error)
      alert('Failed to extend share.')
    }
  }

  const handleCopyShareLink = async (shareId: string) => {
    const shareUrl = `${window.location.origin}/achievery/trust-ledger/view/${shareId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
      alert('Failed to copy link.')
    }
  }

  const handleExportData = async (shareId: string) => {
    try {
      // This would call a backend function to generate export
      const response = await fetch(`/api/trust-ledger/export/${shareId}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trust-ledger-export-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Export feature coming soon!')
    }
  }

  const sendShareNotification = async (share: TrustLedgerShare) => {
    try {
      // This would be handled by a backend function/webhook
      await fetch('/api/trust-ledger/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId: share.id,
          recipientEmail: share.shared_with_email,
          senderName: user.user_metadata?.name || user.email,
          accessLevel: share.access_level
        })
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      // Don't block the share creation for notification failures
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div className="space-y-6">

      {/* Add New Share */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Manage Shares</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Share</span>
          </Button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddShare} className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg space-y-6 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newShareEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShareEmail(e.target.value)}
                  placeholder="coach@example.com"
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  They'll receive an email invitation to view your progress
                </p>
              </div>

              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <Input
                  id="expiry"
                  type="date"
                  value={newShareExpiry}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShareExpiry(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickTimeframes.map((timeframe) => (
                    <button
                      key={timeframe.label}
                      type="button"
                      onClick={() => {
                        const date = new Date()
                        date.setDate(date.getDate() + timeframe.days)
                        setNewShareExpiry(date.toISOString().split('T')[0])
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Access Level <span className="text-red-500">*</span>
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {accessLevels.map((level) => {
                  const IconComponent = level.icon
                  return (
                    <label
                      key={level.id}
                      className={`relative cursor-pointer border rounded-lg p-4 transition-all ${
                        newShareLevel === level.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accessLevel"
                        value={level.id}
                        checked={newShareLevel === level.id}
                        onChange={(e) => setNewShareLevel(e.target.value as any)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3 mb-3">
                        <IconComponent className={`w-5 h-5 ${
                          newShareLevel === level.id ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <div className="font-medium text-gray-900">{level.label}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{level.description}</div>
                      <ul className="space-y-1">
                        {level.features.map((feature, index) => (
                          <li key={index} className="text-xs text-gray-500 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notifications"
                checked={newShareNotifications}
                onChange={(e) => setNewShareNotifications(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="notifications" className="text-sm text-gray-700">
                Send email notifications for new progress updates
              </label>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <Button type="submit" disabled={submitting} size="sm">
                {submitting ? 'Creating Share...' : 'Create Share'}
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
        {shares.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No shares created yet</p>
            <p className="text-sm">Create your first share to start collaborating with coaches or mentors.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => {
              const expired = isExpired(share.expires_at)
              const daysUntilExpiry = getDaysUntilExpiry(share.expires_at)
              const accessLevel = accessLevels.find(l => l.id === share.access_level)
              const IconComponent = accessLevel?.icon || Eye

              return (
                <div key={share.id} className={`border rounded-lg p-6 transition-all ${
                  share.is_active && !expired ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900 text-lg">
                          {share.shared_with_email}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          share.is_active && !expired
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : expired
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {expired ? 'Expired' : share.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span><span className="font-medium">{accessLevel?.label}</span></span>
                        </div>
                        {share.expires_at && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {expired ? 'Expired' : `${daysUntilExpiry} days left`}
                              {' '}({new Date(share.expires_at).toLocaleDateString()})
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        Created {new Date(share.created_at).toLocaleDateString()} •
                        Last updated {new Date(share.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
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
                      onClick={() => handleCopyShareLink(share.id)}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportData(share.id)}
                      className="flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </Button>

                    {share.expires_at && !expired && (
                      <div className="flex space-x-1">
                        {quickTimeframes.slice(0, 3).map((timeframe) => (
                          <Button
                            key={timeframe.label}
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtendShare(share.id, timeframe.days)}
                            className="text-xs"
                          >
                            +{timeframe.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteShare(share.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

    </div>
  )
}