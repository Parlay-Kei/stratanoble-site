#!/usr/bin/env node
/**
 * StrataNoble Client Page Fix Script
 *
 * Converts client-only pages to server component wrappers.
 * This fixes the "Cannot read properties of null (reading 'useState')" error
 * during Next.js 15 static page generation.
 *
 * Pattern:
 * - Moves client code to ComponentNameClient.tsx in /components/pages/
 * - Creates server wrapper page.tsx that imports the client component
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'apps', 'website', 'src', 'app');
const componentsDir = path.join(__dirname, '..', 'apps', 'website', 'src', 'components', 'pages');

// Ensure components/pages directory exists
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

console.log('========================================');
console.log('  StrataNoble Client Page Fix Script');
console.log('========================================\n');

let fixed = 0;
let skipped = 0;
let errors = 0;

function findPageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip API routes and special directories
      if (entry.name === 'api' || entry.name.startsWith('[')) {
        continue;
      }
      findPageFiles(fullPath, files);
    } else if (entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

function getPageName(pagePath) {
  const relativePath = pagePath.replace(appDir, '').replace(/[\\/]page\.tsx$/, '');
  const parts = relativePath.split(/[\\/]/).filter(Boolean);

  if (parts.length === 0) return 'Home';

  // Convert path to component name: /dashboard/analytics -> DashboardAnalytics
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase()))
    .join('');
}

function isClientComponent(content) {
  const firstLines = content.split(/\r?\n/).slice(0, 5).join('\n');
  return /'use client'|"use client"/.test(firstLines);
}

function hasHooks(content) {
  // Check if component uses React hooks directly (not just imports them)
  return /\buse(State|Effect|Ref|Callback|Memo|Context|Reducer|LayoutEffect|ImperativeHandle|DebugValue)\s*\(/.test(content);
}

const pages = findPageFiles(appDir);
console.log(`Found ${pages.length} page files\n`);

for (const pagePath of pages) {
  const relativePath = pagePath.replace(appDir, '').replace(/^[\\/]/, '');

  try {
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Skip if not a client component
    if (!isClientComponent(content)) {
      console.log(`SKIP: ${relativePath} (server component)`);
      skipped++;
      continue;
    }

    // Skip if it's already been fixed (imports from components/pages/)
    if (content.includes("from '@/components/pages/") || content.includes('from "@/components/pages/')) {
      console.log(`SKIP: ${relativePath} (already fixed)`);
      skipped++;
      continue;
    }

    // Skip if it doesn't use hooks (just has 'use client' for other reasons)
    if (!hasHooks(content)) {
      console.log(`SKIP: ${relativePath} (no hooks)`);
      skipped++;
      continue;
    }

    const pageName = getPageName(pagePath);
    const clientComponentName = `${pageName}PageClient`;
    const clientFileName = `${clientComponentName}.tsx`;
    const clientFilePath = path.join(componentsDir, clientFileName);

    // Find and extract the default export function name
    const exportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
    if (!exportMatch) {
      console.log(`SKIP: ${relativePath} (no default export function)`);
      skipped++;
      continue;
    }

    const originalFunctionName = exportMatch[1];

    // Transform the client code
    // 1. Change the export default function name to the client component name
    // 2. Add named export
    let clientContent = content;

    // Remove the 'use client' directive (it will be at the top of the new file)
    clientContent = clientContent.replace(/^['"]use client['"];?\s*\n?/m, '');

    // Remove the dynamic export (not needed in client component)
    clientContent = clientContent.replace(/export\s+const\s+dynamic\s*=\s*['"][^'"]+['"];\s*\n?/g, '');

    // Remove metadata export (not allowed in client components)
    clientContent = clientContent.replace(/export\s+const\s+metadata[^;]*;\s*\n?/g, '');
    clientContent = clientContent.replace(/export\s+const\s+metadata\s*:\s*Metadata\s*=\s*\{[\s\S]*?\};\s*\n?/g, '');

    // Change export default function to named export
    clientContent = clientContent.replace(
      /export\s+default\s+function\s+\w+/,
      `export function ${clientComponentName}`
    );

    // Add 'use client' at the top
    clientContent = `'use client';\n\n${clientContent.trim()}\n`;

    // Create the server wrapper
    const wrapperContent = `import { Metadata } from 'next';
import { ${clientComponentName} } from '@/components/pages/${clientComponentName}';

export const metadata: Metadata = {
  title: '${pageName} | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function ${originalFunctionName}() {
  return <${clientComponentName} />;
}
`;

    // Write the client component
    fs.writeFileSync(clientFilePath, clientContent, 'utf-8');

    // Write the server wrapper
    fs.writeFileSync(pagePath, wrapperContent, 'utf-8');

    console.log(`FIXED: ${relativePath}`);
    console.log(`       -> ${clientFileName}`);
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
