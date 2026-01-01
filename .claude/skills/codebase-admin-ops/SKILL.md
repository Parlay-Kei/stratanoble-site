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
| List root files | `ls -la \| head -20` |
| Check unused deps | `npx depcheck` |
| Find TODO/FIXME | `grep -r "TODO\|FIXME" src/` |
| Count source files | `find src -name "*.ts" -o -name "*.tsx" \| wc -l` |

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

- Scan directory structure with depth and exclusions
- Validate organization against framework conventions
- Identify orphaned files and directories
- Check for misplaced configuration files

### Configuration Audit

- Environment files (.env*)
- Build configs (vite, webpack, etc.)
- TypeScript configuration
- Package management files

### Dependency Analysis

- Find unused packages with `npx depcheck`
- Check for outdated dependencies
- Run security audits
- Identify duplicate packages

### Cleanup Workflow

1. Identify cleanup targets (temp, unused, orphaned)
2. Review and approve targets
3. Execute cleanup with optional archiving
4. Verify cleanup success

---

## Level 3: Complete Reference (5KB+)

### Full Audit Process

- Phase 1: Structure (directories, organization, orphans, conventions)
- Phase 2: Configuration (scan, validate, redundant, secrets)
- Phase 3: Dependencies (analyze, unused, security, outdated)
- Phase 4: Files (inventory, large, temp, duplicates)
- Phase 5: Cleanup (plan, execute, verify, rollback)

### Framework Conventions

Supports: react-vite, next, express, and custom frameworks

### Pre-Production Audit

8-point checklist: dev files, configs, console.logs, TODOs, gitignore, build, vulnerabilities, docs

---

## Related Skills

- **docs-admin-ops** - Documentation administration
- **deployment-ops** - Deployment configuration
- **testing-ops** - Test file organization
- **environment-ops** - Environment management

---

**Last Updated:** 2025-11-28
