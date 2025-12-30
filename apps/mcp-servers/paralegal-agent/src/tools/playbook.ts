import { z } from 'zod';
import { getSupabaseClient } from '../lib/supabase.js';
import type { PlaybookRule, AcceptableAlternative, UnacceptablePosition } from '../types/index.js';

/**
 * Input schema for the playbook tool
 */
export const playbookInputSchema = z.object({
  topic: z.string().describe('Negotiation topic to get rules for'),
  jurisdiction: z.string().optional().describe('Jurisdiction for rules'),
  rule_key: z.string().optional().describe('Specific rule key to retrieve'),
});

export type PlaybookInput = z.infer<typeof playbookInputSchema>;

/**
 * Playbook rule output type
 */
interface PlaybookRuleOutput {
  ruleKey: string;
  topic: string;
  jurisdiction?: string;
  defaultPosition: string;
  acceptableAlternatives?: AcceptableAlternative[];
  unacceptablePositions?: UnacceptablePosition[];
  escalationRequired: boolean;
  escalationReason?: string;
  notesForAI?: string;
  priority: number;
}

/**
 * Default playbook rules for StrataNoble
 */
const DEFAULT_PLAYBOOK_RULES: PlaybookRuleOutput[] = [
  // IP Ownership Rules
  {
    ruleKey: 'ip_preexisting',
    topic: 'IP_OWNERSHIP',
    defaultPosition: 'Provider (StrataNoble) retains all pre-existing IP, frameworks, methodologies, and reusable code components. Client receives a perpetual license to use pre-existing IP solely as incorporated into deliverables.',
    acceptableAlternatives: [
      {
        position: 'Shared ownership of novel innovations created specifically for the engagement',
        conditions: 'Only for truly novel innovations that could not have existed without this specific client relationship',
        notes: 'Requires separate IP addendum defining scope of shared IP',
      },
      {
        position: 'Broader license for pre-existing IP',
        conditions: 'Client may request usage beyond deliverables for internal purposes only',
        notes: 'No sublicensing permitted; usage fee may apply',
      },
    ],
    unacceptablePositions: [
      {
        position: 'Client owns all code and work product including frameworks and tools',
        reason: 'Would prevent Provider from reusing core tools and methodologies on other projects',
        hardStop: true,
      },
      {
        position: 'Work-for-hire treatment of all engagement work',
        reason: 'Incompatible with our business model; we invest in reusable frameworks',
        hardStop: true,
      },
    ],
    escalationRequired: false,
    notesForAI: 'Be firm on pre-existing IP retention. This is core to the business model. Frame as protecting the investment that allows us to deliver efficiently.',
    priority: 100,
  },
  {
    ruleKey: 'ip_deliverables',
    topic: 'IP_OWNERSHIP',
    defaultPosition: 'Client owns final deliverables (specific to their engagement) upon full payment. This includes custom configurations, client-specific logic, and branded assets.',
    acceptableAlternatives: [
      {
        position: 'Provider retains right to showcase work in portfolio (anonymized if requested)',
        conditions: 'Standard request; helps demonstrate capabilities',
        notes: 'Client can request embargo period before portfolio use',
      },
    ],
    unacceptablePositions: [
      {
        position: 'Client ownership before full payment',
        reason: 'Payment must be complete before IP transfer occurs',
        hardStop: true,
      },
    ],
    escalationRequired: false,
    notesForAI: 'Final deliverables ownership is typically negotiable. Focus on ensuring full payment is received before transfer.',
    priority: 90,
  },

  // Liability Rules
  {
    ruleKey: 'liability_cap',
    topic: 'LIABILITY',
    defaultPosition: 'Total liability capped at fees paid in the 12 months preceding the claim. No liability for consequential, incidental, special, or punitive damages.',
    acceptableAlternatives: [
      {
        position: 'Cap at total contract value instead of 12-month lookback',
        conditions: 'For fixed-price engagements where total is clear upfront',
        notes: 'May be simpler for both parties to administer',
      },
      {
        position: 'Higher cap multiplier (e.g., 2x fees)',
        conditions: 'Only with corresponding insurance coverage and premium pricing',
        notes: 'Requires escalation for approval of increased exposure',
      },
    ],
    unacceptablePositions: [
      {
        position: 'Unlimited liability',
        reason: 'Uninsurable and existential risk to the business',
        hardStop: true,
      },
      {
        position: 'Liability for lost profits or business interruption',
        reason: 'Consequential damages are unpredictable and potentially unlimited',
        hardStop: true,
      },
      {
        position: 'Cap below fees paid',
        reason: 'Liability cap should at minimum cover what client paid',
        hardStop: false,
      },
    ],
    escalationRequired: true,
    escalationReason: 'Any deviation from standard liability cap requires leadership approval due to insurance and risk implications',
    notesForAI: 'Liability is a hard negotiation point. Emphasize that our pricing assumes standard liability terms. Higher caps require premium pricing.',
    priority: 95,
  },

  // Payment Terms Rules
  {
    ruleKey: 'payment_deposit',
    topic: 'PAYMENT',
    defaultPosition: '25% deposit due upon signing, balance according to milestone schedule defined in SOW. Net 30 payment terms.',
    acceptableAlternatives: [
      {
        position: '20% deposit',
        conditions: 'For established clients with payment history',
        notes: 'Document the client relationship justifying reduced deposit',
      },
      {
        position: 'Net 45 terms',
        conditions: 'For enterprise clients with standard procurement cycles',
        notes: 'Adjust project timeline accordingly to manage cash flow',
      },
      {
        position: '50% upfront, 50% on completion',
        conditions: 'For smaller projects under $25K',
        notes: 'Simplifies billing for quick engagements',
      },
    ],
    unacceptablePositions: [
      {
        position: 'No deposit / 100% upon completion',
        reason: 'Exposes Provider to significant delivery risk without payment protection',
        hardStop: true,
      },
      {
        position: 'Net 90+ terms',
        reason: 'Creates cash flow strain and implies client solvency concerns',
        hardStop: true,
      },
      {
        position: 'Payment contingent on third-party actions',
        reason: 'Payment should not depend on factors outside our control',
        hardStop: false,
      },
    ],
    escalationRequired: false,
    notesForAI: 'Deposit protects against scope changes and ensures client commitment. Be flexible on structure but maintain deposit requirement.',
    priority: 85,
  },

  // Termination Rules
  {
    ruleKey: 'termination_notice',
    topic: 'TERMINATION',
    defaultPosition: 'Either party may terminate for convenience with 30 days written notice. Client pays for work completed through termination date.',
    acceptableAlternatives: [
      {
        position: '14-day notice period',
        conditions: 'For short-term engagements under 60 days',
        notes: 'Shorter notice is reasonable for shorter projects',
      },
      {
        position: '45-day notice period',
        conditions: 'For enterprise clients with complex transition needs',
        notes: 'Longer notice helps ensure orderly knowledge transfer',
      },
    ],
    unacceptablePositions: [
      {
        position: 'Immediate termination without payment for work in progress',
        reason: 'Provider must be compensated for completed work regardless of termination',
        hardStop: true,
      },
      {
        position: 'Termination penalties or clawbacks of already-paid fees',
        reason: 'Fees for completed work are non-refundable',
        hardStop: true,
      },
    ],
    escalationRequired: false,
    notesForAI: 'Termination rights should be balanced. Focus on ensuring compensation for completed work rather than restricting termination rights.',
    priority: 70,
  },

  // Confidentiality Rules
  {
    ruleKey: 'confidentiality_duration',
    topic: 'CONFIDENTIALITY',
    defaultPosition: 'Mutual confidentiality with 3-year survival period post-termination. Standard carve-outs for public information, prior knowledge, and independent development.',
    acceptableAlternatives: [
      {
        position: '5-year survival period',
        conditions: 'For particularly sensitive industries (healthcare, finance)',
        notes: 'Longer period is reasonable for regulated industries',
      },
      {
        position: 'Perpetual confidentiality for trade secrets',
        conditions: 'Only for clearly designated trade secrets',
        notes: 'Trade secrets retain protection as long as they remain secret',
      },
    ],
    unacceptablePositions: [
      {
        position: 'One-way confidentiality (only Provider bound)',
        reason: 'Our methodologies and pricing are also confidential',
        hardStop: false,
      },
      {
        position: 'Confidentiality prevents portfolio use entirely',
        reason: 'Need ability to reference engagement existence at minimum',
        hardStop: false,
      },
    ],
    escalationRequired: false,
    notesForAI: 'Confidentiality terms are usually straightforward. Ensure mutual obligations and reasonable carve-outs for our portfolio.',
    priority: 60,
  },

  // Jurisdiction Rules
  {
    ruleKey: 'jurisdiction_nevada',
    topic: 'JURISDICTION',
    jurisdiction: 'US-NV',
    defaultPosition: 'Nevada law governs. Disputes resolved by mediation, then binding arbitration in Las Vegas. No jury trials.',
    acceptableAlternatives: [
      {
        position: 'Delaware law (for corporate clients)',
        conditions: 'Delaware is acceptable as a neutral, business-friendly jurisdiction',
        notes: 'Keep arbitration in Las Vegas if possible',
      },
      {
        position: 'Arbitration in client state',
        conditions: 'For major enterprise clients',
        notes: 'May increase our costs for dispute resolution',
      },
    ],
    unacceptablePositions: [
      {
        position: 'Mandatory litigation instead of arbitration',
        reason: 'Litigation is slower and more expensive than arbitration',
        hardStop: false,
      },
      {
        position: 'Foreign jurisdiction/governing law',
        reason: 'Creates uncertainty and increased legal costs',
        hardStop: true,
      },
    ],
    escalationRequired: false,
    notesForAI: 'Nevada is strongly preferred. Arbitration protects both parties from expensive litigation. Be flexible on venue for good clients.',
    priority: 50,
  },

  // AI Disclosure Rules
  {
    ruleKey: 'ai_subprocessor_disclosure',
    topic: 'AI_DISCLOSURE',
    defaultPosition: 'Provider uses AI-assisted coding tools as subprocessors. Human oversight applies to all AI outputs. AI tools are covered under confidentiality provisions.',
    acceptableAlternatives: [
      {
        position: 'Named disclosure of specific AI tools',
        conditions: 'For regulated industries requiring subprocessor identification',
        notes: 'List Claude, GitHub Copilot, or other tools used',
      },
    ],
    unacceptablePositions: [
      {
        position: 'Complete prohibition of AI tool usage',
        reason: 'AI tools are integral to our development process and efficiency',
        hardStop: true,
      },
    ],
    escalationRequired: false,
    notesForAI: 'AI disclosure is non-negotiable. We use AI tools and must disclose this. Focus on human oversight and confidentiality protections.',
    priority: 80,
  },
];

