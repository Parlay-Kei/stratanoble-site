import { NextRequest, NextResponse } from 'next/server';
import { OFFERINGS } from '@/data/offerings';
import { getStripe, hasStripeConfig } from '@/lib/stripe-conditional';
import { CheckoutSessionSchema, validateRequest, createValidationErrorResponse, createSuccessResponse } from '@/lib/validators';
import { withEnhancedCSRFProtection } from '@/lib/csrf';
import { logger } from '@/lib/logger';

async function checkoutHandler(request: NextRequest) {
  try {
    // Check if Stripe is configured
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

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validation = validateRequest(CheckoutSessionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createValidationErrorResponse(validation.errorMap),
        { status: 422 }
      );
    }

    const { offeringId, customerEmail, customerName, promoCode, test } = validation.data;

    const offering = OFFERINGS[offeringId as keyof typeof OFFERINGS];
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';

    // Build line items based on offering type
    const line_items =
      offeringId === 'partner'
        ? [
            { price: (offering as typeof OFFERINGS.partner).priceIds.setup, quantity: 1 },
            { price: (offering as typeof OFFERINGS.partner).priceIds.recurring, quantity: 1 },
          ]
        : [{ price: (offering as typeof OFFERINGS.lite | typeof OFFERINGS.growth).priceId, quantity: 1 }];

    // Build checkout session parameters
    const sessionParams: any = {
      mode: 'subscription',
      line_items,
      customer_email: customerEmail,
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        offering_id: offeringId,
        customer_name: customerName,
        test_mode: test ? 'true' : 'false',
        ...offering.metadata,
      },
    };

    // Add test discount if in test mode
    if (test && process.env.STRIPE_TEST_PROMOTION_CODE) {
      sessionParams.discounts = [{ promotion_code: process.env.STRIPE_TEST_PROMOTION_CODE }];
      logger.info('Test mode enabled - applying discount coupon');
    }

    // Add promo code if provided
    if (promoCode && !test) {
      sessionParams.discounts = [{ promotion_code: promoCode }];
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json(
      createSuccessResponse({
        sessionId: session.id,
        url: session.url
      }),
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Checkout session creation error', new Error(errorMessage));
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Apply CSRF protection to the POST handler
export const POST = withEnhancedCSRFProtection(checkoutHandler);
