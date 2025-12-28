#!/usr/bin/env node
/**
 * Supabase Performance Audit
 * Identifies slow queries, missing indexes, and optimization opportunities
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
  console.log('🔍 Running Performance Audit...\n');

  // 1. Check for missing indexes on foreign keys
  console.log('1️⃣  Checking foreign key indexes...');
  const fkIndexQuery = `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      CASE WHEN i.indexname IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as index_status
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    LEFT JOIN pg_indexes i
      ON i.schemaname = tc.table_schema
      AND i.tablename = tc.table_name
      AND i.indexdef LIKE '%' || kcu.column_name || '%'
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `;
  const fkResult = await client.query(fkIndexQuery);

  let missingFkIndexes = 0;
  for (const row of fkResult.rows) {
    if (row.index_status === 'MISSING') {
      missingFkIndexes++;
      const indexName = `idx_${row.table_name}_${row.column_name}`;
      issues.push({
        type: 'PERFORMANCE',
        category: 'INDEX',
        table: row.table_name,
        message: `Missing index on FK column '${row.column_name}' -> ${row.foreign_table_name}`
      });
      fixes.push(`CREATE INDEX IF NOT EXISTS ${indexName} ON public.${row.table_name}(${row.column_name});`);
    }
  }
  console.log(`   Found ${missingFkIndexes} missing FK indexes\n`);

  // 2. Check table sizes and bloat
  console.log('2️⃣  Checking table sizes...');
  const sizeQuery = `
    SELECT
      relname as table_name,
      pg_size_pretty(pg_total_relation_size(relid)) as total_size,
      pg_size_pretty(pg_relation_size(relid)) as table_size,
      pg_size_pretty(pg_indexes_size(relid)) as index_size,
      n_live_tup as row_count,
      n_dead_tup as dead_rows,
      CASE
        WHEN n_live_tup > 0 THEN ROUND(100.0 * n_dead_tup / n_live_tup, 2)
        ELSE 0
      END as dead_row_pct
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(relid) DESC
  `;
  const sizeResult = await client.query(sizeQuery);

  console.log('   Top tables by size:');
  sizeResult.rows.slice(0, 10).forEach(row => {
    const deadPct = parseFloat(row.dead_row_pct) || 0;
    const indicator = deadPct > 20 ? '⚠️' : '✅';
    console.log(`   ${indicator} ${row.table_name}: ${row.total_size} (${row.row_count} rows, ${row.dead_row_pct}% dead)`);

    if (deadPct > 20) {
      issues.push({
        type: 'PERFORMANCE',
        category: 'BLOAT',
        table: row.table_name,
        message: `Table '${row.table_name}' has ${row.dead_row_pct}% dead rows - needs VACUUM`
      });
      fixes.push(`VACUUM ANALYZE public.${row.table_name};`);
    }
  });
  console.log();

  // 3. Check for unused indexes
  console.log('3️⃣  Checking unused indexes...');
  const unusedIndexQuery = `
    SELECT
      schemaname,
      relname as table_name,
      indexrelname as index_name,
      idx_scan as scans,
      pg_size_pretty(pg_relation_size(indexrelid)) as index_size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 20
  `;
  const unusedResult = await client.query(unusedIndexQuery);

  if (unusedResult.rows.length > 0) {
    console.log('   Unused indexes (0 scans):');
    unusedResult.rows.forEach(row => {
      console.log(`   ⚠️ ${row.table_name}.${row.index_name}: ${row.index_size}`);
      issues.push({
        type: 'INFO',
        category: 'INDEX',
        table: row.table_name,
        message: `Unused index '${row.index_name}' (${row.index_size}) - consider dropping`
      });
    });
  } else {
    console.log('   ✅ No unused indexes found');
  }
  console.log();

  // 4. Check for common columns that might need indexes
  console.log('4️⃣  Checking common query patterns...');
  const commonColumnsQuery = `
    SELECT
      t.tablename,
      a.attname as column_name,
      CASE WHEN i.indexname IS NOT NULL THEN 'INDEXED' ELSE 'NOT INDEXED' END as index_status
    FROM pg_tables t
    JOIN pg_attribute a ON a.attrelid = (t.schemaname || '.' || t.tablename)::regclass
    LEFT JOIN pg_indexes i ON i.tablename = t.tablename
      AND i.schemaname = t.schemaname
      AND i.indexdef LIKE '%' || a.attname || '%'
    WHERE t.schemaname = 'public'
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND a.attname IN ('created_at', 'updated_at', 'email', 'user_id', 'client_id', 'status')
    ORDER BY t.tablename, a.attname
  `;
  const commonResult = await client.query(commonColumnsQuery);

  let missingCommonIndexes = 0;
  for (const row of commonResult.rows) {
    if (row.index_status === 'NOT INDEXED') {
      // Only suggest indexes for frequently queried columns
      if (['email', 'user_id', 'client_id', 'status'].includes(row.column_name)) {
        missingCommonIndexes++;
        const indexName = `idx_${row.tablename}_${row.column_name}`;
        issues.push({
          type: 'SUGGESTION',
          category: 'INDEX',
          table: row.tablename,
          message: `Consider adding index on '${row.column_name}' for faster lookups`
        });
        fixes.push(`-- Suggested index (evaluate before applying):\n-- CREATE INDEX IF NOT EXISTS ${indexName} ON public.${row.tablename}(${row.column_name});`);
      }
    }
  }
  console.log(`   Found ${missingCommonIndexes} columns that might benefit from indexes\n`);

  // 5. Check slow query stats (if pg_stat_statements is available)
  console.log('5️⃣  Checking query statistics...');
  try {
    const slowQueryQuery = `
      SELECT
        LEFT(query, 100) as query_preview,
        calls,
        ROUND(total_exec_time::numeric, 2) as total_time_ms,
        ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
        rows
      FROM pg_stat_statements
      WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
      ORDER BY mean_exec_time DESC
      LIMIT 10
    `;
    const slowResult = await client.query(slowQueryQuery);

    if (slowResult.rows.length > 0) {
      console.log('   Slowest queries (avg time):');
      slowResult.rows.forEach(row => {
        const indicator = row.avg_time_ms > 1000 ? '🔴' : row.avg_time_ms > 100 ? '🟡' : '🟢';
        console.log(`   ${indicator} ${row.avg_time_ms}ms avg (${row.calls} calls): ${row.query_preview}...`);
      });
    }
  } catch (err) {
    console.log('   ⚠️ pg_stat_statements not available (extension not enabled)');
  }
  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 PERFORMANCE AUDIT SUMMARY\n');

  const perf = issues.filter(i => i.type === 'PERFORMANCE');
  const suggestions = issues.filter(i => i.type === 'SUGGESTION');
  const info = issues.filter(i => i.type === 'INFO');

  console.log(`   🔴 Performance Issues: ${perf.length}`);
  console.log(`   🟡 Suggestions: ${suggestions.length}`);
  console.log(`   🔵 Info: ${info.length}`);
  console.log(`   📝 Fixes Generated: ${fixes.filter(f => !f.startsWith('--')).length}`);

  if (perf.length > 0) {
    console.log('\n🔴 PERFORMANCE ISSUES:');
    perf.forEach(i => console.log(`   - [${i.category}] ${i.message}`));
  }

  // Generate fix file
  const fixContent = `-- ============================================================================
-- AUTO-GENERATED PERFORMANCE FIXES
-- Generated: ${new Date().toISOString()}
-- ============================================================================
-- IMPORTANT: Review each fix before applying!
-- Some suggested indexes may not be needed based on actual query patterns.
-- ============================================================================

${fixes.join('\n\n')}

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run EXPLAIN ANALYZE on slow queries to verify improvements
`;

  const fixPath = join(projectRoot, 'supabase', 'migrations', 'APPLY_VIA_SQL_EDITOR_performance_fixes.sql');
  writeFileSync(fixPath, fixContent, 'utf-8');
  console.log(`\n📄 Fix file generated: ${fixPath}`);

  // Generate report
  const report = `# Supabase Performance Audit Report

**Generated:** ${new Date().toISOString()}
**Project:** bvneqoevtwodyfqglpzi

## Summary

| Category | Count |
|----------|-------|
| Performance Issues | ${perf.length} |
| Suggestions | ${suggestions.length} |
| Info | ${info.length} |
| Fixes Generated | ${fixes.filter(f => !f.startsWith('--')).length} |

## Performance Issues

${perf.length > 0 ? perf.map(i => `- **[${i.category}]** ${i.message}`).join('\n') : 'None found! ✅'}

## Suggestions

${suggestions.length > 0 ? suggestions.map(i => `- **[${i.category}]** ${i.message}`).join('\n') : 'None'}

## Info

${info.length > 0 ? info.map(i => `- **[${i.category}]** ${i.message}`).join('\n') : 'None'}

## Table Statistics

| Table | Size | Rows | Dead Rows % |
|-------|------|------|-------------|
${sizeResult.rows.slice(0, 15).map(r => `| ${r.table_name} | ${r.total_size} | ${r.row_count} | ${r.dead_row_pct}% |`).join('\n')}

## Recommended Actions

1. Review the generated fix file at \`supabase/migrations/APPLY_VIA_SQL_EDITOR_performance_fixes.sql\`
2. Apply missing FK indexes (these are usually safe)
3. Run VACUUM ANALYZE on tables with high dead row percentages
4. Evaluate suggested indexes based on actual query patterns

---
*Generated by performance-audit.mjs*
`;

  const reportPath = join(projectRoot, 'SUPABASE_PERFORMANCE_AUDIT_REPORT.md');
  writeFileSync(reportPath, report, 'utf-8');
  console.log(`📄 Report generated: ${reportPath}`);

  await client.end();
}

main().catch(console.error);
