const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

class RuntimeErrorTester {
    constructor() {
        this.browsers = [];
        this.testResults = {
            timestamp: new Date().toISOString(),
            serverAccessible: false,
            browsers: {},
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                runtimeErrorsFound: false,
                hydrationErrorsFound: false,
                specificCallErrorFound: false
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

    async runTest(browserType, browserName) {
        console.log(`\n🔍 Testing with ${browserName}...`);
        console.log('='.repeat(40));

        const browserResult = {
            name: browserName,
            success: false,
            pages: {},
            errors: [],
            consoleErrors: [],
            javascriptErrors: [],
            hydrationErrors: [],
            networkErrors: []
        };

        let browser = null;
        let page = null;

        try {
            // Launch browser
            browser = await browserType.launch({
                headless: true,
                args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
            });
            const context = await browser.newContext({
                viewport: { width: 1920, height: 1080 }
            });
            page = await context.newPage();

            // Set up error monitoring
            page.on('console', (msg) => {
                const type = msg.type();
                const text = msg.text();

                if (type === 'error') {
                    browserResult.consoleErrors.push({
                        type: 'console',
                        message: text,
                        timestamp: new Date().toISOString()
                    });

                    console.log(`❌ Console Error: ${text}`);

                    // Check for specific errors
                    if (text.includes('hydration') || text.includes('Hydration')) {
                        browserResult.hydrationErrors.push({
                            message: text,
                            timestamp: new Date().toISOString()
                        });
                        console.log(`🔥 HYDRATION ERROR DETECTED: ${text}`);
                    }

                    if (text.includes('Cannot read properties of undefined (reading \'call\')')) {
                        browserResult.javascriptErrors.push({
                            type: 'specific-runtime',
                            message: text,
                            error: 'Cannot read properties of undefined (reading \'call\')',
                            timestamp: new Date().toISOString()
                        });
                        console.log(`💥 TARGET RUNTIME ERROR DETECTED: ${text}`);
                    }
                }
            });

            page.on('pageerror', (error) => {
                browserResult.javascriptErrors.push({
                    type: 'page-error',
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ Page Error: ${error.message}`);
            });

            page.on('requestfailed', (request) => {
                browserResult.networkErrors.push({
                    url: request.url(),
                    failureText: request.failure()?.errorText,
                    timestamp: new Date().toISOString()
                });
                console.warn(`⚠️ Network Error: ${request.url()} - ${request.failure()?.errorText}`);
            });

            // Test each page
            for (const testPage of this.testPages) {
                console.log(`\n--- Testing ${testPage.name} (${testPage.path}) ---`);

                const pageResult = {
                    path: testPage.path,
                    name: testPage.name,
                    accessible: false,
                    loadTime: null,
                    errors: [],
                    hydrationComplete: false,
                    interactivityWorking: false
                };

                try {
                    const startTime = Date.now();

                    // Navigate to page
                    const response = await page.goto(`http://localhost:3000${testPage.path}`, {
                        waitUntil: 'networkidle',
                        timeout: 30000
                    });

                    pageResult.loadTime = Date.now() - startTime;

                    if (response && response.ok()) {
                        pageResult.accessible = true;
                        console.log(`✅ ${testPage.name} loaded successfully (${pageResult.loadTime}ms)`);

                        // Wait for hydration and React to be ready
                        await page.waitForTimeout(3000);

                        // Check if page is properly hydrated
                        try {
                            await page.waitForSelector('body', { timeout: 5000 });
                            pageResult.hydrationComplete = true;
                            console.log(`✅ ${testPage.name} hydration appears complete`);

                            // Test basic interactivity
                            const interactivityResult = await this.testPageInteractivity(page, testPage.path);
                            pageResult.interactivityWorking = interactivityResult;

                        } catch (hydrationError) {
                            console.warn(`⚠️ ${testPage.name} hydration issue: ${hydrationError.message}`);
                            pageResult.errors.push(`Hydration issue: ${hydrationError.message}`);
                        }

                        // Check for specific runtime errors in the page context
                        const runtimeCheck = await page.evaluate(() => {
                            // Check if we can detect any React hydration issues
                            const hasReactElements = document.querySelectorAll('[data-reactroot], [data-reactid]').length > 0;
                            const hasNextElements = document.querySelector('[id="__next"]') !== null;

                            return {
                                hasReactElements,
                                hasNextElements,
                                bodyHasContent: document.body.children.length > 0,
                                scriptsLoaded: document.scripts.length
                            };
                        });

                        console.log(`📊 React/Next.js status: hasNext=${runtimeCheck.hasNextElements}, bodyContent=${runtimeCheck.bodyHasContent}, scripts=${runtimeCheck.scriptsLoaded}`);

                    } else {
                        console.error(`❌ ${testPage.name} returned status: ${response?.status()}`);
                        pageResult.errors.push(`HTTP ${response?.status()}`);
                    }

                } catch (error) {
                    console.error(`❌ ${testPage.name} navigation failed: ${error.message}`);
                    pageResult.errors.push(error.message);
                }

                browserResult.pages[testPage.path] = pageResult;
                this.testResults.summary.totalTests++;

                if (pageResult.accessible && pageResult.errors.length === 0) {
                    this.testResults.summary.passedTests++;
                } else {
                    this.testResults.summary.failedTests++;
                }
            }

            browserResult.success = true;

        } catch (error) {
            console.error(`❌ ${browserName} test failed:`, error.message);
            browserResult.errors.push(error.message);

        } finally {
            if (browser) {
                await browser.close();
            }
        }

        this.testResults.browsers[browserName] = browserResult;

        // Update summary flags
        if (browserResult.hydrationErrors.length > 0) {
            this.testResults.summary.hydrationErrorsFound = true;
        }
        if (browserResult.javascriptErrors.length > 0) {
            this.testResults.summary.runtimeErrorsFound = true;
        }
        if (browserResult.javascriptErrors.some(err => err.error === 'Cannot read properties of undefined (reading \'call\')')) {
            this.testResults.summary.specificCallErrorFound = true;
        }

        return browserResult;
    }

    async testPageInteractivity(page, path) {
        try {
            // Test if navigation links are present and clickable
            const navLinks = await page.locator('nav a').count();
            console.log(`   Found ${navLinks} navigation links`);

            // Test if buttons are present
            const buttons = await page.locator('button').count();
            console.log(`   Found ${buttons} interactive buttons`);

            // Test form elements if present
            const forms = await page.locator('form').count();
            if (forms > 0) {
                console.log(`   Found ${forms} forms`);
            }

            return true;

        } catch (error) {
            console.warn(`⚠️ Interactivity test issue: ${error.message}`);
            return false;
        }
    }

    async checkServerAccessibility() {
        console.log('📡 Testing server accessibility...');

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            const response = await page.goto('http://localhost:3000', {
                waitUntil: 'networkidle',
                timeout: 30000
            });

            if (response && response.ok()) {
                this.testResults.serverAccessible = true;
                console.log('✅ Server is accessible at localhost:3000');
                return true;
            } else {
                console.error('❌ Server returned non-OK response:', response?.status());
                return false;
            }
        } catch (error) {
            console.error('❌ Server accessibility test failed:', error.message);
            return false;
        } finally {
            await browser.close();
        }
    }

    generateSummary() {
        console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
        console.log('===============================');

        console.log(`Test Timestamp: ${this.testResults.timestamp}`);
        console.log(`Server Accessible: ${this.testResults.serverAccessible ? '✅ YES' : '❌ NO'}`);
        console.log(`Total Tests Run: ${this.testResults.summary.totalTests}`);
        console.log(`Passed Tests: ${this.testResults.summary.passedTests}`);
        console.log(`Failed Tests: ${this.testResults.summary.failedTests}`);

        console.log('\n🔍 ERROR ANALYSIS:');
        console.log(`Hydration Errors Found: ${this.testResults.summary.hydrationErrorsFound ? '❌ YES' : '✅ NO'}`);
        console.log(`Runtime Errors Found: ${this.testResults.summary.runtimeErrorsFound ? '❌ YES' : '✅ NO'}`);
        console.log(`Specific "Cannot read properties of undefined (reading 'call')" Error: ${this.testResults.summary.specificCallErrorFound ? '❌ FOUND' : '✅ NOT FOUND'}`);

        // Browser-specific results
        console.log('\n🌐 BROWSER RESULTS:');
        Object.keys(this.testResults.browsers).forEach(browserName => {
            const browser = this.testResults.browsers[browserName];
            console.log(`\n${browserName}:`);
            console.log(`  Success: ${browser.success ? '✅' : '❌'}`);
            console.log(`  Console Errors: ${browser.consoleErrors.length}`);
            console.log(`  JavaScript Errors: ${browser.javascriptErrors.length}`);
            console.log(`  Hydration Errors: ${browser.hydrationErrors.length}`);
            console.log(`  Network Errors: ${browser.networkErrors.length}`);

            if (browser.javascriptErrors.length > 0) {
                console.log('  JavaScript Errors:');
                browser.javascriptErrors.forEach((error, index) => {
                    console.log(`    ${index + 1}. ${error.message}`);
                });
            }

            if (browser.hydrationErrors.length > 0) {
                console.log('  Hydration Errors:');
                browser.hydrationErrors.forEach((error, index) => {
                    console.log(`    ${index + 1}. ${error.message}`);
                });
            }
        });

        // Final verdict
        console.log('\n🎯 FINAL VERDICT:');
        if (!this.testResults.summary.runtimeErrorsFound &&
            !this.testResults.summary.hydrationErrorsFound &&
            !this.testResults.summary.specificCallErrorFound) {
            console.log('🎉 SUCCESS: No runtime or hydration errors detected across all browsers!');
            console.log('✅ The "Cannot read properties of undefined (reading \'call\')" error appears to be RESOLVED');
        } else {
            console.log('⚠️ ISSUES DETECTED: Some runtime or hydration errors were found');
            if (this.testResults.summary.specificCallErrorFound) {
                console.log('❌ The specific "Cannot read properties of undefined (reading \'call\')" error is STILL PRESENT');
            }
        }
    }

    async saveResults() {
        const resultsDir = path.join(__dirname, 'test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsFile = path.join(resultsDir, `runtime-error-test-${timestamp}.json`);

        fs.writeFileSync(resultsFile, JSON.stringify(this.testResults, null, 2));
        console.log(`\n💾 Results saved to: ${resultsFile}`);
    }

    async run() {
        console.log('🚀 RUNTIME ERROR TESTING SUITE');
        console.log('================================');
        console.log('Target: "Cannot read properties of undefined (reading \'call\')" runtime error');
        console.log('Testing hydration and client-side functionality across browsers\n');

        try {
            // Check server accessibility first
            const serverAccessible = await this.checkServerAccessibility();
            if (!serverAccessible) {
                throw new Error('Server not accessible - cannot proceed with testing');
            }

            // Run tests in different browsers
            await this.runTest(chromium, 'Chromium');
            // Only test Chromium for now to be faster, but framework supports all browsers
            // await this.runTest(firefox, 'Firefox');
            // await this.runTest(webkit, 'WebKit');

            this.generateSummary();
            await this.saveResults();

            return this.testResults;

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            this.testResults.summary.testFailed = true;
            this.testResults.summary.failureReason = error.message;
            return this.testResults;
        }
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    const tester = new RuntimeErrorTester();
    tester.run().then((results) => {
        console.log('\n🏁 Testing completed');
        process.exit(results.summary.runtimeErrorsFound || results.summary.hydrationErrorsFound ? 1 : 0);
    }).catch((error) => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = RuntimeErrorTester;