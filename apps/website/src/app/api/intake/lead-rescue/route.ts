import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { ipRateLimiter, emailRateLimiter } from '@/lib/rate-limit';
import { notifyNewIntake } from '@/lib/ses-notify';
import { sanitizeText, sanitizeEmail, sanitizeName } from '@/lib/sanitize';

// Validation schema for lead rescue intake
const leadRescueSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  businessName: z.string().min(1).max(200),
  websiteOrIG: z.string().optional(),
  currentLeadChannel: z.enum([
    'social',
    'referrals',
    'ads',
    'seo',
    'events',
    'cold-outreach',
    'other',
  ]),
  currentTools: z.array(
    z.enum(['notion', 'airtable', 'hubspot', 'squarespace', 'google-forms', 'other'])
  ),
  urgency: z.enum(['asap', 'this-week', 'this-month', 'exploring']),
  notes: z.string().max(2000).optional(),
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
    // Rate limit by IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipLimit = await ipRateLimiter.limit(ip);

    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Rate limit by email
    const emailLimit = await emailRateLimiter.limit(body.email || 'unknown');
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests from this email. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate input
    const validated = leadRescueSchema.parse(body);

    // Sanitize text fields
    const sanitized = {
      name: sanitizeName(validated.name),
      email: sanitizeEmail(validated.email),
      businessName: sanitizeText(validated.businessName, 200),
      websiteOrIG: sanitizeText(validated.websiteOrIG || '', 500),
      currentLeadChannel: validated.currentLeadChannel,
      currentTools: validated.currentTools,
      urgency: validated.urgency,
      notes: sanitizeText(validated.notes || '', 2000),
    };

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(
      sanitized.email,
      'LEAD_RESCUE'
    );

    // Transaction to check idempotency and create intake
    const result = await prisma.$transaction(async (tx) => {
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
          source: 'LEAD_RESCUE',
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
          source: 'LEAD_RESCUE',
          name: sanitized.name,
          email: sanitized.email,
          businessName: sanitized.businessName,
          payload: sanitized,
        });
      } catch (error) {
        console.error('[Lead Rescue] SES notification failed:', error);
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

    console.error('[Lead Rescue] Intake error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
