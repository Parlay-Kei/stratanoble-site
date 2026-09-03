// ============================================================================
// STRATA NOBLE - PUBLIC OFFER ARCHITECTURE
// Source of truth: 2026-09-03 Strata Noble business model and brand blueprint
// Last synced: 2026-09-03
// ============================================================================

// --- TIER 0: ENTRY PRODUCTS (entry path) ---
export const ENTRY_PRODUCTS = [
  {
    id: 'ai-fit-call',
    name: 'AI Fit Call',
    price: 0,
    priceLabel: 'Free',
    period: 'one-time',
    description:
      'A short qualification call to decide whether there is one recurring office task worth improving with AI.',
    deliverables: [
      '15 to 20 minute qualification call',
      'One likely workflow candidate',
      'Clear next step or no-fit answer',
    ],
    cta: 'Book an AI Fit Call',
    ctaLink: '/contact?service=ai-fit-call',
  },
] as const;

// --- TIER 1: ASSESSMENTS ---
export const ASSESSMENTS = [
  {
    id: 'ai-operations-review',
    name: 'AI Operations Review',
    price: 500,
    priceLabel: '$500',
    period: 'one-time',
    timeline: '3 to 5 business days',
    description:
      'A focused review of one office process. You get a process map, top opportunities, risk notes, and a fixed-scope setup recommendation.',
    deliverables: [
      'One process map',
      'Top three AI opportunities',
      'Risk notes and human-review needs',
      'One recommended setup',
      'Fixed-scope proposal',
    ],
    cta: 'Book the Review',
    ctaLink: '/contact?service=ai-operations-review',
  },
] as const;

// --- TIER 2: AI WORKDAY SETUPS ---
export const CONSULTING_SERVICES = [
  {
    id: 'first-ai-workday-setup',
    name: 'First AI Workday Setup',
    price: 2000,
    priceLabel: '$2,000',
    period: 'one-time',
    timeline: '7 to 10 business days',
    entryPoint: 'AI Fit Call or AI Operations Review',
    description:
      'One safe AI-assisted routine for a repeated office task, configured around your source material, tested with real examples, taught to your team, and handed over.',
    deliverables: [
      'One selected recurring task',
      'Approved prompts, templates, and reusable instructions',
      'Human-review and approval rules',
      'Representative testing',
      'Team training session',
      'One-page operating playbook',
      'AI Use Guide',
      '14-day stabilization support',
    ],
    cta: 'Start with a Fit Call',
    ctaLink: '/contact?service=ai-fit-call',
  },
  {
    id: 'ai-workday-expansion',
    name: 'AI Workday Expansion',
    price: 1250,
    priceLabel: '$1,250-$2,500',
    period: 'one-time',
    timeline: 'Scoped after first setup',
    description:
      'One additional validated AI-assisted routine using the same bounded handoff model after the first setup is working.',
    deliverables: [
      'One additional recurring task',
      'Configured prompts and templates',
      'Review rules',
      'Testing and training',
      'Updated AI Use Guide',
    ],
    cta: 'Discuss Expansion',
    ctaLink: '/contact?service=ai-workday-expansion',
  },
] as const;

// --- TIER 3: SUPPORT PLANS (recurring) ---
export const SUPPORT_PLANS = [
  {
    id: 'quarterly-ai-tune-up',
    name: 'Quarterly AI Tune-Up',
    price: 750,
    priceLabel: '$750',
    period: '/quarter',
    commitment: 'Quarterly, scoped each cycle',
    description:
      'A bounded quarterly review to check adoption, improve prompts or process steps, update use rules, and make one practical optimization.',
    deliverables: [
      'Adoption review',
      'Prompt and process improvements',
      'Updated use rules',
      'One bounded optimization',
    ],
    cta: 'Plan a Tune-Up',
    ctaLink: '/contact?service=quarterly-ai-tune-up',
  },
] as const;

// --- Q S
// --- Q SUITE PLATFORM (recurring platform licensing) ---
export const QSUITE_PLANS = [
  {
    id: 'qsuite-basic',
    name: 'Basic',
    modules: '1-2 active modules',
    price: 297,
    priceLabel: '$297',
    period: '/month',
    description: 'Access to 1-2 Q SUITE modules configured for your business.',
  },
  {
    id: 'qsuite-standard',
    name: 'Standard',
    modules: '3-4 active modules',
    price: 597,
    priceLabel: '$597',
    period: '/month',
    popular: true,
    description: 'Access to 3-4 Q SUITE modules with expanded operational coverage.',
  },
  {
    id: 'qsuite-full',
    name: 'Full Suite',
    modules: 'All 5 modules',
    price: 997,
    priceLabel: '$997',
    period: '/month',
    description: 'Complete Q SUITE: Q-CC, Q-ICMS, Q-ARI, Q-REIL, Q-VAULT.',
    note: 'Included free with Operations Command',
  },
] as const;

// --- Q SUITE MODULES ---
export const QSUITE_MODULES = [
  { id: 'q-cc', name: 'Q-CC', fullName: 'Client Command', description: 'Intake, routing, CRM' },
  { id: 'q-icms', name: 'Q-ICMS', fullName: 'Integrated Client Management System', description: 'Client lifecycle management' },
  { id: 'q-ari', name: 'Q-ARI', fullName: 'Automated Revenue Intelligence', description: 'Revenue insights, pipeline analytics' },
  { id: 'q-reil', name: 'Q-REIL', fullName: 'Real Estate & Industry Logic', description: 'Industry-specific workflows' },
  { id: 'q-vault', name: 'Q-VAULT', fullName: 'Secure Delivery Vault', description: 'Proof of work, audit trail, secure document delivery' },
] as const;

