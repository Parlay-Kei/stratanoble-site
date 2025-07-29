import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      // console.error('Missing webhook signature or secret');
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      // console.error('Webhook signature verification failed:', _err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // console.log(`📦 Received webhook event: ${event.type}`);

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
        // console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch {
    // console.error('Webhook error:', _error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // console.log('✅ Checkout session completed:', session.id);
  // console.log('   Customer Email:', session.customer_email);
  // console.log('   Amount:', `$${((session.amount_total || 0) / 100).toFixed(2)}`);
  // console.log('   Payment Status:', session.payment_status);
  // console.log('   Metadata:', session.metadata);
  
  // Update order status in your system
  // TODO: Integrate with your database/order management system
  
  // Send confirmation email
  if (session.metadata?.service === 'solution_services') {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/api/stripe/kickoff-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (response.ok) {
        // console.log('✅ Kickoff email sent successfully');
      } else {
        // console.error('❌ Failed to send kickoff email');
      }
    } catch {
      // console.error('❌ Error sending kickoff email:', _error);
    }
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
  // console.log('✅ Payment intent succeeded:', paymentIntent.id);
  // console.log('   Amount:', `$${(paymentIntent.amount / 100).toFixed(2)}`);
  // console.log('   Currency:', paymentIntent.currency);
  // console.log('   Customer Email:', paymentIntent.receipt_email);
  
  // Update payment status in your system
  // TODO: Integrate with your database to update payment status
  
  // Trigger any post-payment workflows
  if (paymentIntent.metadata?.service === 'solution_services') {
    // Trigger deliverable delivery
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
        // console.log('✅ Deliverable delivery triggered successfully');
      } else {
        // console.error('❌ Failed to trigger deliverable delivery');
      }
    } catch {
      // console.error('❌ Error triggering deliverable delivery:', _error);
    }
  }
}

async function handlePaymentIntentFailed(_paymentIntent: Stripe.PaymentIntent) {
  // console.log('❌ Payment intent failed:', paymentIntent.id);
  // console.log('   Last Payment Error:', paymentIntent.last_payment_error?.message);
  // console.log('   Customer Email:', paymentIntent.receipt_email);
  
  // Update payment status in your system
  // TODO: Integrate with your database to update payment status
  
  // Send failure notification
  // TODO: Implement failure notification system
  // console.log('📧 Should send payment failure notification to customer');
}
