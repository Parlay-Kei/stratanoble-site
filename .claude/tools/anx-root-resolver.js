/**
 * ANX Root Resolver
 * Universal resolution of ANX canonical root across all projects
 */

const fs = require('fs');
const path = require('path');

let cachedRoot = null;
let resolutionMethod = null;

function getANXRoot() {
  if (cachedRoot) return cachedRoot;

  // 1. Environment variable (highest priority)
  const envRoot = process.env.ANX_ROOT;
  if (envRoot) {
    const resolved = path.resolve(envRoot);
    if (fs.existsSync(resolved)) {
      cachedRoot = resolved;
      resolutionMethod = 'environment';
      console.log(`[ANX] Root resolved via ANX_ROOT: ${resolved}`);
      return cachedRoot;
    } else {
      throw new Error(`[ANX_ROOT_RESOLVER] ANX_ROOT env var points to non-existent path: ${envRoot}`);
    }
  }

  // 2. Canonical fallback
  const canonical = 'C:\\Dev\\.claude-anx';
  if (fs.existsSync(canonical)) {
    cachedRoot = canonical;
    resolutionMethod = 'canonical';
    console.log(`[ANX] Root resolved via canonical path: ${canonical}`);
    return cachedRoot;
  }

  // 3. Project-local detection (temporary migration support)
  const projectLocal = findProjectLocal();
  if (projectLocal) {
    console.warn('[ANX] WARNING: Using project-local .claude - migrate to canonical .claude-anx');
    console.warn('[ANX] Migration guide: https://docs.anx/canonical-root-migration');
    cachedRoot = projectLocal;
    resolutionMethod = 'project-local';
    return cachedRoot;
  }

  // 4. Fail fast with clear diagnostics
  const error = new Error(`
[ANX_ROOT_RESOLVER] No valid ANX root found

Diagnostics:
  Current working directory: ${process.cwd()}
  ANX_ROOT environment variable: ${envRoot || 'undefined'}
  Canonical path checked: ${canonical}
  Project .claude searched: none found

Resolution Options:
  1. Set ANX_ROOT environment variable:
     export ANX_ROOT="C:\\Dev\\.claude-anx"

  2. Ensure canonical path exists:
     mkdir -p "${canonical}"

  3. Use project-local .claude (temporary):
     mkdir .claude

For setup help: https://docs.anx/installation
`);

  error.code = 'ANX_ROOT_NOT_FOUND';
  throw error;
}

function findProjectLocal() {
  let currentDir = process.cwd();
  const maxDepth = 10; // Prevent infinite loops
  let depth = 0;

  while (currentDir !== path.dirname(currentDir) && depth < maxDepth) {
    const claudeDir = path.join(currentDir, '.claude');
    if (fs.existsSync(claudeDir)) {
      const toolsDir = path.join(claudeDir, 'tools');
      const skillsDir = path.join(claudeDir, 'skills');

      // Only consider it a valid ANX root if it has ANX structure
      if (fs.existsSync(toolsDir) || fs.existsSync(skillsDir)) {
        return claudeDir;
      }
    }
    currentDir = path.dirname(currentDir);
    depth++;
  }
  return null;
}

function validateCanonicalRoot() {
  const potentialRoots = [
    'C:\\Dev\\.claude',
    'C:\\Dev\\.claude-anx'
  ];

  const existingRoots = potentialRoots.filter(root => {
    try {
      return fs.existsSync(root) && fs.statSync(root).isDirectory();
    } catch (e) {
      return false;
    }
  });

  if (existingRoots.length > 1) {
    console.error('[ANX_ROOT_GUARD] 🚨 CANONICAL ROOT REGRESSION DETECTED');
    console.error('[ANX_ROOT_GUARD]');
    console.error('[ANX_ROOT_GUARD] Expected: Single canonical root at C:\\Dev\\.claude-anx');
    console.error('[ANX_ROOT_GUARD] Found multiple roots:');
    existingRoots.forEach(root => {
      console.error(`[ANX_ROOT_GUARD]   - ${root}`);
    });
    console.error('[ANX_ROOT_GUARD]');
    console.error('[ANX_ROOT_GUARD] Action Required:');
    console.error('[ANX_ROOT_GUARD]   1. Migrate non-canonical roots to shims');
    console.error('[ANX_ROOT_GUARD]   2. Remove duplicate ANX installations');
    console.error('[ANX_ROOT_GUARD]   3. Use canonical root: C:\\Dev\\.claude-anx');
    console.error('[ANX_ROOT_GUARD]');
    console.error('[ANX_ROOT_GUARD] Migration guide: https://docs.anx/canonical-root');

    process.exit(1);
  }

  if (existingRoots.length === 0) {
    console.error('[ANX_ROOT_GUARD] No ANX root found');
    console.error('[ANX_ROOT_GUARD] Setup guide: https://docs.anx/installation');
    process.exit(1);
  }

  console.log(`[ANX_ROOT_GUARD] ✅ Canonical root validated: ${existingRoots[0]}`);
  return existingRoots[0];
}

function getResolutionInfo() {
  const root = getANXRoot();
  return {
    path: root,
    method: resolutionMethod,
    exists: fs.existsSync(root),
    writable: isWritable(root),
    timestamp: new Date().toISOString()
  };
}

function isWritable(dirPath) {
  try {
    const testFile = path.join(dirPath, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch (e) {
    return false;
  }
}

// Self-test mode
if (require.main === module) {
  console.log('ANX Root Resolver - Self Test');
  console.log('============================');

  try {
    const info = getResolutionInfo();
    console.log('✅ Resolution successful:');
    console.log(`   Path: ${info.path}`);
    console.log(`   Method: ${info.method}`);
    console.log(`   Exists: ${info.exists}`);
    console.log(`   Writable: ${info.writable}`);
    console.log(`   Timestamp: ${info.timestamp}`);

    // Test validation
    console.log('\n🔍 Running validation...');
    validateCanonicalRoot();

  } catch (error) {
    console.error('❌ Resolution failed:');
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  getANXRoot,
  validateCanonicalRoot,
  getResolutionInfo,
  findProjectLocal
};