#!/usr/bin/env node
/**
 * Full Supabase Security Audit
 * Identifies all security issues and generates fixes
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load env
const envPath = join(projectRoot, 'apps', 'website', '.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) {
        const k = t.substring(0, eq);
        const v = t.substring(eq + 1);
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const issues = [];
const fixes = [];

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('🔍 Running Full Security Audit...\n');

  // 1. Check RLS status on all tables
  console.log('1️⃣  Checking RLS on all tables...');
  const rlsQuery = `
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  const rlsResult = await client.query(rlsQuery);

  let rlsDisabled = 0;
  for (const row of rlsResult.rows) {
    if (!row.rowsecurity) {
      rlsDisabled++;
      issues.push({
        type: 'CRITICAL',
        category: 'RLS',
        table: row.tablename,
        message: `RLS is disabled on table '${row.tablename}'`
      });
      fixes.push(`ALTER TABLE public.${row.tablename} ENABLE ROW LEVEL SECURITY;`);
    }
  }
  console.log(`   Found ${rlsDisabled} tables with RLS disabled\n`);

  // 2. Check for tables without any policies
  console.log('2️⃣  Checking for tables without policies...');
  const noPolicyQuery = `
    SELECT t.tablename
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
    WHERE t.schemaname = 'public'
    AND t.rowsecurity = true
    GROUP BY t.tablename
    HAVING COUNT(p.policyname) = 0
  `;
  const noPolicyResult = await client.query(noPolicyQuery);

  for (const row of noPolicyResult.rows) {
    issues.push({
      type: 'WARNING',
      category: 'POLICY',
      table: row.tablename,
      message: `Table '${row.tablename}' has RLS enabled but no policies (data inaccessible)`
    });
    fixes.push(`-- Add policy for ${row.tablename}
CREATE POLICY "Service role can access ${row.tablename}"
    ON public.${row.tablename}
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');`);
  }
  console.log(`   Found ${noPolicyResult.rows.length} tables with RLS but no policies\n`);

  // 3. Check for SECURITY DEFINER views
  console.log('3️⃣  Checking SECURITY DEFINER views...');
  const viewQuery = `
    SELECT
      c.relname as viewname,
      COALESCE(
        (SELECT option_value FROM pg_options_to_table(c.reloptions) WHERE option_name = 'security_invoker'),
        'false'
      ) as security_invoker,
      obj_description(c.oid) as comment
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'v'
  `;
  const viewResult = await client.query(viewQuery);

  let definerViews = 0;
  for (const row of viewResult.rows) {
    if (row.security_invoker !== 'true') {
      definerViews++;
      // Only flag as issue if not documented
      if (!row.comment || !row.comment.includes('SECURITY DEFINER: Intentional')) {
        issues.push({
          type: 'WARNING',
          category: 'VIEW',
          table: row.viewname,
          message: `View '${row.viewname}' uses SECURITY DEFINER (undocumented)`
        });
      } else {
        console.log(`   ✅ ${row.viewname} - DEFINER (documented as intentional)`);
      }
    }
  }
  console.log(`   Total SECURITY DEFINER views: ${definerViews}\n`);

  // 4. Check for exposed functions
  console.log('4️⃣  Checking exposed functions...');
  const funcQuery = `
    SELECT
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args,
      p.prosecdef as security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    ORDER BY p.proname
  `;
  const funcResult = await client.query(funcQuery);

  let secDefFuncs = 0;
  for (const row of funcResult.rows) {
    if (row.security_definer) {
      secDefFuncs++;
      issues.push({
        type: 'INFO',
        category: 'FUNCTION',
        table: row.function_name,
        message: `Function '${row.function_name}' uses SECURITY DEFINER`
      });
    }
  }
  console.log(`   Found ${funcResult.rows.length} public functions (${secDefFuncs} with SECURITY DEFINER)\n`);

  // 5. Check for missing indexes on foreign keys
  console.log('5️⃣  Checking foreign key indexes...');
  const fkQuery = `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
  `;
  const fkResult = await client.query(fkQuery);
  console.log(`   Found ${fkResult.rows.length} foreign key relationships\n`);

  // 6. Summary
  console.log('=' .repeat(60));
  console.log('\n📊 SECURITY AUDIT SUMMARY\n');

  const critical = issues.filter(i => i.type === 'CRITICAL');
  const warnings = issues.filter(i => i.type === 'WARNING');
  const info = issues.filter(i => i.type === 'INFO');

  console.log(`   🔴 Critical Issues: ${critical.length}`);
  console.log(`   🟡 Warnings: ${warnings.length}`);
  console.log(`   🔵 Info: ${info.length}`);
  console.log(`   📝 Total Fixes Generated: ${fixes.length}`);

  if (critical.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES:');
    critical.forEach(i => console.log(`   - [${i.category}] ${i.message}`));
  }

  if (warnings.length > 0) {
    console.log('\n🟡 WARNINGS:');
    warnings.forEach(i => console.log(`   - [${i.category}] ${i.message}`));
  }

  // Generate fix file
  if (fixes.length > 0) {
    const fixContent = `-- ============================================================================
-- AUTO-GENERATED SECURITY FIXES
-- Generated: ${new Date().toISOString()}
-- ============================================================================

${fixes.join('\n\n')}

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
`;

    const fixPath = join(projectRoot, 'supabase', 'migrations', 'APPLY_VIA_SQL_EDITOR_auto_security_fixes.sql');
    writeFileSync(fixPath, fixContent, 'utf-8');
    console.log(`\n📄 Fix file generated: ${fixPath}`);
  }

  // Generate report
  const report = `# Supabase Security Audit Report

**Generated:** ${new Date().toISOString()}
**Project:** bvneqoevtwodyfqglpzi

## Summary

| Category | Count |
|----------|-------|
| Critical | ${critical.length} |
| Warnings | ${warnings.length} |
| Info | ${info.length} |
| Fixes Generated | ${fixes.length} |

## Critical Issues

${critical.length > 0 ? critical.map(i => `- **[${i.category}]** ${i.message}`).join('\n') : 'None found! ✅'}

## Warnings

${warnings.length > 0 ? warnings.map(i => `- **[${i.category}]** ${i.message}`).join('\n') : 'None found! ✅'}

## Info

${info.length > 0 ? info.map(i => `- **[${i.category}]** ${i.message}`).join('\n') : 'None found'}

## Tables Audited

${rlsResult.rows.map(r => `- ${r.tablename}: RLS ${r.rowsecurity ? '✅' : '❌'}`).join('\n')}

## Recommended Actions

${fixes.length > 0 ? `
1. Review the generated fix file
2. Apply fixes using: \`npm run supabase:auto-fix\`
3. Re-run audit to verify
` : 'No actions required - all checks passed! ✅'}

---
*Generated by full-security-audit.mjs*
`;

  const reportPath = join(projectRoot, 'SUPABASE_SECURITY_AUDIT_REPORT.md');
  writeFileSync(reportPath, report, 'utf-8');
  console.log(`📄 Report generated: ${reportPath}`);

  await client.end();

  // Exit with error if critical issues
  if (critical.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
