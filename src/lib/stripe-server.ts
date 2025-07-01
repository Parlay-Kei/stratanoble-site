import Stripe from 'stripe';

// Server-side Stripe initialization
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil',
});

// Create checkout session
export async function createCheckoutSession(
  packageType: 'lite' | 'core' | 'premium',
  customerEmail: string,
  customerName: string
) {
  const priceIds = {
    lite: process.env.STRIPE_PRICE_ID_SOLUTION_LITE,
    core: process.env.STRIPE_PRICE_ID_SOLUTION_CORE,
    premium: process.env.STRIPE_PRICE_ID_SOLUTION_PREMIUM
  };
  
  const priceId = priceIds[packageType];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  
  if (!priceId) {
    throw new Error(`Price ID not found for package type: ${packageType}`);
  }
  
  try {
    console.log('Creating checkout session with params:', {
      packageType,
      priceId,
      customerEmail,
      customerName,
      baseUrl
    });

    const session = await stripe.checkout.sessions.create({
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

    console.log('Stripe session created successfully:', {
      id: session.id,
      url: session.url,
      status: session.status
    });

    if (!session.url) {
      throw new Error('Stripe session created but no URL returned');
    }

    return session;
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
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
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    // For now, log the email details
    console.log('Kickoff email should be sent to:', {
      customer_email: session.customer_email,
      package_type: session.metadata?.package_type,
      customer_name: session.metadata?.customer_name,
      amount_total: session.amount_total,
      payment_status: session.payment_status
    });

    // Trigger deliverable delivery if this is a Solution Services package
    if (session.metadata?.service === 'solution_services' && session.metadata?.package_type) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
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
        console.log('Deliverable delivery result:', deliverableResult);
      } catch (error) {
        console.error('Error triggering deliverable delivery:', error);
      }
    }
    
    return {
      success: true,
      customer_email: session.customer_email,
      package_type: session.metadata?.package_type
    };
  } catch (error) {
    console.error('Error sending kickoff email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Stripe Connect functions for merchant onboarding
export async function createConnectedAccount(businessName: string, email: string) {
  try {
    const account = await stripe.accounts.create({
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
    console.error('Error creating connected account:', error);
    throw new Error(`Failed to create connected account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createAccountLink(accountId: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw new Error(`Failed to create account link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
