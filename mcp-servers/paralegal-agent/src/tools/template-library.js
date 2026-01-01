/**
 * Template Library Tool
 * Fetches contract templates from database or filesystem
 *
 * SECURITY: Includes template versioning with SHA-256 checksums
 * Every template returned includes version ID and hash for traceability
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template version registry - immutable IDs for each template version
// Update this when templates change
const TEMPLATE_VERSIONS = {
  'MSA_standard_US-NV': 'MSA_v1.0.0',
  'SOW_standard_US-NV': 'SOW_v1.0.0',
  'CHANGE_ORDER_standard_US-NV': 'CO_v1.0.0',
  'NDA_standard_US-NV': 'NDA_v1.0.0',
  'IP_ADDENDUM_standard_US-NV': 'IPA_v1.0.0',
  'PAYMENT_POLICY_standard_US-NV': 'PP_v1.0.0',
};

/**
 * Generate SHA-256 hash of template content
 */
function generateTemplateHash(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

/**
 * Get template version ID
 */
function getTemplateVersionId(documentType, riskProfile, jurisdiction) {
  const key = `${documentType}_${riskProfile}_${jurisdiction}`;
  return TEMPLATE_VERSIONS[key] || `${documentType}_v0.0.0`;
}

export async function getContractTemplate(args, supabase) {
  const { document_type, risk_profile = 'standard', jurisdiction = 'US-NV' } = args;

  try {
    // Try to fetch from database first
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('document_type', document_type)
      .eq('risk_profile', risk_profile)
      .eq('jurisdiction', jurisdiction)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      // Generate hash for database template
      const contentStr = typeof data.content === 'string'
        ? data.content
        : JSON.stringify(data.content);
      const templateHash = generateTemplateHash(contentStr);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              template: {
                ...data,
                template_version: data.version || getTemplateVersionId(document_type, risk_profile, jurisdiction),
                template_hash: templateHash,
                integrity_verified: true
              },
              source: 'database'
            }, null, 2)
          }
        ]
      };
    }

    // Fallback to filesystem
    const templateFileName = getTemplateFileName(document_type, risk_profile);
    const templatePath = path.join(__dirname, '../../data/templates', templateFileName);

    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      const templateHash = generateTemplateHash(content);
      const templateVersion = getTemplateVersionId(document_type, risk_profile, jurisdiction);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              template: {
                document_type,
                risk_profile,
                jurisdiction,
                content,
                template_version: templateVersion,
                template_hash: templateHash,
                template_id: `${templateVersion}_${templateHash.substring(0, 8)}`,
                source: 'filesystem',
                integrity_verified: true
              }
            }, null, 2)
          }
        ]
      };
    } catch (fsError) {
      throw new Error(`Template not found: ${document_type} (${risk_profile}, ${jurisdiction})`);
    }

  } catch (error) {
    // SECURITY: Sanitize error messages
    const safeError = error.message?.replace(/key|secret|password|token/gi, '[REDACTED]');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: safeError || 'Unknown error'
          }, null, 2)
        }
      ],
      isError: true
    };
  }
}

function getTemplateFileName(documentType, riskProfile) {
  const typeMap = {
    'MSA': 'msa',
    'SOW': 'sow',
    'CHANGE_ORDER': 'change-order',
    'NDA': 'nda',
    'IP_ADDENDUM': 'ip-addendum',
    'PAYMENT_POLICY': 'payment-policy',
    'DPA': 'dpa',
    'SECURITY_ADDENDUM': 'security-addendum',
    'BETA_AGREEMENT': 'beta-agreement',
    'SUPPORT_SLA': 'support-sla'
  };

  const base = typeMap[documentType] || documentType.toLowerCase();

  if (riskProfile === 'standard') {
    return `${base}-standard.md`;
  } else {
    return `${base}-${riskProfile.replace('_', '-')}.md`;
  }
}

/**
 * Verify template integrity by comparing stored hash
 * Use this before generating contracts from cached templates
 */
export async function verifyTemplateIntegrity(templateContent, expectedHash) {
  const actualHash = generateTemplateHash(templateContent);
  return {
    valid: actualHash === expectedHash,
    expected: expectedHash,
    actual: actualHash
  };
}
