import { loadStripe } from '@stripe/stripe-js';
import { config } from './config';

// Client-side Stripe initialization
const stripePublishableKey = config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  // console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is missing');
}

// Load Stripe.js for client-side
export const getStripe = () => {
  if (!stripePublishableKey) {
    // console.error('Stripe publishable key is not configured');
    return null;
  }
  return loadStripe(stripePublishableKey);
};

// Solution Services package configurations (client-safe)
export const SOLUTION_SERVICES_PACKAGES = {
  lite: {
    name: 'Solution Services - Lite',
    price: 1200,
    features: [
      '2-hour strategy session',
      'Business model canvas',
      '30-day action plan',
      'Email support'
    ]
  },
  core: {
    name: 'Solution Services - Core',
    price: 2500,
    features: [
      '4-hour deep dive',
      'Market analysis report',
      'Revenue model design',
      '90-day roadmap',
      '2 follow-up calls'
    ]
  },
  premium: {
    name: 'Solution Services - Premium',
    price: 5000,
    features: [
      'Full strategy & execution',
      'Quarterly reviews',
      'Priority support',
      'Implementation guidance',
      'Success metrics tracking'
    ]
  }
};
