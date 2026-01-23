#!/usr/bin/env node
/**
 * Codebase Agent
 * Triggered on source code and script changes
 * Analyzes code quality, complexity, and potential issues
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, basename, extname, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Parse event from command line
const eventJson = process.argv[2];
if (!eventJson) {
  console.error('No event data provided');
  process.exit(1);
}

const event = JSON.parse(eventJson);

// Code patterns to analyze
const CODE_PATTERNS = {
  // Potential issues
  consoleLogs: /console\.(log|debug|info|warn|error)\(/g,
  debugger: /\bdebugger\b/g,
  todoComments: /\/\/\s*(TODO|FIXME|XXX|HACK|BUG)(?:\([^)]+\))?:?\s*(.+)/gi,

  // Code smells
  deepNesting: /^\s{16,}\S/gm, // 4+ levels of indentation
  longLines: /.{200,}/g, // Lines over 200 chars
  magicNumbers: /(?<![.\d])\b(?!0|1\b)\d{2,}\b(?!px|em|rem|%|vh|vw)/g,

  // Complexity indicators
  conditionals: /\b(if|else|switch|case|\?|&&|\|\|)\b/g,
  loops: /\b(for|while|do|forEach|map|filter|reduce)\b/g,
  functions: /\b(function|=>|async\s+function)\b/g,

  // Import analysis
  imports: /^import\s+(?:(?:\{[^}]+\}|[\w*]+)\s+from\s+)?['"]([^'"]+)['"]/gm,
  requires: /require\s*\(['"]([^'"]+)['"]\)/g,

  // Export analysis
  exports: /^export\s+(?:default\s+)?(?:const|let|var|function|class|async\s+function)\s+(\w+)/gm,

  // React patterns
  useEffect: /useEffect\s*\(/g,
  useState: /useState\s*\(/g,
  useCallback: /useCallback\s*\(/g,
  useMemo: /useMemo\s*\(/g,

  // Async patterns
  asyncFunctions: /async\s+(?:function\s+)?\w*\s*\(/g,
  awaitUsage: /\bawait\b/g,
  promiseCreation: /new\s+Promise/g,

  // Error handling
  tryCatch: /try\s*\{/g,
  catchBlock: /catch\s*\(/g,
  throwStatement: /throw\s+/g
};

// File type specific analysis
const FILE_ANALYZERS = {
  '.ts': analyzeTypeScript,
  '.tsx': analyzeTypeScript,
  '.js': analyzeJavaScript,
  '.jsx': analyzeJavaScript,
  '.sh': analyzeShellScript,
  '.ps1': analyzePowerShell
};

/**
 * Analyze TypeScript/TSX file
 */
function analyzeTypeScript(content, filePath) {
  const analysis = {
    type: 'TypeScript',
    imports: [],
    exports: [],
    components: [],
    hooks: { useEffect: 0, useState: 0, useCallback: 0, useMemo: 0 },
    complexity: {},
    issues: []
  };

  // Extract imports
  let match;
  CODE_PATTERNS.imports.lastIndex = 0;
  while ((match = CODE_PATTERNS.imports.exec(content)) !== null) {
    analysis.imports.push(match[1]);
  }

  // Extract exports
  CODE_PATTERNS.exports.lastIndex = 0;
  while ((match = CODE_PATTERNS.exports.exec(content)) !== null) {
    analysis.exports.push(match[1]);
  }

  // Count React hooks
  analysis.hooks.useEffect = (content.match(CODE_PATTERNS.useEffect) || []).length;
  analysis.hooks.useState = (content.match(CODE_PATTERNS.useState) || []).length;
  analysis.hooks.useCallback = (content.match(CODE_PATTERNS.useCallback) || []).length;
  analysis.hooks.useMemo = (content.match(CODE_PATTERNS.useMemo) || []).length;

  // Complexity metrics
  analysis.complexity = calculateComplexity(content);

  // Check for issues
  analysis.issues = findCodeIssues(content, filePath);

  // React-specific checks
  if (filePath.endsWith('.tsx')) {
    // Check for missing memo on components with many hooks
    const totalHooks = Object.values(analysis.hooks).reduce((a, b) => a + b, 0);
    if (totalHooks > 5 && !content.includes('React.memo') && !content.includes('memo(')) {
      analysis.issues.push({
        type: 'OPTIMIZATION_OPPORTUNITY',
        severity: 'INFO',
        message: 'Component has many hooks, consider using React.memo'
      });
    }

    // Check for useEffect with missing dependencies warning potential
    if (analysis.hooks.useEffect > 3) {
      analysis.issues.push({
        type: 'COMPLEXITY',
        severity: 'INFO',
        message: 'Multiple useEffect hooks - consider consolidating or extracting custom hooks'
      });
    }
  }

  return analysis;
}

