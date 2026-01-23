---
name: release-ops
description: Release operations skill for version management, changelog generation, and release coordination. Enables controlled, documented releases.
version: 1.0.0
level: 3
triggers:
  - release
  - version
  - changelog
  - deploy release
  - tag
  - bump version
---

# release-ops Skill

Release operations for version management, changelog generation, and deployment coordination. Enables Platform Ops to execute controlled releases.

## Quick Commands

| Command | Action |
|---------|--------|
| `version` | Show current version |
| `bump` | Bump version (patch/minor/major) |
| `changelog` | Generate changelog |
| `tag` | Create release tag |
| `release` | Full release workflow |
| `rollback` | Rollback to previous release |
| `status` | Show release status |

---

## Level 1: Version Management

### getCurrentVersion()
```javascript
/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const pkg = require('./package.json');
  return {
    version: pkg.version,
    name: pkg.name,
    source: 'package.json'
  };
}
```

### bumpVersion()
```bash
#!/bin/bash
# Bump version
bump_version() {
  local level="${1:-patch}"

  # Validate level
  if [[ ! "$level" =~ ^(patch|minor|major)$ ]]; then
    echo "Error: Invalid level. Use patch, minor, or major"
    return 1
  fi

  # Bump with npm
  npm version "$level" --no-git-tag-version

  # Get new version
  local new_version=$(node -p "require('./package.json').version")

  echo "Version bumped to: $new_version"
  return 0
}
```

### parseVersion()
```javascript
/**
 * Parse semver version string
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) return null;

  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
    string: version
  };
}
```

---

## Level 2: Changelog Generation

### generateChangelog()
```javascript
/**
 * Generate changelog from git commits
 */
async function generateChangelog(fromTag, toTag = 'HEAD') {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  // Get commits between tags
  const { stdout } = await execAsync(
    `git log ${fromTag}..${toTag} --pretty=format:"%H|%s|%an|%ad" --date=short`
  );

  const commits = stdout.split('\n').filter(Boolean).map(line => {
    const [hash, message, author, date] = line.split('|');
    return { hash, message, author, date };
  });

  // Categorize commits by conventional commit type
  const categories = {
    feat: { title: 'Features', commits: [] },
    fix: { title: 'Bug Fixes', commits: [] },
    docs: { title: 'Documentation', commits: [] },
    refactor: { title: 'Refactoring', commits: [] },
    test: { title: 'Tests', commits: [] },
    chore: { title: 'Maintenance', commits: [] },
    other: { title: 'Other', commits: [] }
  };

  for (const commit of commits) {
    const match = commit.message.match(/^(\w+)(?:\(.+\))?:\s*(.+)$/);
    if (match) {
      const type = match[1];
      const msg = match[2];
      if (categories[type]) {
        categories[type].commits.push({ ...commit, cleanMessage: msg });
      } else {
        categories.other.commits.push({ ...commit, cleanMessage: commit.message });
      }
    } else {
      categories.other.commits.push({ ...commit, cleanMessage: commit.message });
    }
  }

  return categories;
}

/**
 * Format changelog as markdown
 */
function formatChangelog(categories, version, date) {
  let md = `## [${version}] - ${date}\n\n`;

  for (const [key, category] of Object.entries(categories)) {
    if (category.commits.length > 0) {
      md += `### ${category.title}\n\n`;
      for (const commit of category.commits) {
        md += `- ${commit.cleanMessage} (${commit.hash.slice(0, 7)})\n`;
      }
      md += '\n';
    }
  }

  return md;
}
```

---

## Level 3: Release Workflow

### createRelease()
```javascript
/**
 * Full release workflow
 */
