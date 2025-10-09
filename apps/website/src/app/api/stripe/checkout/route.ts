import { NextRequest, NextResponse } from 'next/server';
import { getStripe, hasStripeConfig } from '@/lib/stripe-conditional';
import { CheckoutSessionSchema, validateRequest, createValidationErrorResponse, createSuccessResponse } from '@/lib/validators';
import { withEnhancedCSRFProtection } from '@/lib/csrf';
import { logger } from '@/lib/logger';

async function checkoutHandler(request: NextRequest) {
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

    const body = await request.json();

    const validation = validateRequest(CheckoutSessionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createValidationErrorResponse(validation.errorMap),
        { status: 422 }
      );
    }

    const { offeringId, customerEmail, customerName, promoCode, test, priceId } = validation.data as any;

    // Require priceId for platform tiers; consulting should not reach here (handled via redirect)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing priceId for checkout' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';

    const sessionParams: any = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        offering_id: offeringId,
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
    if (process.env.NODE_ENV !== 'production') {\n      return NextResponse.json({ error: 'Failed to create checkout session', detail: errorMessage }, { status: 500 });\n    }\n    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

export const POST = withEnhancedCSRFProtection(checkoutHandler);