/**
 * Analyze JavaScript file
 */
function analyzeJavaScript(content, filePath) {
  const analysis = {
    type: 'JavaScript',
    imports: [],
    exports: [],
    complexity: {},
    issues: []
  };

  // Extract imports/requires
  let match;
  CODE_PATTERNS.imports.lastIndex = 0;
  while ((match = CODE_PATTERNS.imports.exec(content)) !== null) {
    analysis.imports.push(match[1]);
  }

  CODE_PATTERNS.requires.lastIndex = 0;
  while ((match = CODE_PATTERNS.requires.exec(content)) !== null) {
    analysis.imports.push(match[1]);
  }

  // Complexity metrics
  analysis.complexity = calculateComplexity(content);

  // Find issues
  analysis.issues = findCodeIssues(content, filePath);

  return analysis;
}

/**
 * Analyze shell script
 */
function analyzeShellScript(content, filePath) {
  const analysis = {
    type: 'ShellScript',
    commands: [],
    issues: []
  };

  // Check for shebang
  if (!content.startsWith('#!')) {
    analysis.issues.push({
      type: 'MISSING_SHEBANG',
      severity: 'WARNING',
      message: 'Shell script missing shebang line'
    });
  }

  // Check for unsafe patterns
  if (content.includes('eval ')) {
    analysis.issues.push({
      type: 'UNSAFE_EVAL',
      severity: 'HIGH',
      message: 'Script uses eval - potential security risk'
    });
  }

  if (content.includes('rm -rf')) {
    analysis.issues.push({
      type: 'DANGEROUS_COMMAND',
      severity: 'WARNING',
      message: 'Script contains rm -rf - verify paths are safe'
    });
  }

  // Check for unquoted variables
  if (content.match(/\$\w+[^"'\s]/g)) {
    analysis.issues.push({
      type: 'UNQUOTED_VARIABLE',
      severity: 'INFO',
      message: 'Script may have unquoted variables - can cause issues with spaces'
    });
  }

  return analysis;
}

/**
 * Analyze PowerShell script
 */
function analyzePowerShell(content, filePath) {
  const analysis = {
    type: 'PowerShell',
    cmdlets: [],
    issues: []
  };

  // Check for execution policy bypass
  if (content.toLowerCase().includes('bypass')) {
    analysis.issues.push({
      type: 'EXECUTION_POLICY',
      severity: 'INFO',
      message: 'Script may bypass execution policy'
    });
  }

  // Check for dangerous cmdlets
  if (content.includes('Remove-Item') && content.includes('-Recurse')) {
    analysis.issues.push({
      type: 'DANGEROUS_COMMAND',
      severity: 'WARNING',
      message: 'Script contains recursive Remove-Item - verify paths are safe'
    });
  }

  return analysis;
}

/**
 * Calculate code complexity metrics
 */
function calculateComplexity(content) {
  const lines = content.split('\n');
  const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('*'));

  return {
    totalLines: lines.length,
    codeLines: codeLines.length,
    conditionals: (content.match(CODE_PATTERNS.conditionals) || []).length,
    loops: (content.match(CODE_PATTERNS.loops) || []).length,
    functions: (content.match(CODE_PATTERNS.functions) || []).length,
    asyncFunctions: (content.match(CODE_PATTERNS.asyncFunctions) || []).length,
    tryCatch: (content.match(CODE_PATTERNS.tryCatch) || []).length
  };
}

/**
 * Find common code issues
 */
function findCodeIssues(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Console logs
  const consoleLogs = content.match(CODE_PATTERNS.consoleLogs) || [];
  if (consoleLogs.length > 0) {
    issues.push({
      type: 'CONSOLE_LOG',
      severity: 'INFO',
      message: `${consoleLogs.length} console statement(s) found`,
      count: consoleLogs.length
    });
  }

  // Debugger statements
  if (CODE_PATTERNS.debugger.test(content)) {
    issues.push({
      type: 'DEBUGGER',
      severity: 'WARNING',
      message: 'debugger statement found - remove before production'
    });
  }

  // TODOs
  const todos = [];
  let match;
  CODE_PATTERNS.todoComments.lastIndex = 0;
  while ((match = CODE_PATTERNS.todoComments.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;
    todos.push({
      type: match[1],
      text: match[2].trim(),
      line: lineNumber
    });
  }
  if (todos.length > 0) {
    issues.push({
      type: 'TODO_COMMENTS',
      severity: 'INFO',
      message: `${todos.length} TODO/FIXME comment(s) found`,
      details: todos.slice(0, 5) // First 5
    });
  }

  // Deep nesting
  const deepNesting = content.match(CODE_PATTERNS.deepNesting) || [];
  if (deepNesting.length > 3) {
    issues.push({
      type: 'DEEP_NESTING',
      severity: 'WARNING',
      message: `${deepNesting.length} deeply nested code blocks (4+ levels)`
    });
  }

  // Long lines
  const longLines = content.match(CODE_PATTERNS.longLines) || [];
  if (longLines.length > 0) {
    issues.push({
      type: 'LONG_LINES',
      severity: 'INFO',
      message: `${longLines.length} line(s) over 200 characters`
    });
  }

  // Large file
  if (lines.length > 500) {
    issues.push({
      type: 'LARGE_FILE',
      severity: 'INFO',
      message: `File has ${lines.length} lines - consider splitting`
    });
  }

  // No error handling
  const complexity = calculateComplexity(content);
  if (complexity.asyncFunctions > 0 && complexity.tryCatch === 0) {
    issues.push({
      type: 'MISSING_ERROR_HANDLING',
      severity: 'WARNING',
      message: 'Async functions without try/catch blocks'
    });
  }

  return issues;
}

/**
 * Main codebase analysis
 */
async function runCodebaseAnalysis() {
  console.log(`\n[Codebase Agent] Analyzing: ${event.path}`);
  console.log(`[Codebase Agent] Event type: ${event.eventType}`);

  const results = {
    analyzedAt: new Date().toISOString(),
    file: event.path,
    eventType: event.eventType,
    language: null,
    metrics: {},
    issues: [],
    analysis: {}
  };

  // Handle file deletion
  if (event.eventType === 'unlink') {
    console.log('[Codebase Agent] Source file deleted');
    results.analysis = {
      action: 'FILE_DELETED'
    };
    return results;
  }

  // Check if file exists
  const fullPath = event.fullPath;
  if (!existsSync(fullPath)) {
    console.log('[Codebase Agent] File no longer exists, skipping analysis');
    return results;
  }

  // Get file type
  const ext = extname(fullPath).toLowerCase();
  results.language = ext;

  // Read file content
  try {
    const content = readFileSync(fullPath, 'utf-8');

    // Get appropriate analyzer
    const analyzer = FILE_ANALYZERS[ext];

    if (analyzer) {
      const analysis = analyzer(content, event.path);
      results.analysis = analysis;
      results.issues = analysis.issues || [];
      results.metrics = analysis.complexity || {};
    } else {
      // Generic metrics for unknown types
      results.metrics = calculateComplexity(content);
    }

    // Summary
    console.log(`[Codebase Agent] Analysis complete:`);
    console.log(`  - Language: ${results.language}`);
    console.log(`  - Lines: ${results.metrics.totalLines || 0}`);
    console.log(`  - Functions: ${results.metrics.functions || 0}`);
    console.log(`  - Complexity (conditionals): ${results.metrics.conditionals || 0}`);
    console.log(`  - Issues found: ${results.issues.length}`);

  } catch (error) {
    console.error(`[Codebase Agent] Error reading file: ${error.message}`);
    results.error = error.message;
  }

  // Output results
  console.log('\n[Codebase Agent] Results:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// Run the analysis
runCodebaseAnalysis()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('[Codebase Agent] Fatal error:', error);
    process.exit(1);
  });
