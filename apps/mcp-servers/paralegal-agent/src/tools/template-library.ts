import { z } from 'zod';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getSupabaseClient, handleSupabaseError } from '../lib/supabase.js';
import { DocumentType, RiskProfile, DEFAULT_JURISDICTION } from '../types/index.js';
import type { ContractTemplate } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Input schema for the template library tool
 */
export const templateLibraryInputSchema = z.object({
  document_type: z.enum([
    'MSA', 'SOW', 'CHANGE_ORDER', 'NDA',
    'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA',
    'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'
  ]).describe('Type of contract template to retrieve'),
  jurisdiction: z.string().optional().default(DEFAULT_JURISDICTION)
    .describe('Jurisdiction for the template (default: US-NV)'),
  risk_profile: z.enum(['standard', 'vendor_friendly', 'customer_friendly']).optional()
    .describe('Risk profile version of the template'),
});

export type TemplateLibraryInput = z.infer<typeof templateLibraryInputSchema>;

/**
 * Template mapping to file names
 */
const TEMPLATE_FILES: Record<string, string> = {
  MSA: 'msa-standard.md',
  SOW: 'sow-template.md',
  CHANGE_ORDER: 'change-order.md',
  NDA: 'nda-mutual.md',
  IP_ADDENDUM: 'ip-addendum.md',
  PAYMENT_POLICY: 'payment-policy.md',
  DPA: 'dpa-template.md',
  SECURITY_ADDENDUM: 'security-addendum.md',
  BETA_AGREEMENT: 'beta-agreement.md',
  SUPPORT_SLA: 'support-sla.md',
};

/**
 * Read template from file system
 */
async function readTemplateFromFile(documentType: string): Promise<string | null> {
  const fileName = TEMPLATE_FILES[documentType];
  if (!fileName) {
    return null;
  }

  const templatePath = join(__dirname, '..', '..', 'data', 'templates', fileName);

  try {
    const content = await fs.readFile(templatePath, 'utf-8');
    return content;
  } catch (error) {
    // File doesn't exist - try database
    return null;
  }
}

/**
 * Read template from Supabase
 */
async function readTemplateFromDatabase(
  documentType: string,
  jurisdiction: string,
  riskProfile?: string
): Promise<ContractTemplate | null> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('contract_templates')
    .select('*')
    .eq('document_type', documentType)
    .eq('is_active', true);

  if (jurisdiction) {
    query = query.eq('jurisdiction', jurisdiction);
  }

  if (riskProfile) {
    query = query.eq('risk_profile', riskProfile);
  }

  const { data, error } = await query.limit(1).single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    handleSupabaseError(error, 'Failed to fetch template from database');
  }

  return data as ContractTemplate | null;
}

/**
 * Template library tool definition
 */
export const templateLibraryTool = {
  name: 'get_contract_template',
  description: `Fetch base contract templates by type and jurisdiction.

Available document types:
- MSA: Master Services Agreement
- SOW: Statement of Work
- CHANGE_ORDER: Change Order for existing SOW
- NDA: Non-Disclosure Agreement (Mutual)
- IP_ADDENDUM: Intellectual Property Addendum
- PAYMENT_POLICY: Payment Terms and Policies
- DPA: Data Processing Agreement
- SECURITY_ADDENDUM: Security Requirements Addendum
- BETA_AGREEMENT: Beta/Early Access Agreement
- SUPPORT_SLA: Support Service Level Agreement

Templates contain placeholders ({{VARIABLE_NAME}}) that should be populated
with deal context data.`,

  inputSchema: {
    type: 'object',
    properties: {
      document_type: {
        type: 'string',
        enum: ['MSA', 'SOW', 'CHANGE_ORDER', 'NDA', 'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA', 'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'],
        description: 'Type of contract template to retrieve',
      },
      jurisdiction: {
        type: 'string',
        description: 'Jurisdiction for the template (default: US-NV)',
        default: DEFAULT_JURISDICTION,
      },
      risk_profile: {
        type: 'string',
        enum: ['standard', 'vendor_friendly', 'customer_friendly'],
        description: 'Risk profile version of the template',
      },
    },
    required: ['document_type'],
  },

  handler: async (input: TemplateLibraryInput): Promise<{
    success: boolean;
    template?: {
      documentType: string;
      jurisdiction: string;
      riskProfile: string;
      content: string;
      variables: string[];
      sections: string[];
    };
    error?: string;
  }> => {
    try {
      const { document_type, jurisdiction, risk_profile } = templateLibraryInputSchema.parse(input);

      // First try file system
      let templateContent = await readTemplateFromFile(document_type);
      let templateMetadata: Partial<ContractTemplate> | null = null;

      // If not in file system, try database
      if (!templateContent) {
        templateMetadata = await readTemplateFromDatabase(
          document_type,
          jurisdiction || DEFAULT_JURISDICTION,
          risk_profile
        );

        if (templateMetadata) {
          templateContent = templateMetadata.content;
        }
      }

      if (!templateContent) {
        return {
          success: false,
          error: `No template found for document type: ${document_type}`,
        };
      }

      // Extract variables from template ({{VARIABLE_NAME}} format)
      const variableMatches = templateContent.match(/\{\{([A-Z_]+)\}\}/g) || [];
      const variables = [...new Set(variableMatches.map(v => v.replace(/\{\{|\}\}/g, '')))];

      // Extract section headers (## format)
      const sectionMatches = templateContent.match(/^##\s+.+$/gm) || [];
      const sections = sectionMatches.map(s => s.replace(/^##\s+/, ''));

      return {
        success: true,
        template: {
          documentType: document_type,
          jurisdiction: jurisdiction || DEFAULT_JURISDICTION,
          riskProfile: risk_profile || 'standard',
          content: templateContent,
          variables,
          sections,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
