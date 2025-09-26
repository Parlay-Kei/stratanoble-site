const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function comprehensiveRuntimeAnalysis() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Arrays to collect all errors and issues
    const consoleErrors = [];
    const networkErrors = [];
    const jsErrors = [];
    const resourceFailures = [];
    const performanceIssues = [];

    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push({
                type: 'console-error',
                message: msg.text(),
                timestamp: new Date().toISOString(),
                location: msg.location()
            });
        }
        if (msg.type() === 'warning') {
            consoleErrors.push({
                type: 'console-warning',
                message: msg.text(),
                timestamp: new Date().toISOString(),
                location: msg.location()
            });
        }
    });

    // Capture JavaScript errors
    page.on('pageerror', error => {
        jsErrors.push({
            type: 'javascript-error',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    });

    // Capture network failures
    page.on('response', response => {
        if (!response.ok()) {
            networkErrors.push({
                type: 'network-error',
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                timestamp: new Date().toISOString()
            });
        }
    });

    // Capture request failures
    page.on('requestfailed', request => {
        resourceFailures.push({
            type: 'request-failed',
            url: request.url(),
            failure: request.failure()?.errorText || 'Unknown failure',
            method: request.method(),
            timestamp: new Date().toISOString()
        });
    });

    console.log('🔍 Starting comprehensive runtime error analysis...');
    console.log('📊 Navigating to http://localhost:3000');

    try {
        // Navigate to the site with extended timeout
        const startTime = Date.now();
        await page.goto('http://localhost:3000', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        const loadTime = Date.now() - startTime;

        console.log(`✅ Page loaded in ${loadTime}ms`);

        // Wait for potential hydration
        await page.waitForTimeout(3000);

        // Check for React hydration
        const reactHydrated = await page.evaluate(() => {
            return !!(window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || document.querySelector('[data-reactroot]'));
        });

        console.log(`🔧 React hydration status: ${reactHydrated ? 'SUCCESS' : 'FAILED'}`);

        // Get all script errors from window.onerror
        const windowErrors = await page.evaluate(() => {
            return window.__runtimeErrors || [];
        });

        // Capture current page state
        const pageState = await page.evaluate(() => {
            return {
                readyState: document.readyState,
                scripts: Array.from(document.scripts).map(s => ({ src: s.src, loaded: !s.defer })),
                stylesheets: Array.from(document.styleSheets).map(s => ({ href: s.href, disabled: s.disabled })),
                hasReactRoot: !!document.querySelector('[data-reactroot]'),
                bodyClass: document.body.className,
                headContent: document.head.innerHTML.length,
                bodyContent: document.body.innerHTML.length
            };
        });

        // Test key interactive elements
        console.log('🖱️  Testing interactive elements...');

        const interactiveTests = [];
        try {
            // Try to find and test navigation
            const navElements = await page.locator('nav, [role="navigation"], .navigation').all();
            interactiveTests.push(`Found ${navElements.length} navigation elements`);

            // Try to find buttons
            const buttons = await page.locator('button, [role="button"], .btn').all();
            interactiveTests.push(`Found ${buttons.length} button elements`);

            // Try to find forms
            const forms = await page.locator('form').all();
            interactiveTests.push(`Found ${forms.length} form elements`);

            // Test if we can click on anything
            if (buttons.length > 0) {
                try {
                    await buttons[0].click({ timeout: 5000 });
                    interactiveTests.push('First button clickable: SUCCESS');
                } catch (e) {
                    interactiveTests.push(`First button clickable: FAILED - ${e.message}`);
                }
            }

        } catch (error) {
            interactiveTests.push(`Interactive testing failed: ${error.message}`);
        }

        // Collect comprehensive error report
        const errorReport = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            loadTime: loadTime,
            reactHydrated: reactHydrated,
            pageState: pageState,
            interactiveTests: interactiveTests,
            totalErrors: consoleErrors.length + networkErrors.length + jsErrors.length + resourceFailures.length,
            errorBreakdown: {
                consoleErrors: consoleErrors.length,
                networkErrors: networkErrors.length,
                javascriptErrors: jsErrors.length,
                resourceFailures: resourceFailures.length
            },
            errors: {
                consoleErrors,
                networkErrors,
                jsErrors,
                resourceFailures,
                windowErrors
            }
        };

        // Save comprehensive report
        const reportPath = path.join(__dirname, 'COMPREHENSIVE_RUNTIME_ERROR_ANALYSIS.json');
        fs.writeFileSync(reportPath, JSON.stringify(errorReport, null, 2));

        // Create human-readable summary
        let summary = `# Comprehensive Runtime Error Analysis Report\n`;
        summary += `**Generated:** ${errorReport.timestamp}\n`;
        summary += `**URL:** ${errorReport.url}\n`;
        summary += `**Load Time:** ${errorReport.loadTime}ms\n`;
        summary += `**React Hydration:** ${errorReport.reactHydrated ? '✅ SUCCESS' : '❌ FAILED'}\n\n`;

        summary += `## Error Summary\n`;
        summary += `- **Total Runtime Issues:** ${errorReport.totalErrors}\n`;
        summary += `- **Console Errors:** ${errorReport.errorBreakdown.consoleErrors}\n`;
        summary += `- **Network Errors:** ${errorReport.errorBreakdown.networkErrors}\n`;
        summary += `- **JavaScript Errors:** ${errorReport.errorBreakdown.javascriptErrors}\n`;
        summary += `- **Resource Failures:** ${errorReport.errorBreakdown.resourceFailures}\n\n`;

        if (errorReport.errors.consoleErrors.length > 0) {
            summary += `## Console Errors\n`;
            errorReport.errors.consoleErrors.forEach((error, index) => {
                summary += `### ${index + 1}. ${error.type.toUpperCase()}\n`;
                summary += `**Message:** ${error.message}\n`;
                summary += `**Location:** ${error.location ? JSON.stringify(error.location) : 'Unknown'}\n`;
                summary += `**Time:** ${error.timestamp}\n\n`;
            });
        }

        if (errorReport.errors.jsErrors.length > 0) {
            summary += `## JavaScript Errors\n`;
            errorReport.errors.jsErrors.forEach((error, index) => {
                summary += `### ${index + 1}. JAVASCRIPT ERROR\n`;
                summary += `**Message:** ${error.message}\n`;
                summary += `**Stack:** ${error.stack}\n`;
                summary += `**Time:** ${error.timestamp}\n\n`;
            });
        }

        if (errorReport.errors.networkErrors.length > 0) {
            summary += `## Network Errors\n`;
            errorReport.errors.networkErrors.forEach((error, index) => {
                summary += `### ${index + 1}. NETWORK ERROR\n`;
                summary += `**URL:** ${error.url}\n`;
                summary += `**Status:** ${error.status} ${error.statusText}\n`;
                summary += `**Time:** ${error.timestamp}\n\n`;
            });
        }

        summary += `## Page State Analysis\n`;
        summary += `- **Document Ready State:** ${pageState.readyState}\n`;
        summary += `- **Scripts Loaded:** ${pageState.scripts.length}\n`;
        summary += `- **Stylesheets:** ${pageState.stylesheets.length}\n`;
        summary += `- **React Root Element:** ${pageState.hasReactRoot ? 'Present' : 'Missing'}\n`;
        summary += `- **Body Classes:** ${pageState.bodyClass || 'None'}\n`;
        summary += `- **Head Content Length:** ${pageState.headContent} characters\n`;
        summary += `- **Body Content Length:** ${pageState.bodyContent} characters\n\n`;

        summary += `## Interactive Elements Test\n`;
        interactiveTests.forEach(test => {
            summary += `- ${test}\n`;
        });

        const summaryPath = path.join(__dirname, 'COMPREHENSIVE_RUNTIME_ERROR_REPORT.md');
        fs.writeFileSync(summaryPath, summary);

        console.log(`📋 Comprehensive analysis complete!`);
        console.log(`📊 Total runtime issues found: ${errorReport.totalErrors}`);
        console.log(`📄 Reports saved:`);
        console.log(`   - JSON: ${reportPath}`);
        console.log(`   - Markdown: ${summaryPath}`);

        return errorReport;

    } catch (error) {
        console.error('❌ Analysis failed:', error);
        jsErrors.push({
            type: 'analysis-error',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        return {
            failed: true,
            error: error.message,
            errors: { consoleErrors, networkErrors, jsErrors, resourceFailures }
        };
    } finally {
        await browser.close();
    }
}

// Run the analysis
comprehensiveRuntimeAnalysis().then(report => {
    if (report.failed) {
        console.error('Analysis failed:', report.error);
        process.exit(1);
    } else {
        console.log('Analysis completed successfully');
        process.exit(0);
    }
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});