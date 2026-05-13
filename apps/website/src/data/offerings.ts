// ============================================================================
// STRATA NOBLE - CANONICAL OFFER ARCHITECTURE
// Source of truth: SN-BRAND-COMMERCIAL-ARCHITECTURE.md (SN-BCA-001 v1.1.0)
// Last synced: 2026-05-13
// ============================================================================

// --- TIER 0: ENTRY PRODUCTS (productized deliverables, $50–$199) ---
export const ENTRY_PRODUCTS = [
  {
    id: 'business-tracker',
    name: 'Google Sheets Business Tracker',
    price: 50,
    priceLabel: 'From $50',
    period: 'one-time',
    description:
      'A clean, pre-configured Google Sheets tracker built for your business. Track jobs, clients, revenue, or the metrics that matter most — set up and ready to use.',
    deliverables: [
      'Custom-built Google Sheets tracker',
      'Setup and configuration',
      'Usage guide',
    ],
    cta: 'Get Started',
    ctaLink: '/contact?service=business-tracker',
  },
  {
    id: 'process-cleanup',
    name: 'Small Business Process Clean-Up',
    price: 75,
    priceLabel: 'From $75',
    period: 'one-time',
    description:
      "Take one messy area of your business and organize it. Map the current flow, remove what's redundant, and install a cleaner process you can actually follow.",
    deliverables: [
      'Current-state process map',
      'Redesigned process',
      'Simple SOP document',
    ],
    cta: 'Get Started',
    ctaLink: '/contact?service=process-cleanup',
  },
  {
    id: 'service-menu-cleanup',
    name: 'Service Menu Cleanup',
    price: 75,
    priceLabel: 'From $75',
    period: 'one-time',
    description:
      "Clarify and restructure your service offerings so customers understand what you do, what it costs, and how to hire you. Confused buyers don't buy.",
    deliverables: [
      'Restructured service menu',
      'Clear pricing presentation',
      'Revised offer copy',
    ],
    cta: 'Get Started',
    ctaLink: '/contact?service=service-menu-cleanup',
  },
  {
    id: 'customer-follow-up',
    name: 'Customer Follow-Up Setup',
    price: 99,
    priceLabel: 'From $99',
    period: 'one-time',
    description:
      'Install a simple, working follow-up system so no lead or client falls through the cracks. Templates, triggers, and a repeatable process — delivered and ready to use.',
    deliverables: [
      'Follow-up sequence (3–5 touchpoints)',
      'Message templates',
      'Trigger and timing guide',
    ],
    cta: 'Get Started',
    ctaLink: '/contact?service=customer-follow-up',
  },
  {
    id: 'starter-kit',
    name: 'Simple Business Starter Kit',
    price: 199,
    priceLabel: 'From $199',
    period: 'one-time',
    description:
      'The essential operational foundation for a small service business. Intake process, follow-up system, service menu, and a simple tracker — organized and ready to run.',
    deliverables: [
      'Intake process setup',
      'Follow-up sequence',
      'Service menu cleanup',
      'Business tracker',
    ],
    cta: 'Get Started',
    ctaLink: '/contact?service=starter-kit',
  },
] as const;

// --- TIER 1: ASSESSMENTS ($149–$397) ---
// Note: Business Systems Audit ($149) is mirrored on StrataNoble.com and HelloSkip marketplace.
export const ASSESSMENTS = [
  {
    id: 'business-systems-audit',
    name: 'Business Systems Audit',
    price: 149,
    priceLabel: '$149',
    period: 'one-time',
    timeline: '48 hours',
    description:
      "A focused review of your current business systems and processes. Identify what's working, what's broken, and what to fix first — delivered in 48 hours.",
    deliverables: [
      'Systems review report',
      'Prioritized fix list',
      'Recommended next steps',
    ],
    cta: 'Book an Audit',
    ctaLink: '/contact?service=business-systems-audit',
  },
  {
    id: 'small-business-checkup',
    name: 'Small Business Checkup',
    price: 397,
    priceLabel: '$397',
    period: 'one-time',
    timeline: '3–5 business days',
    description:
      'A practical operational review for service businesses. Covers intake, follow-up systems, service delivery, and reporting — you get a clear picture of where things stand and a prioritized fix list.',
    deliverables: [
      'Operational review report',
      'Gap analysis',
      'Prioritized action plan',
      'ProofLoop receipt',
    ],
    cta: 'Book a Checkup',
    ctaLink: '/contact?service=small-business-checkup',
  },
] as const;

