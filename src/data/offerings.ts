// Stripe product offerings with price IDs and feature flags
export const OFFERINGS = {
  lite: {
    name: 'Dashboard Lite',
    description: 'Looker dashboard + weekly digest',
    price: '$300/month',
    priceId: 'price_1RsFQhGEwjQWkTx0mcFlA0Bv',
    features: {
      dashboard: true,
      weeklyDigest: true,
      apiAccess: false,
      customReports: false,
      prioritySupport: false,
      automationHooks: false,
      brandDeals: false,
      templateMarketplace: false
    },
    featureList: [
      'Looker Studio dashboard',
      'Weekly performance digest',
      'Basic social media metrics',
      'Email support'
    ],
    metadata: { tier: 'lite' }
  },
  growth: {
    name: 'Growth Blueprint',
    description: 'Dashboard + strategy + A/B tests',
    price: '$2,000/month',
    priceId: 'price_1RsFSGGEwjQWkTx0THs4KEKn',
    features: {
      dashboard: true,
      weeklyDigest: true,
      apiAccess: true,
      customReports: true,
      prioritySupport: true,
      automationHooks: true,
      brandDeals: false,
      templateMarketplace: true
    },
    featureList: [
      'Everything in Dashboard Lite',
      'Custom report generation',
      'API access for integrations',
      'A/B testing recommendations',
      'Automation hooks (Airtable, Geniuslink)',
      'Template marketplace access',
      'Priority email support'
    ],
    metadata: { tier: 'growth' }
  },
  partner: {
    name: 'Revenue Partner',
    description: 'Complete partnership with setup and ongoing support',
    price: '$1,000 setup + $4,000/month',
    priceIds: {
      recurring: 'price_1RsFWjGEwjQWkTx0FvgCrXva', // $4000/month
      setup: 'price_1RsFWjGEwjQWkTx0YwSXDYHv', // $1000 one-time
    },
    features: {
      dashboard: true,
      weeklyDigest: true,
      apiAccess: true,
      customReports: true,
      prioritySupport: true,
      automationHooks: true,
      brandDeals: true,
      templateMarketplace: true
    },
    featureList: [
      'Everything in Growth Blueprint',
      'Brand deal brokerage access',
      'Dedicated account manager',
      'Custom dashboard development',
      'White-label reporting',
      'Revenue sharing opportunities',
      'Phone & Slack support'
    ],
    metadata: { tier: 'partner' }
  },
} as const;

// Type definitions for offerings
export type OfferingId = keyof typeof OFFERINGS;
export type Offering = typeof OFFERINGS[OfferingId];
