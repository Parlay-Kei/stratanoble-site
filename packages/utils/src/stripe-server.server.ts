// This file should ONLY be imported on the server side
// It will throw an error if imported on the client side

if (typeof window !== 'undefined') {
  throw new Error('stripe-server.server.ts should never be imported on the client side');
}

const Stripe = require('stripe');
const logger = require('pino')();

// Only initialize Stripe on the server side
let stripe: any = null;

// Server-side only initialization
function initializeStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!stripeSecretKey || stripeSecretKey === 'sk_test_placeholder_for_development' || stripeSecretKey.includes('placeholder')) {
    if (isDevelopment) {
      // In development, use a safe placeholder key that won't cause errors
      console.warn('⚠️ STRIPE_SECRET_KEY not found or using placeholder, using development stub');
      return new Stripe('sk_test_51placeholder_for_development_000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
    } else {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
  } else {
    return new Stripe(stripeSecretKey);
  }
}

// Initialize Stripe only when needed
export function getStripe(): any {
  if (!stripe) {
    stripe = initializeStripe();
  }
  
  return stripe;
}

// Create checkout session
export async function createCheckoutSession(
  packageType: 'lite' | 'core' | 'premium' | 'workshop_standard' | 'presence_standard' | 'analysis_standard',
  customerEmail: string,
  customerName: string
) {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe is only available on the server side');
  }
  
  const priceIds = {
    lite: process.env.STRIPE_PRICE_ID_SOLUTION_LITE,
    core: process.env.STRIPE_PRICE_ID_SOLUTION_CORE,
    premium: process.env.STRIPE_PRICE_ID_SOLUTION_PREMIUM,
    workshop_standard: process.env.STRIPE_PRICE_ID_WORKSHOP_STANDARD,
    presence_standard: process.env.STRIPE_PRICE_ID_PRESENCE_STANDARD,
    analysis_standard: process.env.STRIPE_PRICE_ID_ANALYSIS_STANDARD
  } as const;
  
  const priceId = priceIds[packageType];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';
  
  if (!priceId) {
    throw new Error(`Price ID not found for package type: ${packageType}`);
  }
  
  try {
    logger.info({
      msg: 'Creating checkout session with params',
      packageType,
      priceId,
      customerEmail,
      customerName,
      baseUrl
    });

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/services`,
      customer_email: customerEmail,
      metadata: {
        package_type: packageType,
        customer_name: customerName,
        service: 'solution_services'
      },
    });

    logger.info({
      msg: 'Stripe session created successfully',
      id: session.id,
      url: session.url,
      status: session.status
    });

    if (!session.url) {
      throw new Error('Stripe session created but no URL returned');
    }

    return session;
  } catch (error) {
    logger.error({
      msg: 'Stripe checkout session creation error',
      error
    });
    
    // Log more details about the error
    if (error instanceof Error) {
      logger.error({
        msg: 'Error details',
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Send kickoff email after successful payment
export async function sendKickoffEmail(sessionId: string) {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe is only available on the server side');
  }
  
  try {
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    
    // TODO: Integrate with AWS SES email service
    // For now, log the email details
    logger.info({
      msg: 'Kickoff email should be sent to',
      customer_email: session.customer_email,
      package_type: session.metadata?.package_type,
      customer_name: session.metadata?.customer_name,
      amount_total: session.amount_total,
      payment_status: session.payment_status
    });

    // Trigger deliverable delivery if this is a Solution Services package
    if (session.metadata?.service === 'solution_services' && session.metadata?.package_type) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';
        const deliverableResponse = await fetch(`${baseUrl}/api/deliverables/deliver`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerEmail: session.customer_email,
            customerName: session.metadata.customer_name,
            packageType: session.metadata.package_type,
          }),
        });

        const deliverableResult = await deliverableResponse.json();
        logger.info({
          msg: 'Deliverable delivery result',
          deliverableResult
        });
      } catch (error) {
        logger.error({
          msg: 'Error triggering deliverable delivery',
          error
        });
      }
    }
    
    return {
      success: true,
      customer_email: session.customer_email,
      package_type: session.metadata?.package_type
    };
  } catch (error) {
    logger.error({
      msg: 'Error sending kickoff email',
      error
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Stripe Connect functions for merchant onboarding
export async function createConnectedAccount(businessName: string, email: string) {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe is only available on the server side');
  }
  
  try {
    const account = await stripeInstance.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
        url: 'https://stratanoble.com',
        mcc: '7399', // Business Services, Not Elsewhere Classified
      },
    });

    return account;
  } catch (error) {
    logger.error({
      msg: 'Error creating connected account',
      error
    });
    throw new Error(`Failed to create connected account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createAccountLink(accountId: string, returnUrl: string) {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe is only available on the server side');
  }
  
  try {
    const accountLink = await stripeInstance.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });

    return accountLink;
  } catch (error) {
    logger.error({
      msg: 'Error creating account link',
      error
    });
    throw new Error(`Failed to create account link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