/**
 * Playbook tool definition
 */
export const playbookTool = {
  name: 'get_playbook_rules',
  description: `Get negotiation playbook rules and policy decisions for StrataNoble contracts.

Available topics:
- IP_OWNERSHIP: Intellectual property ownership negotiations
- LIABILITY: Liability caps and limitations
- PAYMENT: Payment terms, deposits, and schedules
- TERMINATION: Termination rights and procedures
- CONFIDENTIALITY: NDA and confidentiality terms
- JURISDICTION: Governing law and dispute resolution
- AI_DISCLOSURE: AI/ML subprocessor disclosures
- INDEMNITY: Indemnification terms
- WARRANTY: Service warranties
- SCOPE: Scope management and changes

Returns:
- Default positions (what we prefer)
- Acceptable alternatives (what we can live with)
- Unacceptable positions (deal-breakers)
- Escalation requirements
- AI guidance notes`,

  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        description: 'Negotiation topic to get rules for',
      },
      jurisdiction: {
        type: 'string',
        description: 'Jurisdiction for rules (optional)',
      },
      rule_key: {
        type: 'string',
        description: 'Specific rule key to retrieve (optional)',
      },
    },
    required: ['topic'],
  },

  handler: async (input: PlaybookInput): Promise<{
    success: boolean;
    rules?: PlaybookRuleOutput[];
    error?: string;
  }> => {
    try {
      const { topic, jurisdiction, rule_key } = playbookInputSchema.parse(input);

      // Try to fetch from database first
      const supabase = getSupabaseClient();

      let query = supabase
        .from('playbook_rules')
        .select('*')
        .ilike('topic', `%${topic}%`)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (jurisdiction) {
        query = query.or(`jurisdiction.eq.${jurisdiction},jurisdiction.is.null`);
      }

      if (rule_key) {
        query = query.eq('rule_key', rule_key);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database query failed, using default playbook:', error.message);
      }

      let rules: PlaybookRuleOutput[] = [];

      if (data && data.length > 0) {
        // Map database results to output format
        rules = data.map((rule: PlaybookRule) => ({
          ruleKey: rule.ruleKey,
          topic: rule.topic,
          jurisdiction: rule.jurisdiction,
          defaultPosition: rule.defaultPosition,
          acceptableAlternatives: rule.acceptableAlternatives,
          unacceptablePositions: rule.unacceptablePositions,
          escalationRequired: rule.escalationRequired,
          escalationReason: rule.escalationReason,
          notesForAI: rule.notesForAI,
          priority: rule.priority,
        }));
      } else {
        // Fall back to default playbook rules
        rules = DEFAULT_PLAYBOOK_RULES.filter(rule => {
          const topicMatch = rule.topic.toLowerCase().includes(topic.toLowerCase()) ||
                            topic.toLowerCase().includes(rule.topic.toLowerCase());

          if (!topicMatch) return false;

          if (jurisdiction && rule.jurisdiction && rule.jurisdiction !== jurisdiction) {
            return false;
          }

          if (rule_key && rule.ruleKey !== rule_key) {
            return false;
          }

          return true;
        });
      }

      if (rules.length === 0) {
        return {
          success: true,
          rules: [],
          error: `No playbook rules found for topic: ${topic}. Consider reviewing with legal counsel.`,
        };
      }

      return {
        success: true,
        rules,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
