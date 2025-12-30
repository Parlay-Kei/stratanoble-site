import { z } from 'zod';
import { marked } from 'marked';
import { getSupabaseClient, handleSupabaseError } from '../lib/supabase.js';
import { DocumentType, ContractStatus, RiskProfile, ChangeType, DEFAULT_JURISDICTION } from '../types/index.js';
import type { Contract, ContractContent, ContractVersion, ContractSection, ContractParty } from '../types/index.js';

/**
 * Input schema for the document save tool
 */
export const documentSaveInputSchema = z.object({
  deal_id: z.string().uuid().optional().describe('UUID of the associated deal'),
  contract_id: z.string().uuid().optional().describe('UUID of existing contract to update (creates new version)'),
  document_type: z.enum([
    'MSA', 'SOW', 'CHANGE_ORDER', 'NDA',
    'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA',
    'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'
  ]).describe('Type of contract document'),
  title: z.string().optional().describe('Document title'),
  content: z.object({
    sections: z.array(z.object({
      id: z.string(),
      title: z.string(),
      order: z.number(),
      content: z.string(),
      clauses: z.array(z.string()).optional(),
      isRequired: z.boolean().optional(),
    })),
    variables: z.record(z.union([z.string(), z.number(), z.boolean()])),
    metadata: z.record(z.unknown()).optional(),
  }).describe('Contract content with sections and variables'),
  parties: z.array(z.object({
    role: z.enum(['provider', 'client', 'third_party']),
    name: z.string(),
    legalName: z.string(),
    address: z.object({
      street1: z.string(),
      street2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
    }).optional(),
    signatory: z.object({
      name: z.string(),
      title: z.string(),
      email: z.string(),
    }).optional(),
  })).optional().describe('Contract parties'),
  risk_profile: z.enum(['standard', 'customer_friendly', 'vendor_friendly']).optional()
    .describe('Risk profile for the contract'),
  jurisdiction: z.string().optional().describe('Governing jurisdiction'),
  effective_date: z.string().optional().describe('Contract effective date'),
  expiration_date: z.string().optional().describe('Contract expiration date'),
  change_summary: z.string().optional().describe('Summary of changes (for updates)'),
  metadata: z.record(z.unknown()).optional().describe('Additional metadata'),
});

export type DocumentSaveInput = z.infer<typeof documentSaveInputSchema>;

/**
 * Render contract content to markdown
 */
