#!/usr/bin/env node

/**
 * Quick script to organize root-level .md, .txt, and .zip files
 */

import { readdirSync, statSync, renameSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// File categorization
function getTargetDir(fileName) {
  const ext = extname(fileName).toLowerCase();
  
  // Archive files
  if (ext === '.zip' || ext === '.txt' || fileName.endsWith('.tar.gz')) {
    return 'docs/archive';
  }
  
  // Ops files
  if (fileName.endsWith('-ops.md')) {
    return 'docs/ops';
  }
  
  // Agent files
  if (fileName.includes('-agent.md') || fileName.endsWith('_AGENT.md')) {
    return 'docs/agents';
  }
  
  // Completion files
  if (fileName.includes('_COMPLETE') || fileName.includes('COMPLETE_') || fileName.includes('_COMPLETION')) {
    return 'docs/completion';
  }
  
  // Guide files
  if (fileName.includes('_GUIDE') || fileName.includes('GUIDE_') || fileName.includes('_SETUP') || fileName.includes('SETUP_')) {
    return 'docs/guides';
  }
  
  // Report files
  if (fileName.includes('_REPORT') || fileName.includes('REPORT_') || fileName.includes('_STATUS') || fileName.includes('STATUS_')) {
    return 'docs/reports';
  }
  
  // Implementation files
  if (fileName.includes('_IMPLEMENTATION') || fileName.includes('IMPLEMENTATION_') || fileName.includes('_MIGRATION')) {
    return 'docs/implementation';
  }
  
  // Deployment files
  if (fileName.includes('_DEPLOYMENT') || fileName.includes('DEPLOYMENT_')) {
    return 'docs/deployment';
  }
  
  // Testing files
  if (fileName.includes('_TEST') || fileName.includes('TEST_') || fileName.includes('TESTING')) {
    return 'docs/testing';
  }
  
  // Default to docs root
  return 'docs';
}

// Get all files in root
const rootFiles = readdirSync(projectRoot, { withFileTypes: true })
  .filter(dirent => dirent.isFile())
  .map(dirent => dirent.name)
  .filter(name => {
    const ext = extname(name).toLowerCase();
    return ext === '.md' || ext === '.txt' || ext === '.zip' || name.endsWith('.tar.gz');
  });

console.log(`Found ${rootFiles.length} files to organize in root directory\n`);

let moved = 0;
let errors = [];

for (const fileName of rootFiles) {
  const sourcePath = join(projectRoot, fileName);
  const targetDir = getTargetDir(fileName);
  const targetPath = join(projectRoot, targetDir, fileName);
  
  // Skip if already in target location
  if (sourcePath === targetPath) continue;
  
  // Create target directory if it doesn't exist
  const targetDirPath = join(projectRoot, targetDir);
  if (!existsSync(targetDirPath)) {
    mkdirSync(targetDirPath, { recursive: true });
  }
  
  // Check if target already exists
  if (existsSync(targetPath)) {
    // Add timestamp to avoid conflicts
    const ext = extname(fileName);
    const nameWithoutExt = basename(fileName, ext);
    const timestamp = Date.now();
    const newTargetPath = join(projectRoot, targetDir, `${nameWithoutExt}_${timestamp}${ext}`);
    
    try {
      renameSync(sourcePath, newTargetPath);
      console.log(`  ✓ Moved: ${fileName} → ${targetDir}/${basename(newTargetPath)}`);
      moved++;
    } catch (error) {
      errors.push({ file: fileName, error: error.message });
    }
  } else {
    try {
      renameSync(sourcePath, targetPath);
      console.log(`  ✓ Moved: ${fileName} → ${targetDir}/`);
      moved++;
    } catch (error) {
      errors.push({ file: fileName, error: error.message });
    }
  }
}

console.log(`\n✓ Moved ${moved} files`);

if (errors.length > 0) {
  console.log(`\nErrors: ${errors.length}`);
  errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
}

