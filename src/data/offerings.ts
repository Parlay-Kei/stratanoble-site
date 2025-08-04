// Stripe product offerings with price IDs
export const OFFERINGS = {
  lite: {
    name: 'Dashboard Lite',
    description: 'Looker dashboard + weekly digest',
    priceId: 'price_1RsFQsP6dZu6HftBv9XGdulO',
    metadata: { tier: 'lite' }
  },
  growth: {
    name: 'Growth Blueprint',
    description: 'Dashboard + strategy + A/B tests',
    priceId: 'price_1RsFQtP6dZu6HftBrG78WPOI',
    metadata: { tier: 'growth' }
  },
  partner: {
    name: 'Revenue Partner',
    description: 'Complete partnership with setup and ongoing support',
    priceIds: {
      recurring: 'price_1RsFQuP6dZu6HftBGcFZargk',
      setup: 'price_1RsFQtP6dZu6HftBLuaDwo9M',
    },
    metadata: { tier: 'partner' }
  },
} as const;

// Type definitions for offerings
export type OfferingId = keyof typeof OFFERINGS;
export type Offering = typeof OFFERINGS[OfferingId];
