import { NextRequest, NextResponse } from 'next/server';
import csrf from 'csrf';
import { cookies } from 'next/headers';

// Initialize CSRF tokens generator
const tokens = new csrf();

// CSRF configuration
const CSRF_COOKIE_NAME = '__csrf_secret';
const CSRF_HEADER_NAME = 'x-csrf-token';

export class CSRFError extends Error {
  constructor(message = 'Invalid CSRF token') {
    super(message);
    this.name = 'CSRFError';
  }
}

/**
 * Generate a CSRF secret and token pair
 */
export function generateCSRFToken(): { secret: string; token: string } {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  
  return { secret, token };
}

/**
 * Verify a CSRF token against a secret
 */
export function verifyCSRFToken(secret: string, token: string): boolean {
  return tokens.verify(secret, token);
}

/**
 * Get or create CSRF secret from cookies
 */
export async function getCSRFSecret(): Promise<{ secret: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existingSecret = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (existingSecret) {
    return { secret: existingSecret, isNew: false };
  }
  
  // Generate new secret
  const secret = tokens.secretSync();
  return { secret, isNew: true };
}

/**
 * Set CSRF secret cookie
 */
export function setCSRFCookie(response: NextResponse, secret: string): NextResponse {
  response.cookies.set(CSRF_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  
  return response;
}

/**
 * Extract CSRF token from request headers or body
 */
export function extractCSRFToken(request: NextRequest, body?: any): string | null {
  // Check header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;
  
  // Check body for form submissions
  if (body && typeof body === 'object') {
    return body._csrf || body.csrfToken || null;
  }
  
  return null;
}

/**
 * Validate CSRF token for a request
 */
export async function validateCSRFToken(request: NextRequest, body?: any): Promise<boolean> {
  try {
    const { secret } = await getCSRFSecret();
    const token = extractCSRFToken(request, body);
    
    if (!token) {
      return false;
    }
    
    return verifyCSRFToken(secret, token);
  } catch {
    return false;
  }
}

/**
 * CSRF protection middleware wrapper
 */
export function withCSRFProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip CSRF protection for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }
    
    // Skip CSRF protection in development if configured
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_CSRF_PROTECTION === 'true') {
      return handler(request);
    }
    
    // Skip for webhook endpoints (they have their own verification)
    if (request.nextUrl.pathname.includes('/webhook')) {
      return handler(request);
    }
    
    try {
      // Parse request body to extract CSRF token
      let body: any = null;
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        body = await request.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        body = Object.fromEntries(formData.entries());
      }
      
      // Validate CSRF token
      const isValid = await validateCSRFToken(request, body);
      
      if (!isValid) {
        return NextResponse.json(
          {
            error: 'CSRF token validation failed',
            message: 'Invalid or missing CSRF token',
            code: 'CSRF_ERROR',
          },
          { status: 403 }
        );
      }
      
      // Create new request with parsed body
      const newRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: body ? JSON.stringify(body) : null,
      });
      
      return handler(newRequest);
    } catch (error) {
      console.error('CSRF validation error:', error);
      return NextResponse.json(
        {
          error: 'CSRF validation failed',
          message: 'Unable to validate CSRF token',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * API endpoint to get CSRF token
 */
export async function getCSRFTokenEndpoint(): Promise<NextResponse> {
  try {
    const { secret, isNew } = await getCSRFSecret();
    const token = tokens.create(secret);
    
    const response = NextResponse.json({
      csrfToken: token,
    });
    
    // Set cookie if secret is new
    if (isNew) {
      setCSRFCookie(response, secret);
    }
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

/**
 * Check if origin is valid (additional CSRF protection)
 */
export function verifyOrigin(origin: string | null, allowedOrigins?: string[]): boolean {
  if (!origin) return false;
  
  const allowed = allowedOrigins || [
    process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://localhost:3000',
    'https://localhost:8080',
  ];
  
  return allowed.some(allowedOrigin => {
    // Remove trailing slash for comparison
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
    return normalizedOrigin === normalizedAllowed;
  });
}

/**
 * Enhanced CSRF protection that also checks origin
 */
export function withEnhancedCSRFProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip CSRF protection for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }
    
    // Verify origin first
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    if (!verifyOrigin(origin) && !verifyOrigin(referer)) {
      return NextResponse.json(
        {
          error: 'Invalid origin',
          message: 'Request origin not allowed',
        },
        { status: 403 }
      );
    }
    
    // Apply CSRF token validation
    return withCSRFProtection(handler)(request);
  };
}
