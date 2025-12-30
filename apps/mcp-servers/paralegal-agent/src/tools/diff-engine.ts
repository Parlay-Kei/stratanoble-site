import { z } from 'zod';
import * as Diff from 'diff';
import { getSupabaseClient, handleSupabaseError } from '../lib/supabase.js';
import type { DiffResult, ContractContent } from '../types/index.js';

/**
 * Input schema for the diff engine tool
 */
export const diffEngineInputSchema = z.object({
  base_document_id: z.string().uuid().describe('UUID of the base document for comparison'),
  comparison_document_id: z.string().uuid().describe('UUID of the document to compare against base'),
});

export type DiffEngineInput = z.infer<typeof diffEngineInputSchema>;

/**
 * Keywords that indicate risk-impacting changes
 */
const RISK_KEYWORDS = {
  high: [
    'unlimited liability', 'indemnify', 'indemnification', 'hold harmless',
    'consequential damages', 'punitive damages', 'work for hire',
    'exclusive license', 'perpetual', 'irrevocable', 'waive', 'waiver',
    'sole discretion', 'unilateral', 'termination for cause',
  ],
  medium: [
    'liability', 'damages', 'limitation', 'cap', 'insurance',
    'warranty', 'representation', 'covenant', 'assignment',
    'subcontract', 'intellectual property', 'confidential',
    'non-compete', 'non-solicit', 'governing law', 'jurisdiction',
  ],
  low: [
    'notice', 'payment terms', 'invoice', 'milestone', 'deliverable',
    'timeline', 'schedule', 'deadline', 'effective date',
  ],
};

/**
 * Analyze a change for risk impact
 */
function analyzeRiskImpact(
  section: string,
  oldText: string,
  newText: string
): { severity: 'low' | 'medium' | 'high'; description: string; recommendation?: string } | null {
  const combinedText = (oldText + ' ' + newText).toLowerCase();

  // Check for high-risk keywords
  for (const keyword of RISK_KEYWORDS.high) {
    if (combinedText.includes(keyword.toLowerCase())) {
      return {
        severity: 'high',
        description: `Change involves "${keyword}" in section "${section}"`,
        recommendation: 'Requires careful legal review before acceptance',
      };
    }
  }

  // Check for medium-risk keywords
  for (const keyword of RISK_KEYWORDS.medium) {
    if (combinedText.includes(keyword.toLowerCase())) {
      return {
        severity: 'medium',
        description: `Change involves "${keyword}" in section "${section}"`,
        recommendation: 'Review against playbook rules before acceptance',
      };
    }
  }

  // Check for low-risk keywords
  for (const keyword of RISK_KEYWORDS.low) {
    if (combinedText.includes(keyword.toLowerCase())) {
      return {
        severity: 'low',
        description: `Change involves "${keyword}" in section "${section}"`,
      };
    }
  }

  return null;
}

/**
 * Extract section title from text
 */
