import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@upstash/qstash/nextjs';
import { sendKickoffEmail } from '@/lib/stripe-server';
import { db } from '@/lib/supabase';
import pino from 'pino';
import Stripe from 'stripe';

const logger = pino();

async function handler(request: NextRequest) {
  try {
    const event: Stripe.Event = await request.json();
    
    logger.info({
      msg: 'Processing Stripe webhook event from queue',
      eventId: event.id,
      eventType: event.type
    });

    // Log the webhook event
    await db.logWebhook({
      event_id: event.id,
      event_type: event.type,
      processed: false,
      payload: event as Record<string, unknown>
    });

    // Process the event based on its type
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
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      default:
        logger.info({
          msg: 'Unhandled webhook event type',
          eventType: event.type,
          eventId: event.id
        });
    }

    // Update webhook log to processed
    await db.logWebhook({
      event_id: event.id,
      event_type: event.type,
      processed: true,
      payload: event as Record<string, unknown>
    });

    logger.info({
      msg: 'Successfully processed webhook event',
      eventId: event.id,
      eventType: event.type
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error({
      msg: 'Error processing webhook event',
      error: errorMessage
    });

    // Log the error in the webhook log
    try {
      const event: Stripe.Event = await request.json();
      await db.logWebhook({
        event_id: event.id,
        event_type: event.type,
        processed: false,
        error_message: errorMessage,
        payload: event as Record<string, unknown>
      });
    } catch (logError) {
      logger.error({
        msg: 'Failed to log webhook error',
        error: logError
      });
    }

    // Return 500 to signal QStash to retry
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  logger.info({
    msg: 'Processing checkout session completed',
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
    await sendKickoffEmail(session.id);
  }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  logger.info({
    msg: 'Processing payment intent succeeded',
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

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  
  logger.info({
    msg: 'Processing invoice payment succeeded',
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid
  });

  // Handle subscription invoice payments
  // Add your business logic here
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  logger.info({
    msg: 'Processing subscription created',
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status
  });

  // Handle new subscription creation
  // Add your business logic here
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  
  logger.info({
    msg: 'Processing subscription updated',
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status
  });

  // Handle subscription updates (status changes, plan changes, etc.)
  // Add your business logic here
}

// Verify the request signature from QStash
export const POST = verifySignature(handler);

export async function GET() {
  return NextResponse.json({ message: 'Stripe queue worker is running' });
}