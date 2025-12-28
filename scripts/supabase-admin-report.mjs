#!/usr/bin/env node
/**
 * Supabase Admin Report Generator
 * 
 * Comprehensive database administration report including:
 * - Security advisors (security & performance)
 * - Table listing and RLS status
 * - Migration status
 * - Database health checks
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const projectRef = 'bvneqoevtwodyfqglpzi';

const report = {
  timestamp: new Date().toISOString(),
  projectRef,
  projectUrl: `https://${projectRef}.supabase.co`,
  checks: {},
  issues: [],
  recommendations: []
};

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: projectRoot,
      ...options
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout?.toString() || error.message,
      error: error.stderr?.toString() || error.message
    };
  }
}

console.log('🔍 Running Supabase Admin Report...\n');
console.log(`Project: ${projectRef}`);
console.log(`URL: ${report.projectUrl}\n`);

// 1. Check Supabase CLI connection
console.log('1️⃣  Checking Supabase CLI connection...');
const statusCheck = execCommand('supabase projects list');
if (statusCheck.success) {
  report.checks.cliConnection = { status: 'connected', output: statusCheck.output };
  console.log('   ✅ CLI connected');
} else {
  report.checks.cliConnection = { status: 'error', error: statusCheck.error };
  report.issues.push({
    severity: 'warning',
    category: 'connection',
    message: 'Supabase CLI connection issue',
    details: statusCheck.error
  });
  console.log('   ⚠️  CLI connection issue (may need login)');
}

// 2. Check project status
console.log('\n2️⃣  Checking project status...');
const projectStatus = execCommand(`supabase projects list --format json`);
if (projectStatus.success) {
  try {
    const projects = JSON.parse(projectStatus.output);
    const ourProject = projects.find(p => p.id === projectRef || p.ref === projectRef);
    if (ourProject) {
      report.checks.projectStatus = {
        status: 'found',
        name: ourProject.name,
        region: ourProject.region,
        status: ourProject.status
      };
      console.log(`   ✅ Project found: ${ourProject.name}`);
      console.log(`   📍 Region: ${ourProject.region}`);
      console.log(`   📊 Status: ${ourProject.status}`);
    } else {
      report.checks.projectStatus = { status: 'not_found' };
      console.log('   ⚠️  Project not found in list');
    }
  } catch (e) {
    report.checks.projectStatus = { status: 'parse_error', error: e.message };
    console.log('   ⚠️  Could not parse project list');
  }
} else {
  report.checks.projectStatus = { status: 'error', error: projectStatus.error };
  console.log('   ⚠️  Could not fetch project status');
}

// 3. Check migrations
console.log('\n3️⃣  Checking migrations...');
const migrationsDir = join(projectRoot, 'supabase', 'migrations');
const infraMigrationsDir = join(projectRoot, 'infra', 'supabase', 'migrations');

let localMigrations = [];
try {
  const fs = await import('fs/promises');
  try {
    const files = await fs.readdir(migrationsDir);
    localMigrations = files.filter(f => f.endsWith('.sql')).sort();
  } catch (e) {
    // Try infra directory
    try {
      const files = await fs.readdir(infraMigrationsDir);
      localMigrations = files.filter(f => f.endsWith('.sql')).sort();
    } catch (e2) {
      // No migrations directory found
    }
  }
} catch (e) {
  // Fallback
}

report.checks.migrations = {
  localCount: localMigrations.length,
  files: localMigrations
};

console.log(`   📦 Found ${localMigrations.length} local migration files`);

// Check remote migrations
const remoteMigrations = execCommand(`supabase migration list --project-ref ${projectRef} --format json`);
if (remoteMigrations.success) {
  try {
    const migrations = JSON.parse(remoteMigrations.output);
    report.checks.migrations.remoteCount = migrations.length;
    report.checks.migrations.remote = migrations.map(m => ({
      version: m.version,
      name: m.name,
      inserted_at: m.inserted_at
    }));
    console.log(`   📦 Found ${migrations.length} remote migrations`);
    
    // Check for drift
    if (localMigrations.length !== migrations.length) {
      report.issues.push({
        severity: 'warning',
        category: 'migrations',
        message: 'Migration count mismatch',
        details: `Local: ${localMigrations.length}, Remote: ${migrations.length}`
      });
      console.log('   ⚠️  Migration count mismatch detected');
    }
  } catch (e) {
    report.checks.migrations.remoteError = e.message;
    console.log('   ⚠️  Could not parse remote migrations');
  }
} else {
  report.checks.migrations.remoteError = remoteMigrations.error;
  console.log('   ⚠️  Could not fetch remote migrations');
}

// 4. Read Security Advisor file
console.log('\n4️⃣  Analyzing security advisors...');
const securityAdvisorPath = join(projectRoot, 'Security Advisor');
try {
  const securityData = readFileSync(securityAdvisorPath, 'utf-8');
  const lines = securityData.split('\n').filter(l => l.trim());
  
  // Parse CSV-like format
  const issues = [];
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('|') && !line.startsWith('|---')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 6) {
        issues.push({
          name: parts[0],
          title: parts[1],
          level: parts[2],
          category: parts[4],
          description: parts[5],
          detail: parts[6] || '',
          remediation: parts[7] || ''
        });
      }
    }
  }
  
  report.checks.securityAdvisors = {
    totalIssues: issues.length,
    errors: issues.filter(i => i.level === 'ERROR').length,
    warnings: issues.filter(i => i.level === 'WARNING').length,
    issues: issues
  };
  
  console.log(`   🔒 Found ${issues.length} security issues`);
  console.log(`   ❌ Errors: ${issues.filter(i => i.level === 'ERROR').length}`);
  console.log(`   ⚠️  Warnings: ${issues.filter(i => i.level === 'WARNING').length}`);
  
  // Add critical issues to report
  issues.filter(i => i.level === 'ERROR').forEach(issue => {
    report.issues.push({
      severity: 'error',
      category: 'security',
      message: issue.title,
      details: issue.detail,
      remediation: issue.remediation
    });
  });
  
} catch (e) {
  report.checks.securityAdvisors = { error: e.message };
  console.log('   ⚠️  Could not read Security Advisor file');
}

// 5. Check for RLS issues
console.log('\n5️⃣  Checking RLS status...');
const rlsIssues = report.checks.securityAdvisors?.issues?.filter(
  i => i.name === 'rls_disabled_in_public'
) || [];

if (rlsIssues.length > 0) {
  report.issues.push({
    severity: 'error',
    category: 'rls',
    message: 'RLS disabled on public tables',
    details: rlsIssues.map(i => i.detail).join(', '),
    count: rlsIssues.length
  });
  console.log(`   ❌ Found ${rlsIssues.length} tables with RLS disabled`);
} else {
  console.log('   ✅ No RLS issues found');
}

// 6. Check for security definer views
console.log('\n6️⃣  Checking security definer views...');
const securityDefinerIssues = report.checks.securityAdvisors?.issues?.filter(
  i => i.name === 'security_definer_view'
) || [];

if (securityDefinerIssues.length > 0) {
  report.issues.push({
    severity: 'error',
    category: 'security',
    message: 'Security definer views detected',
    details: securityDefinerIssues.map(i => i.detail).join(', '),
    count: securityDefinerIssues.length,
    remediation: 'Review views and consider using SECURITY INVOKER instead'
  });
  console.log(`   ⚠️  Found ${securityDefinerIssues.length} security definer views`);
} else {
  console.log('   ✅ No security definer view issues');
}

// 7. Generate recommendations
console.log('\n7️⃣  Generating recommendations...');

if (report.issues.filter(i => i.severity === 'error').length > 0) {
  report.recommendations.push({
    priority: 'high',
    action: 'Fix critical security issues',
    details: 'Address RLS and security definer view issues immediately'
  });
}

if (report.checks.migrations.localCount !== report.checks.migrations.remoteCount) {
  report.recommendations.push({
    priority: 'medium',
    action: 'Sync migrations',
    details: 'Ensure local and remote migrations are in sync'
  });
}

if (report.checks.securityAdvisors?.errors > 0) {
  report.recommendations.push({
    priority: 'high',
    action: 'Review security advisors',
    details: `Address ${report.checks.securityAdvisors.errors} security errors`
  });
}

// 8. Generate summary
console.log('\n📊 Summary:');
console.log(`   Total Issues: ${report.issues.length}`);
console.log(`   Critical: ${report.issues.filter(i => i.severity === 'error').length}`);
console.log(`   Warnings: ${report.issues.filter(i => i.severity === 'warning').length}`);
console.log(`   Recommendations: ${report.recommendations.length}`);

// 9. Write report
const reportPath = join(projectRoot, 'SUPABASE_ADMIN_REPORT.md');
const reportMarkdown = generateMarkdownReport(report);
writeFileSync(reportPath, reportMarkdown, 'utf-8');

console.log(`\n✅ Report generated: ${reportPath}`);

function generateMarkdownReport(report) {
  return `# Supabase Admin Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}
**Project:** ${report.projectRef}
**URL:** ${report.projectUrl}

---

## Executive Summary

- **Total Issues:** ${report.issues.length}
- **Critical Issues:** ${report.issues.filter(i => i.severity === 'error').length}
- **Warnings:** ${report.issues.filter(i => i.severity === 'warning').length}
- **Recommendations:** ${report.recommendations.length}

---

## Project Status

${report.checks.projectStatus?.status === 'found' ? `
- **Name:** ${report.checks.projectStatus.name}
- **Region:** ${report.checks.projectStatus.region}
- **Status:** ${report.checks.projectStatus.status}
` : '- **Status:** Could not determine project status'}

---

## Migrations

- **Local Migrations:** ${report.checks.migrations.localCount}
- **Remote Migrations:** ${report.checks.migrations.remoteCount || 'Unknown'}

${report.checks.migrations.localCount !== report.checks.migrations.remoteCount ? `
⚠️ **Warning:** Migration count mismatch detected
` : ''}

### Local Migration Files

${report.checks.migrations.files.map(f => `- ${f}`).join('\n')}

---

## Security Advisors

${report.checks.securityAdvisors?.totalIssues ? `
- **Total Issues:** ${report.checks.securityAdvisors.totalIssues}
- **Errors:** ${report.checks.securityAdvisors.errors}
- **Warnings:** ${report.checks.securityAdvisors.warnings}

### Critical Issues

${report.checks.securityAdvisors.issues
  .filter(i => i.level === 'ERROR')
  .map(issue => `
#### ${issue.title}

- **Type:** ${issue.name}
- **Level:** ${issue.level}
- **Detail:** ${issue.detail}
- **Remediation:** [${issue.remediation}](${issue.remediation})
`).join('\n')}
` : 'No security advisor data available'}

---

## Issues Found

${report.issues.length > 0 ? report.issues.map(issue => `
### ${issue.severity === 'error' ? '❌' : '⚠️'} ${issue.message}

- **Category:** ${issue.category}
- **Details:** ${issue.details}
${issue.remediation ? `- **Remediation:** ${issue.remediation}` : ''}
`).join('\n') : '✅ No issues found'}

---

## Recommendations

${report.recommendations.map(rec => `
### ${rec.priority === 'high' ? '🔴 High Priority' : rec.priority === 'medium' ? '🟡 Medium Priority' : '🟢 Low Priority'}: ${rec.action}

${rec.details}
`).join('\n')}

---

## Next Steps

1. **Review Critical Issues:** Address all error-level security issues
2. **Sync Migrations:** Ensure local and remote migrations match
3. **Run Performance Advisors:** Check database performance metrics
4. **Update RLS Policies:** Fix any RLS disabled issues
5. **Review Security Definer Views:** Consider converting to SECURITY INVOKER

---

**Report Generated:** ${new Date().toISOString()}
`;
}

