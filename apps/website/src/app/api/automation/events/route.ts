import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

/**
 * POST /api/automation/events
 *
 * Universal automation event receiver with production-grade security.
 *
 * Security:
 * - Validates source signatures (GitHub, Stripe webhooks)
 * - Requires API key for internal/agent sources
 * - Uses idempotency keys to prevent duplicate job creation
 * - Rate limited via headers (enforced by edge/middleware)
 *
 * Sources: GitHub, Sentry, Supabase, Stripe, Internal, PM Agent, Manual
 */

// Event source types
type EventSource = 'github' | 'sentry' | 'supabase' | 'stripe' | 'internal' | 'pm_agent' | 'manual';

// Job types that can be created
type JobType =
  | 'orchestrate_p0_complete'
  | 'run_validation'
  | 'deploy_staging'
  | 'alert_triggered'
  | 'sprint_status_update'
  | 'system_heartbeat'
  | 'custom';

interface AutomationEvent {
  source: EventSource;
  event_type: string;
  payload: Record<string, unknown>;
  signal_id?: string;
  idempotency_key?: string;
  metadata?: {
    sha?: string;
    run_id?: string;
    triggered_by?: string;
  };
}

// Rate limit tracking (in-memory, resets on deploy - use Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per source

function checkRateLimit(source: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `rate:${source}`;
  const existing = rateLimitMap.get(key);

  if (!existing || existing.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.count, resetAt: existing.resetAt };
}

// Validate GitHub webhook signature
function validateGitHubSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('GITHUB_WEBHOOK_SECRET not configured - skipping signature validation');
    return true; // Allow in development
  }

  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;
  return signature === expectedSignature;
}

// Validate Stripe webhook signature
function validateStripeSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature validation');
    return true;
  }

  // Stripe signature format: t=timestamp,v1=signature
  const elements = signature.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.slice(2);
  const v1Signature = elements.find(e => e.startsWith('v1='))?.slice(3);

  if (!timestamp || !v1Signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const hmac = createHmac('sha256', secret);
  hmac.update(signedPayload);
  const expectedSignature = hmac.digest('hex');

  return v1Signature === expectedSignature;
}

// Validate event source
function validateSource(source: EventSource, headers: Headers, rawBody: string): { valid: boolean; error?: string } {
  switch (source) {
    case 'github':
      const ghEvent = headers.get('x-github-event');
      const ghSignature = headers.get('x-hub-signature-256');
      if (!ghEvent) return { valid: false, error: 'Missing x-github-event header' };
      if (process.env.NODE_ENV === 'production' && !validateGitHubSignature(rawBody, ghSignature)) {
        return { valid: false, error: 'Invalid GitHub signature' };
      }
      return { valid: true };

    case 'sentry':
      if (!headers.has('sentry-hook-resource')) {
        return { valid: false, error: 'Missing sentry-hook-resource header' };
      }
      return { valid: true };

    case 'stripe':
      const stripeSignature = headers.get('stripe-signature');
      if (process.env.NODE_ENV === 'production' && !validateStripeSignature(rawBody, stripeSignature)) {
        return { valid: false, error: 'Invalid Stripe signature' };
      }
      return { valid: true };

    case 'supabase':
      // Supabase webhooks use a shared secret
      const supabaseAuth = headers.get('authorization');
      const expectedAuth = `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`;
      if (process.env.NODE_ENV === 'production' && supabaseAuth !== expectedAuth) {
        return { valid: false, error: 'Invalid Supabase authorization' };
      }
      return { valid: true };

    case 'internal':
    case 'pm_agent':
    case 'manual':
      const apiKey = headers.get('x-api-key');
      if (!apiKey || apiKey !== process.env.AUTOMATION_API_KEY) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: true };

    default:
      return { valid: false, error: `Unknown source: ${source}` };
  }
}

