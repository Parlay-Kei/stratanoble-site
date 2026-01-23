#!/usr/bin/env node
/**
 * Documentation Agent
 * Triggered on documentation file changes
 * Validates structure, checks for broken links, and tracks documentation health
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Parse event from command line
const eventJson = process.argv[2];
if (!eventJson) {
  console.error('No event data provided');
  process.exit(1);
}

const event = JSON.parse(eventJson);

// Documentation quality checks
const DOC_PATTERNS = {
  // Missing sections
  missingTitle: /^(?!#\s)/m,
  emptyFile: /^\s*$/,

  // Broken links
  markdownLink: /\[([^\]]+)\]\(([^)]+)\)/g,
  imageLink: /!\[([^\]]*)\]\(([^)]+)\)/g,

  // TODO/FIXME tracking
  todos: /(?:TODO|FIXME|XXX|HACK|BUG)(?:\([^)]+\))?:?\s*(.+)/gi,

  // Code blocks without language
  unlabeledCodeBlock: /```\n(?![a-z])/gi,

  // Headers structure
  headers: /^(#{1,6})\s+(.+)$/gm,

  // Table of contents reference
  tocLink: /\[([^\]]+)\]\(#([^)]+)\)/g,

  // External links
  externalLink: /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,

  // Internal file references
  internalLink: /\[([^\]]+)\]\((?!http|#)([^)]+)\)/g
};

// Documentation templates/conventions
const DOC_CONVENTIONS = {
  requiredSections: ['Overview', 'Usage', 'API'],
  maxLineLengthSoft: 120,
  minDescriptionLength: 50
};

/**
 * Extract all links from markdown content
 */
function extractLinks(content) {
  const links = {
    internal: [],
    external: [],
    images: [],
    anchors: []
  };

  // Internal links
  let match;
  DOC_PATTERNS.internalLink.lastIndex = 0;
  while ((match = DOC_PATTERNS.internalLink.exec(content)) !== null) {
    links.internal.push({
      text: match[1],
      href: match[2],
      index: match.index
    });
  }

  // External links
  DOC_PATTERNS.externalLink.lastIndex = 0;
  while ((match = DOC_PATTERNS.externalLink.exec(content)) !== null) {
    links.external.push({
      text: match[1],
      href: match[2],
      index: match.index
    });
  }

  // Images
  DOC_PATTERNS.imageLink.lastIndex = 0;
  while ((match = DOC_PATTERNS.imageLink.exec(content)) !== null) {
    links.images.push({
      alt: match[1],
      src: match[2],
      index: match.index
    });
  }

  // Anchor links (TOC)
  DOC_PATTERNS.tocLink.lastIndex = 0;
  while ((match = DOC_PATTERNS.tocLink.exec(content)) !== null) {
    links.anchors.push({
      text: match[1],
      anchor: match[2],
      index: match.index
    });
  }

  return links;
}

/**
 * Extract headers from markdown
 */
function extractHeaders(content) {
  const headers = [];
  let match;

  DOC_PATTERNS.headers.lastIndex = 0;
  while ((match = DOC_PATTERNS.headers.exec(content)) !== null) {
    headers.push({
      level: match[1].length,
      text: match[2],
      index: match.index,
      anchor: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    });
  }

  return headers;
}

/**
 * Check for broken internal links
 */
function checkInternalLinks(links, docDir, projectRoot) {
  const broken = [];

  for (const link of links.internal) {
    // Resolve the link path
    let targetPath = link.href;

    // Handle relative paths
    if (!targetPath.startsWith('/')) {
      targetPath = join(docDir, targetPath);
    } else {
      targetPath = join(projectRoot, targetPath);
    }

    // Remove anchor from path
    const pathWithoutAnchor = targetPath.split('#')[0];

    if (pathWithoutAnchor && !existsSync(pathWithoutAnchor)) {
      broken.push({
        type: 'BROKEN_LINK',
        text: link.text,
        href: link.href,
        message: `File not found: ${link.href}`
      });
    }
  }

  // Check images
  for (const img of links.images) {
    let imgPath = img.src;

    if (!imgPath.startsWith('http')) {
      if (!imgPath.startsWith('/')) {
        imgPath = join(docDir, imgPath);
      } else {
        imgPath = join(projectRoot, imgPath);
      }

      if (!existsSync(imgPath)) {
        broken.push({
          type: 'BROKEN_IMAGE',
          alt: img.alt,
          src: img.src,
          message: `Image not found: ${img.src}`
        });
      }
    }
  }

  return broken;
}

/**
 * Check anchor links against headers
 */
function checkAnchorLinks(anchorLinks, headers) {
  const issues = [];
  const headerAnchors = new Set(headers.map(h => h.anchor));

  for (const link of anchorLinks) {
    if (!headerAnchors.has(link.anchor)) {
      issues.push({
        type: 'BROKEN_ANCHOR',
        text: link.text,
        anchor: link.anchor,
        message: `Anchor not found: #${link.anchor}`
      });
    }
  }

  return issues;
}

