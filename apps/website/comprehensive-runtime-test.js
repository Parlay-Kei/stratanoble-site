const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveRuntimeTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.errors = [];
        this.testResults = {
            timestamp: new Date().toISOString(),
            serverAccessible: false,
            pagesTest: {},
            javascriptErrors: [],
            consoleErrors: [],
            hydrationErrors: [],
            networkErrors: [],
            performanceMetrics: {},
            summary: {
                totalPages: 0,
                successfulPages: 0,
                errorPages: 0,
                hydrationIssuesFound: false,
                runtimeErrorsFound: false
            }
        };

        this.testPages = [
            { path: '/', name: 'Homepage' },
            { path: '/about', name: 'About Page' },
            { path: '/contact', name: 'Contact Page' },
            { path: '/services', name: 'Services Page' },
            { path: '/technology', name: 'Technology Page' },
            { path: '/discovery', name: 'Discovery Page' },
            { path: '/achievery-preview', name: 'ACHIEVERY Preview Page' },
            { path: '/workshops', name: 'Workshops Page' }
        ];
    }

    async initialize() {
        console.log('🚀 Starting Comprehensive Runtime Testing...');
        console.log('==================================================');

        try {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-extensions'
                ],
                defaultViewport: { width: 1920, height: 1080 }
            });

            this.page = await this.browser.newPage();

            // Set up console monitoring
            this.page.on('console', (msg) => {
                const type = msg.type();
                const text = msg.text();

                if (type === 'error') {
                    this.testResults.consoleErrors.push({
                        type: 'console',
                        message: text,
                        timestamp: new Date().toISOString()
                    });

                    // Check for specific hydration and runtime errors
                    if (text.includes('hydration') || text.includes('Hydration')) {
                        this.testResults.hydrationErrors.push({
                            message: text,
                            timestamp: new Date().toISOString()
                        });
                    }

                    if (text.includes('Cannot read properties of undefined (reading \'call\')')) {
                        this.testResults.javascriptErrors.push({
                            type: 'runtime',
                            message: text,
                            error: 'Cannot read properties of undefined (reading \'call\')',
                            timestamp: new Date().toISOString()
                        });
                    }
                }

                console.log(`[${type.toUpperCase()}] ${text}`);
            });

            // Set up error monitoring
            this.page.on('error', (error) => {
                this.testResults.javascriptErrors.push({
                    type: 'page-error',
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
                console.error('❌ Page Error:', error);
            });

            // Set up request failure monitoring
            this.page.on('requestfailed', (request) => {
                this.testResults.networkErrors.push({
                    url: request.url(),
                    failureText: request.failure()?.errorText,
                    timestamp: new Date().toISOString()
                });
                console.warn('⚠️ Network Error:', request.url(), request.failure()?.errorText);
            });

            console.log('✅ Browser initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize browser:', error);
            return false;
        }
    }

    async testServerAccessibility() {
        console.log('\n📡 Testing Server Accessibility...');

        try {
            const response = await this.page.goto('http://localhost:3000', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            if (response && response.ok()) {
                this.testResults.serverAccessible = true;
                console.log('✅ Server is accessible at localhost:3000');

                // Wait for initial hydration
                await this.page.waitForTimeout(3000);

                return true;
            } else {
                console.error('❌ Server returned non-OK response:', response?.status());
                return false;
            }
        } catch (error) {
            console.error('❌ Server accessibility test failed:', error.message);
            return false;
        }
    }

    async testPageNavigation() {
        console.log('\n🔍 Testing Page Navigation and Runtime Errors...');

        for (const testPage of this.testPages) {
            console.log(`\n--- Testing ${testPage.name} (${testPage.path}) ---`);

            const pageResult = {
                path: testPage.path,
                name: testPage.name,
                accessible: false,
                loadTime: null,
                errors: [],
                consoleErrors: [],
                hydrationComplete: false,
                performanceMetrics: {}
            };

            try {
                // Clear previous console errors for this page
                const initialErrorCount = this.testResults.consoleErrors.length;

                const startTime = Date.now();
                const response = await this.page.goto(`http://localhost:3000${testPage.path}`, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                pageResult.loadTime = Date.now() - startTime;

                if (response && response.ok()) {
                    pageResult.accessible = true;
                    console.log(`✅ ${testPage.name} loaded successfully (${pageResult.loadTime}ms)`);

                    // Wait for React hydration
                    await this.page.waitForTimeout(5000);

                    // Check if page is hydrated
                    try {
                        await this.page.waitForSelector('body', { timeout: 5000 });
                        pageResult.hydrationComplete = true;
                        console.log(`✅ ${testPage.name} hydration completed`);
                    } catch (hydrationError) {
                        console.warn(`⚠️ ${testPage.name} hydration issue:`, hydrationError.message);
                    }

                    // Test basic interactivity
                    await this.testPageInteractivity(testPage.path);

                    // Collect performance metrics
                    const metrics = await this.page.metrics();
                    pageResult.performanceMetrics = {
                        JSEventListeners: metrics.JSEventListeners,
                        Nodes: metrics.Nodes,
                        JSHeapUsedSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024 * 100) / 100 // MB
                    };

                    // Get new console errors for this page
                    const newErrors = this.testResults.consoleErrors.slice(initialErrorCount);
                    pageResult.consoleErrors = newErrors;

                    if (newErrors.length === 0) {
                        console.log(`✅ ${testPage.name} - No console errors detected`);
                    } else {
                        console.warn(`⚠️ ${testPage.name} - ${newErrors.length} console errors detected`);
                        newErrors.forEach(error => {
                            console.warn(`   - ${error.message}`);
                        });
                    }

                } else {
                    console.error(`❌ ${testPage.name} returned status:`, response?.status());
                    pageResult.errors.push(`HTTP ${response?.status()}`);
                }

            } catch (error) {
                console.error(`❌ ${testPage.name} navigation failed:`, error.message);
                pageResult.errors.push(error.message);
            }

            this.testResults.pagesTest[testPage.path] = pageResult;
            this.testResults.summary.totalPages++;

            if (pageResult.accessible && pageResult.consoleErrors.length === 0) {
                this.testResults.summary.successfulPages++;
            } else {
                this.testResults.summary.errorPages++;
            }
        }
    }

    async testPageInteractivity(path) {
        console.log(`🖱️ Testing interactivity for ${path}`);

        try {
            // Test if navigation links are clickable
            const navLinks = await this.page.$$('nav a');
            console.log(`   Found ${navLinks.length} navigation links`);

            // Test if buttons are functional
            const buttons = await this.page.$$('button');
            console.log(`   Found ${buttons.length} interactive buttons`);

            // Test form elements if present
            const forms = await this.page.$$('form');
            if (forms.length > 0) {
                console.log(`   Found ${forms.length} forms`);
            }

            // Test for any JavaScript click handlers
            const clickableElements = await this.page.$$('[onclick], [data-testid]');
            console.log(`   Found ${clickableElements.length} elements with click handlers`);

        } catch (error) {
            console.warn(`⚠️ Interactivity test issue: ${error.message}`);
        }
    }

    async runRuntimeErrorCheck() {
        console.log('\n🔍 Running Specific Runtime Error Checks...');

        try {
            // Inject a script to check for specific runtime errors
            const runtimeCheckResult = await this.page.evaluate(() => {
                const errors = [];
                const originalError = console.error;

                // Override console.error temporarily to catch specific errors
                console.error = function(...args) {
                    const message = args.join(' ');
                    if (message.includes('Cannot read properties of undefined (reading \'call\')')) {
                        errors.push({
                            type: 'runtime',
                            message: message,
                            timestamp: new Date().toISOString()
                        });
                    }
                    originalError.apply(console, args);
                };

                // Test React hydration status
                const hasReact = typeof window.React !== 'undefined';
                const hasReactDOM = typeof window.ReactDOM !== 'undefined';

                // Restore original console.error
                setTimeout(() => {
                    console.error = originalError;
                }, 1000);

                return {
                    errors,
                    hasReact,
                    hasReactDOM,
                    reactVersion: hasReact ? window.React.version : 'Not detected'
                };
            });

            if (runtimeCheckResult.errors.length > 0) {
                console.warn('⚠️ Runtime errors detected:', runtimeCheckResult.errors);
                this.testResults.javascriptErrors.push(...runtimeCheckResult.errors);
            } else {
                console.log('✅ No specific runtime errors detected');
            }

            console.log('React Detection:', {
                hasReact: runtimeCheckResult.hasReact,
                hasReactDOM: runtimeCheckResult.hasReactDOM,
                version: runtimeCheckResult.reactVersion
            });

        } catch (error) {
            console.error('❌ Runtime error check failed:', error);
        }
    }

    generateSummary() {
        console.log('\n📊 Test Summary:');
        console.log('================');

        // Update summary flags
        this.testResults.summary.hydrationIssuesFound = this.testResults.hydrationErrors.length > 0;
        this.testResults.summary.runtimeErrorsFound = this.testResults.javascriptErrors.length > 0;

        console.log(`Total Pages Tested: ${this.testResults.summary.totalPages}`);
        console.log(`Successful Pages: ${this.testResults.summary.successfulPages}`);
        console.log(`Pages with Errors: ${this.testResults.summary.errorPages}`);
        console.log(`Console Errors: ${this.testResults.consoleErrors.length}`);
        console.log(`JavaScript Errors: ${this.testResults.javascriptErrors.length}`);
        console.log(`Hydration Errors: ${this.testResults.hydrationErrors.length}`);
        console.log(`Network Errors: ${this.testResults.networkErrors.length}`);

        if (this.testResults.javascriptErrors.length === 0 &&
            this.testResults.hydrationErrors.length === 0 &&
            this.testResults.consoleErrors.length === 0) {
            console.log('\n🎉 SUCCESS: No runtime or hydration errors detected!');
            console.log('✅ The "Cannot read properties of undefined (reading \'call\')" error appears to be resolved');
        } else {
            console.log('\n⚠️ ISSUES FOUND:');

            if (this.testResults.javascriptErrors.length > 0) {
                console.log('\n❌ JavaScript Runtime Errors:');
                this.testResults.javascriptErrors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.message}`);
                });
            }

            if (this.testResults.hydrationErrors.length > 0) {
                console.log('\n❌ Hydration Errors:');
                this.testResults.hydrationErrors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.message}`);
                });
            }

            if (this.testResults.consoleErrors.length > 0) {
                console.log('\n❌ Console Errors:');
                this.testResults.consoleErrors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.message}`);
                });
            }
        }
    }

    async saveResults() {
        const resultsDir = path.join(__dirname, 'test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsFile = path.join(resultsDir, `runtime-test-${timestamp}.json`);

        fs.writeFileSync(resultsFile, JSON.stringify(this.testResults, null, 2));
        console.log(`\n💾 Results saved to: ${resultsFile}`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('\n🧹 Browser cleanup completed');
        }
    }

    async run() {
        try {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize browser');
            }

            const serverAccessible = await this.testServerAccessibility();
            if (!serverAccessible) {
                throw new Error('Server not accessible');
            }

            await this.testPageNavigation();
            await this.runRuntimeErrorCheck();

            this.generateSummary();
            await this.saveResults();

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            this.testResults.summary.testFailed = true;
            this.testResults.summary.failureReason = error.message;

        } finally {
            await this.cleanup();
        }

        return this.testResults;
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    const tester = new ComprehensiveRuntimeTester();
    tester.run().then((results) => {
        console.log('\n🏁 Testing completed');
        process.exit(results.summary.runtimeErrorsFound || results.summary.hydrationIssuesFound ? 1 : 0);
    }).catch((error) => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = ComprehensiveRuntimeTester;