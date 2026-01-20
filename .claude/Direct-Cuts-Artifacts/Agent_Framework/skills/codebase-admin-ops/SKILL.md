# Codebase Admin Operations Skill

**Purpose:** Manage, audit, and maintain project codebases for organization and health  
**Version:** 1.0.0  
**Created:** 2025-11-28

---

## Level 1: Quick Reference (0-2KB)

### Essential Commands

```bash
# Quick Health Check
codebase-admin health                 # Overall project health
codebase-admin scan --structure       # Directory structure audit
codebase-admin deps --unused          # Find unused dependencies

# Common Operations
codebase-admin clean --temp           # Remove temp files
codebase-admin config --validate      # Validate all configs
codebase-admin env --audit            # Audit environment files
```

### Quick Wins

| Task | Command |
|------|---------|
| Find large files | `find . -size +1M -not -path "./node_modules/*"` |
| List root files | `ls -la | head -20` |
| Check unused deps | `npx depcheck` |
| Find TODO/FIXME | `grep -r "TODO\|FIXME" src/` |
| Count source files | `find src -name "*.ts" -o -name "*.tsx" | wc -l` |

### Common Issues & Fixes

| Issue | Quick Fix |
|-------|-----------|
| Unused dependencies | `npm prune && npm dedupe` |
| Multiple .env files | Consolidate to .env.local + .env.production |
| Orphaned files in root | Move to appropriate directory or delete |
| Large node_modules | `rm -rf node_modules && npm ci` |

---

## Level 2: Detailed Guide (2-5KB)

### Project Structure Audit

**Step 1: Scan Directory Structure**
```typescript
const structure = await codebaseAdmin.scanStructure({
  root: '.',
  depth: 3,
  exclude: ['node_modules', 'dist', '.git']
});

// Returns:
{
  directories: 25,
  files: 142,
  byType: {
    typescript: 85,
    markdown: 12,
    json: 8,
    other: 37
  },
  issues: [
    { path: 'walkthrough.md', issue: 'Development journal in root' },
    { path: 'specs/dnc-compliance-system/', issue: 'Unrelated project files' }
  ]
}
```

**Step 2: Validate Organization**
```typescript
const validation = await codebaseAdmin.validateOrganization({
  framework: 'react-vite',
  checkConventions: true
});

// Returns:
{
  score: 85,
  issues: [
    { severity: 'low', message: 'Utils could be in src/lib/' },
    { severity: 'medium', message: 'Hooks directory missing' }
  ],
  suggestions: [
    'Create src/hooks/ for custom React hooks',
    'Move greetingUtils.ts to src/lib/'
  ]
}
```

### Configuration Audit

```typescript
const configAudit = await codebaseAdmin.auditConfigs({
  types: ['env', 'build', 'typescript', 'package']
});

// Returns:
{
  files: {
    env: ['.env.local', '.env.production'],
    build: ['vite.config.ts', 'postcss.config.js'],
    typescript: ['tsconfig.json', 'tsconfig.node.json'],
    package: ['package.json', 'package-lock.json']
  },
  issues: [
    { file: '.env.production.verify', issue: 'Redundant file' },
    { file: 'tsconfig.json', issue: 'Missing strict mode' }
  ],
  redundant: ['.env.production.verify', '.env.production.verify.clean']
}
```

### Dependency Analysis

```typescript
const deps = await codebaseAdmin.analyzeDependencies({
  checkUsage: true,
  checkOutdated: true,
  checkSecurity: true
});

// Returns:
{
  total: 45,
  production: 30,
  development: 15,
  unused: ['some-unused-package'],
  outdated: [
    { name: 'react', current: '18.2.0', latest: '19.0.0' }
  ],
  vulnerabilities: [],
  duplicates: []
}
```

### File Cleanup Workflow

```typescript
// 1. Identify cleanup targets
const targets = await codebaseAdmin.identifyCleanupTargets({
  includeTemp: true,
  includeUnused: true,
  includeOrphaned: true
});

// 2. Review and approve
console.log('Files to remove:', targets.map(t => t.path));
const approved = await confirmWithUser(targets);

// 3. Execute cleanup
const result = await codebaseAdmin.cleanup({
  targets: approved,
  archive: true,  // Backup before delete
  dryRun: false
});

// 4. Verify
await codebaseAdmin.verifyCleanup();
```

### Environment File Management

```typescript
// Audit environment files
const envAudit = await codebaseAdmin.auditEnvFiles();

// Returns:
{
  files: [
    { name: '.env.local', vars: 3, status: 'active' },
    { name: '.env.production', vars: 3, status: 'active' },
    { name: '.env.production.verify', vars: 3, status: 'redundant' }
  ],
  issues: [
    { type: 'redundant', files: ['.env.production.verify*'] },
    { type: 'missing_example', message: 'No .env.example file' }
  ],
  recommendations: [
    'Remove .env.production.verify* files',
    'Create .env.example template'
  ]
}
```

---

## Level 3: Complete Reference (5KB+)

### Full Codebase Audit Process

```typescript
interface CodebaseAudit {
  // Phase 1: Structure
  structure: {
    scanDirectories(): Promise<DirectoryMap>;
    validateOrganization(): Promise<OrganizationScore>;
    findOrphans(): Promise<OrphanedFile[]>;
    checkConventions(): Promise<ConventionViolation[]>;
  };
  
  // Phase 2: Configuration
  configuration: {
    scanConfigs(): Promise<ConfigInventory>;
    validateConfigs(): Promise<ValidationResult[]>;
    findRedundant(): Promise<RedundantConfig[]>;
    checkSecrets(): Promise<SecretExposure[]>;
  };
  
  // Phase 3: Dependencies
  dependencies: {
    analyzeDeps(): Promise<DependencyAnalysis>;
    findUnused(): Promise<UnusedPackage[]>;
    checkSecurity(): Promise<Vulnerability[]>;
    checkOutdated(): Promise<OutdatedPackage[]>;
  };
  
  // Phase 4: Files
  files: {
    scanAll(): Promise<FileInventory>;
    findLarge(): Promise<LargeFile[]>;
    findTemp(): Promise<TempFile[]>;
    findDuplicates(): Promise<DuplicateFile[]>;
  };
  
  // Phase 5: Cleanup
  cleanup: {
    generatePlan(): Promise<CleanupPlan>;
    executeCleanup(): Promise<CleanupResult>;
    verifyCleanup(): Promise<VerificationResult>;
    rollback(): Promise<RollbackResult>;
  };
}
```

### Framework-Specific Conventions

```typescript
const frameworkConventions = {
  'react-vite': {
    requiredDirs: ['src', 'public'],
    recommendedDirs: ['src/components', 'src/pages', 'src/services', 'src/types'],
    rootFiles: ['index.html', 'vite.config.ts', 'tsconfig.json', 'package.json'],
    forbiddenInRoot: ['*.jsx', '*.tsx', 'walkthrough.md'],
    configFiles: {
      build: 'vite.config.ts',
      typescript: 'tsconfig.json',
      postcss: 'postcss.config.js',
      tailwind: 'tailwind.config.js'
    }
  },
  'next': {
    requiredDirs: ['pages', 'public'],
    recommendedDirs: ['components', 'lib', 'styles'],
    rootFiles: ['next.config.js', 'package.json'],
    configFiles: {
      build: 'next.config.js',
      typescript: 'tsconfig.json'
    }
  }
};
```

### Cleanup Target Identification

```typescript
async function identifyCleanupTargets(config: CleanupConfig): Promise<CleanupTarget[]> {
  const targets: CleanupTarget[] = [];
  
  // 1. Temporary files
  const tempPatterns = [
    '*.log', '*.tmp', '.DS_Store', 'Thumbs.db',
    '*.bak', '*.swp', '*~'
  ];
  
  for (const pattern of tempPatterns) {
    const files = await glob(pattern, { ignore: 'node_modules/**' });
    targets.push(...files.map(f => ({
      path: f,
      type: 'temp',
      reason: 'Temporary file',
      safe: true
    })));
  }
  
  // 2. Redundant configs
  const redundantEnvFiles = await findRedundantEnvFiles();
  targets.push(...redundantEnvFiles.map(f => ({
    path: f,
    type: 'config',
    reason: 'Redundant environment file',
    safe: true
  })));
  
  // 3. Orphaned directories
  const orphanedDirs = await findOrphanedDirectories();
  targets.push(...orphanedDirs.map(d => ({
    path: d.path,
    type: 'directory',
    reason: d.reason,
    safe: d.hasNoReferences
  })));
  
  // 4. Development artifacts
  const devArtifacts = await findDevArtifacts();
  targets.push(...devArtifacts.map(f => ({
    path: f.path,
    type: 'artifact',
    reason: 'Development artifact not needed in production',
    safe: f.safe
  })));
  
  // 5. Unrelated project files
  const unrelatedFiles = await findUnrelatedFiles();
  targets.push(...unrelatedFiles.map(f => ({
    path: f.path,
    type: 'unrelated',
    reason: f.reason,
    safe: true
  })));
  
  return targets;
}
```

### Dependency Cleanup

```typescript
async function cleanupDependencies(options: DepCleanupOptions): Promise<DepCleanupResult> {
  const result: DepCleanupResult = {
    removed: [],
    deduped: [],
    updated: [],
    errors: []
  };
  
  // 1. Find unused dependencies
  const unused = await findUnusedDependencies();
  
  // 2. Confirm removal
  if (options.interactive) {
    const confirmed = await confirmRemoval(unused);
    for (const pkg of confirmed) {
      try {
        await exec(`npm uninstall ${pkg}`);
        result.removed.push(pkg);
      } catch (error) {
        result.errors.push({ package: pkg, error });
      }
    }
  }
  
  // 3. Dedupe
  if (options.dedupe) {
    await exec('npm dedupe');
    result.deduped = await getDedupeResults();
  }
  
  // 4. Prune
  if (options.prune) {
    await exec('npm prune');
  }
  
  // 5. Update outdated (if requested)
  if (options.updateOutdated) {
    const outdated = await findOutdatedPackages();
    for (const pkg of outdated.filter(p => p.safe)) {
      try {
        await exec(`npm update ${pkg.name}`);
        result.updated.push(pkg);
      } catch (error) {
        result.errors.push({ package: pkg.name, error });
      }
    }
  }
  
  return result;
}
```

