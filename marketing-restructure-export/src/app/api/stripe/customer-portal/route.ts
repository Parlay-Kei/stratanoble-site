import { NextRequest, NextResponse } from 'next/server';
import { getStripe, hasStripeConfig } from '@/lib/stripe-conditional';
import { assertUserWithTier, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';
import { logger } from '@/lib/logger';
import { Database } from '@/types/database';

type Client = Database['public']['Tables']['clients']['Row'];

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!hasStripeConfig()) {
      return NextResponse.json(
        { error: 'Customer portal is currently unavailable' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Customer portal is currently unavailable' },
        { status: 503 }
      );
    }

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
      const userClient = await db.getClientByStripeCustomerId(customerId) as Client | null;
      
      if (!userClient || userClient.id !== user.id) {
        return NextResponse.json(
          { error: 'Access denied to this customer account' },
          { status: 403 }
        );
      }
    } catch (dbError) {
      logger.error('Database error verifying customer ownership', dbError instanceof Error ? dbError : new Error(String(dbError)));
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
    
    logger.error('Customer portal session creation error', new Error(errorMessage));
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
