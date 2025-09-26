const { chromium } = require('playwright');
const fs = require('fs');

async function targetedErrorSearch() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext();
    const page = await context.newPage();

    const allErrors = [];

    // Capture ALL console activity
    page.on('console', msg => {
        const message = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString(),
            args: msg.args().map(arg => arg.toString())
        };

        allErrors.push(message);

        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);

        // Look for specific error patterns
        if (msg.text().includes('Cannot read properties of undefined') ||
            msg.text().includes('reading \'call\'') ||
            msg.text().includes('hydration') ||
            msg.text().includes('TypeError')) {
            console.log('🚨 CRITICAL ERROR DETECTED:', msg.text());
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        const errorInfo = {
            type: 'pageerror',
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString()
        };

        allErrors.push(errorInfo);
        console.log('🚨 PAGE ERROR:', error.message);

        if (error.stack) {
            console.log('Stack trace:', error.stack);
        }
    });

    // Handle request failures in detail
    page.on('requestfailed', request => {
        const failure = {
            type: 'request-failed',
            url: request.url(),
            failure: request.failure(),
            method: request.method(),
            timestamp: new Date().toISOString()
        };

        allErrors.push(failure);
        console.log('🌐 REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });

    // Monitor response failures
    page.on('response', response => {
        if (!response.ok()) {
            const responseError = {
                type: 'response-error',
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                headers: response.headers(),
                timestamp: new Date().toISOString()
            };

            allErrors.push(responseError);
            console.log(`🔴 RESPONSE ERROR: ${response.status()} ${response.statusText()} - ${response.url()}`);
        }
    });

    console.log('🔍 Starting targeted error search for "Cannot read properties of undefined (reading \'call\')"...');

    try {
        // Navigate with extensive error capture
        console.log('📍 Navigating to http://localhost:3000...');

        await page.goto('http://localhost:3000', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Initial page load complete');

        // Wait for any delayed errors
        console.log('⏳ Waiting 5 seconds for delayed errors...');
        await page.waitForTimeout(5000);

        // Check if there are runtime errors stored in window
        const windowErrorCheck = await page.evaluate(() => {
            const errors = [];

            // Check for global error handlers
            if (window.__errorStack) {
                errors.push(...window.__errorStack);
            }

            // Check React error boundaries
            if (window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
                errors.push('React Error Overlay detected');
            }

            // Check for Next.js build errors
            if (window.__NEXT_DATA__?.buildId && window.__NEXT_DATA__.buildId === 'development') {
                errors.push('Development build detected');
            }

            // Check console history if available
            if (window.console._history) {
                errors.push(...window.console._history);
            }

            return {
                errors,
                nextData: window.__NEXT_DATA__,
                reactVersion: window.React?.version || 'Not detected',
                nextVersion: window.__NEXT_DATA__?.nextVersion || 'Not detected',
                hasHydrateErrors: !!document.querySelector('[data-reactroot]')
            };
        });

        console.log('🔧 Window error check result:', windowErrorCheck);

        // Try to trigger interactive elements that might cause the 'call' error
        console.log('🖱️  Attempting to trigger interactive elements...');

        try {
            // Click various elements that might trigger the error
            const buttons = await page.locator('button').all();
            console.log(`Found ${buttons.length} buttons to test`);

            for (let i = 0; i < Math.min(buttons.length, 3); i++) {
                try {
                    console.log(`Testing button ${i + 1}...`);
                    await buttons[i].scrollIntoViewIfNeeded();
                    await buttons[i].click({ timeout: 3000 });
                    await page.waitForTimeout(1000);
                } catch (e) {
                    console.log(`Button ${i + 1} click failed:`, e.message);
                }
            }

            // Try form interactions
            const forms = await page.locator('form').all();
            console.log(`Found ${forms.length} forms to test`);

            for (let i = 0; i < forms.length; i++) {
                try {
                    const inputs = await forms[i].locator('input, textarea').all();
                    if (inputs.length > 0) {
                        console.log(`Testing form ${i + 1} inputs...`);
                        await inputs[0].scrollIntoViewIfNeeded();
                        await inputs[0].fill('test');
                        await page.waitForTimeout(500);
                    }
                } catch (e) {
                    console.log(`Form ${i + 1} interaction failed:`, e.message);
                }
            }

        } catch (error) {
            console.log('Interactive testing failed:', error.message);
        }

        // Final error collection
        console.log('📋 Collecting final error report...');

        const report = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            totalErrors: allErrors.length,
            windowChecks: windowErrorCheck,
            errorsByType: {
                console: allErrors.filter(e => ['log', 'info', 'warn', 'error'].includes(e.type)),
                pageerror: allErrors.filter(e => e.type === 'pageerror'),
                networkFailed: allErrors.filter(e => e.type === 'request-failed'),
                responseErrors: allErrors.filter(e => e.type === 'response-error')
            },
            allErrors: allErrors
        };

        // Search for specific patterns
        const callErrors = allErrors.filter(e =>
            e.text?.includes('call') ||
            e.message?.includes('call') ||
            e.text?.includes('Cannot read properties') ||
            e.message?.includes('Cannot read properties')
        );

        if (callErrors.length > 0) {
            console.log('🚨 FOUND "call" RELATED ERRORS:', callErrors.length);
            report.callErrors = callErrors;
        } else {
            console.log('ℹ️  No "call" related errors found in current session');
        }

        // Save detailed report
        fs.writeFileSync('C:\\Dev\\StrataNoble\\apps\\website\\TARGETED_ERROR_SEARCH.json', JSON.stringify(report, null, 2));

        console.log(`📊 Analysis complete. Found ${report.totalErrors} total events.`);
        console.log('📄 Detailed report saved to TARGETED_ERROR_SEARCH.json');

        return report;

    } catch (error) {
        console.error('❌ Targeted search failed:', error);
        return { failed: true, error: error.message, allErrors };
    } finally {
        await browser.close();
    }
}

targetedErrorSearch().then(report => {
    console.log('Search completed');
    if (report.failed) {
        console.error('Search failed:', report.error);
    }
}).catch(console.error);