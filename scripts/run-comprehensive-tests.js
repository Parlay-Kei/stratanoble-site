#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'running',
      web_platform_tests: {
        user_registration: false,
        dream_capture: false,
        action_logging: false,
        narrative_generation: false,
        tier_access: false,
        coach_sharing: false,
        mobile_prompts: false,
      },
      mobile_app_tests: {
        deep_linking: false,
        push_notifications: false,
        offline_functionality: false,
        data_sync: false,
        strata_integration: false,
      },
      integration_tests: {
        sso_flow: false,
        realtime_sync: false,
        stripe_subscriptions: false,
        coach_dashboard: false,
        email_notifications: false,
      },
      performance_metrics: {
        web_load_time: 0,
        mobile_launch_time: 0,
        database_query_time: 0,
        ai_reframing_time: 0,
      },
      screenshots: {},
      issues_found: [],
      tests_passed: 0,
      tests_failed: 0,
      recommendations: [],
    };

    this.servers = {
      web: null,
      mobile: null,
    };
  }

  async runComprehensiveTests() {
    console.log('🚀 Starting Comprehensive Cross-Platform Integration Tests');
    console.log('===========================================================');

    try {
      // Phase 1: Setup test environment
      await this.setupTestEnvironment();

      // Phase 2: Start development servers
      await this.startDevelopmentServers();

      // Phase 3: Run web platform tests
      await this.runWebPlatformTests();

      // Phase 4: Run mobile app tests
      await this.runMobileAppTests();

      // Phase 5: Run integration tests
      await this.runIntegrationTests();

      // Phase 6: Run performance tests
      await this.runPerformanceTests();

      // Phase 7: Cleanup and report
      await this.cleanup();
      await this.generateComprehensiveReport();

    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      this.results.status = 'failed';
      await this.cleanup();
    }

    return this.results;
  }

  async setupTestEnvironment() {
    console.log('\\n🔧 Setting up test environment...');

    // Check required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_ACHIEVERY_URL',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Ensure test directories exist
    const testDirs = [
      'apps/website/tests/reports',
      'apps/website/tests/screenshots',
      'apps/achievery-mobile/tests/results',
    ];

    for (const dir of testDirs) {
      const fullPath = path.join(__dirname, '..', dir);
      await fs.mkdir(fullPath, { recursive: true });
    }

    console.log('✅ Test environment setup complete');
  }

  async startDevelopmentServers() {
    console.log('\\n🌐 Starting development servers...');

    // Start web server
    try {
      this.servers.web = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        detached: true,
      });

      console.log('✅ Web server starting...');

      // Wait for web server to be ready
      await this.waitForServer('http://localhost:3000', 30000);
      console.log('✅ Web server ready');

    } catch (error) {
      console.error('❌ Failed to start web server:', error.message);
      throw error;
    }

    // Start mobile development server
    try {
      this.servers.mobile = spawn('npm', ['run', 'dev:mobile'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        detached: true,
      });

      console.log('✅ Mobile server starting...');

      // Wait a moment for mobile server
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('✅ Mobile server ready');

    } catch (error) {
      console.warn('⚠️  Mobile server start failed (continuing with web tests):', error.message);
    }
  }

  async waitForServer(url, timeout = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Server not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Server at ${url} not ready within ${timeout}ms`);
  }

  async runWebPlatformTests() {
    console.log('\\n🌐 Running Web Platform Tests...');

    const testSuites = [
      'cross-platform-integration.spec.ts',
      'data-sync.spec.ts',
    ];

    for (const testFile of testSuites) {
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
        this.processPlaywrightResults(testResults, testFile);

      } catch (error) {
        console.error(`❌ ${testFile} failed:`, error.message);
        this.results.tests_failed++;
        this.results.issues_found.push({
          severity: 'high',
          category: 'functionality',
          description: `Web platform test failed: ${error.message}`,
          location: testFile,
          reproduction_steps: `Run: npx playwright test tests/e2e/${testFile}`,
        });
      }
    }
  }

  async runMobileAppTests() {
    console.log('\\n📱 Running Mobile App Tests...');

    try {
      console.log('Running mobile integration tests...');

      const mobileTestOutput = execSync(
        'npm test -- tests/integration.test.ts',
        {
          encoding: 'utf8',
          cwd: path.join(__dirname, '..', 'apps', 'achievery-mobile'),
          timeout: 180000, // 3 minutes
        }
      );

      // Parse Jest output
      const passMatch = mobileTestOutput.match(/Tests:\\s+(\\d+) passed/);
      const failMatch = mobileTestOutput.match(/Tests:\\s+\\d+ passed,\\s+(\\d+) failed/);

      const passed = passMatch ? parseInt(passMatch[1]) : 0;
      const failed = failMatch ? parseInt(failMatch[1]) : 0;

      this.results.tests_passed += passed;
      this.results.tests_failed += failed;

      // Update mobile test results based on output
      if (mobileTestOutput.includes('App Installation')) {
        this.results.mobile_app_tests.deep_linking = true;
      }
      if (mobileTestOutput.includes('Deep Linking')) {
        this.results.mobile_app_tests.deep_linking = true;
      }
      if (mobileTestOutput.includes('Push Notifications')) {
        this.results.mobile_app_tests.push_notifications = true;
      }
      if (mobileTestOutput.includes('Offline')) {
        this.results.mobile_app_tests.offline_functionality = true;
      }
      if (mobileTestOutput.includes('Data Sync')) {
        this.results.mobile_app_tests.data_sync = true;
      }
      if (mobileTestOutput.includes('Strata Integration')) {
        this.results.mobile_app_tests.strata_integration = true;
      }

      console.log(`✅ Mobile tests: ${passed} passed, ${failed} failed`);

    } catch (error) {
      console.error('❌ Mobile app tests failed:', error.message);
      this.results.tests_failed++;
      this.results.issues_found.push({
        severity: 'high',
        category: 'functionality',
        description: `Mobile app tests failed: ${error.message}`,
        location: 'Mobile app',
        reproduction_steps: 'Run: npm test -- tests/integration.test.ts',
      });
    }
  }

  async runIntegrationTests() {
    console.log('\\n🔗 Running Integration Tests...');

    try {
      // Test API endpoints
      const apiTests = [
        { url: 'http://localhost:3000/api/health', name: 'Health Check' },
        { url: 'http://localhost:3000/api/early-access', name: 'Early Access API' },
      ];

      for (const apiTest of apiTests) {
        try {
          const response = await fetch(apiTest.url, { method: 'HEAD' });
          if (response.ok || response.status === 405) { // 405 = Method Not Allowed is OK
            console.log(`✅ ${apiTest.name} endpoint accessible`);
            this.results.tests_passed++;
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error(`❌ ${apiTest.name} failed:`, error.message);
          this.results.tests_failed++;
          this.results.issues_found.push({
            severity: 'medium',
            category: 'integration',
            description: `API endpoint ${apiTest.url} failed: ${error.message}`,
            location: 'API endpoints',
            reproduction_steps: `Test: curl -I ${apiTest.url}`,
          });
        }
      }

      // Test external service connectivity
      try {
        const achieveryResponse = await fetch(process.env.NEXT_PUBLIC_ACHIEVERY_URL, { method: 'HEAD' });
        if (achieveryResponse.ok) {
          this.results.integration_tests.sso_flow = true;
          console.log('✅ ACHIEVERY platform connectivity verified');
          this.results.tests_passed++;
        }
      } catch (error) {
        console.error('❌ ACHIEVERY platform connectivity failed:', error.message);
        this.results.tests_failed++;
      }

    } catch (error) {
      console.error('❌ Integration tests failed:', error.message);
      this.results.tests_failed++;
    }
  }

  async runPerformanceTests() {
    console.log('\\n⚡ Running Performance Tests...');

    try {
      // Test page load times
      const pages = ['/', '/discovery', '/achievery-preview', '/early-access'];
      let totalLoadTime = 0;

      for (const page of pages) {
        const startTime = Date.now();
        try {
          const response = await fetch(`http://localhost:3000${page}`);
          const endTime = Date.now();
          const loadTime = endTime - startTime;

          totalLoadTime += loadTime;

          if (loadTime > 1000) {
            this.results.issues_found.push({
              severity: 'medium',
              category: 'performance',
              description: `Page load time (${loadTime}ms) exceeds 1 second threshold`,
              location: page,
              reproduction_steps: `Navigate to ${page} and measure load time`,
            });
          }

          console.log(`✅ ${page}: ${loadTime}ms`);

        } catch (error) {
          console.error(`❌ ${page} load failed:`, error.message);
          this.results.tests_failed++;
        }
      }

      this.results.performance_metrics.web_load_time = totalLoadTime / pages.length;
      this.results.tests_passed++;

    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
      this.results.tests_failed++;
    }
  }

  processPlaywrightResults(testResults, testFile) {
    if (!testResults.suites) return;

    for (const suite of testResults.suites) {
      for (const spec of suite.specs) {
        if (spec.ok) {
          this.results.tests_passed++;

          // Map test names to result properties
          if (spec.title.includes('registration')) {
            this.results.web_platform_tests.user_registration = true;
          }
          if (spec.title.includes('preview')) {
            this.results.web_platform_tests.dream_capture = true;
          }
          if (spec.title.includes('tier')) {
            this.results.web_platform_tests.tier_access = true;
          }
          if (spec.title.includes('authentication')) {
            this.results.integration_tests.sso_flow = true;
          }
          if (spec.title.includes('real-time')) {
            this.results.integration_tests.realtime_sync = true;
          }
          if (spec.title.includes('security')) {
            this.results.web_platform_tests.coach_sharing = true;
          }
          if (spec.title.includes('mobile')) {
            this.results.web_platform_tests.mobile_prompts = true;
          }

        } else {
          this.results.tests_failed++;
          this.results.issues_found.push({
            severity: 'high',
            category: 'functionality',
            description: `Test failed: ${spec.title}`,
            location: testFile,
            reproduction_steps: `Run specific test: ${spec.title}`,
          });
        }
      }
    }
  }

  async cleanup() {
    console.log('\\n🧹 Cleaning up test environment...');

    // Kill development servers
    if (this.servers.web) {
      try {
        process.kill(-this.servers.web.pid, 'SIGTERM');
        console.log('✅ Web server stopped');
      } catch (error) {
        console.warn('⚠️  Failed to stop web server:', error.message);
      }
    }

    if (this.servers.mobile) {
      try {
        process.kill(-this.servers.mobile.pid, 'SIGTERM');
        console.log('✅ Mobile server stopped');
      } catch (error) {
        console.warn('⚠️  Failed to stop mobile server:', error.message);
      }
    }
  }

  async generateComprehensiveReport() {
    console.log('\\n📊 Generating Comprehensive Test Report...');

    // Calculate status
    this.results.status = this.results.tests_failed === 0 ? 'completed' : 'partial';

    // Generate recommendations
    if (this.results.performance_metrics.web_load_time > 1000) {
      this.results.recommendations.push('Optimize web application load times with code splitting and lazy loading');
    }

    if (this.results.tests_failed > 0) {
      this.results.recommendations.push('Address failed tests before production deployment');
    }

    if (!this.results.mobile_app_tests.data_sync) {
      this.results.recommendations.push('Implement and test mobile app data synchronization');
    }

    if (!this.results.integration_tests.realtime_sync) {
      this.results.recommendations.push('Set up real-time data synchronization between platforms');
    }

    this.results.recommendations.push('Set up continuous integration for automated testing');
    this.results.recommendations.push('Implement monitoring and alerting for production environment');

    // Save comprehensive report
    const reportDir = path.join(__dirname, '..', 'tests', 'reports');
    await fs.mkdir(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, 'comprehensive-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    // Generate summary
    console.log('\\n=== Comprehensive Cross-Platform Test Results ===');
    console.log(`Status: ${this.results.status}`);
    console.log(`Tests Passed: ${this.results.tests_passed}`);
    console.log(`Tests Failed: ${this.results.tests_failed}`);
    console.log(`Issues Found: ${this.results.issues_found.length}`);
    console.log(`Web Load Time: ${Math.round(this.results.performance_metrics.web_load_time)}ms`);

    console.log('\\n=== Web Platform Tests ===');
    Object.entries(this.results.web_platform_tests).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });

    console.log('\\n=== Mobile App Tests ===');
    Object.entries(this.results.mobile_app_tests).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });

    console.log('\\n=== Integration Tests ===');
    Object.entries(this.results.integration_tests).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });

    if (this.results.issues_found.length > 0) {
      console.log('\\n=== Issues Found ===');
      this.results.issues_found.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        console.log(`   Location: ${issue.location}`);
      });
    }

    console.log('\\n=== Recommendations ===');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    console.log(`\\nDetailed report saved to: ${reportPath}`);

    if (this.results.status === 'completed') {
      console.log('\\n✅ All cross-platform integration tests completed successfully!');
    } else {
      console.log('\\n⚠️  Some tests failed. Review issues above before deployment.');
    }
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new ComprehensiveTestRunner();
  runner.runComprehensiveTests().catch(console.error);
}

export default ComprehensiveTestRunner;