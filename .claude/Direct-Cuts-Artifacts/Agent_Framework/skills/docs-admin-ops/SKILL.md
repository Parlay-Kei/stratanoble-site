# Documentation Admin Operations Skill

**Purpose:** Manage, audit, and maintain project documentation across codebases  
**Version:** 1.0.0  
**Created:** 2025-11-28

---

## Level 1: Quick Reference (0-2KB)

### Essential Commands

```bash
# Quick Documentation Health Check
docs-admin audit --quick              # Fast audit of doc structure
docs-admin validate --links           # Check for broken links
docs-admin inventory                  # List all documentation files

# Common Operations
docs-admin consolidate <file1> <file2> --output <merged>
docs-admin remove --unused            # Remove orphaned docs
docs-admin sync --readme              # Sync README with current state
```

### Quick Wins

| Task | Command |
|------|---------|
| Find all .md files | `find . -name "*.md" -not -path "./node_modules/*"` |
| Check for TODOs | `grep -r "TODO\|FIXME" docs/` |
| Word count | `wc -w docs/*.md` |
| Find duplicate content | `docs-admin duplicates --threshold 80` |

### Common Issues & Fixes

| Issue | Quick Fix |
|-------|-----------|
| Outdated README | Run `docs-admin sync --readme` |
| Broken internal links | Run `docs-admin validate --links --fix` |
| Missing CHANGELOG | Run `docs-admin init changelog` |
| Duplicate docs | Run `docs-admin consolidate --auto` |

---

## Level 2: Detailed Guide (2-5KB)

### Documentation Audit Workflow

**Step 1: Inventory Scan**
```typescript
const inventory = await docsAdmin.scanInventory({
  root: '.',
  exclude: ['node_modules', 'dist', '.git'],
  extensions: ['.md', '.txt', '.rst']
});

// Returns:
{
  total: 15,
  byLocation: {
    root: ['README.md', 'CHANGELOG.md'],
    docs: ['API.md', 'DEPLOYMENT.md', 'SECURITY.md'],
    specs: ['requirements.md', 'design.md']
  },
  orphaned: [],
  missing: ['CONTRIBUTING.md']
}
```

**Step 2: Content Analysis**
```typescript
const analysis = await docsAdmin.analyzeContent({
  checkAccuracy: true,
  checkLinks: true,
  checkReferences: true,
  compareToCode: true
});

// Returns:
{
  discrepancies: [
    { file: 'docs/API.md', issue: 'References non-existent endpoint /api/v2/users' },
    { file: 'README.md', issue: 'Component count outdated (says 19, actual 18)' }
  ],
  brokenLinks: [],
  redundancies: [
    { files: ['TESTING_GUIDE.md', 'TEST_PARAMETERS.md'], overlap: 85 }
  ]
}
```

**Step 3: Generate Report**
```typescript
const report = await docsAdmin.generateReport({
  format: 'markdown',
  includeRecommendations: true,
  prioritize: true
});
```

### Documentation Standards

**Required Files:**
- `README.md` - Project overview, setup, quick start
- `CHANGELOG.md` - Version history (Keep a Changelog format)
- `docs/` directory with:
  - `API.md` - API/service documentation
  - `DEPLOYMENT.md` - Deployment procedures
  - `SECURITY.md` - Security policies

**Recommended Files:**
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Community guidelines
- `LICENSE` - License information

### Consolidation Strategy

When merging redundant documentation:

```typescript
// 1. Identify overlapping content
const overlap = await docsAdmin.findOverlap(['TESTING_GUIDE.md', 'TEST_PARAMETERS.md']);

// 2. Create consolidated version
const consolidated = await docsAdmin.consolidate({
  sources: ['TESTING_GUIDE.md', 'TEST_PARAMETERS.md'],
  output: 'docs/TESTING.md',
  strategy: 'merge-unique',  // Keep unique content from each
  preserveStructure: 'first' // Use first file's structure
});

// 3. Update references
await docsAdmin.updateReferences({
  old: ['TESTING_GUIDE.md', 'TEST_PARAMETERS.md'],
  new: 'docs/TESTING.md'
});

// 4. Archive originals (optional)
await docsAdmin.archive(['TESTING_GUIDE.md', 'TEST_PARAMETERS.md']);
```

### Cross-Reference Validation

```typescript
// Validate that documentation matches code
const validation = await docsAdmin.crossValidate({
  docs: 'docs/API.md',
  source: 'src/services/',
  checkTypes: true,
  checkFunctions: true
});

// Returns:
{
  documented: ['barberService', 'appointmentService', 'bookingService'],
  undocumented: ['locationService'],
  outdated: [
    { name: 'reviewService', issue: 'Missing createReview function' }
  ]
}
```

### Version Tracking

```typescript
// Track documentation versions with code
const versions = await docsAdmin.trackVersions({
  changelog: 'CHANGELOG.md',
  package: 'package.json',
  audit: 'docs/APPLICATION_AUDIT.md'
});

// Ensure version consistency
await docsAdmin.syncVersions({
  source: 'package.json',
  targets: ['CHANGELOG.md', 'docs/APPLICATION_AUDIT.md']
});
```

---

## Level 3: Complete Reference (5KB+)

### Full Documentation Audit Process

```typescript
interface DocumentationAudit {
  // Phase 1: Discovery
  discovery: {
    scanFileSystem(): Promise<FileInventory>;
    identifyDocTypes(): Promise<DocTypeMap>;
    checkStructure(): Promise<StructureAnalysis>;
  };
  
  // Phase 2: Content Analysis
  analysis: {
    checkAccuracy(): Promise<AccuracyReport>;
    findRedundancies(): Promise<RedundancyReport>;
    validateLinks(): Promise<LinkValidation>;
    compareToSource(): Promise<SourceComparison>;
  };
  
  // Phase 3: Quality Assessment
  quality: {
    checkCompleteness(): Promise<CompletenessScore>;
    assessReadability(): Promise<ReadabilityMetrics>;
    validateFormatting(): Promise<FormatReport>;
    checkConsistency(): Promise<ConsistencyReport>;
  };
  
  // Phase 4: Remediation
  remediation: {
    generateReport(): Promise<AuditReport>;
    suggestImprovements(): Promise<Improvements[]>;
    autoFix(issues: Issue[]): Promise<FixResult>;
    createMissingDocs(): Promise<CreatedDocs[]>;
  };
}
```

### Document Type Detection

```typescript
const docTypes = {
  readme: {
    patterns: ['README.md', 'readme.md'],
    required: true,
    sections: ['description', 'installation', 'usage'],
    validators: [validateReadmeStructure, checkBadges, validateLinks]
  },
  changelog: {
    patterns: ['CHANGELOG.md', 'HISTORY.md', 'CHANGES.md'],
    required: true,
    format: 'keepachangelog',
    validators: [validateChangelogFormat, checkVersions, validateDates]
  },
  api: {
    patterns: ['API.md', 'docs/api/*.md'],
    required: true,
    sections: ['endpoints', 'authentication', 'errors'],
    validators: [validateApiDocs, checkEndpointAccuracy, validateExamples]
  },
  security: {
    patterns: ['SECURITY.md', 'docs/security.md'],
    required: true,
    sections: ['authentication', 'authorization', 'vulnerabilities'],
    validators: [validateSecurityDocs, checkCompliance]
  },
  deployment: {
    patterns: ['DEPLOYMENT.md', 'docs/deploy*.md'],
    required: false,
    sections: ['prerequisites', 'steps', 'verification'],
    validators: [validateDeploymentDocs, checkEnvironments]
  },
  testing: {
    patterns: ['TESTING.md', 'TEST*.md', 'docs/test*.md'],
    required: false,
    sections: ['setup', 'running', 'coverage'],
    validators: [validateTestDocs, checkTestCommands]
  },
  specs: {
    patterns: ['specs/*.md', 'spec/*.md'],
    required: false,
    sections: ['requirements', 'design', 'tasks'],
    validators: [validateSpecStructure, checkTaskCompletion]
  }
};
```

### Discrepancy Detection Algorithms

```typescript
// Code-to-Documentation Sync Check
async function detectDiscrepancies(codeDir: string, docsDir: string): Promise<Discrepancy[]> {
  const discrepancies: Discrepancy[] = [];
  
  // 1. Component Count Check
  const actualComponents = await countComponents(`${codeDir}/components`);
  const documentedComponents = await parseDocumentedCount(`${docsDir}/APPLICATION_AUDIT.md`, 'components');
  
  if (actualComponents !== documentedComponents) {
    discrepancies.push({
      type: 'count_mismatch',
      category: 'components',
      documented: documentedComponents,
      actual: actualComponents,
      file: 'APPLICATION_AUDIT.md',
      severity: 'medium',
      fix: `Update component count from ${documentedComponents} to ${actualComponents}`
    });
  }
  
  // 2. Service Documentation Check
  const actualServices = await listFiles(`${codeDir}/services`, '.ts');
  const documentedServices = await parseDocumentedServices(`${docsDir}/API.md`);
  
  const undocumented = actualServices.filter(s => !documentedServices.includes(s));
  const outdated = documentedServices.filter(s => !actualServices.includes(s));
  
  for (const service of undocumented) {
    discrepancies.push({
      type: 'missing_documentation',
      category: 'services',
      item: service,
      severity: 'high',
      fix: `Add documentation for ${service} to API.md`
    });
  }
  
  // 3. Database Schema Check
  const actualTables = await parseSchemaFile(`${codeDir}/../supabase/schema.sql`);
  const documentedTables = await parseDocumentedTables(`${docsDir}/APPLICATION_AUDIT.md`);
  
  const missingFromDocs = actualTables.filter(t => !documentedTables.includes(t));
  const missingFromSchema = documentedTables.filter(t => !actualTables.includes(t));
  
  return discrepancies;
}
```

### Redundancy Detection

```typescript
// Content Similarity Analysis
async function findRedundancies(files: string[]): Promise<Redundancy[]> {
  const redundancies: Redundancy[] = [];
  
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const content1 = await readFile(files[i]);
      const content2 = await readFile(files[j]);
      
      const similarity = calculateSimilarity(content1, content2);
      
      if (similarity > 0.6) {  // 60% threshold
        redundancies.push({
          files: [files[i], files[j]],
          similarity: Math.round(similarity * 100),
          recommendation: similarity > 0.8 
            ? 'consolidate' 
            : 'review for potential merge',
          overlappingSections: findOverlappingSections(content1, content2)
        });
      }
    }
  }
  
  return redundancies;
}

// Jaccard Similarity for text comparison
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(tokenize(text1));
  const words2 = new Set(tokenize(text2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
```

### Automated Documentation Generation

```typescript
// Generate missing documentation from code
async function generateMissingDocs(analysis: Analysis): Promise<GeneratedDoc[]> {
  const generated: GeneratedDoc[] = [];
  
  // Generate API docs from service files
  if (analysis.missing.includes('API.md')) {
    const services = await parseServiceFiles('src/services/');
    const apiDoc = generateApiDoc(services);
    generated.push({
      path: 'docs/API.md',
      content: apiDoc,
      source: 'auto-generated from src/services/'
    });
  }
  
  // Generate CHANGELOG from git history
  if (analysis.missing.includes('CHANGELOG.md')) {
    const commits = await getGitHistory();
    const changelog = generateChangelog(commits);
    generated.push({
      path: 'CHANGELOG.md',
      content: changelog,
      source: 'auto-generated from git history'
    });
  }
  
  // Generate component docs from TSDoc comments
  const components = await parseComponents('src/components/');
  for (const component of components) {
    if (!component.hasDocumentation) {
      const doc = generateComponentDoc(component);
      generated.push({
        path: `docs/components/${component.name}.md`,
        content: doc,
        source: 'auto-generated from TSDoc'
      });
    }
  }
  
  return generated;
}
```

### Cleanup Operations