// --- TIER 2: CONSULTING SERVICES (scoped engagements, $997–$4,997) ---
export const CONSULTING_SERVICES = [
  {
    id: 'systems-audit',
    name: 'Systems Audit',
    price: 997,
    priceLabel: '$997',
    period: 'one-time',
    timeline: '48–72 hours',
    entryPoint: 'Free 30-minute diagnostic call',
    description:
      "Audit the business's current operational infrastructure — how work flows, where it breaks, what's missing, what's redundant. Identify the top 3–5 structural issues and deliver a prioritized action plan.",
    deliverables: [
      'Systems audit report',
      'Prioritized fix list',
      'Recommended engagement path',
      'ProofLoop receipt',
    ],
    cta: 'Book a Free Diagnostic',
    ctaLink: '/contact?service=diagnostic',
  },
  {
    id: '48-hour-fix',
    name: '48-Hour Operations Fix',
    price: 1250,
    priceLabel: '$1,250',
    period: 'one-time',
    timeline: '48 hours',
    description:
      'A fast fix for one broken business process. Identify the failure point, redesign the flow, implement the fix, and verify it works — delivered in 48 hours.',
    deliverables: [
      'Process diagnosis',
      'Redesigned and implemented fix',
      'Verification report',
      'ProofLoop receipt',
    ],
    cta: 'Get a Fast Fix',
    ctaLink: '/contact?service=48-hour-fix',
  },
  {
    id: 'process-improvement-sprint',
    name: 'Process Improvement Sprint',
    price: 2497,
    priceLabel: '$2,497',
    period: 'one-time',
    timeline: '10 business days',
    description:
      'Take one broken or underperforming process and rebuild it. Map current state, design target state, implement the fix, install tracking, verify improvement. Scoped to a single workflow or process area.',
    deliverables: [
      'Redesigned process (implemented)',
      'Before/after metrics',
      'SOPs for the new process',
      'ProofLoop receipt',
    ],
    cta: 'Start a Sprint',
    ctaLink: '/contact?service=process-improvement-sprint',
  },
  {
    id: 'service-system-buildout',
    name: 'Service System Buildout',
    price: 3500,
    priceLabel: '$3,500',
    period: 'one-time',
    timeline: '14 days',
    description:
      'A practical system buildout for service businesses. Includes intake, scheduling, follow-up, and delivery infrastructure — installed and configured for how your business actually works.',
    deliverables: [
      'Intake system (installed)',
      'Scheduling and follow-up workflows',
      'Delivery process infrastructure',
      'SOPs',
      'ProofLoop receipt',
    ],
    cta: 'Start a Buildout',
    ctaLink: '/contact?service=service-system-buildout',
  },
  {
    id: 'operations-buildout',
    name: 'Operations Buildout',
    price: 4997,
    priceLabel: '$4,997',
    period: 'one-time',
    timeline: '21 days',
    description:
      'End-to-end operational infrastructure installation. Typical scope includes workflow design, system configuration, automation setup, reporting installation, SOPs, and team training. Scoped to your business, delivered in 21 days.',
    deliverables: [
      'Working operational systems (installed and configured)',
      'SOPs',
      'Reporting dashboards',
      'ProofLoop receipts',
      'ANX Vault delivery',
    ],
    cta: 'Start a Buildout',
    ctaLink: '/contact?service=operations-buildout',
  },
] as const;

// --- TIER 3: SUPPORT PLANS (recurring) ---
export const SUPPORT_PLANS = [
  {
    id: 'operations-care-plan',
    name: 'Operations Care Plan',
    price: 500,
    priceLabel: '$500',
    period: '/month',
    commitment: 'Month-to-month',
    description:
      'Monthly support to maintain, improve, and adjust your business systems. Includes system monitoring, one strategy check-in per month, and minor adjustments to keep things running smoothly.',
    deliverables: [
      'Monthly system monitoring',
      'One 30-min strategy check-in',
      'Minor system adjustments',
      'Monthly status report',
    ],
    cta: 'Get on the Care Plan',
    ctaLink: '/contact?service=operations-care-plan',
  },
  {
    id: 'operations-command',
    name: 'Operations Command',
    price: 1497,
    priceLabel: '$1,497',
    period: '/month',
    commitment: '3-month minimum, month-to-month after',
    description:
      'Monthly monitoring and optimization. One 60-min strategy call per month. Priority support with next-business-day response. Monthly performance report. Minor system adjustments up to 4 hours per month. Full Suite Q SUITE access included.',
    deliverables: [
      'Monthly system monitoring and optimization',
      'One 60-min strategy call per month',
      'Priority support (next-business-day response)',
      'Monthly performance report',
      'Minor system adjustments (up to 4 hrs/month)',
      'Q SUITE Full Suite access included',
    ],
    cta: 'Apply for Operations Command',
    ctaLink: '/contact?service=operations-command',
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
