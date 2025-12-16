// ============================================================================
// PLATFORM TIERS - Primary SaaS Offering
// ============================================================================
// AI-powered business building platform with subscription pricing

export const PLATFORM_TIERS = [
  {
    id: 'free',
    name: 'FREE',
    subtitle: 'Perfect for validating your idea',
    description: 'Get started with AI-powered idea validation and basic business planning tools.',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    stripePriceId: null, // No Stripe needed for free tier
    features: [
      'AI idea validation',
      'Market research report',
      'Business name generator',
      'Basic business plan',
      '5 AI assists per month',
      'Community forum access',
      'Business templates library',
      'Email support'
    ],
    cta: 'Start Free',
    ctaLink: '/auth/signup',
    popular: false,
    tier: 'free',
    metadata: {
      maxAiAssists: 5,
      features: {
        ideaValidation: true,
        marketResearch: true,
        businessPlan: 'basic',
        brandIdentity: false,
        websiteBuilder: false,
        marketing: false,
        coaching: false,
        prioritySupport: false
      }
    }
  },
  {
    id: 'builder',
    name: 'BUILDER',
    subtitle: 'For serious builders ready to launch',
    description: 'Everything you need to build and launch your business with AI automation.',
    price: 47,
    priceLabel: '$47',
    period: '/month',
    // Hardcoded for reliability - env vars can fail at build time
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID || 'price_1SF1l1GEwjQWkTx0wbp1COP8',
    features: [
      'Everything in Free, plus:',
      'Complete business plan',
      'Brand identity package (logo, colors, voice)',
      'Website builder with templates',
      'Unlimited AI assists',
      'Marketing automation',
      'Email sequence templates',
      'Launch playbook',
      'Payment processing setup',
      'Financial projection tools',
      '90-day roadmap',
      'Priority email support'
    ],
    cta: 'Start Building',
    ctaLink: '/auth/signup?tier=builder',
    popular: true,
    tier: 'builder',
    metadata: {
      maxAiAssists: -1, // unlimited
      features: {
        ideaValidation: true,
        marketResearch: true,
        businessPlan: 'complete',
        brandIdentity: true,
        websiteBuilder: true,
        marketing: 'automated',
        coaching: false,
        prioritySupport: true
      }
    }
  },
  {
    id: 'prosperity',
    name: 'PROSPERITY',
    subtitle: 'For growing businesses',
    description: 'Advanced automation with expert coaching to accelerate your growth.',
    price: 97,
    priceLabel: '$97',
    period: '/month',
    // Hardcoded for reliability - env vars can fail at build time
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID || 'price_1SF1lHGEwjQWkTx0l3yTxXE5',
    features: [
      'Everything in Builder, plus:',
      'Advanced automation workflows',
      '1-on-1 monthly coaching call',
      'Priority support (2-hour response)',
      'Funding assistance & grant finder',
      'Custom growth strategies',
      'Financial projections & modeling',
      'Scaling playbooks',
      'Performance analytics dashboard',
      'A/B testing recommendations',
      'Dedicated success manager',
      'Phone & Slack support'
    ],
    cta: 'Go Pro',
    ctaLink: '/auth/signup?tier=prosperity',
    popular: false,
    tier: 'prosperity',
    metadata: {
      maxAiAssists: -1, // unlimited
      features: {
        ideaValidation: true,
        marketResearch: true,
        businessPlan: 'complete',
        brandIdentity: true,
        websiteBuilder: true,
        marketing: 'advanced',
        coaching: true,
        prioritySupport: true
      }
    }
  },
] as const;

// ============================================================================
// CONSULTING SERVICES - Premium Hands-On Support
// ============================================================================
// High-touch consulting for complex businesses needing expert guidance

