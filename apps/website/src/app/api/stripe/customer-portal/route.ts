import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { assertUserWithTier, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';
import pino from 'pino';

const logger = pino();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user first
    const user = await assertUserWithTier(request, 'any');
    
    const body = await request.json();
    const { customerId, returnUrl } = body;

    // Validate required fields
    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required field: customerId' },
        { status: 400 }
      );
    }

    // Verify customer belongs to authenticated user
    const { db } = await import('@/lib/supabase');
    try {
      const userClient = await db.getClientByStripeCustomerId(customerId);
      
      if (!userClient || userClient.id !== user.id) {
        return NextResponse.json(
          { error: 'Access denied to this customer account' },
          { status: 403 }
        );
      }
    } catch (dbError) {
      logger.error({ error: dbError }, 'Database error verifying customer ownership');
      return NextResponse.json(
        { error: 'Unable to verify customer access' },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';
    const defaultReturnUrl = `${origin}/dashboard`;

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || defaultReturnUrl,
    });

    return NextResponse.json({ 
      url: portalSession.url 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle authentication and authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    logger.error({ error: errorMessage }, 'Customer portal session creation error');
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
