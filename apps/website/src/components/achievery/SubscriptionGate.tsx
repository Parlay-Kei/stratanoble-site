'use client'

import React from 'react'
// Force recompilation after syntax fixes
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Crown, Zap, Sparkles, X } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionGateProps {
  children: React.ReactNode
  feature: 'actions_per_week' | 'advanced_analytics' | 'trust_ledger_shares' | 'export_data' | 'coach_integrations'
  fallback?: React.ReactNode
}

interface UserTier {
  tier: 'lite' | 'growth' | 'partner' | 'enterprise'
  weeklyActions?: number
  weeklyLimit?: number
}

const TIER_LIMITS = {
  lite: {
    actions_per_week: 5,
    advanced_analytics: false,
    trust_ledger_shares: 2,
    export_data: false,
    coach_integrations: 0,
  },
  growth: {
    actions_per_week: 25,
    advanced_analytics: true,
    trust_ledger_shares: 10,
    export_data: true,
    coach_integrations: 1,
  },
  partner: {
    actions_per_week: 100,
    advanced_analytics: true,
    trust_ledger_shares: Infinity,
    export_data: true,
    coach_integrations: 3,
  },
  enterprise: {
    actions_per_week: Infinity,
    advanced_analytics: true,
    trust_ledger_shares: Infinity,
    export_data: true,
    coach_integrations: Infinity,
  },
}

const PAYWALL_MESSAGES = {
  actions_per_week: {
    title: 'Weekly Action Limit Reached',
    message: 'You\'ve logged your maximum actions for this week. Upgrade to continue tracking your progress.',
    icon: Zap,
    color: 'emerald',
  },
  advanced_analytics: {
    title: 'Advanced Analytics Available',
    message: 'Unlock detailed progress patterns and insights with advanced analytics.',
    icon: Sparkles,
    color: 'blue',
  },
  trust_ledger_shares: {
    title: 'Trust Ledger Sharing Limit',
    message: 'Share your progress with more coaches and mentors.',
    icon: Crown,
    color: 'purple',
  },
  export_data: {
    title: 'Export Your Data',
    message: 'Download your progress data in CSV or PDF format.',
    icon: Zap,
    color: 'indigo',
  },
  coach_integrations: {
    title: 'Coach Integration',
    message: 'Connect with Strata Noble consultants and other coaches.',
    icon: Crown,
    color: 'amber',
  },
}

const TIERS = {
  growth: {
    name: 'ACHIEVERY Pro',
    price: '$9.99/month',
    description: 'Unlock unlimited tracking and advanced insights.',
    popular: true,
  },
  partner: {
    name: 'Coaching Add-on',
    price: '$149/session',
    description: 'Optional strategy support for guided execution.',
    popular: false,
  },
  enterprise: {
    name: 'Q SUITE Integration Pack',
    price: '$29.99 one-time',
    description: 'Connect ACHIEVERY workflows with Q SUITE modules.',
    popular: false,
  },
}

export function SubscriptionGate({ children, feature, fallback }: SubscriptionGateProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userTier, setUserTier] = useState<UserTier | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        setUser(user)

        // Get user tier from clients table
        const { data: client } = await supabase
          .from('clients')
          .select('tier')
          .eq('id', user.id)
          .single()

        const tier = (client as any)?.tier || 'lite'
        
        // For actions_per_week, we need to check current usage
        let weeklyActions = 0
        let weeklyLimit = 0
        if (feature === 'actions_per_week') {
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          
          const { data: actions } = await supabase
            .from('user_actions')
            .select('id')
            .eq('user_id', user.id)
            .gte('logged_date', weekStart.toISOString().split('T')[0])

          weeklyActions = actions?.length || 0
          weeklyLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS].actions_per_week as number
        }

        setUserTier({ tier: tier as any, weeklyActions, weeklyLimit })

        // Check if user has access to this feature
        const tierLimits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]
        const limit = tierLimits[feature]
        
        if (feature === 'actions_per_week') {
          // For actions_per_week, limit is always a number
          setHasAccess(weeklyActions < (limit as number))
        } else {
          // For other features, limit can be boolean or number
          if (typeof limit === 'boolean') {
            setHasAccess(limit)
          } else {
            setHasAccess((limit as number) > 0)
          }
        }

      } catch (error) {
        console.error('Error checking subscription access:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [feature])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forest-green"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const paywallConfig = PAYWALL_MESSAGES[feature]
  const Icon = paywallConfig.icon
  const nextTier = userTier?.tier === 'lite' ? 'growth' : userTier?.tier === 'growth' ? 'partner' : 'enterprise'
  const tierInfo = TIERS[nextTier as keyof typeof TIERS]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-grey/25 p-8 text-center">
      <div className="bg-field-sage/15 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-forest-green" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">{paywallConfig.title}</h3>
      <p className="text-gray-600 mb-6">{paywallConfig.message}</p>
      
      {feature === 'actions_per_week' && userTier && (
        <div className="bg-void/30 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-2">
            {userTier.weeklyActions}/{userTier.weeklyLimit} actions this week
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-forest-green rounded-full"
              style={{ width: `${Math.min(100, (userTier.weeklyActions! / userTier.weeklyLimit!) * 100)}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-field-sage/10 to-field-sage/15 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">{tierInfo.name}</h4>
            <p className="text-sm text-gray-600">{tierInfo.description}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{tierInfo.price}</div>
            {tierInfo.popular && (
              <span className="text-xs bg-field-sage/15 text-forest-green px-2 py-1 rounded-full">
                Popular
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/contact?utm_source=paywall&utm_medium=cta&utm_campaign=upgrade&feature=${feature}`}
          className="bg-forest-green hover:bg-forest-green text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Upgrade Now
        </Link>
        <button
          onClick={() => setShowUpgrade(true)}
          className="border border-slate-grey/30 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          View All Plans
        </button>
      </div>
      
      <p className="text-xs text-slate-grey mt-4">
        Part of the Strata Noble ecosystem
      </p>
    </div>
  )
}

// Higher-order component for easy wrapping
export function withSubscriptionGate<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  feature: SubscriptionGateProps['feature'],
  fallback?: React.ReactNode
) {
  return function GatedComponent(props: T) {
    return (
      <SubscriptionGate feature={feature} fallback={fallback}>
        <WrappedComponent {...props} />
      </SubscriptionGate>
    )
  }
}