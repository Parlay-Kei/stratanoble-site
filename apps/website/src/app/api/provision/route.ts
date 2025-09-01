import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/supabase';
import { sendEmail } from '@/lib/mailer';
import { logger } from '@/lib/logger';
import { getStripe, hasStripeConfig } from '@/lib/stripe-conditional';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!hasStripeConfig()) {
      logger.warn('Stripe not configured - provision webhook unavailable');
      return NextResponse.json(
        { error: 'Webhook processing is currently unavailable' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Webhook processing is currently unavailable' },
        { status: 503 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature') as string;

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      logger.error('Webhook signature verification failed', err instanceof Error ? err : new Error(String(err)));
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    logger.info('Processing webhook event', { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as any);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as any);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as any);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as any);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any);
        break;
      default:
        logger.info('Unhandled event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  logger.info('Processing checkout session completed', { sessionId: session.id });

  if (!session.customer_email || !session.customer) {
    logger.warn('Missing customer information in session');
    return;
  }

  const customerEmail = session.customer_email;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id;

  try {
    // Upsert customer in Supabase customers table
    await db.upsertCustomer({
      email: customerEmail,
      name: session.customer_details?.name || 'Customer',
      stripe_customer_id: stripeCustomerId,
      metadata: session.metadata as Record<string, unknown> | undefined,
    });

    // Ensure a client exists keyed by stripe_customer_id
    const tier = determineTierFromSession(session) as 'lite' | 'growth' | 'partner';
    await db.upsertClientByStripeCustomerId(stripeCustomerId, { tier, status: 'active' });

    // Create order record for this checkout
    await db.createOrder({
      stripe_session_id: session.id,
      customer_name: session.customer_details?.name || 'Customer',
      customer_email: customerEmail,
      package_type: session.metadata?.package_type || 'unknown',
      amount: (session.amount_total || 0) / 100,
      status: 'paid',
      metadata: session.metadata as Record<string, unknown> | undefined,
    });

    // Send welcome email
    await sendWelcomeEmail(customerEmail, session.customer_details?.name || 'Customer', tier);

    logger.info('User provisioning completed', { email: customerEmail, stripeCustomerId });
  } catch (error) {
    logger.error('User provisioning failed', error instanceof Error ? error : new Error(String(error)), { email: customerEmail });
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: any) {
  logger.info('Processing subscription created', { subscriptionId: subscription.id });
  
  const stripeCustomerId = subscription.customer as string;
  await updateClientTierByStripeCustomerId(stripeCustomerId, determineTierFromSubscription(subscription));
}

async function handleSubscriptionUpdated(subscription: any) {
  logger.info('Processing subscription updated', { subscriptionId: subscription.id });
  
  const stripeCustomerId = subscription.customer as string;
  await updateClientTierByStripeCustomerId(stripeCustomerId, determineTierFromSubscription(subscription));
}

async function handleSubscriptionDeleted(subscription: any) {
  logger.info('Processing subscription deleted', { subscriptionId: subscription.id });
  
  const stripeCustomerId = subscription.customer as string;
  await updateClientTierByStripeCustomerId(stripeCustomerId, null); // Remove tier when subscription is deleted
}

async function handlePaymentSucceeded(invoice: any) {
  logger.info('Processing payment succeeded', { invoiceId: invoice.id });
  
  // Log stripe event and upsert customer/client via Supabase
  await db.logStripeEvent({
    event_id: invoice.id || crypto.randomUUID(),
    type: 'invoice.payment_succeeded',
    handled: true,
  });
  if (invoice.customer) {
    const stripeCustomerId = String(invoice.customer);
    await db.upsertCustomer({
      email: invoice.customer_email || 'unknown@unknown',
      name: invoice.customer_name || 'Customer',
      stripe_customer_id: stripeCustomerId,
      metadata: invoice as unknown as Record<string, unknown>,
    });
    await db.upsertClientByStripeCustomerId(stripeCustomerId, { status: 'active' });
  }
}

async function updateClientTierByStripeCustomerId(stripeCustomerId: string, tier: string | null) {
  try {
    const mappedTier = (tier ?? 'lite') as 'lite' | 'growth' | 'partner';
    await db.upsertClientByStripeCustomerId(stripeCustomerId, { tier: mappedTier, status: 'active' });
    logger.info('Updated client tier', { stripeCustomerId, tier: mappedTier });
  } catch (error) {
    logger.error('Failed to update client tier', error instanceof Error ? error : new Error(String(error)), { stripeCustomerId, tier });
  }
}

// Removed Prisma ID helpers; Supabase client operations are keyed by stripe_customer_id

function determineTierFromSession(session: any): string {
  // Extract tier from metadata or price ID
  if (session.metadata?.tier) {
    return session.metadata.tier;
  }

  // Fallback to determining from line items
  // This would need to be customized based on your price IDs
  return 'lite';
}

function determineTierFromSubscription(subscription: any): string {
  // Extract tier from subscription metadata or price ID
  if (subscription.metadata?.tier) {
    return subscription.metadata.tier;
  }

  // Fallback logic based on price IDs
  const priceId = subscription.items.data[0]?.price.id;
  if (priceId === process.env.STRIPE_PRICE_ID_PARTNER) return 'partner';
  if (priceId === process.env.STRIPE_PRICE_ID_GROWTH) return 'growth';
  return 'lite';
}

async function sendWelcomeEmail(email: string, name: string, tier: string) {
  try {
    const subject = 'Welcome to Strata Noble - Your Account is Ready!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Strata Noble!</h1>
        </div>
        
        <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} account is now active and ready to use!
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
               style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Access Your Dashboard
            </a>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your account includes:
          </p>

          <ul style="color: #333; font-size: 16px; line-height: 1.6; margin-left: 20px;">
            ${tier === 'partner' ? '<li>Full analytics dashboard</li><li>Priority support</li><li>Custom reporting</li><li>API access</li>' : 
              tier === 'growth' ? '<li>Analytics dashboard</li><li>Weekly reports</li><li>Email support</li>' :
              '<li>Basic dashboard</li><li>Monthly reports</li>'}
          </ul>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2025 Strata Noble. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail(email, subject, html);
    logger.info('Welcome email sent', { email });
  } catch (error) {
    logger.error('Failed to send welcome email', error instanceof Error ? error : new Error(String(error)), { email });
  }
}