export const CONSULTING_SERVICES = [
  {
    id: 'consulting-strategy',
    name: 'Strategy Consulting',
    subtitle: 'Expert guidance for complex businesses',
    description: 'Hands-on strategic consulting for businesses that need personalized expert guidance beyond platform automation.',
    price: 2500,
    priceLabel: 'From $1,200',
    period: 'one-time',
    stripePriceId: null, // Custom quotes - contact sales
    packages: [
      {
        name: 'Lite',
        price: '$1,200',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CONSULTING_LITE_PRICE_ID || null,
        features: [
          '2-hour strategy session',
          'Business model canvas',
          '30-day action plan',
          'Email support for 30 days'
        ]
      },
      {
        name: 'Core',
        price: '$2,500',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CONSULTING_CORE_PRICE_ID || null,
        features: [
          '4-hour deep dive session',
          'Market analysis report',
          'Revenue model design',
          '90-day roadmap',
          '2 follow-up calls'
        ]
      },
      {
        name: 'Premium',
        price: '$5,000',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CONSULTING_PREMIUM_PRICE_ID || null,
        features: [
          'Full strategy & execution',
          'Quarterly reviews',
          'Priority support',
          'Implementation guidance',
          'Success metrics tracking'
        ]
      }
    ],
    features: [
      'Custom business development',
      'Hands-on implementation support',
      'Strategic consulting sessions',
      'Market entry strategy',
      'Priority platform access',
      'Dedicated consultant',
      'Custom reporting'
    ],
    cta: 'Book Discovery Call',
    ctaLink: '/contact',
    popular: false,
    tier: 'consulting',
    metadata: {
      requiresDiscovery: true,
      customPricing: true
    }
  },
  {
    id: 'consulting-brand',
    name: 'Brand & Digital',
    subtitle: 'Complete brand development',
    description: 'Professional brand identity and digital presence development with hands-on creative direction.',
    price: 1500,
    priceLabel: 'From $1,500',
    period: 'one-time',
    stripePriceId: null, // Custom quotes - contact sales
    packages: [
      {
        name: 'Starter',
        price: '$1,500',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BRAND_STARTER_PRICE_ID || null,
        features: [
          'Logo design',
          'Brand guidelines',
          'Basic website (5 pages)',
          'Social media setup'
        ]
      },
      {
        name: 'Growth',
        price: '$3,500',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BRAND_GROWTH_PRICE_ID || null,
        features: [
          'Full brand identity',
          'Custom website (10 pages)',
          'Content strategy',
          'Social media management (30 days)',
          'SEO optimization'
        ]
      },
      {
        name: 'Authority',
        price: '$7,500',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BRAND_AUTHORITY_PRICE_ID || null,
        features: [
          'Complete brand suite',
          'Advanced website with CMS',
          'Content creation (3 months)',
          'Marketing automation',
          'Ongoing support (90 days)'
        ]
      }
    ],
    features: [
      'Professional brand identity',
      'Custom website development',
      'Content strategy & creation',
      'Marketing automation setup',
      'SEO & performance optimization',
      'Social media management',
      'Ongoing creative support'
    ],
    cta: 'Get Custom Quote',
    ctaLink: '/contact',
    popular: false,
    tier: 'consulting',
    metadata: {
      requiresDiscovery: true,
      customPricing: true
    }
  },
  {
    id: 'consulting-data',
    name: 'Data & Analytics',
    subtitle: 'Operations optimization',
    description: 'Comprehensive data analysis and operations optimization for established businesses.',
    price: 800,
    priceLabel: 'From $800',
    period: 'one-time',
    stripePriceId: null, // Custom quotes - contact sales
    packages: [
      {
        name: 'Analysis',
        price: '$800',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_DATA_ANALYSIS_PRICE_ID || null,
        features: [
          'Data audit',
          'KPI identification',
          'Performance report',
          'Optimization recommendations'
        ]
      },
      {
        name: 'Implementation',
        price: '$2,000',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_DATA_IMPL_PRICE_ID || null,
        features: [
          'Full data analysis',
          'Custom dashboard setup',
          'Process optimization',
          'Team training',
          '30-day support'
        ]
      }
    ],
    features: [
      'Comprehensive data audit',
      'KPI dashboard setup',
      'Performance optimization',
      'Process automation',
      'Team training',
      'Custom reporting',
      'Ongoing analytics support'
    ],
    cta: 'Request Analysis',
    ctaLink: '/contact',
    popular: false,
    tier: 'consulting',
    metadata: {
      requiresDiscovery: true,
      customPricing: false
    }
  },
] as const;

// ============================================================================
// LEGACY OFFERINGS - For Backwards Compatibility
// ============================================================================
// Keep existing dashboard/analytics offerings for current customers

export const LEGACY_OFFERINGS = {
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
    metadata: { tier: 'lite', legacy: true }
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
    metadata: { tier: 'growth', legacy: true }
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
    metadata: { tier: 'partner', legacy: true }
  },
} as const;

// ============================================================================
// COMBINED EXPORTS
// ============================================================================

// Primary export - Platform tiers for new customers
export const OFFERINGS = PLATFORM_TIERS;

// All offerings combined (for backwards compatibility)
export const ALL_OFFERINGS = [
  ...PLATFORM_TIERS,
  ...CONSULTING_SERVICES,
];

// Type definitions
export type PlatformTierId = typeof PLATFORM_TIERS[number]['id'];
export type ConsultingServiceId = typeof CONSULTING_SERVICES[number]['id'];
export type LegacyOfferingId = keyof typeof LEGACY_OFFERINGS;

export type PlatformTier = typeof PLATFORM_TIERS[number];
export type ConsultingService = typeof CONSULTING_SERVICES[number];
export type LegacyOffering = typeof LEGACY_OFFERINGS[LegacyOfferingId];

// Helper function to get offering by ID
export function getOfferingById(id: string) {
  return ALL_OFFERINGS.find(offering => offering.id === id);
}

// Helper function to get platform tier by ID
export function getPlatformTier(id: PlatformTierId) {
  return PLATFORM_TIERS.find(tier => tier.id === id);
}

// Helper function to get consulting service by ID
export function getConsultingService(id: ConsultingServiceId) {
  return CONSULTING_SERVICES.find(service => service.id === id);
}

// Helper function to check if offering is platform tier
export function isPlatformTier(offering: any): offering is PlatformTier {
  return PLATFORM_TIERS.some(tier => tier.id === offering.id);
}

// Helper function to check if offering is consulting service
export function isConsultingService(offering: any): offering is ConsultingService {
  return CONSULTING_SERVICES.some(service => service.id === offering.id);
}