### Pre-Production Audit

```typescript
async function preProductionAudit(): Promise<AuditReport> {
  const checks: AuditCheck[] = [];
  
  // 1. No development files in production paths
  checks.push({
    name: 'No dev files',
    passed: !(await hasDevFilesInProd()),
    details: await listDevFilesInProd()
  });
  
  // 2. All configs valid
  checks.push({
    name: 'Valid configs',
    passed: await allConfigsValid(),
    details: await validateAllConfigs()
  });
  
  // 3. No console.logs in production code
  checks.push({
    name: 'No console.logs',
    passed: !(await hasConsoleLogs()),
    details: await listConsoleLogs()
  });
  
  // 4. No TODO/FIXME in critical paths
  checks.push({
    name: 'No TODO in critical',
    passed: !(await hasTodoInCritical()),
    details: await listCriticalTodos()
  });
  
  // 5. .gitignore covers sensitive files
  checks.push({
    name: 'Gitignore complete',
    passed: await gitignoreComplete(),
    details: await checkGitignore()
  });
  
  // 6. Build succeeds
  checks.push({
    name: 'Build succeeds',
    passed: await buildSucceeds(),
    details: await getBuildOutput()
  });
  
  // 7. No security vulnerabilities
  checks.push({
    name: 'No vulnerabilities',
    passed: !(await hasVulnerabilities()),
    details: await runSecurityAudit()
  });
  
  // 8. Documentation up to date
  checks.push({
    name: 'Docs up to date',
    passed: await docsUpToDate(),
    details: await checkDocumentation()
  });
  
  return {
    passed: checks.every(c => c.passed),
    score: (checks.filter(c => c.passed).length / checks.length) * 100,
    checks,
    recommendations: generateRecommendations(checks)
  };
}
```

---

## Examples

### Example 1: Full Codebase Audit

```typescript
const audit = await codebaseAdmin.fullAudit({
  projectRoot: 'C:/Dev/Direct-Cuts',
  framework: 'react-vite',
  options: {
    checkStructure: true,
    checkConfigs: true,
    checkDependencies: true,
    checkDocumentation: true
  }
});

console.log(`
Codebase Audit Report
=====================
Health Score: ${audit.score}/100

Structure: ${audit.structure.issues.length} issues
Configs: ${audit.configs.redundant.length} redundant files
Dependencies: ${audit.deps.unused.length} unused packages
Documentation: ${audit.docs.discrepancies.length} discrepancies

Top Actions:
${audit.recommendations.slice(0, 5).map((r, i) => `${i+1}. ${r}`).join('\n')}
`);
```

### Example 2: Quick Cleanup

```typescript
const cleanup = await codebaseAdmin.quickCleanup({
  removeTemp: true,
  removeRedundantConfigs: true,
  pruneDependencies: true,
  archive: true
});

console.log(`
Cleanup Complete
================
Removed: ${cleanup.removed.length} files
Archived: ${cleanup.archived.length} files
Pruned: ${cleanup.pruned.length} packages
Space freed: ${cleanup.spaceSaved}
`);
```

### Example 3: Pre-Production Check

```typescript
const preCheck = await codebaseAdmin.preProductionAudit();

if (!preCheck.passed) {
  console.log('❌ Pre-production audit failed:');
  preCheck.checks
    .filter(c => !c.passed)
    .forEach(c => console.log(`  - ${c.name}: ${c.details}`));
} else {
  console.log('✅ Ready for production!');
}
```

---

## Troubleshooting

### Issue: "Build fails after cleanup"
**Solution:**
1. Check git diff to see what was removed
2. Restore from archive if files were backed up
3. Run `npm install` to restore dependencies
4. Verify import paths are still valid

### Issue: "Missing dependencies after prune"
**Solution:**
1. Check if package is a peer dependency
2. Verify it's not imported dynamically
3. Reinstall with `npm install <package>`
4. Add to explicit dependencies if needed

### Issue: "Config validation errors"
**Solution:**
1. Check specific error message
2. Compare to framework documentation
3. Restore backup config if needed
4. Test build after changes

---

## Related Skills

- **docs-admin-ops** - For documentation-specific tasks
- **deployment-ops** - For deployment configuration
- **testing-ops** - For test file organization
- **environment-ops** - For environment management

---

## Configuration

```json
{
  "codebaseAdmin": {
    "framework": "react-vite",
    "excludePaths": ["node_modules", "dist", ".git", "coverage"],
    "archiveOnDelete": true,
    "maxFileSize": "5MB",
    "autoCleanTemp": true,
    "validateOnSave": false
  }
}
```

---

**Last Updated:** 2025-11-28  
**Maintained By:** Codebase Admin Agent
