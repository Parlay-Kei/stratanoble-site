import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Server-only Supabase admin client factory.
 * Uses service role key for privileged database operations.
 *
 * SECURITY REQUIREMENTS:
 * - Must only be used in server contexts (API routes, server actions, server components)
 * - Requires SUPABASE_SERVICE_ROLE_KEY in production
 * - Never expose this client to the client-side
 *
 * @throws {Error} If called from client-side
 * @throws {Error} If SUPABASE_SERVICE_ROLE_KEY is missing in production
 */
export function createAdminClient() {
  // Enforce server-only usage
  if (typeof window !== 'undefined') {
    throw new Error(
      'createAdminClient() is server-only. ' +
      'This client uses the service role key and must never be exposed to browsers.'
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate required environment variables
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  // Production requires service role key
  if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations in production. ' +
      'This prevents privilege escalation attacks. Configure the service role key immediately.'
    );
  }

  // Development warning for missing service role key
  if (!serviceRoleKey) {
    console.warn(
      '[SECURITY WARNING] SUPABASE_SERVICE_ROLE_KEY not set in development. ' +
      'Using anon key for admin operations. This is ONLY acceptable in local development. ' +
      'DO NOT deploy to production without a service role key.'
    );
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Validates that all required admin environment variables are configured.
 * Use this in startup scripts or health checks.
 *
 * @returns Validation result with errors (if any)
 */
export function validateAdminConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is REQUIRED in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Performs a health check on the admin client configuration and connection.
 * Use this in monitoring or startup validation.
 *
 * @returns Health check result with status and details
 */
export async function healthCheckAdmin(): Promise<{
  healthy: boolean;
  config: { valid: boolean; errors: string[] };
  connection?: { success: boolean; error?: string };
}> {
  const configResult = validateAdminConfig();

  // If config is invalid, don't attempt connection
  if (!configResult.valid) {
    return {
      healthy: false,
      config: configResult,
    };
  }

  // Test connection with a simple query
  try {
    const admin = createAdminClient();
    // Use a lightweight query to test connection
    const { error } = await admin.from('_supabase_migrations').select('version').limit(1);

    if (error) {
      return {
        healthy: false,
        config: configResult,
        connection: {
          success: false,
          error: error.message,
        },
      };
    }

    return {
      healthy: true,
      config: configResult,
      connection: {
        success: true,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      config: configResult,
      connection: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Server Actions and API Route Utilities
 */

/**
 * Wrapper for server actions that require admin client.
 * Automatically handles client-side protection and error handling.
 *
 * @example
 * export const myServerAction = withAdminClient(async (admin, params) => {
 *   const { data, error } = await admin.from('users').select('*');
 *   if (error) throw error;
 *   return data;
 * });
 */
export function withAdminClient<TParams extends any[], TResult>(
  handler: (admin: ReturnType<typeof createAdminClient>, ...params: TParams) => Promise<TResult>
) {
  return async (...params: TParams): Promise<TResult> => {
    const admin = createAdminClient();
    return handler(admin, ...params);
  };
}

