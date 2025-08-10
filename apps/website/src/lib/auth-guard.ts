import { supabase } from './supabase'

export interface UserTier {
  tier: 'lite' | 'growth' | 'partner'
  status: 'active' | 'cancelled' | 'suspended'
  role?: 'user' | 'admin' | 'superuser'
}

export interface UserProfile {
  id: string
  email: string
  tier: 'lite' | 'growth' | 'partner'
  status: 'active' | 'cancelled' | 'suspended'
  role: 'user' | 'admin' | 'superuser'
  stripeCustomerId?: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Try to get from users table first (new schema)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, tier, status, role, stripe_customer_id')
      .eq('id', userId)
      .single()

    if (user) {
      return {
        id: user.id,
        email: user.email,
        tier: user.tier as 'lite' | 'growth' | 'partner',
        status: user.status as 'active' | 'cancelled' | 'suspended',
        role: user.role as 'user' | 'admin' | 'superuser',
        stripeCustomerId: user.stripe_customer_id
      }
    }

    // Fallback to clients table (backwards compatibility)
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, email, tier, status')
      .eq('id', userId)
      .single()

    if (error || !client) {
      return null
    }

    return {
      id: client.id,
      email: client.email,
      tier: client.tier as 'lite' | 'growth' | 'partner',
      status: client.status as 'active' | 'cancelled' | 'suspended',
      role: 'user' // Default role for legacy clients
    }
  } catch {
    return null
  }
}

export async function getUserTier(userId: string): Promise<UserTier | null> {
  const profile = await getUserProfile(userId)
  if (!profile) return null

  return {
    tier: profile.tier,
    status: profile.status,
    role: profile.role
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

export function hasRoleAccess(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'user': 1,
    'admin': 2,
    'superuser': 3
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 999

  return userLevel >= requiredLevel
}

export function isAdmin(profile: UserProfile): boolean {
  return profile.role === 'admin' || profile.role === 'superuser'
}

export function isSuperuser(profile: UserProfile): boolean {
  return profile.role === 'superuser'
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