import { supabase } from './supabase'

export interface UserTier {
  tier: 'lite' | 'growth' | 'partner'
  status: 'active' | 'cancelled' | 'suspended'
}

export async function getUserTier(userId: string): Promise<UserTier | null> {
  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select('tier, status')
      .eq('id', userId)
      .single()

    if (error || !client) {
      return null
    }

    return {
      tier: client.tier as 'lite' | 'growth' | 'partner',
      status: client.status as 'active' | 'cancelled' | 'suspended'
    }
  } catch {
    // Error fetching user tier - return null to deny access
    return null
  }
}

export function hasAccess(userTier: string, requiredTier: string): boolean {
  const tierHierarchy = {
    'lite': 1,
    'growth': 2, 
    'partner': 3
  }

  const userLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0
  const requiredLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 999

  return userLevel >= requiredLevel
}

export interface RouteGuardResult {
  hasAccess: boolean
  redirectTo?: string
  message?: string
}

export function checkRouteAccess(
  currentPath: string, 
  userTier: UserTier | null
): RouteGuardResult {
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/pricing', '/contact', '/about', '/case-studies']
  if (publicRoutes.includes(currentPath)) {
    return { hasAccess: true }
  }

  // Routes that require authentication but no specific tier
  const authRoutes = ['/dashboard']
  if (authRoutes.includes(currentPath)) {
    if (!userTier) {
      return { 
        hasAccess: false, 
        redirectTo: '/pricing',
        message: 'Please subscribe to access the dashboard'
      }
    }
    
    if (userTier.status !== 'active') {
      return {
        hasAccess: false,
        redirectTo: '/pricing',
        message: 'Your subscription is not active. Please update your billing.'
      }
    }
    
    return { hasAccess: true }
  }

  // Tier-specific routes
  const tierRoutes = {
    '/dashboard/analytics': 'lite',
    '/dashboard/reports': 'growth',
    '/dashboard/brand-deals': 'partner',
    '/dashboard/revenue-share': 'partner'
  }

  const requiredTier = tierRoutes[currentPath as keyof typeof tierRoutes]
  
  if (requiredTier) {
    if (!userTier) {
      return {
        hasAccess: false,
        redirectTo: '/pricing',
        message: 'Please subscribe to access this feature'
      }
    }

    if (userTier.status !== 'active') {
      return {
        hasAccess: false,
        redirectTo: '/pricing', 
        message: 'Your subscription is not active'
      }
    }

    if (!hasAccess(userTier.tier, requiredTier)) {
      const tierNames = { lite: 'Lite', growth: 'Growth', partner: 'Partner' }
      return {
        hasAccess: false,
        message: `This feature requires ${tierNames[requiredTier as keyof typeof tierNames]} tier or higher. Upgrade your plan to access it.`
      }
    }

    return { hasAccess: true }
  }

  // Default: allow access
  return { hasAccess: true }
}