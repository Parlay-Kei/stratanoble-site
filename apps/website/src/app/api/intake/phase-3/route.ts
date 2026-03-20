import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { rateLimit, createRateLimitHeaders } from '@/lib/rate-limit-buckets';
import { notifyNewIntake } from '@/lib/ses-notify';
import { sanitizeText, sanitizeEmail, sanitizeName } from '@/lib/sanitize';

// Validation schema for Phase 3 intake
const phase3Schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  businessName: z.string().min(1).max(200),
  monthlyLeadsEstimate: z.enum(['0-10', '10-50', '50-100', '100-500', '500+']),
  offerType: z.string().min(1).max(500),
  currentCloseProcess: z.string().max(2000),
  toolStack: z.array(z.string()),
  decisionTimeline: z.enum(['ready-now', '1-2-weeks', '1-month', 'exploring']),
  whatSuccessLooksLike: z.string().max(2000),
});

/**
 * Generate idempotency key based on email, source, and time bucket
 * Uses 10-minute buckets to prevent duplicate submissions
 */
function generateIdempotencyKey(email: string, source: string): string {
  const dateBucket = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  return crypto
    .createHash('sha256')
    .update(`${email}:${source}:${dateBucket}`)
    .digest('hex');
}

/**
 * Hash IP address for privacy-preserving storage
 */
function hashIP(request: NextRequest): string | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;

  if (!ip) return null;

  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP using intake bucket (fail-open: if rate limiting fails, allow request through)
    const rateLimitResult = await rateLimit('intake', request);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Try again in a minute.' },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();

    // Validate input
    const validated = phase3Schema.parse(body);

    // Sanitize text fields
    const sanitized = {
      name: sanitizeName(validated.name),
      email: sanitizeEmail(validated.email),
      businessName: sanitizeText(validated.businessName, 200),
      monthlyLeadsEstimate: validated.monthlyLeadsEstimate,
      offerType: sanitizeText(validated.offerType, 500),
      currentCloseProcess: sanitizeText(validated.currentCloseProcess, 2000),
      toolStack: validated.toolStack.map((tool) => sanitizeText(tool, 100)),
      decisionTimeline: validated.decisionTimeline,
      whatSuccessLooksLike: sanitizeText(validated.whatSuccessLooksLike, 2000),
    };

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(sanitized.email, 'PHASE_3');

    // Transaction to check idempotency and create intake
    const result = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      // Check for existing submission
      const existing = await tx.leadIntake.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        return { duplicate: true, id: existing.id };
      }

      // Create new intake
      const intake = await tx.leadIntake.create({
        data: {
          source: 'PHASE_3',
          name: sanitized.name,
          email: sanitized.email,
          businessName: sanitized.businessName,
          payload: sanitized,
          status: 'NEW',
          ipHash: hashIP(request),
          userAgent: request.headers.get('user-agent')?.slice(0, 500) || null,
          idempotencyKey,
        },
      });

      return { duplicate: false, id: intake.id };
    });

    // Send SES notification (don't block on failure)
    if (!result.duplicate) {
      try {
        await notifyNewIntake({
          source: 'PHASE_3',
          name: sanitized.name,
          email: sanitized.email,
          businessName: sanitized.businessName,
          payload: sanitized,
        });
      } catch (error) {
        console.error('[Phase 3] SES notification failed:', error);
        // Continue - notification failure shouldn't block the request
      }
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      duplicate: result.duplicate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('[Phase 3] Intake error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

