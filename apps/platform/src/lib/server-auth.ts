import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './supabase';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthValidationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Create a Supabase client for server-side use
 */
async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore - called from server component
          }
        },
      },
    }
  );
}

/**
 * Server-side authentication validation utility
 * Validates user authentication and returns user data if valid
 */
export async function validateServerAuth(): Promise<AuthValidationResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Auth validation error:', error);
      return { success: false, error: 'Authentication failed' };
    }

    if (!session?.user) {
      return { success: false, error: 'No authenticated user' };
    }

    return {
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.role
      }
    };
  } catch (error) {
    console.error('Server auth validation error:', error);
    return { success: false, error: 'Authentication system error' };
  }
}

/**
 * API Route authentication middleware
 * Validates authentication for API routes and returns user data
 */
export async function validateApiAuth(request: NextRequest): Promise<AuthValidationResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('API auth validation error:', error);
      return { success: false, error: 'Authentication failed' };
    }

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    return {
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.role
      }
    };
  } catch (error) {
    console.error('API auth validation error:', error);
    return { success: false, error: 'Authentication system error' };
  }
}

/**
 * Validate user permissions for specific resources
 */
export async function validateUserPermissions(
  userId: string,
  resourceOwnerId: string,
  requiredRole?: string
): Promise<{ success: boolean; error?: string }> {
  // User can access their own resources
  if (userId === resourceOwnerId) {
    return { success: true };
  }

  // If a specific role is required, validate it
  if (requiredRole) {
    const authResult = await validateServerAuth();
    if (!authResult.success || authResult.user?.role !== requiredRole) {
      return { success: false, error: 'Insufficient permissions' };
    }
  }

  return { success: false, error: 'Access denied' };
}

/**
 * Input validation utility for API endpoints
 */
export function validateApiInput(
  data: any,
  requiredFields: string[]
): { success: boolean; error?: string; sanitizedData?: any } {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid request data' };
  }

  const sanitizedData = { ...data };

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in sanitizedData) || sanitizedData[field] === null || sanitizedData[field] === undefined) {
      return { success: false, error: `Missing required field: ${field}` };
    }
  }

  // Basic sanitization - remove any fields starting with underscore (potential internal fields)
  Object.keys(sanitizedData).forEach(key => {
    if (key.startsWith('_')) {
      delete sanitizedData[key];
    }
  });

  return { success: true, sanitizedData };
}

/**
 * Email validation utility
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * UUID validation utility
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Rate limiting validation (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { success: boolean; error?: string } {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (userRequests.count >= maxRequests) {
    return { success: false, error: 'Rate limit exceeded' };
  }

  userRequests.count++;
  return { success: true };
}