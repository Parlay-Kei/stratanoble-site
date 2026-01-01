/**
 * Diff Engine Tool
 * Compares contract versions and identifies substantive changes
 */

import { diffLines } from 'diff';

export async function compareContractVersions(args, supabase) {
  const { contract_id, version_a, version_b } = args;

  try {
    // Fetch both versions
    const { data: versions, error } = await supabase
      .from('contract_versions')
      .select('*')
      .eq('contract_id', contract_id)
      .in('version', [version_a, version_b])
      .order('version');

    if (error) {
      throw error;
    }

    if (!versions || versions.length !== 2) {
      throw new Error(`Could not find both versions (${version_a} and ${version_b}) for contract ${contract_id}`);
    }

    const versionAData = versions.find(v => v.version === version_a);
    const versionBData = versions.find(v => v.version === version_b);

    const textA = versionAData.rendered_text || JSON.stringify(versionAData.content);
    const textB = versionBData.rendered_text || JSON.stringify(versionBData.content);

    // Generate line-by-line diff
    const diff = diffLines(textA, textB);

    let addedLines = 0;
    let removedLines = 0;
    const changedSections = [];
    const riskImpactingChanges = [];

    diff.forEach((part, index) => {
      if (part.added) {
        addedLines += part.count;
        const riskAnalysis = analyzeRiskImpact(part.value);
        if (riskAnalysis) {
          riskImpactingChanges.push({
            section: `Addition at position ${index}`,
            ...riskAnalysis
          });
        }
      } else if (part.removed) {
        removedLines += part.count;
        const riskAnalysis = analyzeRiskImpact(part.value);
        if (riskAnalysis) {
          riskImpactingChanges.push({
            section: `Removal at position ${index}`,
            ...riskAnalysis
          });
        }
      }
    });

    // Format diff for display
    const formattedDiff = diff.map(part => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return part.value.split('\n').map(line => prefix + line).join('\n');
    }).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            comparison: {
              contract_id,
              version_a,
              version_b,
              has_changes: addedLines > 0 || removedLines > 0,
              added_lines: addedLines,
              removed_lines: removedLines,
              risk_impacting_changes: riskImpactingChanges,
              full_diff: formattedDiff
            }
          }, null, 2)
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          }, null, 2)
        }
      ],
      isError: true
    };
  }
}

function analyzeRiskImpact(text) {
  const lowerText = text.toLowerCase();

  const riskKeywords = [
    { pattern: /liabilit(y|ies)/i, type: 'liability', severity: 'high' },
    { pattern: /indemnif(y|ication)/i, type: 'indemnity', severity: 'high' },
    { pattern: /warrant(y|ies)/i, type: 'warranty', severity: 'medium' },
    { pattern: /intellectual property|ip rights/i, type: 'ip', severity: 'high' },
    { pattern: /payment|fee|compensation/i, type: 'payment', severity: 'high' },
    { pattern: /termination|cancel/i, type: 'termination', severity: 'medium' },
    { pattern: /confidential/i, type: 'confidentiality', severity: 'medium' },
  ];

  for (const { pattern, type, severity } of riskKeywords) {
    if (pattern.test(lowerText)) {
      return {
        type,
        description: `Change affects ${type} provisions`,
        severity,
        requires_review: severity === 'high' || severity === 'critical'
      };
    }
  }

  return null;
}
