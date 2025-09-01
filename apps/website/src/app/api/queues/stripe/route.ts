import { NextRequest, NextResponse } from 'next/server';
import { hasStripeConfig } from '@/lib/stripe-conditional';
import { db, handleStripeEvent } from '@/lib/supabase';
import { logger } from '@/lib/logger';

async function handler(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!hasStripeConfig()) {
      logger.warn('Stripe not configured - webhook processing unavailable');
      return NextResponse.json(
        { error: 'Webhook processing is currently unavailable' },
        { status: 503 }
      );
    }

    const event: any = await request.json();
    
    logger.info('Processing Stripe webhook event from queue', {
      eventId: event.id,
      eventType: event.type
    });

    // Log the webhook event
    await db.logWebhook({
      event_id: event.id,
      event_type: event.type,
      processed: false,
      payload: event as unknown as Record<string, unknown>
    });

    // Use the Supabase RPC function to handle SaaS-related events
    const saasEvents = [
      'customer.subscription.created',
      'customer.subscription.updated', 
      'customer.subscription.deleted',
      'invoice.payment_failed'
    ];

    if (saasEvents.includes(event.type)) {
      const result = await handleStripeEvent(event as unknown as Record<string, unknown>);
      logger.info('SaaS event processed via Supabase RPC', {
        eventType: event.type,
        eventId: event.id,
        result
      });

      // Call provision Edge Function for new subscriptions
      if (event.type === 'customer.subscription.created') {
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          
          await fetch(`${supabaseUrl}/functions/v1/provision`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event })
          });
        } catch (provisionError) {
          logger.error('Error calling provision function:', provisionError instanceof Error ? provisionError : new Error(String(provisionError)));
        }
      }
    } else {
      // Process legacy events
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event);
          break;
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event);
          break;
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event);
          break;
        default:
          logger.info('Unhandled webhook event type', {
            eventType: event.type,
            eventId: event.id
          });
      }
    }

    // Update webhook log to processed
    await db.logWebhook({
      event_id: event.id,
      event_type: event.type,
      processed: true,
      payload: event as unknown as Record<string, unknown>
    });

    logger.info('Successfully processed webhook event', {
      eventId: event.id,
      eventType: event.type
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('Error processing webhook event', new Error(errorMessage), {
      error: errorMessage
    });

    // Log the error in the webhook log
    try {
      const event: any = await request.json();
      await db.logWebhook({
        event_id: event.id,
        event_type: event.type,
        processed: false,
        error_message: errorMessage,
        payload: event as unknown as Record<string, unknown>
      });
    } catch (logError) {
      logger.error('Failed to log webhook error', logError instanceof Error ? logError : new Error(String(logError)));
    }

    // Return 500 to signal QStash to retry
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(event: any) {
  const session = event.data.object as any;
  
  logger.info('Processing checkout session completed', {
    sessionId: session.id,
    customerEmail: session.customer_email,
    paymentStatus: session.payment_status
  });

  if (session.payment_status === 'paid') {
    // Create or update customer record
    if (session.customer_email && session.metadata?.customer_name) {
      await db.upsertCustomer({
        email: session.customer_email,
        name: session.metadata.customer_name,
        stripe_customer_id: session.customer as string,
        metadata: session.metadata as Record<string, unknown>
      });
    }

    // Create order record
    if (session.customer_email && session.metadata?.customer_name && session.metadata?.package_type) {
      await db.createOrder({
        stripe_session_id: session.id,
        customer_name: session.metadata.customer_name,
        customer_email: session.customer_email,
        package_type: session.metadata.package_type,
        amount: session.amount_total || 0,
        status: 'completed',
        metadata: session.metadata as Record<string, unknown>
      });
    }

    // Send kickoff email and trigger deliverables
    // TODO: Re-enable when Stripe is properly configured
    // await sendKickoffEmail(session.id);
    logger.info('Kickoff email skipped - Stripe integration disabled');
  }
}

async function handlePaymentIntentSucceeded(event: any) {
  const paymentIntent = event.data.object as any;
  
  logger.info('Processing payment intent succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency
  });

  // Update order status if this is linked to a checkout session
  if (paymentIntent.metadata?.stripe_session_id) {
    await db.updateOrderStatus(
      paymentIntent.metadata.stripe_session_id,
      'paid',
      paymentIntent.metadata as Record<string, unknown>
    );
  }
}

async function handleInvoicePaymentSucceeded(event: any) {
  const invoice = event.data.object as any;
  
  logger.info('Processing invoice payment succeeded', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid
  });

  // Handle subscription invoice payments
  // Add your business logic here
}

// Legacy subscription handlers - now handled by Supabase RPC
// Keeping for backward compatibility with existing checkout flows

// Export handler directly - QStash signature verification can be added later if needed
export const POST = handler;

export async function GET() {
  return NextResponse.json({ message: 'Stripe queue worker is running' });
}
