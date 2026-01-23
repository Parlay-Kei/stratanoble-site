/**
 * Rule Matcher for File Monitor
 * Matches file paths against configured rules with glob patterns
 */

import { minimatch } from 'minimatch';
import { statSync, readFileSync } from 'fs';

class RuleMatcher {
  constructor(rules) {
    this.rules = rules || [];
    this.compiledPatterns = new Map();
    this.compilePatterns();
  }

  compilePatterns() {
    for (const rule of this.rules) {
      // Pre-compile minimatch patterns for performance
      this.compiledPatterns.set(rule.id, {
        pattern: rule.pattern,
        options: { dot: true, nocase: process.platform === 'win32' }
      });
    }
  }

  /**
   * Find all matching rules for a file path and event type
   */
  findMatchingRules(filePath, eventType) {
    const matches = [];
    const normalizedPath = filePath.replace(/\\/g, '/');

    for (const rule of this.rules) {
      // Check if event type matches
      if (!rule.events.includes(eventType) && !rule.events.includes('all')) {
        continue;
      }

      // Check pattern match
      const patternConfig = this.compiledPatterns.get(rule.id);
      if (minimatch(normalizedPath, rule.pattern, patternConfig.options)) {
        matches.push(rule);
      }
    }

    // Sort by priority
    return matches.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }

  /**
   * Check additional conditions for a rule
   */
  checkConditions(rule, filePath, fullPath) {
    if (!rule.conditions) {
      return { passes: true };
    }

    const conditions = rule.conditions;
    const results = { passes: true, details: {} };

    try {
      const stats = statSync(fullPath);

      // Check file size condition
      if (conditions.maxSizeKb) {
        const sizeKb = stats.size / 1024;
        results.details.size = { current: sizeKb, max: conditions.maxSizeKb };
        if (sizeKb <= conditions.maxSizeKb) {
          results.passes = false;
          results.details.sizeReason = 'File size within limits';
        }
      }

      // Check staleness condition
      if (conditions.staleDays) {
        const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        results.details.staleness = {
          daysSinceModified: Math.floor(daysSinceModified),
          threshold: conditions.staleDays
        };
        if (daysSinceModified < conditions.staleDays) {
          results.passes = false;
          results.details.stalenessReason = 'File not stale yet';
        }
      }

      // Check content match condition
      if (conditions.contentMatch && results.passes) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const flags = conditions.caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(conditions.contentMatch, flags);
          const matches = content.match(regex);

          results.details.contentMatch = {
            pattern: conditions.contentMatch,
            found: matches ? matches.length : 0
          };

          if (!matches || matches.length === 0) {
            results.passes = false;
            results.details.contentMatchReason = 'No matching content found';
          }
        } catch (readError) {
          // Binary file or read error - skip content check
          results.details.contentMatchReason = 'Could not read file content';
        }
      }

      // Check file extension condition
      if (conditions.extensions) {
        const ext = filePath.split('.').pop()?.toLowerCase();
        results.details.extension = { current: ext, allowed: conditions.extensions };
        if (!conditions.extensions.includes(ext)) {
          results.passes = false;
          results.details.extensionReason = 'Extension not in allowed list';
        }
      }

    } catch (statError) {
      // File might have been deleted
      results.details.error = statError.message;
      if (rule.events.includes('unlink')) {
        results.passes = true; // Still process unlink events
      } else {
        results.passes = false;
      }
    }

    return results;
  }

  /**
   * Get all rules for a specific trigger
   */
  getRulesForTrigger(trigger) {
    return this.rules.filter(rule => rule.trigger === trigger);
  }

  /**
   * Get all scan-type rules
   */
  getScanRules() {
    return this.rules.filter(rule => rule.events.includes('scan'));
  }

  /**
   * Update rules dynamically
   */
  updateRules(newRules) {
    this.rules = newRules;
    this.compiledPatterns.clear();
    this.compilePatterns();
  }

  /**
   * Add a single rule
   */
  addRule(rule) {
    this.rules.push(rule);
    this.compiledPatterns.set(rule.id, {
      pattern: rule.pattern,
      options: { dot: true, nocase: process.platform === 'win32' }
    });
  }

  /**
   * Remove a rule by ID
   */
  removeRule(ruleId) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
    this.compiledPatterns.delete(ruleId);
  }
}

export default RuleMatcher;
