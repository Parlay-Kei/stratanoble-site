import { NextRequest } from 'next/server';
import { supabase } from './supabase';

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function assertUser(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    return user;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Authentication failed');
  }
}

export async function assertUserWithTier(request: NextRequest, requiredTier?: string) {
  const user = await assertUser(request);
  
  if (requiredTier) {
    // Get user profile from database
    const { getUserProfile } = await import('./auth-guard');
    const userProfile = await getUserProfile(user.id);
    
    if (!userProfile || userProfile.status !== 'active') {
      throw new ForbiddenError('Active subscription required');
    }
    
    // Check tier hierarchy if specific tier required
    if (requiredTier !== 'any') {
      const { hasAccess } = await import('./auth-guard');
      
      if (!hasAccess(userProfile.tier, requiredTier)) {
        throw new ForbiddenError(`${requiredTier} tier or higher required`);
      }
    }
  }
  
  return user;
}

export async function assertUserWithRole(request: NextRequest, requiredRole: string) {
  const user = await assertUser(request);
  
  // Get user profile from database
  const { getUserProfile, hasRoleAccess } = await import('./auth-guard');
  const userProfile = await getUserProfile(user.id);
  
  if (!userProfile) {
    throw new ForbiddenError('User profile not found');
  }
  
  if (!hasRoleAccess(userProfile.role, requiredRole)) {
    throw new ForbiddenError(`${requiredRole} role required`);
  }
  
  return { user, profile: userProfile };
}

export async function assertAdmin(request: NextRequest) {
  return await assertUserWithRole(request, 'admin');
}