```typescript
// Safe file removal with backup
async function cleanupDocumentation(config: CleanupConfig): Promise<CleanupResult> {
  const result: CleanupResult = {
    removed: [],
    archived: [],
    updated: [],
    errors: []
  };
  
  // 1. Remove unrelated files
  for (const file of config.unrelatedFiles) {
    if (config.archive) {
      await archiveFile(file, 'docs/archive/');
      result.archived.push(file);
    } else {
      await removeFile(file);
      result.removed.push(file);
    }
  }
  
  // 2. Consolidate redundant files
  for (const redundancy of config.redundancies) {
    const consolidated = await consolidateFiles(redundancy.files, {
      output: redundancy.output,
      strategy: redundancy.strategy
    });
    result.updated.push(consolidated);
    
    // Remove originals after successful consolidation
    for (const original of redundancy.files) {
      if (original !== redundancy.output) {
        await removeFile(original);
        result.removed.push(original);
      }
    }
  }
  
  // 3. Update references in remaining files
  await updateAllReferences(result.removed, result.updated);
  
  return result;
}
```

---

## Examples

### Example 1: Full Documentation Audit

```typescript
// Complete audit workflow
const audit = await docsAdmin.fullAudit({
  projectRoot: 'C:/Dev/Direct-Cuts',
  exclude: ['node_modules', 'dist', '.git', '.venv'],
  options: {
    checkCodeSync: true,
    findRedundancies: true,
    validateLinks: true,
    generateReport: true
  }
});

console.log(`
Documentation Audit Report
==========================
Total Files: ${audit.inventory.total}
Discrepancies Found: ${audit.discrepancies.length}
Redundancies Found: ${audit.redundancies.length}
Missing Required Docs: ${audit.missing.length}

Priority Actions:
${audit.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n')}
`);
```

### Example 2: Quick Cleanup

```typescript
// Fast cleanup of common issues
const cleanup = await docsAdmin.quickCleanup({
  removeOrphaned: true,
  consolidateRedundant: true,
  updateReferences: true,
  archiveRemoved: true
});

console.log(`Cleanup complete:
- Removed: ${cleanup.removed.length} files
- Consolidated: ${cleanup.consolidated.length} file groups
- Updated references in: ${cleanup.updatedRefs.length} files
`);
```

### Example 3: Sync README with Project

```typescript
// Keep README in sync with current state
const sync = await docsAdmin.syncReadme({
  source: 'README.md',
  updateSections: {
    'Project Structure': await generateStructure('src/'),
    'Database Schema': await generateSchemaList('supabase/'),
    'Documentation': await generateDocsList('docs/')
  },
  validateLinks: true
});
```

---

## Troubleshooting

### Issue: "Documentation out of sync with code"
**Solution:**
1. Run `docsAdmin.crossValidate()` to identify specific discrepancies
2. Use `docsAdmin.updateFromCode()` to auto-update counts and lists
3. Manually review complex discrepancies
4. Run validation again to confirm fixes

### Issue: "Duplicate content across files"
**Solution:**
1. Run `docsAdmin.findRedundancies()` to identify overlaps
2. Decide on consolidation strategy (merge, dedupe, or keep separate)
3. Use `docsAdmin.consolidate()` with appropriate options
4. Update all references to point to consolidated file
5. Archive or remove original files

### Issue: "Missing required documentation"
**Solution:**
1. Run `docsAdmin.checkRequired()` to list missing docs
2. Use `docsAdmin.generateTemplate()` to create stubs
3. Fill in project-specific content
4. Validate structure with `docsAdmin.validate()`

### Issue: "Broken internal links"
**Solution:**
1. Run `docsAdmin.validateLinks()` to find broken links
2. Use `docsAdmin.fixLinks()` to auto-fix where possible
3. Manually fix links that can't be auto-resolved
4. Re-run validation to confirm all fixed

---

## Related Skills

- **deployment-ops** - For deployment documentation sync
- **testing-ops** - For test documentation management
- **monitoring-ops** - For operational documentation
- **environment-ops** - For environment configuration docs

---

## Configuration

```json
{
  "docsAdmin": {
    "requiredDocs": ["README.md", "CHANGELOG.md", "docs/API.md", "docs/SECURITY.md"],
    "recommendedDocs": ["CONTRIBUTING.md", "docs/DEPLOYMENT.md", "docs/TESTING.md"],
    "excludePaths": ["node_modules", "dist", ".git", ".venv", "coverage"],
    "redundancyThreshold": 0.6,
    "archiveOnRemove": true,
    "validateLinksOnAudit": true,
    "syncWithCode": true
  }
}
```

---

**Last Updated:** 2025-11-28  
**Maintained By:** Documentation Admin Agent
