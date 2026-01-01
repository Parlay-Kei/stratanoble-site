#!/usr/bin/env node

/**
 * Seed Contract System Database
 *
 * This script seeds the paralegal contract system with:
 * - Contract templates
 * - Clause library
 * - Playbook rules
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTemplates() {
  console.log('Seeding contract templates...');

  const templates = [
    {
      document_type: 'MSA',
      template_key: 'msa_standard_nv',
      template_name: 'Master Service Agreement - Standard (Nevada)',
      description: 'Standard MSA for consulting engagements in Nevada',
      version: '1.0',
      risk_profile: 'standard',
      jurisdiction: 'US-NV',
      content: await fs.readFile(path.join(__dirname, '../data/templates/msa-standard.md'), 'utf-8'),
      sections: [
        { id: '1', title: 'Services', order: 1, required: true },
        { id: '2', title: 'Compensation and Payment', order: 2, required: true },
        { id: '3', title: 'Intellectual Property Rights', order: 3, required: true },
        { id: '4', title: 'Confidentiality', order: 4, required: true },
        { id: '5', title: 'Warranties and Disclaimers', order: 5, required: true },
        { id: '6', title: 'Limitation of Liability', order: 6, required: true },
        { id: '7', title: 'Indemnification', order: 7, required: true },
        { id: '8', title: 'Term and Termination', order: 8, required: true },
        { id: '9', title: 'General Provisions', order: 9, required: true }
      ],
      variables: [
        { name: 'effective_date', type: 'date', required: true, description: 'Agreement effective date' },
        { name: 'client_legal_name', type: 'string', required: true, description: 'Client legal entity name' },
        { name: 'client_address', type: 'string', required: true, description: 'Client address' },
        { name: 'provider_address', type: 'string', required: false, default: 'Nevada, USA', description: 'Provider address' },
        { name: 'deposit_percent', type: 'number', required: false, default: 50, description: 'Upfront deposit percentage' },
        { name: 'net_days', type: 'number', required: false, default: 15, description: 'Invoice payment terms in days' },
        { name: 'late_fee_percent', type: 'number', required: false, default: 1.5, description: 'Monthly late fee percentage' },
        { name: 'confidentiality_years', type: 'number', required: false, default: 5, description: 'Confidentiality obligation duration' },
        { name: 'warranty_period', type: 'number', required: false, default: 30, description: 'Warranty period in days' },
        { name: 'termination_notice_days', type: 'number', required: false, default: 30, description: 'Termination notice period' },
        { name: 'cure_period_days', type: 'number', required: false, default: 30, description: 'Cure period for breach' }
      ],
      required_clauses: ['ip_ownership_provider_retains', 'liability_standard_cap', 'confidentiality_mutual_standard', 'payment_milestone_based', 'dispute_arbitration_nevada'],
      optional_clauses: [],
      is_active: true
    },
    {
      document_type: 'SOW',
      template_key: 'sow_standard_nv',
      template_name: 'Statement of Work - Standard (Nevada)',
      description: 'Standard SOW template for project-based work',
      version: '1.0',
      risk_profile: 'standard',
      jurisdiction: 'US-NV',
      content: await fs.readFile(path.join(__dirname, '../data/templates/sow-standard.md'), 'utf-8'),
      sections: [
        { id: '1', title: 'Project Overview', order: 1, required: true },
        { id: '2', title: 'Scope of Work', order: 2, required: true },
        { id: '3', title: 'Deliverables', order: 3, required: true },
        { id: '4', title: 'Project Timeline', order: 4, required: true },
        { id: '5', title: 'Compensation', order: 5, required: true },
        { id: '6', title: 'Roles and Responsibilities', order: 6, required: true },
        { id: '7', title: 'Assumptions and Dependencies', order: 7, required: true },
        { id: '8', title: 'Change Management', order: 8, required: true },
        { id: '9', title: 'Intellectual Property', order: 9, required: true }
      ],
      variables: [
        { name: 'sow_effective_date', type: 'date', required: true, description: 'SOW effective date' },
        { name: 'msa_effective_date', type: 'date', required: true, description: 'Related MSA effective date' },
        { name: 'project_name', type: 'string', required: true, description: 'Project name' },
        { name: 'project_description', type: 'string', required: true, description: 'Project description' },
        { name: 'total_fee', type: 'number', required: true, description: 'Total project fee' },
        { name: 'start_date', type: 'date', required: true, description: 'Project start date' },
        { name: 'end_date', type: 'date', required: true, description: 'Project end date' }
      ],
      required_clauses: [],
      optional_clauses: [],
      is_active: true
    },
    {
      document_type: 'NDA',
      template_key: 'nda_mutual_standard',
      template_name: 'Mutual NDA - Standard',
      description: 'Mutual non-disclosure agreement for business discussions',
      version: '1.0',
      risk_profile: 'standard',
      jurisdiction: 'US-NV',
      content: await fs.readFile(path.join(__dirname, '../data/templates/nda-standard.md'), 'utf-8'),
      sections: [
        { id: '1', title: 'Definition of Confidential Information', order: 1, required: true },
        { id: '2', title: 'Obligations of Receiving Party', order: 2, required: true },
        { id: '3', title: 'Ownership and Return of Materials', order: 3, required: true },
        { id: '4', title: 'No Obligation to Disclose or Proceed', order: 4, required: true },
        { id: '5', title: 'No Warranty', order: 5, required: true },
        { id: '6', title: 'Remedies', order: 6, required: true },
        { id: '7', title: 'Term and Termination', order: 7, required: true },
        { id: '8', title: 'General Provisions', order: 8, required: true }
      ],
      variables: [
        { name: 'effective_date', type: 'date', required: true, description: 'NDA effective date' },
        { name: 'party_b_legal_name', type: 'string', required: true, description: 'Other party legal name' },
        { name: 'party_b_short_name', type: 'string', required: true, description: 'Other party short name' },
        { name: 'purpose', type: 'string', required: true, description: 'Purpose of NDA' },
        { name: 'agreement_term_years', type: 'number', required: false, default: 2, description: 'Agreement term in years' },
        { name: 'confidentiality_years', type: 'number', required: false, default: 5, description: 'Confidentiality duration in years' },
        { name: 'governing_state', type: 'string', required: false, default: 'Nevada', description: 'Governing law state' }
      ],
      required_clauses: ['confidentiality_mutual_standard'],
      optional_clauses: [],
      is_active: true
    }
  ];

  for (const template of templates) {
    const { error } = await supabase
      .from('contract_templates')
      .upsert(template, { onConflict: 'template_key' });

    if (error) {
      console.error(`Error seeding template ${template.template_key}:`, error);
    } else {
      console.log(`✓ Seeded template: ${template.template_name}`);
    }
  }
}

async function seedClauses() {
  console.log('\nSeeding clause library...');

  const clauses = [
    {
      topic: 'IP_OWNERSHIP',
      clause_key: 'ip_ownership_provider_retains',
      clause_name: 'Provider Retains Pre-existing IP',
      risk_profile: 'vendor_friendly',
      jurisdiction: 'US-NV',
      when_to_use: 'Use when provider has significant pre-existing IP/frameworks being used',
      text: await fs.readFile(path.join(__dirname, '../data/clauses/ip-ownership/provider-retains.md'), 'utf-8'),
      variables: [],
      alternatives: [
        { clause_key: 'ip_ownership_client_owns', when_to_use: 'Premium pricing with portfolio rights' }
      ],
      is_active: true
    },
    {
      topic: 'LIMITATION_OF_LIABILITY',
      clause_key: 'liability_standard_cap',
      clause_name: 'Standard Liability Cap',
      risk_profile: 'standard',
      jurisdiction: 'US-NV',
      when_to_use: 'Standard engagements under $100k',
      text: await fs.readFile(path.join(__dirname, '../data/clauses/liability/standard-cap.md'), 'utf-8'),
      variables: [],
      alternatives: [
        { clause_key: 'liability_2x_cap', when_to_use: 'Enterprise deals over $500k' }
      ],
      is_active: true
    },
    {
      topic: 'CONFIDENTIALITY',
      clause_key: 'confidentiality_mutual_standard',
      clause_name: 'Mutual Confidentiality - Standard',
      risk_profile: 'standard',
      jurisdiction: 'US-NV',
      when_to_use: 'Two-way confidentiality for most engagements',
      text: await fs.readFile(path.join(__dirname, '../data/clauses/confidentiality/mutual-standard.md'), 'utf-8'),
      variables: [],
      alternatives: [],
      is_active: true
    },
    {
      topic: 'PAYMENT_TERMS',
      clause_key: 'payment_milestone_based',
      clause_name: 'Milestone-Based Payment Terms',
      risk_profile: 'standard',
      jurisdiction: 'US-NV',
      when_to_use: 'Project-based work with defined deliverables',
      text: await fs.readFile(path.join(__dirname, '../data/clauses/payment-terms/milestone-based.md'), 'utf-8'),
      variables: [
        { name: 'deposit_percent', type: 'number', default: 50, description: 'Deposit percentage' },
        { name: 'net_days', type: 'number', default: 15, description: 'Payment terms in days' },
        { name: 'late_fee_percent', type: 'number', default: 1.5, description: 'Late fee percentage' },
        { name: 'suspension_days', type: 'number', default: 30, description: 'Days before suspension' }
      ],
      alternatives: [],
      is_active: true
    },
    {
      topic: 'DISPUTE_RESOLUTION',
      clause_key: 'dispute_arbitration_nevada',
      clause_name: 'Arbitration - Nevada',
      risk_profile: 'standard',
      jurisdiction: 'US-NV',
      when_to_use: 'Most Nevada-based agreements',
      text: await fs.readFile(path.join(__dirname, '../data/clauses/dispute-resolution/arbitration-nevada.md'), 'utf-8'),
      variables: [
        { name: 'arbitration_city', type: 'string', default: 'Reno', description: 'Arbitration location' }
      ],
      alternatives: [],
      is_active: true
    }
  ];

  for (const clause of clauses) {
    const { error } = await supabase
      .from('clause_library')
      .upsert(clause, { onConflict: 'clause_key' });

    if (error) {
      console.error(`Error seeding clause ${clause.clause_key}:`, error);
    } else {
      console.log(`✓ Seeded clause: ${clause.clause_name}`);
    }
  }
}

async function seedPlaybookRules() {
  console.log('\nSeeding playbook rules...');

  const playbookData = JSON.parse(
    await fs.readFile(path.join(__dirname, '../data/playbook/stratanoble-playbook.json'), 'utf-8')
  );

  for (const rule of playbookData.rules) {
    const { error } = await supabase
      .from('playbook_rules')
      .upsert(rule, { onConflict: 'rule_key' });

    if (error) {
      console.error(`Error seeding playbook rule ${rule.rule_key}:`, error);
    } else {
      console.log(`✓ Seeded playbook rule: ${rule.topic}`);
    }
  }
}

async function main() {
  console.log('Starting database seed...\n');

  try {
    await seedTemplates();
    await seedClauses();
    await seedPlaybookRules();

    console.log('\n✓ Database seed completed successfully!');
  } catch (error) {
    console.error('\n✗ Database seed failed:', error);
    process.exit(1);
  }
}

main();