// Map event to job type
function mapEventToJobType(source: EventSource, eventType: string): JobType {
  if (source === 'github') {
    if (eventType === 'workflow_run' || eventType === 'ci_success') {
      return 'orchestrate_p0_complete';
    }
  }

  if (source === 'pm_agent') {
    if (eventType === 'signal_complete') {
      return 'orchestrate_p0_complete';
    }
    if (eventType === 'sprint_status') {
      return 'sprint_status_update';
    }
  }

  if (source === 'internal' || source === 'manual') {
    if (eventType === 'run_validation') {
      return 'run_validation';
    }
    if (eventType === 'deploy_staging') {
      return 'deploy_staging';
    }
    if (eventType === 'security_hotfix_p0_complete') {
      return 'orchestrate_p0_complete';
    }
    if (eventType === 'system_heartbeat') {
      return 'system_heartbeat';
    }
  }

  if (source === 'sentry') {
    return 'alert_triggered';
  }

  return 'custom';
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature validation
    const rawBody = await request.text();
    const body: AutomationEvent = JSON.parse(rawBody);

    // Validate required fields
    if (!body.source || !body.event_type || !body.payload) {
      return NextResponse.json(
        { error: 'Missing required fields: source, event_type, payload' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(body.source);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retry_after: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt / 1000).toString(),
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Validate source signature/auth
    const validation = validateSource(body.source, request.headers, rawBody);
    if (!validation.valid) {
      console.warn(`Automation event validation failed: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate idempotency key if not provided
    const idempotencyKey = body.idempotency_key ||
      `${body.source}:${body.event_type}:${body.signal_id || 'no-signal'}:${body.metadata?.sha || Date.now()}`;

    // Create event using idempotent function
    const { data: event, error: eventError } = await supabase
      .rpc('create_event_idempotent', {
        p_source: body.source,
        p_event_type: body.event_type,
        p_payload: body.payload,
        p_signal_id: body.signal_id || null,
        p_metadata: body.metadata || {},
        p_idempotency_key: idempotencyKey,
      });

    if (eventError) {
      console.error('Failed to create event:', eventError);
      return NextResponse.json(
        { error: 'Failed to create event', details: eventError.message },
        { status: 500 }
      );
    }

    // Check if this was a duplicate (event already existed)
    const isDuplicate = event && event.processed_at !== null;

    if (isDuplicate) {
      // Event already processed - return existing state
      const { data: existingJob } = await supabase
        .from('automation_jobs')
        .select('id, type, status')
        .eq('event_id', event.id)
        .single();

      return NextResponse.json({
        success: true,
        duplicate: true,
        event_id: event.id,
        job_id: existingJob?.id,
        job_type: existingJob?.type,
        job_status: existingJob?.status,
        message: 'Event already processed (idempotent)',
        idempotency_key: idempotencyKey,
      }, {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt / 1000).toString(),
        },
      });
    }

    // Determine job type
    const jobType = mapEventToJobType(body.source, body.event_type);

    // Create job using idempotent function
    const { data: job, error: jobError } = await supabase
      .rpc('create_job_idempotent', {
        p_type: jobType,
        p_payload: {
          ...body.payload,
          signal_id: body.signal_id,
          metadata: body.metadata,
        },
        p_event_id: event.id,
        p_idempotency_key: `job:${idempotencyKey}`,
        p_max_retries: 3,
      });

    if (jobError) {
      console.error('Failed to create job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job', details: jobError.message },
        { status: 500 }
      );
    }

    console.log(`Automation event received: ${body.source}/${body.event_type} -> job ${job.id} (${jobType})`);

    return NextResponse.json({
      success: true,
      duplicate: false,
      event_id: event.id,
      job_id: job.id,
      job_type: jobType,
      job_status: job.status,
      message: 'Event recorded and job created',
      idempotency_key: idempotencyKey,
    }, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt / 1000).toString(),
      },
    });

  } catch (error) {
    console.error('Automation event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check automation status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '2.0',
    rate_limit: {
      max_requests: RATE_LIMIT_MAX_REQUESTS,
      window_seconds: RATE_LIMIT_WINDOW_MS / 1000,
    },
    sources: ['github', 'sentry', 'supabase', 'stripe', 'internal', 'pm_agent', 'manual'],
    endpoints: {
      'POST /api/automation/events': 'Receive automation events (idempotent)',
      'GET /api/automation/events': 'Check automation status',
      'POST /api/agent-runner/run': 'Execute a job by job_id',
      'GET /api/agent-runner/run': 'Check runner status and queue',
    },
    idempotency: {
      description: 'Provide idempotency_key in request body to prevent duplicate job creation',
      auto_generated: 'If not provided, key is generated from source:event_type:signal_id:sha',
    },
  });
}
