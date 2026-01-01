---
name: docs-admin-ops
description: Elite documentation administration operations skill for the documentation-admin agent. Provides advanced capabilities for scanning, organizing, auditing, and maintaining project documentation at Vercel/Amazon scale.
version: 3.0.0
level: 3
triggers:
  - audit docs
  - organize documentation
  - scan docs
  - find orphan docs
  - stale documentation
  - docs status report
  - generate TOC
  - documentation cleanup
---

# docs-admin-ops Skill

Elite documentation operations for high-velocity teams. This skill enables the documentation-admin agent to operate at top-tier efficiency.

## Quick Commands

| Command | Action |
|---------|--------|
| `scan` | Full inventory scan of /docs |
| `audit` | Deep analysis with STATUS REPORT |
| `toc` | Generate/update TOC.md |
| `orphans` | Find docs with zero incoming links |
| `stale` | Find docs not edited >30 days |
| `cleanup` | Archive stale + orphan docs |
| `validate` | Check all links + frontmatter |
| `graph` | Build relationship graph |
| `report` | Generate full audit report |

---

## Level 1: Basic Operations

### scanInventory()
```typescript
/**
 * Scan all documentation files and return inventory
 */
async function scanInventory(path: string = './docs'): Promise<DocInventory> {
  // Glob for all markdown files
  const files = await glob(`${path}/**/*.md`);

  return {
    total: files.length,
    byType: categorizeByType(files),
    byProject: categorizeByProject(files),
    byStatus: categorizeByStatus(files),
    lastScan: new Date().toISOString()
  };
}
```

### analyzeContent()
```typescript
/**
 * Analyze document content for quality metrics
 */
async function analyzeContent(filePath: string): Promise<ContentAnalysis> {
  const content = await read(filePath);
  const frontmatter = extractYAMLFrontmatter(content);

  return {
    wordCount: countWords(content),
    hasYAMLFrontmatter: !!frontmatter,
    hasTOC: content.includes('## Table of Contents'),
    hasCodeExamples: /```\w+/.test(content),
    linkCount: countLinks(content),
    lastModified: await getGitLastModified(filePath),
    readabilityScore: calculateReadability(content)
  };
}
```

### validateLinks()
```typescript
/**
 * Validate all internal and external links
 */
async function validateLinks(path: string = './docs'): Promise<LinkValidation> {
  const files = await glob(`${path}/**/*.md`);
  const results = { valid: [], broken: [], external: [] };

  for (const file of files) {
    const links = extractLinks(await read(file));
    for (const link of links) {
      if (isExternal(link)) {
        results.external.push({ file, link });
      } else if (await exists(resolveLink(file, link))) {
        results.valid.push({ file, link });
      } else {
        results.broken.push({ file, link });
      }
    }
  }

  return results;
}
```

---

## Level 2: Advanced Operations

### findRedundancies()
```typescript
/**
 * Find documents with overlapping content
 */
async function findRedundancies(threshold: number = 0.6): Promise<Redundancy[]> {
  const files = await glob('./docs/**/*.md');
  const redundancies = [];

  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const similarity = await calculateSimilarity(files[i], files[j]);
      if (similarity >= threshold) {
        redundancies.push({
          file1: files[i],
          file2: files[j],
          similarity: Math.round(similarity * 100),
          recommendation: similarity >= 0.8 ? 'CONSOLIDATE' : 'REVIEW'
        });
      }
    }
  }

  return redundancies.sort((a, b) => b.similarity - a.similarity);
}
```

### consolidate()
```typescript
/**
 * Merge redundant documents while preserving unique content
 */
async function consolidate(
  files: string[],
  targetPath: string,
  options: ConsolidateOptions = {}
): Promise<ConsolidateResult> {
  // Extract unique sections from all files
  const sections = new Map<string, string>();

  for (const file of files) {
    const content = await read(file);
    const parsed = parseMarkdownSections(content);

    for (const [heading, body] of parsed) {
      if (!sections.has(heading) || body.length > sections.get(heading).length) {
        sections.set(heading, body);
      }
    }
  }

  // Build consolidated document
  const consolidated = buildDocument(sections, options);
  await write(targetPath, consolidated);

  // Archive originals
  for (const file of files) {
    await move(file, `./docs/archive/${basename(file)}`);
  }

  return {
    target: targetPath,
    archived: files,
    sectionsPreserved: sections.size
  };
}
```

### generateReport()
```typescript
/**
 * Generate comprehensive audit report
 */
