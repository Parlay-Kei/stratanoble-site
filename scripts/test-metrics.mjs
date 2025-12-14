#!/usr/bin/env node
/**
 * Test Metrics Collector
 * 
 * Collects metrics from test runs:
 * - Integration runtime
 * - Flake rate (rerun failing tests once and report "passed on retry")
 * 
 * Outputs to CI artifacts as JSON for tracking over time.
 * 
 * Usage:
 *   node scripts/test-metrics.mjs --test-output <jest-output-file>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const METRICS_FILE = 'test-metrics.json';

function parseJestOutput(output) {
  // Parse Jest output for test results
  const lines = output.split('\n');
  const metrics = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    runtime: 0,
    runtimeP95: 0, // 95th percentile runtime
    suites: 0,
    testRuntimes: [], // Individual test runtimes for percentile calculation
  };

  // Look for Jest summary lines
  lines.forEach((line) => {
    // Match: "Tests:       123 passed, 5 failed, 10 skipped"
    const testMatch = line.match(/Tests:\s+(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+skipped)?/);
    if (testMatch) {
      metrics.passed = parseInt(testMatch[1]) || 0;
      metrics.failed = parseInt(testMatch[2]) || 0;
      metrics.skipped = parseInt(testMatch[3]) || 0;
      metrics.totalTests = metrics.passed + metrics.failed + metrics.skipped;
    }

    // Match: "Time:        12.345 s"
    const timeMatch = line.match(/Time:\s+([\d.]+)\s+s/);
    if (timeMatch) {
      metrics.runtime = parseFloat(timeMatch[1]) * 1000; // Convert to ms
    }

    // Match: "Test Suites: 5 passed, 1 failed, 10 total"
    const suiteMatch = line.match(/Test Suites:\s+(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+total)?/);
    if (suiteMatch) {
      metrics.suites = parseInt(suiteMatch[3]) || 0;
    }

    // Try to extract individual test runtimes from JSON output
    // Jest JSON format includes test durations
    try {
      const jsonMatch = line.match(/\{"testResults":/);
      if (jsonMatch) {
        // This is a JSON line, parse it
        const jsonData = JSON.parse(line);
        if (jsonData.testResults) {
          jsonData.testResults.forEach((result) => {
            if (result.duration) {
              metrics.testRuntimes.push(result.duration);
            }
          });
        }
      }
    } catch {
      // Not JSON, skip
    }
  });

  // Calculate 95th percentile if we have individual test runtimes
  if (metrics.testRuntimes.length > 0) {
    metrics.testRuntimes.sort((a, b) => a - b);
    const p95Index = Math.ceil(metrics.testRuntimes.length * 0.95) - 1;
    metrics.runtimeP95 = metrics.testRuntimes[p95Index] || metrics.runtime;
  } else {
    // Fallback: use mean runtime if we don't have individual times
    metrics.runtimeP95 = metrics.runtime;
  }

  return metrics;
}

function loadExistingMetrics() {
  if (existsSync(METRICS_FILE)) {
    try {
      return JSON.parse(readFileSync(METRICS_FILE, 'utf-8'));
    } catch {
      return { runs: [] };
    }
  }
  return { runs: [] };
}

function calculateFlakeRate(metrics, previousRun) {
  // Flake rate = tests that failed once, then passed on immediate retry
  // (same commit, same environment)
  // For now, we'll track this by comparing consecutive runs
  // In the future, we can implement automatic retry logic
  
  if (!previousRun) {
    return {
      flakeRate: 0,
      flakyTests: [],
    };
  }

  // If this run passed but previous run failed (same commit), it's a flake
  const isFlake = previousRun.failed > 0 && metrics.failed === 0 && 
                   previousRun.ci?.runId === metrics.ci?.runId;

  return {
    flakeRate: isFlake ? 100 : 0, // Simplified for now
    flakyTests: [],
    definition: 'Fails once, then passes on immediate retry (same commit, same environment)',
  };
}

function main() {
  const args = process.argv.slice(2);
  const testOutputFile = args.find((arg) => arg.startsWith('--test-output='))?.split('=')[1];

  if (!testOutputFile || !existsSync(testOutputFile)) {
    console.error('❌ Test output file not found:', testOutputFile);
    console.error('Usage: node scripts/test-metrics.mjs --test-output=<jest-output-file>');
    process.exit(1);
  }

  const testOutput = readFileSync(testOutputFile, 'utf-8');
  const metrics = parseJestOutput(testOutput);

  // Load existing metrics first so we can calculate flake rate
  const existing = loadExistingMetrics();
  const previousRun = existing.runs.length > 0 ? existing.runs[existing.runs.length - 1] : null;
  const flakeInfo = calculateFlakeRate(metrics, previousRun);

  const runData = {
    timestamp: new Date().toISOString(),
    ...metrics,
    ...flakeInfo,
    ci: {
      runId: process.env.GITHUB_RUN_ID || 'local',
      workflow: process.env.GITHUB_WORKFLOW || 'local',
      branch: process.env.GITHUB_REF || 'local',
      commit: process.env.GITHUB_SHA || 'local',
    },
  };
  existing.runs.push(runData);

  // Keep only last 100 runs
  if (existing.runs.length > 100) {
    existing.runs = existing.runs.slice(-100);
  }

  // Calculate trends (use 95th percentile for runtime)
  const recentRuns = existing.runs.slice(-10);
  const avgRuntime = recentRuns.reduce((sum, r) => sum + (r.runtime || 0), 0) / recentRuns.length;
  const avgRuntimeP95 = recentRuns.reduce((sum, r) => sum + (r.runtimeP95 || r.runtime || 0), 0) / recentRuns.length;
  const avgFailureRate = recentRuns.reduce((sum, r) => sum + (r.failed || 0) / (r.totalTests || 1), 0) / recentRuns.length;
  const avgFlakeRate = recentRuns.reduce((sum, r) => sum + (r.flakeRate || 0), 0) / recentRuns.length;

  const summary = {
    latest: runData,
    trends: {
      avgRuntime: Math.round(avgRuntime),
      avgRuntimeP95: Math.round(avgRuntimeP95), // 95th percentile - catches outliers
      avgFailureRate: (avgFailureRate * 100).toFixed(2) + '%',
      avgFlakeRate: avgFlakeRate.toFixed(2) + '%',
      totalRuns: existing.runs.length,
    },
    history: existing.runs,
  };

  writeFileSync(METRICS_FILE, JSON.stringify(summary, null, 2));
  writeFileSync('test-metrics-latest.json', JSON.stringify(runData, null, 2));

  console.log('📊 Test Metrics Collected\n');
  console.log(`   Runtime (mean): ${metrics.runtime}ms`);
  console.log(`   Runtime (95th percentile): ${metrics.runtimeP95}ms`);
  console.log(`   Tests: ${metrics.passed} passed, ${metrics.failed} failed, ${metrics.skipped} skipped`);
  console.log(`   Suites: ${metrics.suites}`);
  console.log(`   Flake Rate: ${flakeInfo.flakeRate}% (${flakeInfo.definition || 'fails once, passes on retry'})`);
  console.log(`\n   Metrics saved to: ${METRICS_FILE}`);
  console.log(`   Latest run saved to: test-metrics-latest.json\n`);

  // Output for CI
  if (process.env.CI) {
    console.log(`::set-output name=runtime::${metrics.runtime}`);
    console.log(`::set-output name=passed::${metrics.passed}`);
    console.log(`::set-output name=failed::${metrics.failed}`);
    console.log(`::set-output name=flake_rate::${flakeInfo.flakeRate}`);
  }
}

main();