function extractSection(text: string): string {
  // Look for section headers in the text
  const headerMatch = text.match(/^#+\s+(.+)$/m);
  if (headerMatch) {
    return headerMatch[1];
  }

  // Look for numbered sections
  const numberedMatch = text.match(/^(\d+\.?\d*\.?\s+.+)$/m);
  if (numberedMatch) {
    return numberedMatch[1].substring(0, 50);
  }

  // Return truncated text as fallback
  return text.substring(0, 50) + (text.length > 50 ? '...' : '');
}

/**
 * Diff engine tool definition
 */
export const diffEngineTool = {
  name: 'compare_contracts',
  description: `Compare two contract versions and highlight changes.

Returns:
- Line-by-line diff showing additions, removals, and unchanged text
- Risk-impacting changes with severity ratings (low/medium/high)
- Summary of changes (added lines, removed lines, modified sections)
- Recommendations for reviewing significant changes

Use this tool to:
- Compare contract versions during negotiation
- Review changes proposed by the counterparty
- Track amendments and revisions over time
- Identify sections that require human review`,

  inputSchema: {
    type: 'object',
    properties: {
      base_document_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the base document for comparison',
      },
      comparison_document_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the document to compare against base',
      },
    },
    required: ['base_document_id', 'comparison_document_id'],
  },

  handler: async (input: DiffEngineInput): Promise<{
    success: boolean;
    diff?: DiffResult;
    error?: string;
  }> => {
    try {
      const { base_document_id, comparison_document_id } = diffEngineInputSchema.parse(input);

      const supabase = getSupabaseClient();

      // Fetch both documents
      const { data: baseDoc, error: baseError } = await supabase
        .from('contracts')
        .select('id, version, rendered_text, content')
        .eq('id', base_document_id)
        .single();

      if (baseError) {
        if (baseError.code === 'PGRST116') {
          return {
            success: false,
            error: `Base document not found: ${base_document_id}`,
          };
        }
        handleSupabaseError(baseError, 'Failed to fetch base document');
      }

      const { data: compDoc, error: compError } = await supabase
        .from('contracts')
        .select('id, version, rendered_text, content')
        .eq('id', comparison_document_id)
        .single();

      if (compError) {
        if (compError.code === 'PGRST116') {
          return {
            success: false,
            error: `Comparison document not found: ${comparison_document_id}`,
          };
        }
        handleSupabaseError(compError, 'Failed to fetch comparison document');
      }

      // Get text to compare (prefer rendered_text, fall back to content)
      const baseText = baseDoc.rendered_text ||
        (baseDoc.content as ContractContent)?.sections?.map(s => s.content).join('\n\n') ||
        JSON.stringify(baseDoc.content);

      const compText = compDoc.rendered_text ||
        (compDoc.content as ContractContent)?.sections?.map(s => s.content).join('\n\n') ||
        JSON.stringify(compDoc.content);

      // Perform diff
      const diffResults = Diff.diffLines(baseText, compText);

      // Build change list
      const changes: DiffResult['changes'] = [];
      const riskImpactingChanges: DiffResult['riskImpactingChanges'] = [];
      const modifiedSections = new Set<string>();
      let addedLines = 0;
      let removedLines = 0;

      for (const part of diffResults) {
        const lineCount = part.value.split('\n').filter(l => l.trim()).length;

        if (part.added) {
          changes.push({
            type: 'added',
            value: part.value,
            count: lineCount,
          });
          addedLines += lineCount;

          // Find preceding removed text for context
          const lastRemoved = changes.filter(c => c.type === 'removed').pop();
          const section = extractSection(part.value);
          modifiedSections.add(section);

          const riskAnalysis = analyzeRiskImpact(
            section,
            lastRemoved?.value || '',
            part.value
          );
          if (riskAnalysis) {
            riskImpactingChanges.push({
              section,
              ...riskAnalysis,
            });
          }
        } else if (part.removed) {
          changes.push({
            type: 'removed',
            value: part.value,
            count: lineCount,
          });
          removedLines += lineCount;
          modifiedSections.add(extractSection(part.value));
        } else {
          changes.push({
            type: 'unchanged',
            value: part.value,
            count: lineCount,
          });
        }
      }

      // Sort risk-impacting changes by severity
      const severityOrder = { high: 0, medium: 1, low: 2 };
      riskImpactingChanges.sort((a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity]
      );

      const result: DiffResult = {
        baseVersion: baseDoc.version,
        comparisonVersion: compDoc.version,
        changes,
        riskImpactingChanges,
        summary: {
          addedLines,
          removedLines,
          modifiedSections: [...modifiedSections],
        },
      };

      return {
        success: true,
        diff: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};

/**
 * Compare two text strings directly (for use without database)
 */
export function compareTexts(
  baseText: string,
  comparisonText: string,
  baseVersion = 1,
  comparisonVersion = 2
): DiffResult {
  const diffResults = Diff.diffLines(baseText, comparisonText);

  const changes: DiffResult['changes'] = [];
  const riskImpactingChanges: DiffResult['riskImpactingChanges'] = [];
  const modifiedSections = new Set<string>();
  let addedLines = 0;
  let removedLines = 0;

  for (const part of diffResults) {
    const lineCount = part.value.split('\n').filter(l => l.trim()).length;

    if (part.added) {
      changes.push({ type: 'added', value: part.value, count: lineCount });
      addedLines += lineCount;
      const section = extractSection(part.value);
      modifiedSections.add(section);
    } else if (part.removed) {
      changes.push({ type: 'removed', value: part.value, count: lineCount });
      removedLines += lineCount;
      modifiedSections.add(extractSection(part.value));
    } else {
      changes.push({ type: 'unchanged', value: part.value, count: lineCount });
    }
  }

  return {
    baseVersion,
    comparisonVersion,
    changes,
    riskImpactingChanges,
    summary: {
      addedLines,
      removedLines,
      modifiedSections: [...modifiedSections],
    },
  };
}
