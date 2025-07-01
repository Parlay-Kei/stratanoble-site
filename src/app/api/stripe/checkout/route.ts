import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageType, customerEmail, customerName } = body;

    // Validate required fields
    if (!packageType || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: packageType, customerEmail, customerName' },
        { status: 400 }
      );
    }

    // Validate package type
    if (!['lite', 'core', 'premium'].includes(packageType)) {
      return NextResponse.json(
        { error: 'Invalid package type. Must be lite, core, or premium' },
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

    // Create checkout session
    const session = await createCheckoutSession(
      packageType as 'lite' | 'core' | 'premium',
      customerEmail,
      customerName
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
