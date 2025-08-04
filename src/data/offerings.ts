// Stripe product offerings with price IDs
export const OFFERINGS = {
  lite: {
    name: 'Dashboard Lite',
    description: 'Looker dashboard + weekly digest',
    priceId: 'price_1RsFQhGEwjQWkTx0mcFlA0Bv', // $300/month
    metadata: { tier: 'lite' }
  },
  growth: {
    name: 'Growth Blueprint',
    description: 'Dashboard + strategy + A/B tests',
    priceId: 'price_1RsFSGGEwjQWkTx0THs4KEKn', // $2000/month
    metadata: { tier: 'growth' }
  },
  partner: {
    name: 'Revenue Partner',
    description: 'Complete partnership with setup and ongoing support',
    priceIds: {
      recurring: 'price_1RsFWjGEwjQWkTx0FvgCrXva', // $4000/month
      setup: 'price_1RsFWjGEwjQWkTx0YwSXDYHv', // $1000 one-time
    },
    metadata: { tier: 'partner' }
  },
} as const;

// Type definitions for offerings
export type OfferingId = keyof typeof OFFERINGS;
export type Offering = typeof OFFERINGS[OfferingId];
