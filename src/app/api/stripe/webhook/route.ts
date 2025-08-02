import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { headers } from 'next/headers';
import { db } from '@/lib/supabase';
import { emailService } from '@/lib/email';
import Stripe from 'stripe';
import pino from 'pino';

const logger = pino();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  let eventId: string | undefined;
  
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
      eventId = event.id;
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    logger.info(`📦 Received webhook event: ${event.type}`, { eventId: event.id });

    try {
      // Log webhook event
      await db.logWebhook({
        event_id: event.id,
        event_type: event.type,
        processed: false,
        payload: event.data.object as unknown as Record<string, unknown>,
      });

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;
        
        case 'account.updated':
          await handleAccountUpdated(event.data.object);
          break;
        
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;
        
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      // Mark webhook as processed
      if (eventId) {
        await db.logWebhook({
          event_id: eventId,
          event_type: event.type,
          processed: true,
          payload: event.data.object as unknown as Record<string, unknown>,
        });
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Webhook processing error:', { error: errorMessage, eventId });
      
      if (eventId) {
        await db.logWebhook({
          event_id: eventId,
          event_type: event.type,
          processed: false,
          error_message: errorMessage,
          payload: event.data.object as unknown as Record<string, unknown>,
        });
      }
      
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Webhook error:', { error: errorMessage, eventId });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info('✅ Checkout session completed:', {
    sessionId: session.id,
    customerEmail: session.customer_email,
    amount: `$${((session.amount_total || 0) / 100).toFixed(2)}`,
    paymentStatus: session.payment_status,
    metadata: session.metadata,
  });
  
  try {
    // Create or update order in database
    const orderData = {
      stripe_session_id: session.id,
      customer_name: session.metadata?.customer_name || 'Unknown',
      customer_email: session.customer_email || 'unknown@example.com',
      package_type: session.metadata?.package_type || 'unknown',
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: session.payment_status === 'paid' ? 'paid' as const : 'pending' as const,
      fulfillment_status: 'pending' as const,
      metadata: session.metadata as Record<string, unknown> || {},
    };

    const order = await db.createOrder(orderData);
    logger.info('Order created in database:', { orderId: order.id, sessionId: session.id });

    // Update customer record
    if (session.customer_email && session.metadata?.customer_name) {
      await db.upsertCustomer({
        email: session.customer_email,
        name: session.metadata.customer_name,
        stripe_customer_id: session.customer ? String(session.customer) : undefined,
        metadata: { last_session_id: session.id },
      });
    }

    // Send kickoff email for Solution Services
    if (session.metadata?.service === 'solution_services' && session.customer_email && session.metadata?.customer_name) {
      const emailResult = await emailService.sendOrderKickoffEmail({
        customerName: session.metadata.customer_name,
        customerEmail: session.customer_email,
        packageType: session.metadata.package_type || 'unknown',
        orderId: order.id,
        amount: session.amount_total || 0,
      });

      if (emailResult.success) {
        logger.info('✅ Kickoff email sent successfully', { sessionId: session.id });
        // Update order to mark email sent
        await db.updateOrderStatus(session.id, 'paid', {
          ...orderData.metadata,
          kickoff_email_sent: true,
          kickoff_email_sent_at: new Date().toISOString(),
        });
      } else {
        logger.error('❌ Failed to send kickoff email', { sessionId: session.id, error: emailResult.error });
      }
    }

  } catch (error) {
    logger.error('Error processing checkout session:', {
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  // console.log('🔄 Account updated:', account.id);
  // console.log('   Charges Enabled:', account.charges_enabled);
  // console.log('   Payouts Enabled:', account.payouts_enabled);
  // console.log('   Details Submitted:', account.details_submitted);
  
  // Update merchant account status in your system
  // TODO: Integrate with your database to update merchant status
  
  if (account.charges_enabled && account.payouts_enabled) {
    // console.log('✅ Merchant account fully activated:', account.id);
    // Trigger merchant onboarding completion workflow
    // TODO: Send welcome email, grant access, etc.
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('✅ Payment intent succeeded:', {
    paymentIntentId: paymentIntent.id,
    amount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
    currency: paymentIntent.currency,
    receiptEmail: paymentIntent.receipt_email,
  });
  
  try {
    // Update order status if we can find it
    if (paymentIntent.metadata?.stripe_session_id) {
      await db.updateOrderStatus(paymentIntent.metadata.stripe_session_id, 'paid', {
        payment_intent_id: paymentIntent.id,
        payment_succeeded_at: new Date().toISOString(),
      });
    }

    // Trigger deliverable delivery for Solution Services
    if (paymentIntent.metadata?.service === 'solution_services') {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/deliverables/deliver`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerEmail: paymentIntent.receipt_email,
            customerName: paymentIntent.metadata.customer_name,
            packageType: paymentIntent.metadata.package_type,
          }),
        });

        if (response.ok) {
          logger.info('✅ Deliverable delivery triggered successfully', { paymentIntentId: paymentIntent.id });
        } else {
          logger.error('❌ Failed to trigger deliverable delivery', { paymentIntentId: paymentIntent.id });
        }
      } catch (error) {
        logger.error('❌ Error triggering deliverable delivery:', {
          paymentIntentId: paymentIntent.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } catch (error) {
    logger.error('Error processing payment intent succeeded:', {
      paymentIntentId: paymentIntent.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.error('❌ Payment intent failed:', {
    paymentIntentId: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error?.message,
    receiptEmail: paymentIntent.receipt_email,
  });
  
  try {
    // Update order status if we can find it
    if (paymentIntent.metadata?.stripe_session_id) {
      await db.updateOrderStatus(paymentIntent.metadata.stripe_session_id, 'failed', {
        payment_intent_id: paymentIntent.id,
        payment_failed_at: new Date().toISOString(),
        failure_reason: paymentIntent.last_payment_error?.message,
      });
    }

    // TODO: Send failure notification email to customer
    logger.info('📧 Should send payment failure notification to customer', {
      paymentIntentId: paymentIntent.id,
      receiptEmail: paymentIntent.receipt_email,
    });
    
  } catch (error) {
    logger.error('Error processing payment intent failed:', {
      paymentIntentId: paymentIntent.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
