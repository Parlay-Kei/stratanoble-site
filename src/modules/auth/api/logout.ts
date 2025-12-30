// Auth Module API Layer - Logout Endpoint
// HTTP controller for authentication logout
// Framework-agnostic (uses standard Web API)

// Cookie name for auth session indicator - must match login route
const AUTH_COOKIE_NAME = 'auth-session';

// Generate request ID for observability
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    console.log(JSON.stringify({
      level: 30,
      time: Date.now(),
      requestId,
      msg: 'Logout request started',
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      service: 'strata-noble-platform',
      env: process.env.NODE_ENV || 'development'
    }));

    // Build cookie with proper security flags based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieValue = `${AUTH_COOKIE_NAME}=; HttpOnly;${isProduction ? ' Secure;' : ''} SameSite=Lax; Path=/; Max-Age=0`;

    const response = new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'Set-Cookie': cookieValue
      }
    });

    console.log(JSON.stringify({
      level: 30,
      time: Date.now(),
      requestId,
      duration: Date.now() - startTime,
      msg: 'Logout successful',
      service: 'strata-noble-platform',
      env: process.env.NODE_ENV || 'development'
    }));

    return response;

  } catch (error) {
    console.error(JSON.stringify({
      level: 50,
      time: Date.now(),
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
      msg: 'Logout error',
      service: 'strata-noble-platform',
      env: process.env.NODE_ENV || 'development'
    }));

    return new Response(JSON.stringify({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Logout failed' },
      requestId
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId
      }
    });
  }
}