async function generateReport(): Promise<AuditReport> {
  const inventory = await scanInventory();
  const linkValidation = await validateLinks();
  const redundancies = await findRedundancies();
  const orphans = await detectOrphans();
  const stale = await detectStale();

  return {
    date: new Date().toISOString(),
    auditor: 'DocuForge Elite',

    summary: {
      totalDocs: inventory.total,
      healthy: inventory.total - orphans.length - stale.length,
      issues: orphans.length + stale.length + linkValidation.broken.length
    },

    findings: {
      orphans,
      stale,
      brokenLinks: linkValidation.broken,
      redundancies,
      missingFrontmatter: await findMissingFrontmatter()
    },

    recommendations: generateRecommendations({
      orphans, stale, redundancies,
      brokenLinks: linkValidation.broken
    }),

    score: calculateAuditScore({
      inventory, linkValidation, orphans, stale, redundancies
    })
  };
}
```

---

## Level 3: Elite Operations

### generateTOC()
```typescript
/**
 * Auto-generate master TOC.md dashboard
 */
async function generateTOC(): Promise<void> {
  const inventory = await scanInventory();
  const projects = await getProjects();

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
> Health score: ${await calculateHealthScore()}%

## Quick Navigation

${generateQuickNav(inventory)}

## Projects

${projects.map(p => `
### ${p.name}
- Status: ${p.status}
- Priority: ${p.priority}
- Last Event: ${p.lastEvent}
- Docs: ${p.docCount}

${p.docs.map(d => `  - [${d.title}](${d.path})`).join('\n')}
`).join('\n')}

## Timeline

${await generateTimeline()}

## Recently Updated

${(await getRecentlyUpdated(10)).map(d =>
  `- [${d.title}](${d.path}) - ${d.lastModified}`
).join('\n')}

## Stale Documents (Needs Attention)

${(await detectStale()).map(d =>
  `- [${d.path}](${d.path}) - ${d.daysSinceEdit} days`
).join('\n') || 'None - all docs are current!'}
`;

  await write('./docs/TOC.md', toc);
}
```

### buildLinkGraph()
```typescript
/**
 * Build Obsidian-style link graph for documentation relationships
 */
async function buildLinkGraph(): Promise<LinkGraph> {
  const files = await glob('./docs/**/*.md');
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Build nodes
  for (const file of files) {
    const content = await read(file);
    const frontmatter = extractYAMLFrontmatter(content);

    nodes.push({
      id: file,
      label: getTitle(content) || basename(file),
      project: frontmatter?.project || 'Untagged',
      status: frontmatter?.status || 'Unknown',
      priority: frontmatter?.priority || 'P3'
    });
  }

  // Build edges (links between docs)
  for (const file of files) {
    const links = extractInternalLinks(await read(file));
    for (const link of links) {
      const target = resolveLink(file, link);
      if (nodes.find(n => n.id === target)) {
        edges.push({
          source: file,
          target,
          type: 'references'
        });
      }
    }
  }

  return { nodes, edges };
}
```

### detectOrphans()
```typescript
/**
 * Find documents with zero incoming links
 */
async function detectOrphans(thresholdDays: number = 7): Promise<OrphanDoc[]> {
  const graph = await buildLinkGraph();
  const orphans = [];

  for (const node of graph.nodes) {
    const incomingLinks = graph.edges.filter(e => e.target === node.id);

    if (incomingLinks.length === 0) {
      const lastModified = await getGitLastModified(node.id);
      const daysSinceEdit = daysSince(lastModified);

      if (daysSinceEdit >= thresholdDays) {
        orphans.push({
          path: node.id,
          title: node.label,
          incomingLinks: 0,
          daysSinceEdit,
          recommendation: daysSinceEdit > 14 ? 'ARCHIVE' : 'INTEGRATE'
        });
      }
    }
  }

  return orphans;
}
```

### detectStale()
```typescript
/**
 * Find documents not edited in >30 days
 */
async function detectStale(thresholdDays: number = 30): Promise<StaleDoc[]> {
  const files = await glob('./docs/**/*.md');
  const stale = [];

  for (const file of files) {
    const lastModified = await getGitLastModified(file);
    const daysSinceEdit = daysSince(lastModified);

    if (daysSinceEdit >= thresholdDays) {
      stale.push({
        path: file,
        lastModified,
        daysSinceEdit,
        recommendation:
          daysSinceEdit > 90 ? 'AUTO-ARCHIVE' :
          daysSinceEdit > 60 ? 'ARCHIVE' : 'REVIEW'
      });
    }
  }

  return stale.sort((a, b) => b.daysSinceEdit - a.daysSinceEdit);
}
```

### enforceYAMLFrontmatter()
```typescript
/**
 * Ensure all docs have valid YAML frontmatter
 */
async function enforceYAMLFrontmatter(): Promise<FrontmatterResult> {
  const files = await glob('./docs/**/*.md');
  const results = { valid: [], missing: [], invalid: [] };

  const requiredFields = ['project', 'status', 'priority', 'updated', 'owner'];

  for (const file of files) {
    const content = await read(file);
    const frontmatter = extractYAMLFrontmatter(content);

    if (!frontmatter) {
      results.missing.push(file);
    } else {
      const missingFields = requiredFields.filter(f => !frontmatter[f]);
      if (missingFields.length > 0) {
        results.invalid.push({ file, missingFields });
      } else {
        results.valid.push(file);
      }
    }
  }

  return results;
}
```

### syncWithGit()
```typescript
/**
 * Create PR-based documentation changes
 */
async function syncWithGit(
  changes: DocChange[],
  branchName: string
): Promise<GitSyncResult> {
  // Create feature branch
  await exec(`git checkout -b docs/${branchName}`);

  // Apply changes
  for (const change of changes) {
    switch (change.type) {
      case 'create':
        await write(change.path, change.content);
        break;
      case 'update':
        await write(change.path, change.content);
        break;
      case 'archive':
        await move(change.path, `./docs/archive/${basename(change.path)}`);
        break;
      case 'delete':
        await remove(change.path);
        break;
    }
  }

  // Commit and push
  await exec('git add docs/');
  await exec(`git commit -m "docs: ${branchName}"`);
  await exec(`git push -u origin docs/${branchName}`);

  // Create PR
  const pr = await exec(`gh pr create --title "docs: ${branchName}" --body "Auto-generated by DocuForge Elite"`);

  return {
    branch: `docs/${branchName}`,
    changes: changes.length,
    prUrl: pr.stdout.trim()
  };
}
```

---

## STATUS REPORT Template

```yaml
status_report:
  date: ${DATE}
  auditor: DocuForge Elite

  summary:
    total_docs: ${TOTAL}
    healthy: ${HEALTHY}
    issues: ${ISSUES}
    health_score: ${SCORE}%

  orphans:
    count: ${ORPHAN_COUNT}
    items:
      - path: ${PATH}
        days_no_links: ${DAYS}
        recommendation: ${REC}

  stale:
    count: ${STALE_COUNT}
    items:
      - path: ${PATH}
        last_edit: ${DATE}
        days_stale: ${DAYS}
        recommendation: ${REC}

  broken_links:
    count: ${BROKEN_COUNT}
    items:
      - from: ${SOURCE}
        to: ${TARGET}

  redundancies:
    count: ${REDUNDANT_COUNT}
    items:
      - files: [${FILE1}, ${FILE2}]
        similarity: ${PERCENT}%
        recommendation: ${REC}

  missing_frontmatter:
    count: ${MISSING_COUNT}
    items: [${FILES}]

  actions_required:
    critical: ${CRITICAL_COUNT}
    high: ${HIGH_COUNT}
    medium: ${MEDIUM_COUNT}
    low: ${LOW_COUNT}

  next_steps:
    - ${ACTION1}
    - ${ACTION2}

  docs_ship_ready: ${Y/N}
```

---

## Automation Hooks

### Git Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run documentation validation before commit
if git diff --cached --name-only | grep -q "^docs/"; then
  echo "Validating documentation changes..."

  # Check frontmatter
  for file in $(git diff --cached --name-only | grep "^docs/.*\.md$"); do
    if ! grep -q "^---" "$file"; then
      echo "ERROR: Missing YAML frontmatter in $file"
      exit 1
    fi
  done

  # Update TOC if needed
  npx docs-admin-ops toc
  git add docs/TOC.md

  echo "Documentation validation passed."
fi
```

### Post-merge Hook
```bash
#!/bin/bash
# .git/hooks/post-merge

# Auto-update documentation after merge
echo "Updating documentation dashboard..."
npx docs-admin-ops audit --quick
npx docs-admin-ops toc
```

---

## Integration Commands

```bash
# Full audit
docs-admin-ops audit

# Quick status check
docs-admin-ops status

# Generate TOC
docs-admin-ops toc

# Find issues
docs-admin-ops orphans
docs-admin-ops stale
docs-admin-ops broken-links

# Fix issues
docs-admin-ops cleanup --dry-run
docs-admin-ops cleanup --execute

# Validate
docs-admin-ops validate --frontmatter
docs-admin-ops validate --links
docs-admin-ops validate --all
```

---

## Success Criteria

- 100% YAML frontmatter coverage
- 0 orphan documents
- 0 stale documents (>30 days)
- 0 broken links
- <10% redundancy
- TOC.md always current
- 30-second comprehension guarantee
- Health score >95%

**Docs ship-ready? Always.**
