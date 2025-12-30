#!/usr/bin/env tsx

/**
 * Seed script for Paralegal Contract Agent
 *
 * Populates the database with initial templates, clauses, and playbook rules.
 * Run with: npm run seed (or: tsx scripts/seed-data.ts)
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// Template Data
// ============================================================================

interface TemplateData {
  document_type: string;
  template_key: string;
  template_name: string;
  description: string;
  version: string;
  risk_profile: string;
  jurisdiction: string;
  content: string;
  sections: object[];
  variables: object[];
  required_clauses: string[];
  optional_clauses: string[];
  is_active: boolean;
}

async function loadTemplates(): Promise<TemplateData[]> {
  const templatesDir = join(__dirname, '..', 'data', 'templates');
  const templates: TemplateData[] = [];

  const templateFiles = [
    { file: 'msa-standard.md', type: 'MSA', name: 'Master Services Agreement', desc: 'Framework agreement for ongoing engagements' },
    { file: 'sow-template.md', type: 'SOW', name: 'Statement of Work', desc: 'Specific project scope, deliverables, and timelines' },
    { file: 'change-order.md', type: 'CHANGE_ORDER', name: 'Change Order', desc: 'Modifications to existing SOW' },
    { file: 'nda-mutual.md', type: 'NDA', name: 'Non-Disclosure Agreement (Mutual)', desc: 'Mutual confidentiality protection' },
    { file: 'ip-addendum.md', type: 'IP_ADDENDUM', name: 'IP Addendum', desc: 'Intellectual property ownership details' },
    { file: 'payment-policy.md', type: 'PAYMENT_POLICY', name: 'Payment Policy', desc: 'Payment terms and procedures' },
  ];

  for (const { file, type, name, desc } of templateFiles) {
    try {
      const content = await fs.readFile(join(templatesDir, file), 'utf-8');

      // Extract variables from template
      const variableMatches = content.match(/\{\{([A-Z_]+)\}\}/g) || [];
      const variables = [...new Set(variableMatches.map(v => v.replace(/\{\{|\}\}/g, '')))]
        .map(name => ({ name, type: 'string', required: true }));

      // Extract sections from template
      const sectionMatches = content.match(/^##\s+(.+)$/gm) || [];
      const sections = sectionMatches.map((s, i) => ({
        id: `section-${i + 1}`,
        title: s.replace(/^##\s+/, ''),
        order: i + 1,
        required: true,
      }));

      templates.push({
        document_type: type,
        template_key: `${type.toLowerCase()}_standard_v1`,
        template_name: name,
        description: desc,
        version: '1.0',
        risk_profile: 'standard',
        jurisdiction: 'US-NV',
        content,
        sections,
        variables,
        required_clauses: [],
        optional_clauses: [],
        is_active: true,
      });
    } catch (error) {
      console.warn(`Warning: Could not load template ${file}:`, error);
    }
  }

  return templates;
}

// ============================================================================
// Clause Data
// ============================================================================

const clauses = [
  // IP Ownership Clauses
  {
    topic: 'IP_OWNERSHIP',
    clause_key: 'ip_provider_retains_standard',
    clause_name: 'Provider Retains Pre-existing IP',
    risk_profile: 'standard',
    jurisdiction: 'US-NV',
    when_to_use: 'Standard engagement where provider uses existing tools and frameworks',
    text: `Provider retains all right, title, and interest in and to all Pre-existing IP,
including but not limited to methodologies, frameworks, tools, templates, and reusable
code components that exist prior to or are developed independently of this Agreement.
Client receives a perpetual, non-exclusive, royalty-free license to use Provider's
Pre-existing IP solely to the extent incorporated into the Deliverables.`,
    variables: [],
    alternatives: [
      { clauseKey: 'ip_client_owns_standard', whenToUse: 'When client requires full IP ownership' },
    ],
    is_active: true,
  },
  {
    topic: 'IP_OWNERSHIP',
    clause_key: 'ip_client_owns_standard',
    clause_name: 'Client Owns All Deliverables',
    risk_profile: 'customer_friendly',
    jurisdiction: 'US-NV',
    when_to_use: 'When client negotiates for full ownership of all work product',
    text: `Upon full payment of all fees due, Client shall own all right, title, and interest
in and to all Deliverables created specifically for Client under this Agreement, including
all intellectual property rights therein. Provider hereby assigns to Client all such rights
and agrees to execute any documents necessary to perfect Client's ownership.`,
    variables: [],
    alternatives: [],
    is_active: true,
  },

  // Liability Clauses
  {
    topic: 'LIMITATION_OF_LIABILITY',
    clause_key: 'liability_cap_fees_paid',
    clause_name: 'Liability Cap - Fees Paid',
    risk_profile: 'standard',
    jurisdiction: 'US-NV',
    when_to_use: 'Standard limitation based on fees paid in prior 12 months',
    text: `IN NO EVENT SHALL EITHER PARTY'S TOTAL LIABILITY TO THE OTHER PARTY FOR ALL
DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE TOTAL FEES PAID BY CLIENT TO PROVIDER
UNDER THIS AGREEMENT DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOST PROFITS, LOST DATA,
BUSINESS INTERRUPTION, OR LOSS OF GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
    variables: [
      { name: 'LIABILITY_PERIOD_MONTHS', type: 'number', default: 12 },
    ],
    alternatives: [],
    is_active: true,
  },

  // Confidentiality Clauses
  {
    topic: 'CONFIDENTIALITY',
    clause_key: 'confidentiality_mutual',
    clause_name: 'Mutual Confidentiality',
    risk_profile: 'standard',
    jurisdiction: 'US-NV',
    when_to_use: 'Standard mutual confidentiality for most engagements',
    text: `Each party agrees to hold the other party's Confidential Information in strict
confidence and not to disclose such information to any third party without prior written
consent. "Confidential Information" means any non-public information disclosed by either
party that is designated as confidential or that reasonably should be understood to be
confidential given the nature of the information.

Confidential Information does not include information that: (a) is or becomes publicly
available through no fault of the receiving party; (b) was rightfully in the receiving
party's possession prior to disclosure; (c) is rightfully obtained from a third party
without restriction; or (d) is independently developed without use of the disclosing
party's Confidential Information.

This confidentiality obligation shall survive termination of this Agreement for a period
of {{CONFIDENTIALITY_YEARS}} years.`,
    variables: [
      { name: 'CONFIDENTIALITY_YEARS', type: 'number', default: 3 },
    ],
    alternatives: [],
    is_active: true,
  },

  // Payment Terms Clauses
  {
    topic: 'PAYMENT_TERMS',
    clause_key: 'payment_milestone_deposit',
    clause_name: 'Milestone Payments with Deposit',
    risk_profile: 'vendor_friendly',
    jurisdiction: 'US-NV',
    when_to_use: 'When requiring upfront deposit and milestone-based payments',
    text: `Client shall pay an initial deposit of {{DEPOSIT_PERCENT}}% of the total
project fee upon execution of this Agreement. Remaining fees shall be paid according
to the milestone schedule set forth in the applicable Statement of Work.

All invoices are due and payable within {{NET_DAYS}} days of invoice date. Late payments
shall accrue interest at the rate of {{LATE_FEE_PERCENT}}% per month or the maximum rate
permitted by law, whichever is less.

Provider reserves the right to suspend work upon written notice if any payment is more
than {{SUSPENSION_DAYS}} days past due.`,
    variables: [
      { name: 'DEPOSIT_PERCENT', type: 'number', default: 25 },
      { name: 'NET_DAYS', type: 'number', default: 30 },
      { name: 'LATE_FEE_PERCENT', type: 'number', default: 1.5 },
      { name: 'SUSPENSION_DAYS', type: 'number', default: 30 },
    ],
    alternatives: [],
    is_active: true,
  },

  // Termination Clauses
  {
    topic: 'TERMINATION',
    clause_key: 'termination_convenience_mutual',
    clause_name: 'Termination for Convenience',
    risk_profile: 'standard',
    jurisdiction: 'US-NV',
    when_to_use: 'Standard termination clause allowing either party to exit',
    text: `Either party may terminate this Agreement for convenience upon {{NOTICE_DAYS}}
days' prior written notice to the other party. Upon termination:

(a) Client shall pay Provider for all services performed and expenses incurred through
the effective date of termination;
(b) Provider shall deliver to Client all completed and in-progress Deliverables;
(c) Each party shall return or destroy the other party's Confidential Information;
(d) Any provisions that by their nature should survive termination shall so survive.`,
    variables: [
      { name: 'NOTICE_DAYS', type: 'number', default: 30 },
    ],
    alternatives: [],
    is_active: true,
  },

  // Dispute Resolution Clauses
  {
    topic: 'DISPUTE_RESOLUTION',
    clause_key: 'dispute_mediation_then_arbitration',
    clause_name: 'Mediation then Arbitration',
    risk_profile: 'standard',
    jurisdiction: 'US-NV',
    when_to_use: 'Preferred dispute resolution avoiding litigation',
    text: `Any dispute arising out of or relating to this Agreement shall first be
submitted to mediation before a mutually agreed mediator. If mediation is unsuccessful
within {{MEDIATION_DAYS}} days, the dispute shall be resolved by binding arbitration
administered by JAMS under its Comprehensive Arbitration Rules, with the arbitration
held in {{ARBITRATION_LOCATION}}. The arbitrator's decision shall be final and binding.

Each party shall bear its own costs and attorneys' fees, provided that the prevailing
party may recover reasonable attorneys' fees and costs from the non-prevailing party.`,
    variables: [
      { name: 'MEDIATION_DAYS', type: 'number', default: 60 },
      { name: 'ARBITRATION_LOCATION', type: 'string', default: 'Las Vegas, Nevada' },
    ],
    alternatives: [],
    is_active: true,
  },

  // Governing Law Clauses
  {
    topic: 'GOVERNING_LAW',
    clause_key: 'governing_law_nevada',
    clause_name: 'Nevada Governing Law',
    risk_profile: 'standard',
    jurisdiction: 'US-NV',
    when_to_use: 'Default for StrataNoble contracts (Nevada-based)',
    text: `This Agreement shall be governed by and construed in accordance with the
laws of the State of Nevada, without regard to its conflict of laws principles. The
parties consent to the exclusive jurisdiction of the state and federal courts located
in Clark County, Nevada for any legal proceedings arising from this Agreement.`,
    variables: [],
    alternatives: [],
    is_active: true,
  },
];

// ============================================================================
// Playbook Rules Data
// ============================================================================

async function loadPlaybookRules(): Promise<object[]> {
  const playbookPath = join(__dirname, '..', 'data', 'playbook', 'stratanoble-playbook.json');

  try {
    const content = await fs.readFile(playbookPath, 'utf-8');
    const playbook = JSON.parse(content);

    return playbook.rules.map((rule: any) => ({
      topic: rule.topic,
      rule_key: rule.ruleKey,
      jurisdiction: rule.jurisdiction || null,
      default_position: rule.defaultPosition,
      acceptable_alternatives: rule.acceptableAlternatives || null,
      unacceptable_positions: rule.unacceptablePositions || null,
      escalation_required: rule.escalationRequired || false,
      escalation_reason: rule.escalationReason || null,
      notes_for_ai: rule.notesForAI || null,
      priority: rule.priority || 50,
      is_active: true,
    }));
  } catch (error) {
    console.warn('Could not load playbook rules:', error);
    return [];
  }
}

// ============================================================================
// Sample Deal Data
// ============================================================================

const sampleDeal = {
  client_name: 'Acme Corporation',
  client_legal_name: 'Acme Corporation, Inc.',
  client_address: {
    street1: '123 Business Ave',
    street2: 'Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'USA',
  },
  client_contact: {
    name: 'John Smith',
    email: 'john.smith@acme.com',
    phone: '+1 (415) 555-1234',
    title: 'VP of Engineering',
  },
  governing_law: 'US-NV',
  services_description: 'Custom software development and AI integration services for internal operations platform.',
  deliverables: [
    'Web application with admin dashboard',
    'REST API backend',
    'AI-powered analytics module',
    'Technical documentation',
    'Deployment scripts and infrastructure as code',
  ],
  milestones: [
    {
      id: 'milestone-1',
      name: 'Phase 1: Discovery & Design',
      description: 'Requirements gathering, system design, and architecture planning',
      dueDate: '2025-02-15',
      paymentAmount: 15000,
      deliverables: ['Requirements document', 'System architecture', 'UI/UX mockups'],
    },
    {
      id: 'milestone-2',
      name: 'Phase 2: Core Development',
      description: 'Backend API development and database implementation',
      dueDate: '2025-03-31',
      paymentAmount: 25000,
      deliverables: ['REST API', 'Database schema', 'Authentication system'],
    },
    {
      id: 'milestone-3',
      name: 'Phase 3: Frontend & Integration',
      description: 'Web application frontend and AI module integration',
      dueDate: '2025-05-15',
      paymentAmount: 25000,
      deliverables: ['Web application', 'AI analytics module', 'Integration tests'],
    },
    {
      id: 'milestone-4',
      name: 'Phase 4: Deployment & Handoff',
      description: 'Production deployment, documentation, and knowledge transfer',
      dueDate: '2025-06-15',
      paymentAmount: 10000,
      deliverables: ['Deployed application', 'Documentation', 'Training session'],
    },
  ],
  pricing_model: 'fixed_fee',
  payment_terms: {
    depositPercent: 25,
    milestonePayments: true,
    netDays: 30,
    lateFeePercent: 1.5,
    currency: 'USD',
  },
  ip_model: 'provider_retains',
  start_date: '2025-01-15',
  end_date: '2025-06-15',
  renewal_terms: null,
  special_terms: 'Client prefers weekly status calls. Provider to use client-specified cloud infrastructure (AWS).',
  risk_factors: [
    {
      factor: 'Integration with legacy systems',
      severity: 'medium',
      mitigation: 'Allocated additional time for discovery phase',
    },
    {
      factor: 'AI model training data availability',
      severity: 'low',
      mitigation: 'Client to provide historical data by Phase 2 start',
    },
  ],
  metadata: {
    source: 'Seed data for testing',
    salesRep: 'Demo User',
  },
};

// ============================================================================
// Seed Functions
// ============================================================================

async function seedTemplates(): Promise<void> {
  console.log('Seeding templates...');

  const templates = await loadTemplates();

  for (const template of templates) {
    const { error } = await supabase
      .from('contract_templates')
      .upsert(template, { onConflict: 'template_key' });

    if (error) {
      console.error(`Failed to seed template ${template.template_key}:`, error.message);
    } else {
      console.log(`  ✓ ${template.template_name}`);
    }
  }
}

async function seedClauses(): Promise<void> {
  console.log('Seeding clauses...');

  for (const clause of clauses) {
    const { error } = await supabase
      .from('clause_library')
      .upsert(clause, { onConflict: 'clause_key' });

    if (error) {
      console.error(`Failed to seed clause ${clause.clause_key}:`, error.message);
    } else {
      console.log(`  ✓ ${clause.clause_name}`);
    }
  }
}

async function seedPlaybookRules(): Promise<void> {
  console.log('Seeding playbook rules...');

  const rules = await loadPlaybookRules();

  for (const rule of rules) {
    const { error } = await supabase
      .from('playbook_rules')
      .upsert(rule, { onConflict: 'rule_key' });

    if (error) {
      console.error(`Failed to seed rule ${(rule as any).rule_key}:`, error.message);
    } else {
      console.log(`  ✓ ${(rule as any).topic}: ${(rule as any).rule_key}`);
    }
  }
}

async function seedSampleDeal(): Promise<void> {
  console.log('Seeding sample deal...');

  const { data, error } = await supabase
    .from('deals')
    .insert(sampleDeal)
    .select()
    .single();

  if (error) {
    console.error('Failed to seed sample deal:', error.message);
  } else {
    console.log(`  ✓ Sample deal created: ${data.id}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Paralegal Contract Agent - Database Seed');
  console.log('='.repeat(60));
  console.log();

  try {
    await seedTemplates();
    console.log();

    await seedClauses();
    console.log();

    await seedPlaybookRules();
    console.log();

    await seedSampleDeal();
    console.log();

    console.log('='.repeat(60));
    console.log('Seed completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
