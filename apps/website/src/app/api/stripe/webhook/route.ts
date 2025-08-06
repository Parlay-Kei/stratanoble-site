import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { headers } from 'next/headers';
import pino from 'pino';
import { qstash } from '@/lib/qstash';

const logger = pino();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      logger.error('Missing webhook signature or secret');
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Webhook signature verification failed:', { error: errorMessage });
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Instead of processing here, enqueue the event for a background worker.
    // This makes the endpoint fast and resilient to processing failures.
    if (qstash) {
      await qstash.publishJSON({
        // The URL of your background processing API route
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/queues/stripe`,
        body: event,
        // Use the event ID for deduplication to ensure we only process each event once.
        deduplicationId: event.id,
      });
    } else {
      // Fallback: process immediately if qstash is not available
      logger.warn('QStash not available, processing webhook directly');
      const { handleStripeEvent } = await import('@/lib/supabase');
      await handleStripeEvent(event as unknown as Record<string, unknown>);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Webhook error:', { error: errorMessage });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
