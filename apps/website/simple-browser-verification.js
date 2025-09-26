const { chromium } = require('playwright');
const fs = require('fs');

async function simpleBrowserVerification() {
    console.log('🔍 Simple browser verification for runtime errors...');
    console.log('📍 Target: http://localhost:3000');
    console.log('🎯 Looking for: "Cannot read properties of undefined (reading \'call\')" and other runtime errors');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500,
        devtools: true
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    // Collect all errors
    const errors = {
        console: [],
        javascript: [],
        network: [],
        requests: []
    };

    // Listen to all console messages
    page.on('console', msg => {
        const entry = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString()
        };

        errors.console.push(entry);

        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`🔴 CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`);

            // Check for the specific error
            if (msg.text().includes('Cannot read properties of undefined') && msg.text().includes('call')) {
                console.log('🚨 TARGET ERROR FOUND: "Cannot read properties of undefined (reading \'call\')"');
            }
        }
    });

    // Listen to JavaScript errors
    page.on('pageerror', error => {
        const entry = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString()
        };

        errors.javascript.push(entry);
        console.log(`🚨 JAVASCRIPT ERROR: ${error.message}`);

        if (error.message.includes('Cannot read properties of undefined') && error.message.includes('call')) {
            console.log('🚨 TARGET ERROR FOUND IN JAVASCRIPT: "Cannot read properties of undefined (reading \'call\')"');
        }
    });

    // Listen to network failures
    page.on('requestfailed', request => {
        const entry = {
            url: request.url(),
            failure: request.failure()?.errorText,
            method: request.method(),
            timestamp: new Date().toISOString()
        };

        errors.requests.push(entry);
        console.log(`🌐 REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    try {
        console.log('🌐 Navigating to homepage...');

        // Navigate to the site
        await page.goto('http://localhost:3000', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Navigation complete. Waiting for potential errors...');

        // Wait for potential delayed errors
        await page.waitForTimeout(3000);

        // Check React hydration state
        const reactState = await page.evaluate(() => {
            return {
                reactPresent: !!(window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__),
                nextDataPresent: !!window.__NEXT_DATA__,
                hasReactRoot: !!document.querySelector('[data-reactroot]'),
                bodyHasContent: document.body.innerHTML.length > 1000,
                scriptsLoaded: document.scripts.length,
                readyState: document.readyState
            };
        });

        console.log('🔧 React/Next.js State Check:');
        console.log(`   - React Present: ${reactState.reactPresent}`);
        console.log(`   - Next Data Present: ${reactState.nextDataPresent}`);
        console.log(`   - React Root Element: ${reactState.hasReactRoot}`);
        console.log(`   - Body Content: ${reactState.bodyHasContent}`);
        console.log(`   - Scripts Loaded: ${reactState.scriptsLoaded}`);
        console.log(`   - Document Ready: ${reactState.readyState}`);

        // Try clicking some interactive elements to trigger potential errors
        console.log('🖱️  Testing interactive elements...');

        try {
            // Look for buttons and try to interact
            const visibleButtons = await page.locator('button:visible').all();
            console.log(`   Found ${visibleButtons.length} visible buttons`);

            if (visibleButtons.length > 0) {
                console.log('   Testing first visible button...');
                await visibleButtons[0].click({ timeout: 5000 });
                await page.waitForTimeout(1000);
                console.log('   ✅ Button click successful');
            }
        } catch (clickError) {
            console.log(`   ⚠️ Button click failed: ${clickError.message}`);
        }

        // Take a screenshot for verification
        await page.screenshot({
            path: 'C:\\Dev\\StrataNoble\\apps\\website\\current-state-screenshot.png',
            fullPage: true
        });

        console.log('📸 Screenshot saved as current-state-screenshot.png');

        // Summary
        const summary = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            reactState,
            errorCounts: {
                console: errors.console.length,
                javascript: errors.javascript.length,
                network: errors.network.length,
                requests: errors.requests.length
            },
            targetErrorFound: errors.console.some(e => e.text.includes('Cannot read properties of undefined') && e.text.includes('call')) ||
                             errors.javascript.some(e => e.message.includes('Cannot read properties of undefined') && e.message.includes('call')),
            allErrors: errors
        };

        // Save the full report
        fs.writeFileSync('C:\\Dev\\StrataNoble\\apps\\website\\BROWSER_VERIFICATION_REPORT.json', JSON.stringify(summary, null, 2));

        console.log('\n📊 VERIFICATION SUMMARY:');
        console.log(`   Total Console Messages: ${summary.errorCounts.console}`);
        console.log(`   JavaScript Errors: ${summary.errorCounts.javascript}`);
        console.log(`   Network Failures: ${summary.errorCounts.network}`);
        console.log(`   Request Failures: ${summary.errorCounts.requests}`);
        console.log(`   Target Error Found: ${summary.targetErrorFound ? '🚨 YES' : '✅ NO'}`);

        if (!summary.targetErrorFound) {
            console.log('\n🎉 GOOD NEWS: The "Cannot read properties of undefined (reading \'call\')" error was NOT detected!');
        }

        await browser.close();
        return summary;

    } catch (error) {
        console.error('❌ Browser verification failed:', error.message);
        await browser.close();
        throw error;
    }
}

// Run the verification
simpleBrowserVerification().then(summary => {
    console.log('\n✅ Browser verification completed successfully');
    console.log('📄 Full report saved to BROWSER_VERIFICATION_REPORT.json');
}).catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});