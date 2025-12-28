// Conditional Stripe imports to prevent build failures
// Only import Stripe when environment variables are available

import Stripe from 'stripe';

let stripe: any = null;

export const getStripe = () => {
  if (typeof window === 'undefined') {
    // Server-side: only initialize if environment variable exists
    if (process.env.STRIPE_SECRET_KEY) {
      if (!stripe) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          // Use latest stable API version - type assertion needed for SDK compatibility
          apiVersion: '2024-12-18.acacia' as any,
        });
      }
    }
  }
  return stripe;
};

export const hasStripeConfig = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

