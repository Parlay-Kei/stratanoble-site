#!/usr/bin/env node

/**
 * Documentation Admin - Comprehensive Documentation Organization Tool
 * Implements docs-admin-ops skill functionality
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, renameSync } from 'fs';
import { join, dirname, basename, extname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Configuration
const CONFIG = {
  docsPath: join(projectRoot, 'docs'),
  rootPath: projectRoot,
  archivePath: join(projectRoot, 'docs', 'archive'),
  staleThresholdDays: 30,
  orphanThresholdDays: 7,
  redundancyThreshold: 0.6,
  requiredFiles: [
    'README.md',
    'CHANGELOG.md',
    'docs/API.md',
    'docs/SECURITY.md',
    'docs/DEPLOYMENT.md'
  ],
  recommendedFiles: [
    'CONTRIBUTING.md',
    'docs/TESTING.md',
    'LICENSE'
  ]
};

// File categories for organization
const FILE_CATEGORIES = {
  root: {
    pattern: /^(README|CHANGELOG|CONTRIBUTING|LICENSE|AGENT|CLAUDE|SKILL)\.md$/i,
    target: 'root'
  },
  completion: {
    pattern: /_COMPLETE|COMPLETE_|_COMPLETION|COMPLETION_/i,
    target: 'docs/completion'
  },
  guides: {
    pattern: /_GUIDE|GUIDE_|_SETUP|SETUP_|HOW_TO|INSTRUCTIONS/i,
    target: 'docs/guides'
  },
  reports: {
    pattern: /_REPORT|REPORT_|_AUDIT|AUDIT_|_STATUS|STATUS_/i,
    target: 'docs/reports'
  },
  implementation: {
    pattern: /_IMPLEMENTATION|IMPLEMENTATION_|_MIGRATION|MIGRATION_/i,
    target: 'docs/implementation'
  },
  deployment: {
    pattern: /_DEPLOYMENT|DEPLOYMENT_|DEPLOY_/i,
    target: 'docs/deployment'
  },
  testing: {
    pattern: /_TEST|TEST_|TESTING/i,
    target: 'docs/testing'
  },
  ops: {
    pattern: /-ops\.md$/i,
    target: 'docs/ops'
  },
  agent: {
    pattern: /-agent\.md$|agent-.*\.md$/i,
    target: 'docs/agents'
  }
};

// Utility functions
function getAllMarkdownFiles(dir, fileList = []) {
  const files = readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = join(dir, file.name);
    
    // Skip node_modules, .git, and other ignored directories
    if (file.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'temp', 'tmp', 'root'].includes(file.name)) {
        getAllMarkdownFiles(filePath, fileList);
      }
    } else if (file.isFile() && (extname(file.name) === '.md' || extname(file.name) === '.txt' || extname(file.name) === '.zip' || file.name.endsWith('.tar.gz'))) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function getFileStats(filePath) {
  try {
    const stats = statSync(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime
    };
  } catch (error) {
    return null;
  }
}

function getGitLastModified(filePath) {
  try {
    const relativePath = relative(projectRoot, filePath).replace(/\\/g, '/');
    const result = execSync(`git log -1 --format="%ai" -- "${relativePath}"`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return new Date(result.trim());
  } catch (error) {
    const stats = getFileStats(filePath);
    return stats ? stats.modified : new Date();
  }
}

function daysSince(date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function extractYAMLFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    }
  }
  return frontmatter;
}

function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }
  
  return links;
}

function categorizeFile(filePath) {
  const fileName = basename(filePath);
  const relativePath = relative(projectRoot, filePath);
  const fileDir = dirname(relativePath);
  const fileParentDir = dirname(filePath);
  
  // Only process files that are in the root directory (not in subdirectories)
  // Root files have their parent directory equal to projectRoot
  const isRootFile = fileParentDir === projectRoot || fileDir === '.' || fileDir === relativePath;
  
  if (!isRootFile) {
    // Skip files in subdirectories (except docs which we want to organize)
    if (!relativePath.startsWith('docs/')) {
      return { category: 'skip', target: relativePath };
    }
  }
  
  // Check if already in docs directory
  if (relativePath.startsWith('docs/')) {
    return { category: 'docs', target: relativePath };
  }
  
  // Handle .zip files - move to docs/archive
  if (extname(fileName) === '.zip') {
    return { category: 'archive', target: 'docs/archive' };
  }
  
  // Handle .txt files - move to docs/archive
  if (extname(fileName) === '.txt') {
    return { category: 'archive', target: 'docs/archive' };
  }
  
  // Handle .tar.gz files - move to docs/archive
  if (fileName.endsWith('.tar.gz')) {
    return { category: 'archive', target: 'docs/archive' };
  }
  
  // Check against categories
  for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
    if (config.pattern.test(fileName) || config.pattern.test(relativePath)) {
      return { category, target: config.target };
    }
  }
  
  // Default: move to docs root
  return { category: 'other', target: 'docs' };
}

// Main operations
function scanInventory() {
  console.log('📊 Scanning documentation inventory...\n');
  
  const allFiles = getAllMarkdownFiles(projectRoot);
  const inventory = {
    total: allFiles.length,
    byLocation: {},
    byCategory: {},
    files: []
  };
  
  for (const filePath of allFiles) {
    const relativePath = relative(projectRoot, filePath);
    const stats = getFileStats(filePath);
    const lastModified = getGitLastModified(filePath);
    const content = readFileSync(filePath, 'utf-8');
    const frontmatter = extractYAMLFrontmatter(content);
    const links = extractLinks(content);
    const category = categorizeFile(filePath);
    
    const fileInfo = {
      path: relativePath,
      fullPath: filePath,
      name: basename(filePath),
      size: stats?.size || 0,
      lastModified,
      daysSinceEdit: daysSince(lastModified),
      hasFrontmatter: !!frontmatter,
      frontmatter,
      linkCount: links.length,
      category: category.category,
      targetCategory: category.target,
      wordCount: content.split(/\s+/).length
    };
    
    inventory.files.push(fileInfo);
    
    // Count by location
    const dir = dirname(relativePath);
    inventory.byLocation[dir] = (inventory.byLocation[dir] || 0) + 1;
    
    // Count by category
    inventory.byCategory[category.category] = (inventory.byCategory[category.category] || 0) + 1;
  }
  
  return inventory;
}

function detectStale(inventory, thresholdDays = CONFIG.staleThresholdDays) {
  return inventory.files
    .filter(file => file.daysSinceEdit >= thresholdDays)
    .sort((a, b) => b.daysSinceEdit - a.daysSinceEdit)
    .map(file => ({
      path: file.path,
      daysSinceEdit: file.daysSinceEdit,
      lastModified: file.lastModified,
      recommendation: file.daysSinceEdit > 90 ? 'AUTO-ARCHIVE' :
                      file.daysSinceEdit > 60 ? 'ARCHIVE' : 'REVIEW'
    }));
}

function detectOrphans(inventory) {
  // Build link graph
  const linkMap = new Map();
  
  for (const file of inventory.files) {
    const content = readFileSync(file.fullPath, 'utf-8');
    const links = extractLinks(content);
    
    for (const link of links) {
      if (!link.url.startsWith('http') && !link.url.startsWith('mailto:')) {
        const targetPath = resolve(dirname(file.fullPath), link.url).replace(/\\/g, '/');
        const relativeTarget = relative(projectRoot, targetPath);
        
        if (!linkMap.has(relativeTarget)) {
          linkMap.set(relativeTarget, []);
        }
        linkMap.get(relativeTarget).push(file.path);
      }
    }
  }
  
  // Find files with no incoming links
  return inventory.files
    .filter(file => {
      const incomingLinks = linkMap.get(file.path) || [];
      return incomingLinks.length === 0 && file.daysSinceEdit >= CONFIG.orphanThresholdDays;
    })
    .map(file => ({
      path: file.path,
      incomingLinks: 0,
      daysSinceEdit: file.daysSinceEdit,
      recommendation: file.daysSinceEdit > 14 ? 'ARCHIVE' : 'INTEGRATE'
    }));
}

function findRedundancies(inventory) {
  // Simple similarity check based on file names and sizes
  const redundancies = [];
  const processed = new Set();
  
  for (let i = 0; i < inventory.files.length; i++) {
    for (let j = i + 1; j < inventory.files.length; j++) {
      const file1 = inventory.files[i];
      const file2 = inventory.files[j];
      
      const key = `${file1.path}-${file2.path}`;
      if (processed.has(key)) continue;
      processed.add(key);
      
      // Check for similar names
      const name1 = file1.name.toLowerCase().replace(/[_-]/g, '');
      const name2 = file2.name.toLowerCase().replace(/[_-]/g, '');
      
      if (name1.includes(name2) || name2.includes(name1)) {
        const similarity = Math.min(name1.length, name2.length) / Math.max(name1.length, name2.length);
        
        if (similarity >= CONFIG.redundancyThreshold) {
          redundancies.push({
            file1: file1.path,
            file2: file2.path,
            similarity: Math.round(similarity * 100),
            recommendation: similarity >= 0.8 ? 'CONSOLIDATE' : 'REVIEW'
          });
        }
      }
    }
  }
  
  return redundancies.sort((a, b) => b.similarity - a.similarity);
}

function validateLinks(inventory) {
  const broken = [];
  const valid = [];
  const external = [];
  
  for (const file of inventory.files) {
    const content = readFileSync(file.fullPath, 'utf-8');
    const links = extractLinks(content);
    
    for (const link of links) {
      if (link.url.startsWith('http') || link.url.startsWith('mailto:')) {
        external.push({ file: file.path, link: link.url });
      } else {
        const targetPath = resolve(dirname(file.fullPath), link.url);
        if (existsSync(targetPath)) {
          valid.push({ file: file.path, link: link.url });
        } else {
          broken.push({ file: file.path, link: link.url });
        }
      }
    }
  }
  
  return { valid, broken, external };
}

function checkRequiredFiles(inventory) {
  const existing = new Set(inventory.files.map(f => f.path.replace(/\\/g, '/')));
  const missing = [];
  const present = [];
  
  for (const required of CONFIG.requiredFiles) {
    if (existing.has(required)) {
      present.push(required);
    } else {
      missing.push(required);
    }
  }
  
  return { missing, present };
}

function organizeFilesystem(inventory, dryRun = false) {
  console.log('📁 Organizing filesystem...\n');
  
  const moves = [];
  const errors = [];
  
  // Ensure target directories exist
  const targetDirs = new Set();
  for (const file of inventory.files) {
    const target = join(projectRoot, file.targetCategory, basename(file.path));
    const targetDir = dirname(target);
    targetDirs.add(targetDir);
  }
  
  if (!dryRun) {
    for (const dir of targetDirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }
  
  // Organize files
  for (const file of inventory.files) {
    // Skip files that should not be moved
    if (file.category === 'skip') continue;
    
    const currentPath = file.fullPath;
    const targetPath = join(projectRoot, file.targetCategory, basename(file.path));
    
    // Skip if already in correct location
    if (currentPath === targetPath) continue;
    
    // Skip if target already exists (unless it's the same file)
    if (existsSync(targetPath) && currentPath !== targetPath && !dryRun) {
      // Check if it's a duplicate - if so, skip moving
      const currentContent = readFileSync(currentPath);
      const targetContent = readFileSync(targetPath);
      if (currentContent.equals(targetContent)) {
        // Same content, skip
        continue;
      }
      // Different content, append timestamp
      const ext = extname(file.path);
      const nameWithoutExt = basename(file.path, ext);
      const timestamp = Date.now();
      const newTargetPath = join(projectRoot, file.targetCategory, `${nameWithoutExt}_${timestamp}${ext}`);
      moves.push({
        from: file.path,
        to: file.targetCategory + '/' + basename(newTargetPath),
        fullFrom: currentPath,
        fullTo: newTargetPath
      });
      
      if (!dryRun) {
        try {
          renameSync(currentPath, newTargetPath);
          console.log(`  ✓ Moved: ${file.path} → ${file.targetCategory}/${basename(newTargetPath)}`);
        } catch (error) {
          errors.push({
            file: file.path,
            error: error.message
          });
        }
      }
      continue;
    }
    
    moves.push({
      from: file.path,
      to: file.targetCategory + '/' + basename(file.path),
      fullFrom: currentPath,
      fullTo: targetPath
    });
    
    if (!dryRun) {
      try {
        renameSync(currentPath, targetPath);
        console.log(`  ✓ Moved: ${file.path} → ${file.targetCategory}/`);
      } catch (error) {
        errors.push({
          file: file.path,
          error: error.message
        });
      }
    }
  }
  
  return { moves, errors };
}

function generateReport(inventory, stale, orphans, redundancies, linkValidation, requiredFiles) {
  const report = {
    date: new Date().toISOString(),
    auditor: 'DocuForge Elite',
    summary: {
      totalDocs: inventory.total,
      healthy: inventory.total - orphans.length - stale.length,
      issues: orphans.length + stale.length + linkValidation.broken.length + redundancies.length,
      healthScore: Math.round(((inventory.total - orphans.length - stale.length - linkValidation.broken.length) / inventory.total) * 100)
    },
    findings: {
      orphans: {
        count: orphans.length,
        items: orphans
      },
      stale: {
        count: stale.length,
        items: stale
      },
      brokenLinks: {
        count: linkValidation.broken.length,
        items: linkValidation.broken
      },
      redundancies: {
        count: redundancies.length,
        items: redundancies
      },
      missingRequired: {
        count: requiredFiles.missing.length,
        items: requiredFiles.missing
      }
    },
    inventory: {
      byLocation: inventory.byLocation,
      byCategory: inventory.byCategory
    }
  };
  
  return report;
}

function generateTOC(inventory, report) {
  const toc = `---
project: Documentation
status: Active
priority: P0
updated: ${new Date().toISOString().split('T')[0]}
owner: DocuForge Elite
---

# Documentation Dashboard (TOC)

> Last updated: ${new Date().toISOString()}
> Total documents: ${inventory.total}
> Health score: ${report.summary.healthScore}%

## Quick Navigation

- [API Documentation](API.md)
- [Security Policies](SECURITY.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Testing Guide](TESTING.md)
- [Development Guide](development/README.md)

## Summary

- **Total Documents**: ${inventory.total}
- **Healthy Documents**: ${report.summary.healthy}
- **Issues Found**: ${report.summary.issues}
- **Health Score**: ${report.summary.healthScore}%

## Issues Requiring Attention

### Orphan Documents (${report.findings.orphans.count})
${report.findings.orphans.items.length > 0 ? report.findings.orphans.items.map(o => `- [${o.path}](${o.path}) - ${o.daysSinceEdit} days, ${o.recommendation}`).join('\n') : 'None'}

### Stale Documents (${report.findings.stale.count})
${report.findings.stale.items.length > 0 ? report.findings.stale.items.slice(0, 10).map(s => `- [${s.path}](${s.path}) - ${s.daysSinceEdit} days, ${s.recommendation}`).join('\n') : 'None'}

### Broken Links (${report.findings.brokenLinks.count})
${report.findings.brokenLinks.items.length > 0 ? report.findings.brokenLinks.items.slice(0, 10).map(b => `- [${b.file}](${b.file}) → ${b.link}`).join('\n') : 'None'}

### Redundant Documents (${report.findings.redundancies.count})
${report.findings.redundancies.items.length > 0 ? report.findings.redundancies.items.slice(0, 10).map(r => `- [${r.file1}](${r.file1}) ↔ [${r.file2}](${r.file2}) - ${r.similarity}% similar, ${r.recommendation}`).join('\n') : 'None'}

## Documentation Structure

### By Location
${Object.entries(inventory.byLocation).sort((a, b) => b[1] - a[1]).map(([loc, count]) => `- \`${loc}\`: ${count} files`).join('\n')}

### By Category
${Object.entries(inventory.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => `- ${cat}: ${count} files`).join('\n')}

## Recently Updated

${inventory.files.sort((a, b) => b.lastModified - a.lastModified).slice(0, 10).map(f => `- [${f.name}](${f.path}) - ${f.daysSinceEdit} days ago`).join('\n')}

---

*Generated by DocuForge Elite Documentation Admin*
`;

  return toc;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'audit';
  const dryRun = args.includes('--dry-run');
  
  console.log('🔍 Documentation Admin - DocuForge Elite\n');
  console.log(`Command: ${command}\n`);
  
  try {
    switch (command) {
      case 'scan':
        const inventory = scanInventory();
        console.log(`Total documents: ${inventory.total}`);
        console.log(`By location:`, inventory.byLocation);
        console.log(`By category:`, inventory.byCategory);
        break;
        
      case 'audit':
      case 'report':
        console.log('Running comprehensive audit...\n');
        const inv = scanInventory();
        const stale = detectStale(inv);
        const orphans = detectOrphans(inv);
        const redundancies = findRedundancies(inv);
        const linkValidation = validateLinks(inv);
        const requiredFiles = checkRequiredFiles(inv);
        
        const report = generateReport(inv, stale, orphans, redundancies, linkValidation, requiredFiles);
        
        console.log('\n📊 AUDIT REPORT\n');
        console.log(`Total Documents: ${report.summary.totalDocs}`);
        console.log(`Healthy: ${report.summary.healthy}`);
        console.log(`Issues: ${report.summary.issues}`);
        console.log(`Health Score: ${report.summary.healthScore}%\n`);
        
        console.log(`Orphan Documents: ${report.findings.orphans.count}`);
        console.log(`Stale Documents: ${report.findings.stale.count}`);
        console.log(`Broken Links: ${report.findings.brokenLinks.count}`);
        console.log(`Redundancies: ${report.findings.redundancies.count}`);
        console.log(`Missing Required Files: ${report.findings.missingRequired.count}\n`);
        
        // Save report
        const reportPath = join(CONFIG.docsPath, 'DOCUMENTATION_AUDIT_REPORT.json');
        writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`Report saved to: ${reportPath}`);
        break;
        
      case 'organize':
        console.log('Organizing filesystem...\n');
        const inv2 = scanInventory();
        const orgResult = organizeFilesystem(inv2, dryRun);
        
        if (dryRun) {
          console.log(`\nDry run - would move ${orgResult.moves.length} files:`);
          orgResult.moves.forEach(m => console.log(`  ${m.from} → ${m.to}`));
        } else {
          console.log(`\nMoved ${orgResult.moves.length} files`);
          if (orgResult.errors.length > 0) {
            console.log(`Errors: ${orgResult.errors.length}`);
            orgResult.errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
          }
        }
        break;
        
      case 'toc':
        console.log('Generating TOC...\n');
        const inv3 = scanInventory();
        const stale3 = detectStale(inv3);
        const orphans3 = detectOrphans(inv3);
        const redundancies3 = findRedundancies(inv3);
        const linkValidation3 = validateLinks(inv3);
        const requiredFiles3 = checkRequiredFiles(inv3);
        const report3 = generateReport(inv3, stale3, orphans3, redundancies3, linkValidation3, requiredFiles3);
        const toc = generateTOC(inv3, report3);
        
        const tocPath = join(CONFIG.docsPath, 'TOC.md');
        writeFileSync(tocPath, toc);
        console.log(`TOC generated: ${tocPath}`);
        break;
        
      case 'full':
        console.log('Running full documentation admin operations...\n');
        
        // 1. Scan
        const inv4 = scanInventory();
        console.log(`\n✓ Scanned ${inv4.total} documents\n`);
        
        // 2. Audit
        const stale4 = detectStale(inv4);
        const orphans4 = detectOrphans(inv4);
        const redundancies4 = findRedundancies(inv4);
        const linkValidation4 = validateLinks(inv4);
        const requiredFiles4 = checkRequiredFiles(inv4);
        const report4 = generateReport(inv4, stale4, orphans4, redundancies4, linkValidation4, requiredFiles4);
        console.log(`\n✓ Audit complete - Health Score: ${report4.summary.healthScore}%\n`);
        
        // 3. Generate TOC
        const toc4 = generateTOC(inv4, report4);
        const tocPath4 = join(CONFIG.docsPath, 'TOC.md');
        writeFileSync(tocPath4, toc4);
        console.log(`✓ TOC generated: ${tocPath4}\n`);
        
        // 4. Organize
        const orgResult4 = organizeFilesystem(inv4, dryRun);
        if (dryRun) {
          console.log(`\n✓ Dry run - would move ${orgResult4.moves.length} files`);
        } else {
          console.log(`✓ Organized ${orgResult4.moves.length} files\n`);
        }
        
        // 5. Save report
        const reportPath4 = join(CONFIG.docsPath, 'DOCUMENTATION_AUDIT_REPORT.json');
        writeFileSync(reportPath4, JSON.stringify(report4, null, 2));
        console.log(`✓ Report saved: ${reportPath4}\n`);
        
        console.log('\n✅ Full documentation admin operations complete!\n');
        break;
        
      default:
        console.log(`
Usage: node scripts/docs-admin.mjs <command> [options]

Commands:
  scan       - Scan and inventory all documentation
  audit      - Run comprehensive audit
  organize   - Organize filesystem (use --dry-run to preview)
  toc        - Generate/update TOC.md
  full       - Run all operations (scan, audit, toc, organize)

Options:
  --dry-run  - Preview changes without executing
        `);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

