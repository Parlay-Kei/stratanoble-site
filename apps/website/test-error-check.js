const playwright = require('playwright');

async function checkForRuntimeErrors() {
    const browser = await playwright.chromium.launch({
        headless: false, // Show browser for debugging
        slowMo: 500
    });

    const page = await browser.newPage();

    // Collect console messages and errors
    const consoleMessages = [];
    const jsErrors = [];

    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
        console.log(`Console [${msg.type()}]: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        jsErrors.push({
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        console.log(`JavaScript Error: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
    });

    page.on('requestfailed', request => {
        console.log(`Failed request: ${request.url()} - ${request.failure()?.errorText}`);
    });

    try {
        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('Page loaded successfully');

        // Wait a bit for any async operations
        await page.waitForTimeout(3000);

        // Test basic navigation elements
        console.log('Testing basic navigation...');

        // Check if main content is loaded
        const mainContent = await page.$('main, .main, [role="main"]');
        if (mainContent) {
            console.log('Main content area found');
        } else {
            console.log('Warning: No main content area found');
        }

        // Look for navigation elements
        const nav = await page.$('nav, .nav, [role="navigation"]');
        if (nav) {
            console.log('Navigation element found');
        } else {
            console.log('Warning: No navigation element found');
        }

        // Check for any visible error messages on page
        const errorElements = await page.$$('[class*="error"], .error, [data-testid*="error"]');
        if (errorElements.length > 0) {
            console.log(`Found ${errorElements.length} error elements on page`);
        }

        // Test clicking on links/buttons if any
        const links = await page.$$('a[href]:visible');
        console.log(`Found ${links.length} visible links`);

        // Try clicking first few links to test navigation
        for (let i = 0; i < Math.min(3, links.length); i++) {
            try {
                const href = await links[i].getAttribute('href');
                console.log(`Testing link: ${href}`);

                // Only test internal links or hash links
                if (href && (href.startsWith('/') || href.startsWith('#'))) {
                    await links[i].click();
                    await page.waitForTimeout(1000);
                    console.log(`Successfully clicked link: ${href}`);
                }
            } catch (linkError) {
                console.log(`Error clicking link ${i}: ${linkError.message}`);
            }
        }

        // Check for the specific error mentioned
        const hasCallError = jsErrors.some(error =>
            error.message.includes("Cannot read properties of undefined (reading 'call')")
        );

        if (hasCallError) {
            console.log('❌ FOUND: "Cannot read properties of undefined (reading \'call\')" error');
        } else {
            console.log('✅ No "Cannot read properties of undefined (reading \'call\')" error found');
        }

        // Summary
        console.log('\n=== ERROR SUMMARY ===');
        console.log(`Total console messages: ${consoleMessages.length}`);
        console.log(`JavaScript errors: ${jsErrors.length}`);

        if (jsErrors.length > 0) {
            console.log('\nJavaScript Errors Details:');
            jsErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.name}: ${error.message}`);
                if (error.stack) {
                    console.log(`   Stack: ${error.stack.split('\n')[0]}`);
                }
            });
        }

        // Check for React specific errors
        const reactErrors = consoleMessages.filter(msg =>
            msg.text.includes('React') ||
            msg.text.includes('Warning') ||
            msg.text.includes('Error')
        );

        if (reactErrors.length > 0) {
            console.log('\nReact/Warning Messages:');
            reactErrors.forEach((msg, index) => {
                console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
            });
        }

    } catch (error) {
        console.error('Navigation error:', error.message);
    }

    await page.screenshot({ path: 'localhost-3000-screenshot.png', fullPage: true });
    console.log('Screenshot saved as localhost-3000-screenshot.png');

    await browser.close();
}

checkForRuntimeErrors().catch(console.error);