async function createRelease(options = {}) {
  const { level = 'patch', dryRun = false } = options;

  const results = {
    steps: [],
    success: true,
    version: null
  };

  // 1. Run quality gate
  log('Running quality gate...');
  const gate = await runQualityGate();
  results.steps.push({ name: 'quality-gate', passed: gate.passed });
  if (!gate.passed) {
    results.success = false;
    results.error = 'Quality gate failed';
    return results;
  }

  // 2. Bump version
  log('Bumping version...');
  const currentVersion = getCurrentVersion().version;
  if (!dryRun) {
    await execAsync(`npm version ${level} --no-git-tag-version`);
  }
  const newVersion = getCurrentVersion().version;
  results.version = newVersion;
  results.steps.push({ name: 'version-bump', from: currentVersion, to: newVersion });

  // 3. Generate changelog
  log('Generating changelog...');
  const lastTag = await getLastTag();
  const changes = await generateChangelog(lastTag);
  const changelogEntry = formatChangelog(changes, newVersion, new Date().toISOString().split('T')[0]);
  if (!dryRun) {
    await prependToChangelog(changelogEntry);
  }
  results.steps.push({ name: 'changelog', generated: true });

  // 4. Commit changes
  log('Committing changes...');
  if (!dryRun) {
    await execAsync('git add package.json package-lock.json CHANGELOG.md');
    await execAsync(`git commit -m "chore(release): ${newVersion}"`);
  }
  results.steps.push({ name: 'commit', committed: !dryRun });

  // 5. Create tag
  log('Creating tag...');
  if (!dryRun) {
    await execAsync(`git tag -a v${newVersion} -m "Release ${newVersion}"`);
  }
  results.steps.push({ name: 'tag', tag: `v${newVersion}` });

  // 6. Push
  log('Pushing to origin...');
  if (!dryRun) {
    await execAsync('git push origin main --tags');
  }
  results.steps.push({ name: 'push', pushed: !dryRun });

  return results;
}

function log(msg) {
  console.log(`[release-ops] ${msg}`);
}
```

### getLastTag()
```javascript
/**
 * Get the most recent git tag
 */
async function getLastTag() {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync('git describe --tags --abbrev=0');
    return stdout.trim();
  } catch {
    return 'HEAD~20'; // Fallback to last 20 commits
  }
}
```

---

## Level 4: GitHub Release

### createGitHubRelease()
```javascript
/**
 * Create GitHub release with notes
 */
