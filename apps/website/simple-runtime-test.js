const http = require('http');
const https = require('https');
const { JSDOM } = require('jsdom');

class SimpleRuntimeTester {
    constructor() {
        this.testResults = {
            timestamp: new Date().toISOString(),
            serverAccessible: false,
            pages: {},
            errors: [],
            summary: {
                totalPages: 0,
                successfulPages: 0,
                errorPages: 0,
                serverErrors: [],
                htmlParsingErrors: []
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

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const req = http.get(url, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const endTime = Date.now();
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        loadTime: endTime - startTime
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async testServerAccessibility() {
        console.log('📡 Testing server accessibility...');

        try {
            const response = await this.makeRequest('http://localhost:3000');

            if (response.statusCode === 200) {
                this.testResults.serverAccessible = true;
                console.log('✅ Server is accessible at localhost:3000');
                console.log(`📊 Response time: ${response.loadTime}ms`);
                console.log(`📄 Content length: ${response.data.length} bytes`);
                return true;
            } else {
                console.error(`❌ Server returned status code: ${response.statusCode}`);
                this.testResults.summary.serverErrors.push(`HTTP ${response.statusCode}`);
                return false;
            }
        } catch (error) {
            console.error('❌ Server accessibility test failed:', error.message);
            this.testResults.summary.serverErrors.push(error.message);
            return false;
        }
    }

    async testPageContent(path, name) {
        console.log(`\n--- Testing ${name} (${path}) ---`);

        const pageResult = {
            path: path,
            name: name,
            accessible: false,
            statusCode: null,
            loadTime: null,
            contentLength: null,
            hasReactElements: false,
            hasNextElements: false,
            hasScripts: false,
            hasNavigation: false,
            errors: [],
            warnings: []
        };

        try {
            const response = await this.makeRequest(`http://localhost:3000${path}`);

            pageResult.statusCode = response.statusCode;
            pageResult.loadTime = response.loadTime;
            pageResult.contentLength = response.data.length;

            if (response.statusCode === 200) {
                pageResult.accessible = true;
                console.log(`✅ ${name} loaded successfully (${response.loadTime}ms, ${response.data.length} bytes)`);

                // Parse HTML content to check for React/Next.js elements
                try {
                    // Simple string-based analysis (faster than full DOM parsing)
                    const html = response.data;

                    // Check for Next.js specific elements
                    pageResult.hasNextElements = html.includes('id="__next"') || html.includes('data-reactroot');

                    // Check for React hydration scripts
                    pageResult.hasScripts = html.includes('<script') && html.includes('_next/static');

                    // Check for navigation elements
                    pageResult.hasNavigation = html.includes('<nav') || html.includes('navigation');

                    // Check for potential hydration issues
                    if (html.includes('hydration')) {
                        pageResult.warnings.push('Contains hydration-related content');
                    }

                    // Check for error messages in HTML
                    if (html.includes('Cannot read properties of undefined')) {
                        pageResult.errors.push('Contains "Cannot read properties of undefined" in HTML');
                        console.log('❌ Found "Cannot read properties of undefined" in HTML content');
                    }

                    if (html.includes('Error:') || html.includes('error')) {
                        pageResult.warnings.push('Contains error-related content');
                    }

                    // Check for critical missing elements
                    if (!pageResult.hasNextElements) {
                        pageResult.warnings.push('Missing Next.js root elements');
                    }

                    if (!pageResult.hasScripts) {
                        pageResult.warnings.push('Missing Next.js scripts');
                    }

                    console.log(`📊 Analysis: NextJS=${pageResult.hasNextElements}, Scripts=${pageResult.hasScripts}, Nav=${pageResult.hasNavigation}`);

                    if (pageResult.warnings.length > 0) {
                        console.log(`⚠️ Warnings: ${pageResult.warnings.join(', ')}`);
                    }

                    if (pageResult.errors.length > 0) {
                        console.log(`❌ Errors: ${pageResult.errors.join(', ')}`);
                    }

                } catch (parseError) {
                    console.error(`⚠️ HTML parsing error: ${parseError.message}`);
                    pageResult.errors.push(`HTML parsing failed: ${parseError.message}`);
                    this.testResults.summary.htmlParsingErrors.push({
                        page: name,
                        error: parseError.message
                    });
                }

            } else {
                console.error(`❌ ${name} returned status code: ${response.statusCode}`);
                pageResult.errors.push(`HTTP ${response.statusCode}`);
            }

        } catch (error) {
            console.error(`❌ ${name} test failed: ${error.message}`);
            pageResult.errors.push(error.message);
        }

        return pageResult;
    }

    async testAllPages() {
        console.log('\n🔍 Testing all pages for runtime errors...');
        console.log('=' .repeat(50));

        for (const testPage of this.testPages) {
            const pageResult = await this.testPageContent(testPage.path, testPage.name);

            this.testResults.pages[testPage.path] = pageResult;
            this.testResults.summary.totalPages++;

            if (pageResult.accessible && pageResult.errors.length === 0) {
                this.testResults.summary.successfulPages++;
            } else {
                this.testResults.summary.errorPages++;
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    generateSummary() {
        console.log('\n📊 SIMPLE RUNTIME TEST SUMMARY');
        console.log('==============================');

        console.log(`Test Timestamp: ${this.testResults.timestamp}`);
        console.log(`Server Accessible: ${this.testResults.serverAccessible ? '✅ YES' : '❌ NO'}`);
        console.log(`Total Pages Tested: ${this.testResults.summary.totalPages}`);
        console.log(`Successful Pages: ${this.testResults.summary.successfulPages}`);
        console.log(`Pages with Errors: ${this.testResults.summary.errorPages}`);
        console.log(`Server Errors: ${this.testResults.summary.serverErrors.length}`);
        console.log(`HTML Parsing Errors: ${this.testResults.summary.htmlParsingErrors.length}`);

        // Detailed page results
        console.log('\n📄 PAGE DETAILS:');
        Object.values(this.testResults.pages).forEach(page => {
            const status = page.accessible ? '✅' : '❌';
            const errorCount = page.errors.length;
            const warningCount = page.warnings.length;

            console.log(`${status} ${page.name}: ${page.statusCode} (${page.loadTime}ms) - Errors: ${errorCount}, Warnings: ${warningCount}`);

            if (page.errors.length > 0) {
                page.errors.forEach(error => {
                    console.log(`    ❌ ${error}`);
                });
            }

            if (page.warnings.length > 0) {
                page.warnings.forEach(warning => {
                    console.log(`    ⚠️ ${warning}`);
                });
            }
        });

        // Check for specific runtime error
        const pagesWithRuntimeErrors = Object.values(this.testResults.pages)
            .filter(page => page.errors.some(error => error.includes('Cannot read properties of undefined')));

        console.log('\n🎯 RUNTIME ERROR ANALYSIS:');
        if (pagesWithRuntimeErrors.length === 0) {
            console.log('✅ No "Cannot read properties of undefined (reading \'call\')" errors found in HTML content');
            console.log('✅ All pages are serving successfully without visible runtime errors');
        } else {
            console.log(`❌ Found runtime errors in ${pagesWithRuntimeErrors.length} pages:`);
            pagesWithRuntimeErrors.forEach(page => {
                console.log(`   - ${page.name}: ${page.errors.join(', ')}`);
            });
        }

        // Server performance summary
        const loadTimes = Object.values(this.testResults.pages)
            .filter(page => page.loadTime !== null)
            .map(page => page.loadTime);

        if (loadTimes.length > 0) {
            const avgLoadTime = Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length);
            const maxLoadTime = Math.max(...loadTimes);
            const minLoadTime = Math.min(...loadTimes);

            console.log('\n⚡ PERFORMANCE SUMMARY:');
            console.log(`Average Load Time: ${avgLoadTime}ms`);
            console.log(`Fastest Page: ${minLoadTime}ms`);
            console.log(`Slowest Page: ${maxLoadTime}ms`);
        }

        console.log('\n🎯 FINAL VERDICT:');
        if (this.testResults.serverAccessible &&
            this.testResults.summary.errorPages === 0 &&
            pagesWithRuntimeErrors.length === 0) {
            console.log('🎉 SUCCESS: Server is working properly, all pages load successfully');
            console.log('✅ No visible runtime errors detected in served content');
            console.log('🔍 For complete JavaScript runtime testing, browser automation is recommended');
        } else {
            console.log('⚠️ ISSUES DETECTED:');
            if (!this.testResults.serverAccessible) {
                console.log('❌ Server accessibility issues');
            }
            if (this.testResults.summary.errorPages > 0) {
                console.log(`❌ ${this.testResults.summary.errorPages} pages have errors`);
            }
            if (pagesWithRuntimeErrors.length > 0) {
                console.log(`❌ ${pagesWithRuntimeErrors.length} pages contain runtime error content`);
            }
        }
    }

    async saveResults() {
        const fs = require('fs');
        const path = require('path');

        const resultsDir = path.join(__dirname, 'test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsFile = path.join(resultsDir, `simple-runtime-test-${timestamp}.json`);

        fs.writeFileSync(resultsFile, JSON.stringify(this.testResults, null, 2));
        console.log(`\n💾 Results saved to: ${resultsFile}`);
    }

    async run() {
        console.log('🚀 SIMPLE RUNTIME TESTING SUITE');
        console.log('===============================');
        console.log('Testing server responses and HTML content for runtime errors');
        console.log('This test checks server-side rendering without browser automation\n');

        try {
            // Check server accessibility
            const serverAccessible = await this.testServerAccessibility();
            if (!serverAccessible) {
                console.log('⚠️ Server issues detected, but continuing with page tests...');
            }

            // Test all pages
            await this.testAllPages();

            // Generate summary
            this.generateSummary();

            // Save results
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

// Check if jsdom is available, if not provide a fallback
let jsdomAvailable = false;
try {
    require.resolve('jsdom');
    jsdomAvailable = true;
} catch (e) {
    console.log('ℹ️ JSDOM not available, using simple HTML parsing');
}

// Run the test if this file is executed directly
if (require.main === module) {
    const tester = new SimpleRuntimeTester();
    tester.run().then((results) => {
        console.log('\n🏁 Testing completed');

        const hasErrors = results.summary.errorPages > 0 ||
                         results.summary.serverErrors.length > 0 ||
                         Object.values(results.pages).some(page =>
                             page.errors.some(error => error.includes('Cannot read properties of undefined'))
                         );

        process.exit(hasErrors ? 1 : 0);
    }).catch((error) => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = SimpleRuntimeTester;