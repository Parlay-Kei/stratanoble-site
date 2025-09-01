// Conditional Stripe imports to prevent build failures
// Only import Stripe when environment variables are available

let stripe: any = null;

export const getStripe = () => {
  if (typeof window === 'undefined') {
    // Server-side: only initialize if environment variable exists
    if (process.env.STRIPE_SECRET_KEY) {
      if (!stripe) {
        const Stripe = require('stripe');
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });
      }
    }
  }
  return stripe;
};

export const hasStripeConfig = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};