function renderToMarkdown(content: ContractContent, title?: string): string {
  const lines: string[] = [];

  // Add title
  if (title) {
    lines.push(`# ${title}`);
    lines.push('');
  }

  // Add sections in order
  const sortedSections = [...content.sections].sort((a, b) => a.order - b.order);

  for (const section of sortedSections) {
    lines.push(`## ${section.title}`);
    lines.push('');

    // Replace variables in content
    let sectionContent = section.content;
    for (const [key, value] of Object.entries(content.variables)) {
      const placeholder = `{{${key}}}`;
      sectionContent = sectionContent.replace(new RegExp(placeholder, 'g'), String(value));
    }

    lines.push(sectionContent);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Document save tool definition
 */
export const documentSaveTool = {
  name: 'save_contract_draft',
  description: `Save or update a contract draft.

For new contracts:
- Creates a new contract record with version 1
- Creates initial version history record
- Renders content to markdown text

For updates (when contract_id is provided):
- Creates a new version of the existing contract
- Increments version number
- Stores change summary
- Preserves version history

Returns:
- contract_id: UUID of the saved contract
- version: Current version number
- status: Contract status
- rendered_text: Markdown-rendered contract`,

  inputSchema: {
    type: 'object',
    properties: {
      deal_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the associated deal',
      },
      contract_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of existing contract to update (creates new version)',
      },
      document_type: {
        type: 'string',
        enum: ['MSA', 'SOW', 'CHANGE_ORDER', 'NDA', 'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA', 'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'],
        description: 'Type of contract document',
      },
      title: {
        type: 'string',
        description: 'Document title',
      },
      content: {
        type: 'object',
        description: 'Contract content with sections and variables',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                order: { type: 'number' },
                content: { type: 'string' },
                clauses: { type: 'array', items: { type: 'string' } },
                isRequired: { type: 'boolean' },
              },
              required: ['id', 'title', 'order', 'content'],
            },
          },
          variables: {
            type: 'object',
            additionalProperties: true,
          },
          metadata: {
            type: 'object',
            additionalProperties: true,
          },
        },
        required: ['sections', 'variables'],
      },
      parties: {
        type: 'array',
        description: 'Contract parties',
      },
      risk_profile: {
        type: 'string',
        enum: ['standard', 'customer_friendly', 'vendor_friendly'],
        description: 'Risk profile for the contract',
      },
      jurisdiction: {
        type: 'string',
        description: 'Governing jurisdiction',
      },
      effective_date: {
        type: 'string',
        description: 'Contract effective date',
      },
      expiration_date: {
        type: 'string',
        description: 'Contract expiration date',
      },
      change_summary: {
        type: 'string',
        description: 'Summary of changes (for updates)',
      },
      metadata: {
        type: 'object',
        description: 'Additional metadata',
      },
    },
    required: ['document_type', 'content'],
  },

  handler: async (input: DocumentSaveInput): Promise<{
    success: boolean;
    data?: {
      contractId: string;
      version: number;
      status: string;
      renderedText: string;
      isUpdate: boolean;
    };
    error?: string;
  }> => {
    try {
      const validatedInput = documentSaveInputSchema.parse(input);
      const supabase = getSupabaseClient();

      // Render content to markdown
      const renderedText = renderToMarkdown(
        validatedInput.content as ContractContent,
        validatedInput.title
      );

      // Check if this is an update or new contract
      if (validatedInput.contract_id) {
        // Fetch existing contract
        const { data: existingContract, error: fetchError } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', validatedInput.contract_id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            return {
              success: false,
              error: `Contract not found: ${validatedInput.contract_id}`,
            };
          }
          handleSupabaseError(fetchError, 'Failed to fetch existing contract');
        }

        const newVersion = existingContract.version + 1;

        // Update the contract
        const { data: updatedContract, error: updateError } = await supabase
          .from('contracts')
          .update({
            content: validatedInput.content,
            rendered_text: renderedText,
            version: newVersion,
            status: existingContract.status === 'signed' ? 'signed' : 'draft',
            risk_profile: validatedInput.risk_profile || existingContract.risk_profile,
            jurisdiction: validatedInput.jurisdiction || existingContract.jurisdiction,
            parties: validatedInput.parties || existingContract.parties,
            effective_date: validatedInput.effective_date || existingContract.effective_date,
            expiration_date: validatedInput.expiration_date || existingContract.expiration_date,
            metadata: { ...existingContract.metadata, ...validatedInput.metadata },
            updated_at: new Date().toISOString(),
          })
          .eq('id', validatedInput.contract_id)
          .select()
          .single();

        if (updateError) {
          handleSupabaseError(updateError, 'Failed to update contract');
        }

        // Create version record
        const { error: versionError } = await supabase
          .from('contract_versions')
          .insert({
            contract_id: validatedInput.contract_id,
            version: newVersion,
            content: validatedInput.content,
            rendered_text: renderedText,
            changes_summary: validatedInput.change_summary || `Updated to version ${newVersion}`,
            change_type: 'revision',
          });

        if (versionError) {
          console.error('Failed to create version record:', versionError.message);
        }

        return {
          success: true,
          data: {
            contractId: updatedContract.id,
            version: newVersion,
            status: updatedContract.status,
            renderedText,
            isUpdate: true,
          },
        };
      }

      // Create new contract
      const { data: newContract, error: insertError } = await supabase
        .from('contracts')
        .insert({
          deal_id: validatedInput.deal_id,
          document_type: validatedInput.document_type,
          title: validatedInput.title || `${validatedInput.document_type} Draft`,
          status: 'draft',
          version: 1,
          content: validatedInput.content,
          rendered_text: renderedText,
          risk_profile: validatedInput.risk_profile || 'standard',
          jurisdiction: validatedInput.jurisdiction || DEFAULT_JURISDICTION,
          parties: validatedInput.parties,
          effective_date: validatedInput.effective_date,
          expiration_date: validatedInput.expiration_date,
          metadata: validatedInput.metadata,
        })
        .select()
        .single();

      if (insertError) {
        handleSupabaseError(insertError, 'Failed to create contract');
      }

      // Create initial version record
      const { error: versionError } = await supabase
        .from('contract_versions')
        .insert({
          contract_id: newContract.id,
          version: 1,
          content: validatedInput.content,
          rendered_text: renderedText,
          changes_summary: 'Initial draft',
          change_type: 'initial',
        });

      if (versionError) {
        console.error('Failed to create version record:', versionError.message);
      }

      return {
        success: true,
        data: {
          contractId: newContract.id,
          version: 1,
          status: 'draft',
          renderedText,
          isUpdate: false,
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
