const puppeteer = require('puppeteer');

async function testBrowserErrors() {
    let browser = null;

    try {
        // Launch browser with more debugging options
        browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            slowMo: 100,
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--no-sandbox'
            ]
        });

        const page = await browser.newPage();

        // Enable console API
        await page.evaluateOnNewDocument(() => {
            window.addEventListener('error', (event) => {
                console.log('Global error event:', event.error);
            });

            window.addEventListener('unhandledrejection', (event) => {
                console.log('Unhandled promise rejection:', event.reason);
            });
        });

        const errors = [];
        const warnings = [];
        const logs = [];
        const networkErrors = [];

        // Collect console output
        page.on('console', msg => {
            const text = msg.text();
            const type = msg.type();

            if (type === 'error') {
                errors.push(text);
                console.log(`❌ Console Error: ${text}`);
            } else if (type === 'warning') {
                warnings.push(text);
                console.log(`⚠️ Console Warning: ${text}`);
            } else {
                logs.push(text);
                if (text.includes('error') || text.includes('Error')) {
                    console.log(`📝 Console Log (potential error): ${text}`);
                }
            }
        });

        // Collect JavaScript errors
        page.on('pageerror', error => {
            const errorMsg = `${error.name}: ${error.message}`;
            errors.push(errorMsg);
            console.log(`💥 Page Error: ${errorMsg}`);
            if (error.stack) {
                console.log(`Stack: ${error.stack}`);
            }
        });

        // Collect network failures
        page.on('requestfailed', request => {
            const failure = request.failure();
            networkErrors.push(`${request.url()}: ${failure?.errorText || 'Unknown error'}`);
            console.log(`🌐 Network Error: ${request.url()} - ${failure?.errorText || 'Unknown error'}`);
        });

        // Navigate to the page
        console.log('🚀 Navigating to http://localhost:3000...');

        const response = await page.goto('http://localhost:3000', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        console.log(`📄 Page loaded with status: ${response.status()}`);

        // Wait for any async content to load
        await page.waitForTimeout(5000);

        // Check for the specific error we're looking for
        const hasCallError = errors.some(error =>
            error.includes("Cannot read properties of undefined (reading 'call')")
        );

        // Test basic navigation functionality
        console.log('🧪 Testing navigation elements...');

        try {
            // Check if we can find navigation links
            const navLinks = await page.$$eval('nav a', links =>
                links.map(link => ({ href: link.href, text: link.textContent.trim() }))
            );
            console.log(`✅ Found ${navLinks.length} navigation links`);

            // Test clicking a link
            if (navLinks.length > 0) {
                const firstLink = navLinks.find(link =>
                    link.href.includes('/services') ||
                    link.href.includes('/about') ||
                    link.href.includes('/contact')
                );

                if (firstLink) {
                    console.log(`🔍 Testing link: ${firstLink.href}`);
                    await page.click(`a[href="${new URL(firstLink.href).pathname}"]`);
                    await page.waitForTimeout(2000);

                    const currentUrl = page.url();
                    console.log(`✅ Navigation successful - Current URL: ${currentUrl}`);

                    // Go back to home
                    await page.goto('http://localhost:3000');
                    await page.waitForTimeout(2000);
                }
            }
        } catch (navError) {
            console.log(`❌ Navigation test failed: ${navError.message}`);
        }

        // Test React hydration
        console.log('🧪 Testing React hydration...');
        try {
            const reactDetected = await page.evaluate(() => {
                return typeof window.React !== 'undefined' ||
                       document.querySelector('[data-reactroot]') !== null ||
                       document.querySelector('#__next') !== null ||
                       window.__NEXT_DATA__ !== undefined;
            });

            if (reactDetected) {
                console.log('✅ React/Next.js detected and hydrated');
            } else {
                console.log('⚠️ React/Next.js hydration may not be complete');
            }
        } catch (hydrationError) {
            console.log(`❌ Hydration test failed: ${hydrationError.message}`);
        }

        // Final results
        console.log('\n📊 === TEST RESULTS ===');
        console.log(`Errors found: ${errors.length}`);
        console.log(`Warnings found: ${warnings.length}`);
        console.log(`Network errors: ${networkErrors.length}`);

        if (hasCallError) {
            console.log('❌ FOUND: "Cannot read properties of undefined (reading \'call\')" error');
        } else {
            console.log('✅ No "Cannot read properties of undefined (reading \'call\')" error detected');
        }

        if (errors.length > 0) {
            console.log('\n🚨 ERRORS DETECTED:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        if (warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning}`);
            });
        }

        if (networkErrors.length > 0) {
            console.log('\n🌐 NETWORK ERRORS:');
            networkErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        // Take screenshot
        await page.screenshot({ path: 'test-results.png', fullPage: true });
        console.log('\n📸 Screenshot saved as test-results.png');

        // Keep browser open for manual inspection
        console.log('\n👀 Browser left open for manual inspection. Close when done.');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

console.log('Starting browser error testing...');
testBrowserErrors();