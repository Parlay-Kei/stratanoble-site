// ============================================================================
// STRATA NOBLE - CANONICAL OFFER ARCHITECTURE
// Source of truth: SN-BRAND-COMMERCIAL-ARCHITECTURE.md (SN-BCA-001 v1.0.0)
// Supersedes: SN-OFFER-ARCHITECTURE.md v2.1.0 for naming and framing
// Last synced: 2026-05-03
// ============================================================================

// --- CONSULTING SERVICES (one-time engagements) ---
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

// --- Q SUITE PLATFORM (recurring platform licensing) ---
export const QSUITE_PLANS = [
  {
    id: 'qsuite-basic',
    name: 'Basic',
    modules: '1–2 active modules',
    price: 297,
    priceLabel: '$297',
    period: '/month',
    description: 'Access to 1–2 Q SUITE modules configured for your business.',
  },
  {
    id: 'qsuite-standard',
    name: 'Standard',
    modules: '3–4 active modules',
    price: 597,
    priceLabel: '$597',
    period: '/month',
    popular: true,
    description: 'Access to 3–4 Q SUITE modules with expanded operational coverage.',
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
export type ConsultingService = (typeof CONSULTING_SERVICES)[number];
export type QSuitePlan = (typeof QSUITE_PLANS)[number];
export type QSuiteModule = (typeof QSUITE_MODULES)[number];
export type AchieveryTier = (typeof ACHIEVERY_TIERS)[number];
export type AchieveryIap = (typeof ACHIEVERY_IAP)[number];
export type EcosystemProof = (typeof ECOSYSTEM_PROOF)[number];

export type CatalogEntry =
  | ConsultingService
  | QSuitePlan
  | AchieveryTier;

/** Resolve a catalog id for checkout modal / deep links (no Stripe price IDs in v2; sales via contact). */
export function getOfferingById(id: string): CatalogEntry | undefined {
  return (
    CONSULTING_SERVICES.find((s) => s.id === id) ??
    QSUITE_PLANS.find((s) => s.id === id) ??
    ACHIEVERY_TIERS.find((s) => s.id === id)
  );
}

export function isConsultingService(o: CatalogEntry): o is ConsultingService {
  return CONSULTING_SERVICES.some((s) => s.id === o.id);
}

export function isQSuitePlan(o: CatalogEntry): o is QSuitePlan {
  return QSUITE_PLANS.some((s) => s.id === o.id);
}

export function isAchieveryTier(o: CatalogEntry): o is AchieveryTier {
  return ACHIEVERY_TIERS.some((s) => s.id === o.id);
}
