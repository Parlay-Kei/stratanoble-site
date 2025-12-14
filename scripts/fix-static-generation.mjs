#!/usr/bin/env node
/**
 * StrataNoble Build Fix Script v3
 * Adds 'export const dynamic = force-dynamic' to all page.tsx files
 * CRITICAL: Preserves 'use client' as first line in client components
 * - Client components: insert AFTER 'use client' but BEFORE imports
 * - Server components: insert AFTER all imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'apps', 'website', 'src', 'app');
const exportLine = "export const dynamic = 'force-dynamic';";

console.log('========================================');
console.log('  StrataNoble Build Fix Script v3');
console.log('========================================\n');

let fixed = 0;
let skipped = 0;
let errors = 0;

function findPageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findPageFiles(fullPath, files);
    } else if (entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

function findInsertPosition(content) {
  // CRITICAL: 'use client' must remain the FIRST line in client components!
  // For client components: insert AFTER 'use client' but BEFORE imports
  // For server components: insert AFTER all imports

  const lines = content.split(/\r?\n/);
  let inMultiLineImport = false;
  let lastImportEndLine = -1;
  let hasUseClient = false;
  let useClientLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for 'use client' directive (must be first non-empty line)
    // Handle with or without semicolon: 'use client' or 'use client';
    if (trimmed === "'use client'" || trimmed === '"use client"' ||
        trimmed === "'use client';" || trimmed === '"use client";') {
      hasUseClient = true;
      useClientLine = i;
      continue;
    }

    // Skip empty lines and comments at the start
    if (!inMultiLineImport && (trimmed === '' || trimmed.startsWith('//'))) {
      continue;
    }

    // Check if we're starting an import
    if (trimmed.startsWith('import ')) {
      // Check if import continues to next line (no semicolon or closing brace with semicolon)
      if (trimmed.endsWith(';')) {
        lastImportEndLine = i;
        inMultiLineImport = false;
      } else {
        inMultiLineImport = true;
      }
      continue;
    }

    // Handle continuation of multi-line import
    if (inMultiLineImport) {
      // Check for end of import - look for closing } with ;
      if (trimmed.includes(';')) {
        lastImportEndLine = i;
        inMultiLineImport = false;
      }
      continue;
    }

    // If we're not in an import and line isn't empty/comment, we've hit code
    if (!trimmed.startsWith('/*') && !trimmed.startsWith('*') && trimmed !== '') {
      break;
    }
  }

  // CRITICAL LOGIC:
  // If file has 'use client', insert IMMEDIATELY after 'use client' (before imports)
  // This ensures 'use client' stays as the first line
  if (hasUseClient) {
    return useClientLine + 1;
  }

  // If no 'use client' (server component), insert after all imports
  if (lastImportEndLine >= 0) {
    return lastImportEndLine + 1;
  }

  return 0;
}

const pages = findPageFiles(appDir);
console.log(`Found ${pages.length} page.tsx files\n`);

for (const pagePath of pages) {
  const relativePath = pagePath.replace(appDir, '').replace(/^[\\/]/, '');

  try {
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Skip if already has dynamic export
    if (/export\s+const\s+dynamic\s*=/.test(content)) {
      console.log(`SKIP: ${relativePath} (already has dynamic export)`);
      skipped++;
      continue;
    }

    // Skip API routes
    if (/[\\/]api[\\/]/.test(pagePath)) {
      console.log(`SKIP: ${relativePath} (API route)`);
      skipped++;
      continue;
    }

    // Find proper insertion point
    const insertLine = findInsertPosition(content);
    const lines = content.split(/\r?\n/);

    // Insert the export at the right position
    const newLines = [
      ...lines.slice(0, insertLine),
      '',
      exportLine,
      '',
      ...lines.slice(insertLine)
    ];

    // Clean up excessive blank lines
    let newContent = newLines.join('\n');
    newContent = newContent.replace(/\n{4,}/g, '\n\n\n'); // Max 2 blank lines

    fs.writeFileSync(pagePath, newContent, 'utf-8');

    console.log(`FIXED: ${relativePath}`);
    fixed++;

  } catch (err) {
    console.error(`ERROR: ${relativePath} - ${err.message}`);
    errors++;
  }
}

console.log('\n========================================');
console.log('  Summary');
console.log('========================================');
console.log(`  Fixed:   ${fixed}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Errors:  ${errors}`);
console.log('\nDone! Now run: cd apps/website && npm run build');

process.exit(errors);
