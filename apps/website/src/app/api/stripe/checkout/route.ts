import { NextRequest, NextResponse } from 'next/server';
import { getStripe, hasStripeConfig } from '@/lib/stripe-conditional';
import { CheckoutSessionSchema, validateRequest, createValidationErrorResponse, createSuccessResponse } from '@/lib/validators';
import { withEnhancedCSRFProtection } from '@/lib/csrf';
import { logger } from '@/lib/logger';

async function checkoutHandler(request: NextRequest, parsedBody?: any) {
  try {
    if (!hasStripeConfig()) {
      logger.warn('Stripe not configured - checkout unavailable');
      return NextResponse.json(
        { error: 'Payment processing is currently unavailable' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is currently unavailable' },
        { status: 503 }
      );
    }

    // Use pre-parsed body from CSRF middleware, or parse if not available
    const body = parsedBody || await request.json();

    const validation = validateRequest(CheckoutSessionSchema, body);
    if (!validation.success) {
      logger.warn('Checkout validation failed', { errors: validation.errorMap });
      return NextResponse.json(
        createValidationErrorResponse(validation.errorMap),
        { status: 422 }
      );
    }

    const { offeringId, packageType, customerEmail, customerName, promoCode, test, priceId } = validation.data as any;

    // Require priceId for platform tiers
    if (!priceId) {
      logger.warn('Missing priceId for checkout', { offeringId, packageType });
      return NextResponse.json(
        { error: 'Missing priceId for checkout. Please contact support.' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';

    logger.info('Creating Stripe checkout session', {
      offeringId: offeringId || packageType,
      priceId,
      customerEmail,
      origin
    });

    const sessionParams: any = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      metadata: {
        offering_id: offeringId || packageType,
        customer_name: customerName,
        test_mode: test ? 'true' : 'false',
      },
    };

    if (test && process.env.STRIPE_TEST_PROMOTION_CODE) {
      sessionParams.discounts = [{ promotion_code: process.env.STRIPE_TEST_PROMOTION_CODE }];
      logger.info('Test mode enabled - applying discount coupon');
    }

    if (promoCode && !test) {
      sessionParams.discounts = [{ promotion_code: promoCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logger.info('Stripe checkout session created', { sessionId: session.id });

    return NextResponse.json(
      createSuccessResponse({
        sessionId: session.id,
        url: session.url,
      }),
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Checkout session creation error', new Error(errorMessage));

    // Check for specific Stripe errors
    if (errorMessage.includes('No such price')) {
      return NextResponse.json(
        { error: 'Invalid price configuration. Please contact support.' },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: 'Failed to create checkout session', detail: errorMessage },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}

export const POST = withEnhancedCSRFProtection(checkoutHandler);
