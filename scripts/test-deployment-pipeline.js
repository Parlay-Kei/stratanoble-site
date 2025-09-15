#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPLOYMENT_TEST_CONFIG = {
  environments: ['development', 'staging', 'production'],
  apps: ['website', 'platform', 'mobile'],
  testSuites: [
    'cross-platform-integration',
    'data-sync',
    'performance',
    'security'
  ],
  thresholds: {
    testCoverage: 80,
    performanceScore: 90,
    securityScore: 95,
    buildTime: 300000, // 5 minutes
  },
};

class DeploymentTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      status: 'running',
      tests: {},
      builds: {},
      deployments: {},
      performance: {},
      security: {},
      overall: {
        passed: 0,
        failed: 0,
        duration: 0,
        success: false,
      },
    };
  }

  async runAllTests() {
    const startTime = Date.now();
    console.log('🚀 Starting Deployment Pipeline Tests');
    console.log('=====================================');

    try {
      // Phase 1: Build Tests
      await this.runBuildTests();

      // Phase 2: Unit Tests
      await this.runUnitTests();

      // Phase 3: Integration Tests
      await this.runIntegrationTests();

      // Phase 4: End-to-End Tests
      await this.runE2ETests();

      // Phase 5: Performance Tests
      await this.runPerformanceTests();

      // Phase 6: Security Tests
      await this.runSecurityTests();

      // Phase 7: Deployment Validation
      await this.runDeploymentValidation();

      const endTime = Date.now();
      this.results.overall.duration = endTime - startTime;
      this.results.status = 'completed';
      this.results.overall.success = this.results.overall.failed === 0;

      await this.generateReport();

    } catch (error) {
      this.results.status = 'failed';
      this.results.error = error.message;
      console.error('❌ Deployment pipeline tests failed:', error.message);
    }

    return this.results;
  }

  async runBuildTests() {
    console.log('\\n📦 Running Build Tests...');

    for (const app of DEPLOYMENT_TEST_CONFIG.apps) {
      const buildStart = Date.now();

      try {
        console.log(`Building ${app}...`);

        // Determine build command based on app
        let buildCommand;
        let workspaceFlag = '';

        switch (app) {
          case 'website':
            workspaceFlag = '--workspace=@strata-noble/website';
            break;
          case 'platform':
            workspaceFlag = '--workspace=@strata-noble/platform';
            break;
          case 'mobile':
            workspaceFlag = '--workspace=@strata-noble/achievery-mobile';
            buildCommand = 'npm run build:android'; // For CI/CD
            break;
        }

        if (!buildCommand) {
          buildCommand = `npm run build ${workspaceFlag}`;
        }

        // Run build with timeout
        const buildOutput = execSync(buildCommand, {
          timeout: DEPLOYMENT_TEST_CONFIG.thresholds.buildTime,
          encoding: 'utf8',
          cwd: path.join(__dirname, '..'),
        });

        const buildEnd = Date.now();
        const buildDuration = buildEnd - buildStart;

        this.results.builds[app] = {
          status: 'success',
          duration: buildDuration,
          output: buildOutput.split('\\n').slice(-10), // Last 10 lines
        };

        this.results.overall.passed++;
        console.log(`✅ ${app} build successful (${buildDuration}ms)`);

      } catch (error) {
        this.results.builds[app] = {
          status: 'failed',
          error: error.message,
          duration: Date.now() - buildStart,
        };

        this.results.overall.failed++;
        console.log(`❌ ${app} build failed: ${error.message}`);
      }
    }
  }

  async runUnitTests() {
    console.log('\\n🧪 Running Unit Tests...');

    const testCommands = [
      {
        name: 'website-tests',
        command: 'npm run test:ci --workspace=@strata-noble/website',
        app: 'website',
      },
      {
        name: 'mobile-tests',
        command: 'npm test --workspace=@strata-noble/achievery-mobile',
        app: 'mobile',
      },
    ];

    for (const testConfig of testCommands) {
      try {
        console.log(`Running ${testConfig.name}...`);

        const testOutput = execSync(testConfig.command, {
          encoding: 'utf8',
          cwd: path.join(__dirname, '..'),
          timeout: 120000, // 2 minutes
        });

        // Parse Jest output for coverage
        const coverageMatch = testOutput.match(/All files.*?([0-9.]+)%/);
        const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;

        this.results.tests[testConfig.name] = {
          status: 'passed',
          coverage,
          output: testOutput.split('\\n').slice(-15),
        };

        if (coverage < DEPLOYMENT_TEST_CONFIG.thresholds.testCoverage) {
          console.log(`⚠️  ${testConfig.name} coverage (${coverage}%) below threshold`);
        } else {
          console.log(`✅ ${testConfig.name} passed with ${coverage}% coverage`);
        }

        this.results.overall.passed++;

      } catch (error) {
        this.results.tests[testConfig.name] = {
          status: 'failed',
          error: error.message,
        };

        this.results.overall.failed++;
        console.log(`❌ ${testConfig.name} failed: ${error.message}`);
      }
    }
  }

  async runIntegrationTests() {
    console.log('\\n🔗 Running Integration Tests...');

    try {
      // Run mobile integration tests
      console.log('Running mobile integration tests...');
      const mobileTestOutput = execSync(
        'npm test -- tests/integration.test.ts --workspace=@strata-noble/achievery-mobile',
        {
          encoding: 'utf8',
          cwd: path.join(__dirname, '..'),
          timeout: 180000, // 3 minutes
        }
      );

      this.results.tests['mobile-integration'] = {
        status: 'passed',
        output: mobileTestOutput.split('\\n').slice(-10),
      };

      this.results.overall.passed++;
      console.log('✅ Mobile integration tests passed');

    } catch (error) {
      this.results.tests['mobile-integration'] = {
        status: 'failed',
        error: error.message,
      };

      this.results.overall.failed++;
      console.log(`❌ Mobile integration tests failed: ${error.message}`);
    }
  }

  async runE2ETests() {
    console.log('\\n🌐 Running End-to-End Tests...');

    const e2eTests = [
      'cross-platform-integration.spec.ts',
      'data-sync.spec.ts',
    ];

    for (const testFile of e2eTests) {
      try {
        console.log(`Running ${testFile}...`);

        const testOutput = execSync(
          `npx playwright test tests/e2e/${testFile} --reporter=json`,
          {
            encoding: 'utf8',
            cwd: path.join(__dirname, '..', 'apps', 'website'),
            timeout: 300000, // 5 minutes
          }
        );

        const testResults = JSON.parse(testOutput);
        const passed = testResults.suites?.reduce((acc, suite) => acc + suite.specs.filter(spec => spec.ok).length, 0) || 0;
        const failed = testResults.suites?.reduce((acc, suite) => acc + suite.specs.filter(spec => !spec.ok).length, 0) || 0;

        this.results.tests[testFile] = {
          status: failed === 0 ? 'passed' : 'failed',
          passed,
          failed,
          duration: testResults.stats?.duration || 0,
        };

        this.results.overall.passed += passed;
        this.results.overall.failed += failed;

        console.log(`${failed === 0 ? '✅' : '❌'} ${testFile}: ${passed} passed, ${failed} failed`);

      } catch (error) {
        this.results.tests[testFile] = {
          status: 'failed',
          error: error.message,
        };

        this.results.overall.failed++;
        console.log(`❌ ${testFile} failed: ${error.message}`);
      }
    }
  }

  async runPerformanceTests() {
    console.log('\\n⚡ Running Performance Tests...');

    try {
      // Start development server
      const server = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, '..'),
        detached: true,
      });

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Run Lighthouse performance audit
      try {
        const lighthouseOutput = execSync(
          'npx lighthouse http://localhost:3000 --output=json --quiet --chrome-flags="--headless"',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const lighthouseResults = JSON.parse(lighthouseOutput);
        const performanceScore = Math.round(lighthouseResults.lhr.categories.performance.score * 100);

        this.results.performance = {
          lighthouse_score: performanceScore,
          first_contentful_paint: lighthouseResults.lhr.audits['first-contentful-paint'].numericValue,
          largest_contentful_paint: lighthouseResults.lhr.audits['largest-contentful-paint'].numericValue,
          cumulative_layout_shift: lighthouseResults.lhr.audits['cumulative-layout-shift'].numericValue,
        };

        if (performanceScore >= DEPLOYMENT_TEST_CONFIG.thresholds.performanceScore) {
          console.log(`✅ Performance score: ${performanceScore}/100`);
          this.results.overall.passed++;
        } else {
          console.log(`⚠️  Performance score (${performanceScore}) below threshold`);
          this.results.overall.failed++;
        }

      } catch (lighthouseError) {
        console.log(`⚠️  Lighthouse audit failed: ${lighthouseError.message}`);
        this.results.performance = { error: lighthouseError.message };
      }

      // Clean up server
      process.kill(-server.pid);

    } catch (error) {
      console.log(`❌ Performance tests failed: ${error.message}`);
      this.results.performance = { error: error.message };
      this.results.overall.failed++;
    }
  }

  async runSecurityTests() {
    console.log('\\n🔒 Running Security Tests...');

    try {
      // Run security-focused Playwright tests
      const securityOutput = execSync(
        'npx playwright test tests/e2e/cross-platform-integration.spec.ts --grep="Security" --reporter=json',
        {
          encoding: 'utf8',
          cwd: path.join(__dirname, '..', 'apps', 'website'),
          timeout: 180000,
        }
      );

      const securityResults = JSON.parse(securityOutput);
      const securityPassed = securityResults.suites?.reduce((acc, suite) => acc + suite.specs.filter(spec => spec.ok).length, 0) || 0;
      const securityFailed = securityResults.suites?.reduce((acc, suite) => acc + suite.specs.filter(spec => !spec.ok).length, 0) || 0;

      const securityScore = securityFailed === 0 ? 100 : Math.max(0, 100 - (securityFailed * 20));

      this.results.security = {
        score: securityScore,
        tests_passed: securityPassed,
        tests_failed: securityFailed,
        vulnerabilities: securityFailed,
      };

      if (securityScore >= DEPLOYMENT_TEST_CONFIG.thresholds.securityScore) {
        console.log(`✅ Security score: ${securityScore}/100`);
        this.results.overall.passed++;
      } else {
        console.log(`⚠️  Security score (${securityScore}) below threshold`);
        this.results.overall.failed++;
      }

    } catch (error) {
      console.log(`❌ Security tests failed: ${error.message}`);
      this.results.security = { error: error.message };
      this.results.overall.failed++;
    }
  }

  async runDeploymentValidation() {
    console.log('\\n🚢 Running Deployment Validation...');

    const validations = [
      {
        name: 'Environment Variables',
        check: () => {
          const requiredVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'NEXT_PUBLIC_ACHIEVERY_URL',
          ];

          for (const varName of requiredVars) {
            if (!process.env[varName]) {
              throw new Error(`Missing required environment variable: ${varName}`);
            }
          }
          return true;
        },
      },
      {
        name: 'Package Dependencies',
        check: () => {
          const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
          return packageJson.workspaces && packageJson.workspaces.length > 0;
        },
      },
      {
        name: 'Build Artifacts',
        check: async () => {
          const websiteBuildPath = path.join(__dirname, '..', 'apps', 'website', '.next');
          try {
            await fs.access(websiteBuildPath);
            return true;
          } catch {
            return false;
          }
        },
      },
    ];

    for (const validation of validations) {
      try {
        const result = await validation.check();
        if (result) {
          console.log(`✅ ${validation.name} validation passed`);
          this.results.deployments[validation.name] = { status: 'passed' };
          this.results.overall.passed++;
        } else {
          console.log(`❌ ${validation.name} validation failed`);
          this.results.deployments[validation.name] = { status: 'failed' };
          this.results.overall.failed++;
        }
      } catch (error) {
        console.log(`❌ ${validation.name} validation failed: ${error.message}`);
        this.results.deployments[validation.name] = { status: 'failed', error: error.message };
        this.results.overall.failed++;
      }
    }
  }

  async generateReport() {
    console.log('\\n📊 Generating Test Report...');

    const reportDir = path.join(__dirname, '..', 'tests', 'reports');
    await fs.mkdir(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, 'deployment-pipeline-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    const htmlReport = this.generateHTMLReport();
    const htmlReportPath = path.join(reportDir, 'deployment-pipeline-report.html');
    await fs.writeFile(htmlReportPath, htmlReport);

    console.log('\\n=== Deployment Pipeline Test Summary ===');
    console.log(`Status: ${this.results.status}`);
    console.log(`Duration: ${Math.round(this.results.overall.duration / 1000)}s`);
    console.log(`Tests Passed: ${this.results.overall.passed}`);
    console.log(`Tests Failed: ${this.results.overall.failed}`);
    console.log(`Success: ${this.results.overall.success ? '✅ YES' : '❌ NO'}`);
    console.log(`\\nReports saved to:`);
    console.log(`- JSON: ${reportPath}`);
    console.log(`- HTML: ${htmlReportPath}`);

    if (!this.results.overall.success) {
      console.log('\\n❌ Deployment pipeline tests failed. Review the issues above.');
      process.exit(1);
    } else {
      console.log('\\n✅ All deployment pipeline tests passed! Ready for deployment.');
    }
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Deployment Pipeline Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Deployment Pipeline Test Report</h1>
        <p><strong>Timestamp:</strong> ${this.results.timestamp}</p>
        <p><strong>Environment:</strong> ${this.results.environment}</p>
        <p><strong>Status:</strong> <span class="${this.results.overall.success ? 'success' : 'error'}">${this.results.status}</span></p>
        <p><strong>Duration:</strong> ${Math.round(this.results.overall.duration / 1000)} seconds</p>
    </div>

    <div class="section">
        <h2>Summary</h2>
        <div class="metric">
            <strong>Tests Passed:</strong> <span class="success">${this.results.overall.passed}</span>
        </div>
        <div class="metric">
            <strong>Tests Failed:</strong> <span class="error">${this.results.overall.failed}</span>
        </div>
        <div class="metric">
            <strong>Success Rate:</strong> ${this.results.overall.passed + this.results.overall.failed > 0 ? Math.round((this.results.overall.passed / (this.results.overall.passed + this.results.overall.failed)) * 100) : 0}%
        </div>
    </div>

    <div class="section">
        <h2>Performance Metrics</h2>
        <pre>${JSON.stringify(this.results.performance, null, 2)}</pre>
    </div>

    <div class="section">
        <h2>Security Results</h2>
        <pre>${JSON.stringify(this.results.security, null, 2)}</pre>
    </div>

    <div class="section">
        <h2>Test Results</h2>
        <pre>${JSON.stringify(this.results.tests, null, 2)}</pre>
    </div>

    <div class="section">
        <h2>Build Results</h2>
        <pre>${JSON.stringify(this.results.builds, null, 2)}</pre>
    </div>
</body>
</html>`;
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new DeploymentTestRunner();
  runner.runAllTests().catch(console.error);
}

export default DeploymentTestRunner;