/**
 * Extract TODOs and FIXMEs
 */
function extractTodos(content) {
  const todos = [];
  let match;

  DOC_PATTERNS.todos.lastIndex = 0;
  while ((match = DOC_PATTERNS.todos.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;

    todos.push({
      type: match[0].split(/[(:]/)[0].toUpperCase(),
      text: match[1].trim(),
      line: lineNumber
    });
  }

  return todos;
}

/**
 * Analyze document structure
 */
function analyzeStructure(content, headers) {
  const issues = [];

  // Check for title (H1)
  const hasTitle = headers.some(h => h.level === 1);
  if (!hasTitle) {
    issues.push({
      type: 'MISSING_TITLE',
      severity: 'WARNING',
      message: 'Document is missing a title (# heading)'
    });
  }

  // Check heading hierarchy
  let prevLevel = 0;
  for (const header of headers) {
    if (header.level > prevLevel + 1) {
      issues.push({
        type: 'HEADING_SKIP',
        severity: 'INFO',
        message: `Heading level skipped: "${header.text}" (h${header.level} after h${prevLevel})`
      });
    }
    prevLevel = header.level;
  }

  // Check for very short content
  const contentLength = content.replace(/```[\s\S]*?```/g, '').length;
  if (contentLength < DOC_CONVENTIONS.minDescriptionLength) {
    issues.push({
      type: 'THIN_CONTENT',
      severity: 'WARNING',
      message: 'Document has very little content'
    });
  }

  // Check for unlabeled code blocks
  DOC_PATTERNS.unlabeledCodeBlock.lastIndex = 0;
  const unlabeledBlocks = content.match(DOC_PATTERNS.unlabeledCodeBlock);
  if (unlabeledBlocks && unlabeledBlocks.length > 0) {
    issues.push({
      type: 'UNLABELED_CODE',
      severity: 'INFO',
      message: `${unlabeledBlocks.length} code block(s) without language specification`
    });
  }

  return issues;
}

/**
 * Main documentation analysis
 */
async function runDocAnalysis() {
  console.log(`\n[Docs Agent] Analyzing: ${event.path}`);
  console.log(`[Docs Agent] Event type: ${event.eventType}`);

  const results = {
    analyzedAt: new Date().toISOString(),
    file: event.path,
    eventType: event.eventType,
    metrics: {},
    issues: [],
    todos: [],
    links: { internal: 0, external: 0, images: 0, broken: 0 }
  };

  // Handle file deletion
  if (event.eventType === 'unlink') {
    console.log('[Docs Agent] Documentation file deleted');
    results.issues.push({
      type: 'DOC_DELETED',
      severity: 'WARNING',
      message: `Documentation file was deleted: ${event.path}`
    });
    return results;
  }

  // Handle staleness scan
  if (event.eventType === 'scan' && event.daysStale) {
    results.issues.push({
      type: 'STALE_DOCUMENTATION',
      severity: 'WARNING',
      message: `Documentation not updated in ${event.daysStale} days`,
      action: 'Review and update if needed'
    });
  }

  // Check if file exists
  const fullPath = event.fullPath;
  if (!existsSync(fullPath)) {
    console.log('[Docs Agent] File no longer exists, skipping analysis');
    return results;
  }

  // Read file content
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const docDir = dirname(fullPath);
    const projectRoot = join(__dirname, '..', '..');

    // Extract structure
    const links = extractLinks(content);
    const headers = extractHeaders(content);
    const todos = extractTodos(content);

    // Run checks
    const brokenLinks = checkInternalLinks(links, docDir, projectRoot);
    const anchorIssues = checkAnchorLinks(links.anchors, headers);
    const structureIssues = analyzeStructure(content, headers);

    // Compile results
    results.metrics = {
      wordCount: content.split(/\s+/).length,
      lineCount: content.split('\n').length,
      headerCount: headers.length,
      codeBlockCount: (content.match(/```/g) || []).length / 2
    };

    results.links = {
      internal: links.internal.length,
      external: links.external.length,
      images: links.images.length,
      broken: brokenLinks.length + anchorIssues.length
    };

    results.issues = [
      ...brokenLinks,
      ...anchorIssues,
      ...structureIssues
    ];

    results.todos = todos;

    // Summary
    console.log(`[Docs Agent] Analysis complete:`);
    console.log(`  - Word count: ${results.metrics.wordCount}`);
    console.log(`  - Headers: ${results.metrics.headerCount}`);
    console.log(`  - Links: ${results.links.internal} internal, ${results.links.external} external`);
    console.log(`  - Broken links: ${results.links.broken}`);
    console.log(`  - Issues found: ${results.issues.length}`);
    console.log(`  - TODOs found: ${results.todos.length}`);

  } catch (error) {
    console.error(`[Docs Agent] Error reading file: ${error.message}`);
    results.error = error.message;
  }

  // Output results
  console.log('\n[Docs Agent] Results:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// Run the analysis
runDocAnalysis()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('[Docs Agent] Fatal error:', error);
    process.exit(1);
  });
