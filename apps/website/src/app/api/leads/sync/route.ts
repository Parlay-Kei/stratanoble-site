import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mailchimpService } from '@/lib/mailchimp';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const leadSyncSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.enum(['contact_form', 'discovery_form', 'payment', 'newsletter']),
  serviceType: z.string().optional(),
  tier: z.string().optional(),
  amount: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify this is an internal request or has proper authentication
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INTERNAL_API_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = leadSyncSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, source, serviceType, tier, amount } = validation.data;

    let success = false;

    // Route to appropriate Mailchimp sequence based on source
    switch (source) {
      case 'contact_form':
        success = await mailchimpService.triggerWelcomeSequence(
          email, 
          firstName || '', 
          'contact_form'
        );
        break;

      case 'discovery_form':
        success = await mailchimpService.triggerDiscoverySequence(
          email,
          firstName || '',
          serviceType || 'general'
        );
        break;

      case 'payment':
        if (tier && amount) {
          success = await mailchimpService.triggerPaymentSuccessSequence(
            email,
            firstName || '',
            tier,
            amount
          );
        } else {
          success = await mailchimpService.addToAudience(
            email,
            firstName,
            lastName,
            ['customer', 'payment-success']
          );
        }
        break;

      case 'newsletter':
        success = await mailchimpService.addToAudience(
          email,
          firstName,
          lastName,
          ['newsletter-signup']
        );
        break;

      default:
        success = await mailchimpService.addToAudience(
          email,
          firstName,
          lastName,
          [`source-${source}`]
        );
    }

    // Log the lead sync attempt
    try {
      await prisma.leadSync.create({
        data: {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          source,
          serviceType: serviceType || null,
          tier: tier || null,
          amount: amount || null,
          success,
          syncedAt: new Date(),
        }
      });
    } catch (dbError) {
      // Don't fail the request if logging fails
      logger.error('Failed to log lead sync', dbError instanceof Error ? dbError : new Error(String(dbError)), { 
        email 
      });
    }

    if (success) {
      logger.info('Lead sync successful', { email, source });
      return NextResponse.json({ success: true, message: 'Lead synced to Mailchimp' });
    } else {
      logger.warn('Lead sync failed', { email, source });
      return NextResponse.json({ success: false, message: 'Failed to sync to Mailchimp' });
    }

  } catch (error) {
    logger.error('Lead sync error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Get recent sync attempts for this email
    const recentSyncs = await prisma.leadSync.findMany({
      where: { email },
      orderBy: { syncedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      email,
      syncHistory: recentSyncs,
      totalSyncs: recentSyncs.length,
      lastSuccessfulSync: recentSyncs.find(sync => sync.success)?.syncedAt || null,
    });

  } catch (error) {
    logger.error('Lead sync status error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}