import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';
import { logger } from '@/lib/logger';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;

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
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      default:
        logger.info('Unhandled event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', { error });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout session completed', { sessionId: session.id });

  if (!session.customer_email || !session.customer) {
    logger.warn('Missing customer information in session');
    return;
  }

  const customerEmail = session.customer_email;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id;

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: session.customer_details?.name || null,
          stripeCustomerId: stripeCustomerId,
          tier: determineTierFromSession(session),
        }
      });
      logger.info('Created new user', { userId: user.id, email: customerEmail });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: stripeCustomerId,
          tier: determineTierFromSession(session),
        }
      });
      logger.info('Updated existing user', { userId: user.id, email: customerEmail });
    }

    // Create or update Client record for backwards compatibility
    await prisma.client.upsert({
      where: { email: customerEmail },
      update: {
        stripeCustomerId: stripeCustomerId,
        tier: user.tier || 'lite',
        userId: user.id,
      },
      create: {
        email: customerEmail,
        name: user.name || 'Customer',
        stripeCustomerId: stripeCustomerId,
        tier: user.tier || 'lite',
        userId: user.id,
      }
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || 'Customer', user.tier || 'lite');

    logger.info('User provisioning completed', { userId: user.id });
  } catch (error) {
    logger.error('User provisioning failed', { error, email: customerEmail });
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  logger.info('Processing subscription created', { subscriptionId: subscription.id });
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if ('email' in customer && customer.email) {
    await updateUserTier(customer.email, determineTierFromSubscription(subscription));
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info('Processing subscription updated', { subscriptionId: subscription.id });
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if ('email' in customer && customer.email) {
    await updateUserTier(customer.email, determineTierFromSubscription(subscription));
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info('Processing subscription deleted', { subscriptionId: subscription.id });
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if ('email' in customer && customer.email) {
    await updateUserTier(customer.email, null); // Remove tier when subscription is deleted
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info('Processing payment succeeded', { invoiceId: invoice.id });
  
  // Create invoice record
  await prisma.invoice.create({
    data: {
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      status: invoice.status || 'paid',
      userId: await getUserIdByStripeCustomerId(invoice.customer as string),
      clientId: await getClientIdByStripeCustomerId(invoice.customer as string),
    }
  });
}

async function updateUserTier(email: string, tier: string | null) {
  try {
    await prisma.user.update({
      where: { email },
      data: { tier }
    });

    // Also update Client record for backwards compatibility
    await prisma.client.update({
      where: { email },
      data: { tier: tier || 'lite' }
    });

    logger.info('Updated user tier', { email, tier });
  } catch (error) {
    logger.error('Failed to update user tier', { error, email, tier });
  }
}

async function getUserIdByStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId },
      select: { id: true }
    });
    return user?.id || null;
  } catch (error) {
    logger.error('Failed to get user ID', { error, stripeCustomerId });
    return null;
  }
}

async function getClientIdByStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
  try {
    const client = await prisma.client.findUnique({
      where: { stripeCustomerId },
      select: { id: true }
    });
    return client?.id || null;
  } catch (error) {
    logger.error('Failed to get client ID', { error, stripeCustomerId });
    return null;
  }
}

function determineTierFromSession(session: Stripe.Checkout.Session): string {
  // Extract tier from metadata or price ID
  if (session.metadata?.tier) {
    return session.metadata.tier;
  }

  // Fallback to determining from line items
  // This would need to be customized based on your price IDs
  return 'lite';
}

function determineTierFromSubscription(subscription: Stripe.Subscription): string {
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
    logger.error('Failed to send welcome email', { error, email });
  }
}