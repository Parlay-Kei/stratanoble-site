/**
 * Document Save Tool
 * Persists contracts to database and creates version records
 *
 * SECURITY: This tool includes mandatory validation before saving:
 * - Placeholder detection (blocks unresolved {{VAR}}, [TBD], ___)
 * - Kill switch support (PARALEGAL_KILL_SWITCH env var)
 * - Build manifest generation for audit trail
 * - Draft watermark enforcement
 */

import crypto from 'crypto';

// Unresolved placeholder patterns that MUST fail
const PLACEHOLDER_PATTERNS = [
  /\{\{[A-Z_]+\}\}/g,           // {{VARIABLE_NAME}}
  /\$\{[A-Z_]+\}/g,             // ${VARIABLE_NAME}
  /\[TBD\]/gi,                  // [TBD]
  /\[INSERT\s+[^\]]+\]/gi,      // [INSERT something]
  /_{3,}/g,                     // ___ (blank lines)
  /\[CLIENT[_\s]NAME\]/gi,      // [CLIENT_NAME] or [CLIENT NAME]
  /\[COMPANY[_\s]NAME\]/gi,     // [COMPANY_NAME]
  /\[DATE\]/gi,                 // [DATE]
  /\[AMOUNT\]/gi,               // [AMOUNT]
  /\bPLACEHOLDER\b/g,           // literal PLACEHOLDER (whole word, case sensitive)
];

// Required fields that cannot be empty
const REQUIRED_FIELDS = [
  'document_type',
  'jurisdiction',
  'risk_profile'
];

/**
 * Validate rendered text for unresolved placeholders
 * HARD FAIL if any found - never ship unresolved contracts
 */