// --- ACHIEVERY PRODUCT (standalone application) ---
export const ACHIEVERY_TIERS = [
  {
    id: 'achievery-free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    features: [
      'Core goal tracking',
      'Daily activity logging',
      'Basic progress dashboard',
      '1 active goal',
    ],
  },
  {
    id: 'achievery-pro',
    name: 'ACHIEVERY Pro',
    price: 9.99,
    priceLabel: '$9.99',
    period: '/month',
    annualPrice: 99,
    annualLabel: '$99/year',
    popular: true,
    features: [
      'Unlimited goals',
      'Advanced analytics & progress insights',
      'Custom workflows & templates',
      'Priority support',
      'No ads',
    ],
  },
] as const;

export const ACHIEVERY_IAP = [
  { id: 'qsuite-integration', name: 'Q SUITE Integration Pack', price: 29.99, description: 'Connect ACHIEVERY to Q SUITE modules' },
  { id: 'template-real-estate', name: 'Real Estate Template Pack', price: 9.99, description: 'Real estate-specific workflows and dashboards' },
  { id: 'template-home-service', name: 'Home Service Template Pack', price: 9.99, description: 'Home service-specific workflows and dashboards' },
  { id: 'template-consulting', name: 'Consulting Template Pack', price: 9.99, description: 'Consulting-specific workflows and dashboards' },
  { id: 'coaching-session', name: 'Strategy Coaching Session', price: 149, description: 'Live 60-min session with SN consulting' },
  { id: 'custom-dashboard', name: 'Custom Dashboard Build', price: 49.99, description: 'Personalized analytics dashboard' },
] as const;

// --- ECOSYSTEM PROOF (credibility signals, not purchasable) ---
export const ECOSYSTEM_PROOF = [
  {
    id: 'direct-cuts',
    name: 'Direct Cuts',
    type: 'Production Marketplace',
    proves: 'Full barber marketplace built end-to-end. Stripe Connect payouts, real-time booking, subscription management, and mobile-ready portal. Live in production.',
    link: 'https://direct-cuts.com',
  },
  {
    id: 'mah',
    name: 'E-Commerce Client',
    type: 'Full-Stack Implementation',
    proves: 'Shopify storefront, Supabase backend, intake automation, and Vercel deployment. Delivered with full documentation and a verification receipt the client keeps.',
  },
  {
    id: 'dslv',
    name: 'Institutional Advisory Client',
    type: 'Retainer Engagement',
    proves: 'Revenue pipeline and CRM infrastructure for a firm operating at institutional scale. Ongoing operations support with monthly reporting.',
  },
  {
    id: 'dna',
    name: 'DNA Creator Intelligence',
    type: 'Intelligence Platform',
    proves: 'Original data product built and shipped. Pattern analysis, automated reporting pipeline, and a client-facing dashboard. Built from scratch, not a template.',
  },
  {
    id: 'q-reil',
    name: 'Summit Realty LV',
    type: 'Vertical CRM Deployment',
    proves: 'Q Suite deployed for a real estate operation. Lead intake, Gmail integration, deal tracking, and automated follow-up. Running on the same stack we use internally.',
  },
] as const;

// --- TYPE EXPORTS ---
export type EntryProduct = (typeof ENTRY_PRODUCTS)[number];
export type Assessment = (typeof ASSESSMENTS)[number];
export type ConsultingService = (typeof CONSULTING_SERVICES)[number];
export type SupportPlan = (typeof SUPPORT_PLANS)[number];
export type QSuitePlan = (typeof QSUITE_PLANS)[number];
export type QSuiteModule = (typeof QSUITE_MODULES)[number];
export type AchieveryTier = (typeof ACHIEVERY_TIERS)[number];
export type AchieveryIap = (typeof ACHIEVERY_IAP)[number];
export type EcosystemProof = (typeof ECOSYSTEM_PROOF)[number];

export type CatalogEntry =
  | EntryProduct
  | Assessment
  | ConsultingService
  | SupportPlan
  | QSuitePlan
  | AchieveryTier;

export function getOfferingById(id: string): CatalogEntry | undefined {
  return (
    ENTRY_PRODUCTS.find((s) => s.id === id) ??
    ASSESSMENTS.find((s) => s.id === id) ??
    CONSULTING_SERVICES.find((s) => s.id === id) ??
    SUPPORT_PLANS.find((s) => s.id === id) ??
    QSUITE_PLANS.find((s) => s.id === id) ??
    ACHIEVERY_TIERS.find((s) => s.id === id)
  );
}

export function isEntryProduct(o: CatalogEntry): o is EntryProduct {
  return ENTRY_PRODUCTS.some((s) => s.id === o.id);
}
export function isAssessment(o: CatalogEntry): o is Assessment {
  return ASSESSMENTS.some((s) => s.id === o.id);
}
export function isConsultingService(o: CatalogEntry): o is ConsultingService {
  return CONSULTING_SERVICES.some((s) => s.id === o.id);
}
export function isSupportPlan(o: CatalogEntry): o is SupportPlan {
  return SUPPORT_PLANS.some((s) => s.id === o.id);
}
export function isQSuitePlan(o: CatalogEntry): o is QSuitePlan {
  return QSUITE_PLANS.some((s) => s.id === o.id);
}
export function isAchieveryTier(o: CatalogEntry): o is AchieveryTier {
  return ACHIEVERY_TIERS.some((s) => s.id === o.id);
}