async function createGitHubRelease(version, changelog) {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPO}/releases`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        tag_name: `v${version}`,
        name: `Release ${version}`,
        body: changelog,
        draft: false,
        prerelease: version.includes('-')
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create GitHub release: ${response.statusText}`);
  }

  return await response.json();
}
```

---

## MCP Tool Interface

```javascript
// MCP tool definition for release-ops
const releaseOpsTool = {
  name: 'release_ops',
  description: 'Manage versions, changelogs, and releases',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['version', 'bump', 'changelog', 'tag', 'release', 'rollback', 'status'],
        description: 'Release operation to perform'
      },
      level: {
        type: 'string',
        enum: ['patch', 'minor', 'major'],
        description: 'Version bump level'
      },
      dryRun: {
        type: 'boolean',
        description: 'Preview changes without executing'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# Show current version
release-ops version

# Bump patch version (1.0.0 -> 1.0.1)
release-ops bump patch

# Bump minor version (1.0.0 -> 1.1.0)
release-ops bump minor

# Bump major version (1.0.0 -> 2.0.0)
release-ops bump major

# Generate changelog
release-ops changelog

# Create git tag
release-ops tag v1.2.3

# Full release (bump + changelog + tag + push)
release-ops release --level patch

# Dry run release
release-ops release --level minor --dry-run

# Check release status
release-ops status
```

---

## Release Checklist

```yaml
release_checklist:
  pre_release:
    - [ ] All tests passing
    - [ ] Lint passing
    - [ ] Type check passing
    - [ ] No critical security issues
    - [ ] Changelog prepared
    - [ ] Version bumped

  release:
    - [ ] Changes committed
    - [ ] Tag created
    - [ ] Pushed to origin
    - [ ] GitHub release created

  post_release:
    - [ ] Deployment triggered
    - [ ] Smoke tests passing
    - [ ] Monitoring checked
    - [ ] Stakeholders notified
```

---

## Rollback Operations

### rollbackRelease()
```javascript
/**
 * Rollback to previous release with proof requirements
 */
async function rollbackRelease(options = {}) {
  const { targetVersion, dryRun = false } = options;

  const results = {
    steps: [],
    success: true,
    rollbackProof: null
  };

  // 1. Generate rollback proof requirements
  log('Generating rollback proof requirements...');
  const proofRequirements = {
    preRollback: {
      currentVersion: getCurrentVersion().version,
      targetVersion,
      timestamp: new Date().toISOString(),
      reason: options.reason || 'Manual rollback requested',
      approver: process.env.USER || 'SYSTEM'
    },
    validations: []
  };

  // 2. Validate target version exists
  log('Validating target version...');
  const tagExists = await verifyTagExists(targetVersion);
  if (!tagExists) {
    results.success = false;
    results.error = `Target version ${targetVersion} not found`;
    return results;
  }
  proofRequirements.validations.push({
    check: 'target-version-exists',
    passed: true,
    timestamp: new Date().toISOString()
  });

  // 3. Run pre-rollback quality gate
  log('Running pre-rollback quality gate...');
  const preGate = await runQualityGate('rollback');
  proofRequirements.validations.push({
    check: 'pre-rollback-gate',
    passed: preGate.passed,
    results: preGate.results
  });
  if (!preGate.passed) {
    results.success = false;
    results.error = 'Pre-rollback quality gate failed';
    results.rollbackProof = proofRequirements;
    return results;
  }

  // 4. Execute rollback
  log('Executing rollback...');
  if (!dryRun) {
    await execAsync(`git checkout v${targetVersion}`);
    await execAsync('npm ci');
    await execAsync('npm run build');
  }
  proofRequirements.rollbackExecuted = {
    timestamp: new Date().toISOString(),
    dryRun
  };

  // 5. Post-rollback validation
  log('Running post-rollback validation...');
  const postGate = await runQualityGate('post-rollback');
  proofRequirements.validations.push({
    check: 'post-rollback-gate',
    passed: postGate.passed,
    results: postGate.results
  });

  // 6. Generate rollback receipt
  const receipt = {
    ...proofRequirements,
    completed: new Date().toISOString(),
    success: postGate.passed
  };

  // 7. Write rollback proof
  if (!dryRun) {
    await writeRollbackProof(receipt);
  }

  results.rollbackProof = receipt;
  results.steps.push({ name: 'rollback', completed: true });

  return results;
}

async function verifyTagExists(version) {
  try {
    const { stdout } = await execAsync(`git rev-parse v${version}`);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

async function writeRollbackProof(proof) {
  const proofDir = path.join(process.cwd(), '.rollback-proofs');
  await fs.mkdir(proofDir, { recursive: true });

  const filename = `rollback-${proof.preRollback.currentVersion}-to-${proof.preRollback.targetVersion}-${Date.now()}.json`;
  const filepath = path.join(proofDir, filename);

  await fs.writeFile(filepath, JSON.stringify(proof, null, 2));
  log(`Rollback proof written to: ${filepath}`);

  return filepath;
}
```

### Quality Gate for Rollback
```javascript
/**
 * Quality gate specific to rollback operations
 */
async function runQualityGate(phase = 'pre-rollback') {
  const results = {
    passed: true,
    checks: [],
    timestamp: new Date().toISOString()
  };

  if (phase === 'rollback' || phase === 'pre-rollback') {
    // Check no uncommitted changes
    const { stdout: gitStatus } = await execAsync('git status --porcelain');
    const hasChanges = gitStatus.trim().length > 0;
    results.checks.push({
      name: 'no-uncommitted-changes',
      passed: !hasChanges,
      message: hasChanges ? 'Uncommitted changes detected' : 'Working directory clean'
    });
    if (hasChanges) results.passed = false;

    // Check database migration compatibility
    const migrationCheck = await checkMigrationCompatibility();
    results.checks.push({
      name: 'migration-compatibility',
      passed: migrationCheck.compatible,
      message: migrationCheck.message
    });
    if (!migrationCheck.compatible) results.passed = false;
  }

  if (phase === 'post-rollback') {
    // Verify application starts
    const appCheck = await verifyApplicationStarts();
    results.checks.push({
      name: 'application-starts',
      passed: appCheck.success,
      message: appCheck.message
    });
    if (!appCheck.success) results.passed = false;

    // Run smoke tests
    const smokeTests = await runSmokeTests();
    results.checks.push({
      name: 'smoke-tests',
      passed: smokeTests.passed,
      message: `${smokeTests.passed ? 'All' : 'Some'} smoke tests passed`
    });
    if (!smokeTests.passed) results.passed = false;
  }

  results.results = results.checks;
  return results;
}
```

## Success Criteria

- Version follows semver
- Changelog accurately reflects changes
- Tags match versions
- GitHub release created
- No manual steps required
- Rollback possible within 5 minutes
- **Rollback requires proof of validation**
- **All rollbacks generate audit receipts**
- **QA validator enforces rollback proofs**
