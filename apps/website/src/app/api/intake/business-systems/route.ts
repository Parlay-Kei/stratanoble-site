import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { rateLimit, createRateLimitHeaders } from '@/lib/rate-limit-buckets';
import { notifyNewIntake } from '@/lib/ses-notify';
import { sanitizeText, sanitizeEmail, sanitizeName } from '@/lib/sanitize';

const businessSystemsSchema = z.object({
  name: z.string().min(1).max(100),
  businessName: z.string().min(1).max(200),
  email: z.string().email(),
  phoneOrLinkedIn: z.string().max(300).optional(),
  whatYouSell: z.string().min(1).max(300),
  revenueRange: z
    .enum(['under-10k', '10k-40k', '40k-100k', '100k-plus', 'prefer-not', ''])
    .optional(),
  leadChannels: z
    .array(
      z.enum(['text', 'dm', 'email', 'phone', 'form', 'walk-in', 'referral', 'other'])
    )
    .min(1),
  currentTracker: z.enum(['none', 'notes', 'spreadsheet', 'crm', 'notion-airtable', 'mix']),
  loudestProblem: z.enum([
    'missed-follow-up',
    'no-tracker',
    'crm-mess',
    'unclear-workflow',
    'automation-fuzzy',
    'ops-dashboard',
    'not-sure',
  ]),
  firstResponseOwner: z.enum(['me-only', 'me-and-team', 'no-owner']),
  openLeadsAware: z.enum(['0-5', '6-20', '21-plus', 'unknown']),
  winIn30Days: z.string().min(1).max(1000),
  timeline: z.enum(['this-week', 'next-2-weeks', 'this-month', 'exploring']),
  budgetComfort: z.enum(['under-250', '250-1500', '1500-5000', 'not-sure', '']).optional(),
  notes: z.string().max(2000).optional(),
});

function generateIdempotencyKey(email: string, source: string): string {
  const dateBucket = new Date().toISOString().slice(0, 16);
  return crypto.createHash('sha256').update(`${email}:${source}:${dateBucket}`).digest('hex');
}

function hashIP(request: NextRequest): string | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function scoreFit(payload: z.infer<typeof businessSystemsSchema>): 'good_fit' | 'maybe' | 'not_a_fit' {
  const marketingOnly =
    payload.loudestProblem === 'not-sure' &&
    payload.timeline === 'exploring' &&
    !payload.whatYouSell.trim();

  if (marketingOnly || !payload.whatYouSell.trim()) {
    return 'not_a_fit';
  }

  const systemPain = [
    'missed-follow-up',
    'no-tracker',
    'crm-mess',
    'unclear-workflow',
    'automation-fuzzy',
    'ops-dashboard',
  ].includes(payload.loudestProblem);

  const activeTimeline = ['this-week', 'next-2-weeks', 'this-month'].includes(payload.timeline);

  if (systemPain && activeTimeline) return 'good_fit';
  if (systemPain || activeTimeline) return 'maybe';
  return 'maybe';
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit('intake', request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Try again in a minute.' },
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const validated = businessSystemsSchema.parse(body);

    const sanitized = {
      name: sanitizeName(validated.name),
      email: sanitizeEmail(validated.email),
      businessName: sanitizeText(validated.businessName, 200),
      phoneOrLinkedIn: sanitizeText(validated.phoneOrLinkedIn || '', 300),
      whatYouSell: sanitizeText(validated.whatYouSell, 300),
      revenueRange: validated.revenueRange || '',
      leadChannels: validated.leadChannels,
      currentTracker: validated.currentTracker,
      loudestProblem: validated.loudestProblem,
      firstResponseOwner: validated.firstResponseOwner,
      openLeadsAware: validated.openLeadsAware,
      winIn30Days: sanitizeText(validated.winIn30Days, 1000),
      timeline: validated.timeline,
      budgetComfort: validated.budgetComfort || '',
      notes: sanitizeText(validated.notes || '', 2000),
      fitScore: scoreFit(validated),
      form: 'business-systems-intake',
    };

    const idempotencyKey = generateIdempotencyKey(sanitized.email, 'BUSINESS_SYSTEMS');

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.leadIntake.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        return { duplicate: true, id: existing.id };
      }

      const intake = await tx.leadIntake.create({
        data: {
          source: 'BUSINESS_SYSTEMS',
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

    if (!result.duplicate) {
      try {
        await notifyNewIntake({
          source: 'BUSINESS_SYSTEMS',
          name: sanitized.name,
          email: sanitized.email,
          businessName: sanitized.businessName,
          payload: sanitized,
        });
      } catch (error) {
        console.error('[Business Systems Intake] SES notification failed:', error);
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
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Business Systems Intake] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
