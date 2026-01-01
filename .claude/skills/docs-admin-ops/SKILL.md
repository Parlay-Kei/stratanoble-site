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
```

**Step 2: Content Analysis**
```typescript
const analysis = await docsAdmin.analyzeContent({
  checkAccuracy: true,
  checkLinks: true,
  checkReferences: true,
  compareToCode: true
});
```

### Documentation Standards

**Required Files:**
- `README.md` - Project overview, setup, quick start
- `CHANGELOG.md` - Version history (Keep a Changelog format)
- `docs/API.md` - API/service documentation
- `docs/DEPLOYMENT.md` - Deployment procedures
- `docs/SECURITY.md` - Security policies

### Consolidation Strategy

```typescript
const consolidated = await docsAdmin.consolidate({
  sources: ['TESTING_GUIDE.md', 'TEST_PARAMETERS.md'],
  output: 'docs/TESTING.md',
  strategy: 'merge-unique',
  preserveStructure: 'first'
});
```

---

## Level 3: Complete Reference (5KB+)

### Full Documentation Audit Process

- Phase 1: Discovery (scan, identify, check structure)
- Phase 2: Analysis (accuracy, redundancies, links, source comparison)
- Phase 3: Quality (completeness, readability, formatting, consistency)
- Phase 4: Remediation (report, improvements, auto-fix, create missing)

### Discrepancy Detection

- Component count validation
- Service documentation check
- Database schema verification
- Version number consistency

### Redundancy Detection

- Jaccard similarity analysis (>60% threshold)
- Overlapping section identification
- Consolidation recommendations

---

## Related Skills

- **codebase-admin-ops** - For broader codebase administration
- **deployment-ops** - For deployment documentation sync
- **testing-ops** - For test documentation management

---

**Last Updated:** 2025-11-28
