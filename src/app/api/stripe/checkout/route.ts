import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe-server';
import { OFFERINGS } from '@/data/offerings';
import { stripe } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offeringId, customerEmail, customerName } = body;

    // Validate required fields
    if (!offeringId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: offeringId, customerEmail, customerName' },
        { status: 400 }
      );
    }

    // Validate offering ID
    if (!['lite', 'growth', 'partner'].includes(offeringId)) {
      return NextResponse.json(
        { error: 'Invalid offering ID. Must be lite, growth, or partner' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items,
      customer_email: customerEmail,
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        offering_id: offeringId,
        customer_name: customerName,
        ...offering.metadata,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