function validatePlaceholders(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, errors: ['No rendered text provided'] };
  }

  const errors = [];

  for (const pattern of PLACEHOLDER_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      errors.push(`Unresolved placeholder(s) found: ${[...new Set(matches)].join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate build manifest for audit trail
 * Every contract output must be traceable
 *
 * IMPORTANT: Uses pinned versions from deal if available to prevent contract drift
 */
function generateBuildManifest(args, contractId, version, dealVersions = null) {
  const now = new Date().toISOString();
  const requestId = crypto.randomUUID();

  // Hash the content for integrity verification
  const contentHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(args.content || {}))
    .digest('hex')
    .substring(0, 16);

  const renderedHash = crypto
    .createHash('sha256')
    .update(args.rendered_text || '')
    .digest('hex')
    .substring(0, 16);

  // Use pinned versions from deal if available, otherwise use passed-in versions
  const templateVersion = dealVersions?.template_version || args.template_version || null;
  const playbookVersion = dealVersions?.playbook_version || args.playbook_version || 'default';

  return {
    manifest_version: '1.0.0',
    request_id: requestId,
    generated_at: now,

    // Template traceability
    template_id: args.template_id || null,
    template_version: templateVersion,
    template_hash: args.template_hash || null,

    // Playbook traceability
    playbook_version: playbookVersion,

    // Version pinning info
    version_pinning: {
      enabled: !!dealVersions,
      deal_template_version: dealVersions?.template_version || null,
      deal_playbook_version: dealVersions?.playbook_version || null,
      locked_at: dealVersions?.locked_at || null
    },

    // Clause traceability
    clause_ids: args.clause_ids || [],

    // Variables filled
    variables_filled: Object.keys(args.content?.variables || {}),

    // Integrity hashes
    content_hash: contentHash,
    rendered_hash: renderedHash,

    // Context
    document_type: args.document_type,
    risk_profile: args.risk_profile || 'standard',
    jurisdiction: args.jurisdiction || 'US-NV',
    deal_id: args.deal_id || null,

    // Version info
    contract_id: contractId,
    contract_version: version,

    // Compliance stamp
    draft_notice: 'DRAFT - FOR REVIEW ONLY - NOT LEGAL ADVICE',
    requires_human_review: true
  };
}

/**
 * Check kill switch - emergency stop for all contract generation
 */
function isKillSwitchActive() {
  return process.env.PARALEGAL_KILL_SWITCH === 'true' ||
         process.env.PARALEGAL_KILL_SWITCH === '1';
}

export async function saveContract(args, supabase) {
  // KILL SWITCH CHECK - first thing
  if (isKillSwitchActive()) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'CONTRACT_GENERATION_DISABLED',
            message: 'Contract generation is currently disabled via kill switch (PARALEGAL_KILL_SWITCH). Contact administrator.'
          }, null, 2)
        }
      ],
      isError: true
    };
  }

  const {
    deal_id,
    document_type,
    title,
    content,
    rendered_text,
    risk_profile = 'standard',
    jurisdiction = 'US-NV',
    parties = [],
    metadata = {}
  } = args;

  // Fetch deal's pinned versions if deal_id is provided
  let dealVersions = null;
  if (deal_id) {
    try {
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('template_version, playbook_version, locked_at')
        .eq('id', deal_id)
        .single();

      if (!dealError && dealData) {
        dealVersions = dealData;
      }
    } catch (error) {
      // Non-fatal: Continue without version pinning if deal lookup fails
      console.warn('Could not fetch deal versions:', error.message);
    }
  }

  // REQUIRED FIELD VALIDATION
  const missingFields = [];
  if (!document_type) missingFields.push('document_type');
  if (!jurisdiction) missingFields.push('jurisdiction');

  if (missingFields.length > 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'MISSING_REQUIRED_FIELDS',
            missing: missingFields,
            message: `Cannot save contract without: ${missingFields.join(', ')}`
          }, null, 2)
        }
      ],
      isError: true
    };
  }

  // PLACEHOLDER VALIDATION - HARD FAIL
  const placeholderCheck = validatePlaceholders(rendered_text);
  if (!placeholderCheck.valid) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'UNRESOLVED_PLACEHOLDERS',
            errors: placeholderCheck.errors,
            message: 'Contract contains unresolved placeholders. All variables must be filled before saving.'
          }, null, 2)
        }
      ],
      isError: true
    };
  }

  try {
    // Check if we're updating an existing contract or creating new
    let contractId = args.contract_id;
    let version = 1;

    if (contractId) {
      // Fetch existing contract to increment version
      const { data: existing, error: fetchError } = await supabase
        .from('contracts')
        .select('version')
        .eq('id', contractId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      version = (existing?.version || 0) + 1;

      // Generate build manifest BEFORE saving (with pinned versions from deal)
      const buildManifest = generateBuildManifest(args, contractId, version, dealVersions);

      // Update contract with manifest
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          content,
          rendered_text,
          version,
          status: 'draft',
          metadata: {
            ...metadata,
            build_manifest: buildManifest
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (updateError) {
        throw updateError;
      }

    } else {
      // Generate build manifest BEFORE saving (with pinned versions from deal)
      const tempId = crypto.randomUUID();
      const buildManifest = generateBuildManifest(args, tempId, 1, dealVersions);

      // Create new contract with manifest
      const { data: newContract, error: insertError } = await supabase
        .from('contracts')
        .insert({
          deal_id,
          document_type,
          title,
          content,
          rendered_text,
          risk_profile,
          jurisdiction,
          parties,
          metadata: {
            ...metadata,
            build_manifest: buildManifest
          },
          status: 'draft',
          version: 1
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      contractId = newContract.id;

      // Update manifest with actual contract ID (with pinned versions from deal)
      const finalManifest = generateBuildManifest(args, contractId, 1, dealVersions);
      await supabase
        .from('contracts')
        .update({
          metadata: {
            ...metadata,
            build_manifest: finalManifest
          }
        })
        .eq('id', contractId);
    }

    // Create version record with manifest (with pinned versions from deal)
    const versionManifest = generateBuildManifest(args, contractId, version, dealVersions);

    const { error: versionError } = await supabase
      .from('contract_versions')
      .insert({
        contract_id: contractId,
        version,
        content,
        rendered_text,
        change_type: version === 1 ? 'initial' : 'revision',
        metadata: {
          build_manifest: versionManifest
        }
      });

    if (versionError) {
      throw versionError;
    }

    // Construct success message with version pinning info
    const successMessage = version === 1 ? 'Contract created successfully' : 'Contract updated successfully';
    const versionPinningNotice = dealVersions
      ? `Version pinning active: Using template ${dealVersions.template_version} and playbook ${dealVersions.playbook_version} from deal.`
      : 'No version pinning. Using latest/provided versions.';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            contract_id: contractId,
            version,
            status: 'draft',
            build_manifest: versionManifest,
            message: successMessage,
            version_pinning: versionPinningNotice,
            notice: 'DRAFT - REQUIRES HUMAN REVIEW BEFORE EXTERNAL USE'
          }, null, 2)
        }
      ]
    };

  } catch (error) {
    // SECURITY: Never log raw error details that might contain sensitive data
    const safeError = error.message?.replace(/key|secret|password|token/gi, '[REDACTED]');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: safeError || 'Unknown error occurred'
          }, null, 2)
        }
      ],
      isError: true
    };
  }
}
