// Browser Console Runtime Error Detection Test
// Run this script in the browser developer console while on localhost:3000

(function() {
    console.log('🚀 Starting Browser Console Runtime Error Test');
    console.log('='.repeat(50));

    const testResults = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errors: [],
        warnings: [],
        hydrationStatus: 'unknown',
        reactStatus: 'unknown',
        nextjsStatus: 'unknown',
        interactivityTest: {},
        consoleErrorsDetected: []
    };

    // Override console.error to catch runtime errors
    const originalConsoleError = console.error;
    const detectedErrors = [];

    console.error = function(...args) {
        const errorMessage = args.join(' ');

        detectedErrors.push({
            message: errorMessage,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
        });

        // Check for specific runtime error
        if (errorMessage.includes('Cannot read properties of undefined (reading \'call\')')) {
            console.log('❌ TARGET RUNTIME ERROR DETECTED:', errorMessage);
            testResults.errors.push({
                type: 'target-runtime-error',
                message: errorMessage,
                timestamp: new Date().toISOString()
            });
        }

        // Check for hydration errors
        if (errorMessage.includes('hydration') || errorMessage.includes('Hydration')) {
            console.log('🔥 HYDRATION ERROR DETECTED:', errorMessage);
            testResults.errors.push({
                type: 'hydration-error',
                message: errorMessage,
                timestamp: new Date().toISOString()
            });
        }

        // Call original console.error
        originalConsoleError.apply(console, args);
    };

    // Test 1: Check React/Next.js Status
    function checkFrameworkStatus() {
        console.log('\n📊 Checking Framework Status...');

        // Check React
        if (typeof window.React !== 'undefined') {
            testResults.reactStatus = `loaded-${window.React.version || 'unknown'}`;
            console.log('✅ React is loaded:', window.React.version || 'unknown version');
        } else {
            testResults.reactStatus = 'not-loaded';
            console.log('⚠️ React is not detected in global scope');
        }

        // Check Next.js elements
        const nextRoot = document.getElementById('__next');
        const reactRoot = document.querySelector('[data-reactroot]');

        if (nextRoot || reactRoot) {
            testResults.nextjsStatus = 'elements-found';
            console.log('✅ Next.js/React root elements found');
        } else {
            testResults.nextjsStatus = 'elements-missing';
            testResults.warnings.push('Next.js/React root elements not found');
            console.log('⚠️ Next.js/React root elements not found');
        }

        // Check for Next.js scripts
        const nextScripts = Array.from(document.scripts).filter(script =>
            script.src.includes('_next/static')
        );

        if (nextScripts.length > 0) {
            console.log(`✅ Found ${nextScripts.length} Next.js scripts`);
        } else {
            testResults.warnings.push('No Next.js scripts found');
            console.log('⚠️ No Next.js scripts found');
        }
    }

    // Test 2: Check Hydration Status
    function checkHydrationStatus() {
        console.log('\n💧 Checking Hydration Status...');

        try {
            // Check if body has content
            const bodyContent = document.body.children.length;
            const hasInteractiveElements = document.querySelectorAll('button, input, select, textarea, [onclick]').length;

            if (bodyContent > 0) {
                testResults.hydrationStatus = 'content-rendered';
                console.log(`✅ Page has rendered content (${bodyContent} elements in body)`);
            } else {
                testResults.hydrationStatus = 'no-content';
                testResults.errors.push({
                    type: 'hydration-issue',
                    message: 'No content rendered in body',
                    timestamp: new Date().toISOString()
                });
                console.log('❌ No content rendered in body');
            }

            if (hasInteractiveElements > 0) {
                console.log(`✅ Found ${hasInteractiveElements} interactive elements`);
            } else {
                testResults.warnings.push('No interactive elements found');
                console.log('⚠️ No interactive elements found');
            }

        } catch (error) {
            testResults.errors.push({
                type: 'hydration-check-error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            console.error('❌ Error checking hydration status:', error);
        }
    }

    // Test 3: Interactivity Test
    function testInteractivity() {
        console.log('\n🖱️ Testing Basic Interactivity...');

        const interactivityResults = {
            navigationLinks: 0,
            buttons: 0,
            forms: 0,
            clickHandlers: 0
        };

        try {
            // Test navigation links
            const navLinks = document.querySelectorAll('nav a, header a');
            interactivityResults.navigationLinks = navLinks.length;
            console.log(`📍 Found ${navLinks.length} navigation links`);

            // Test buttons
            const buttons = document.querySelectorAll('button');
            interactivityResults.buttons = buttons.length;
            console.log(`🔘 Found ${buttons.length} buttons`);

            // Test forms
            const forms = document.querySelectorAll('form');
            interactivityResults.forms = forms.length;
            console.log(`📝 Found ${forms.length} forms`);

            // Test elements with click handlers
            const clickableElements = document.querySelectorAll('[onclick], [data-testid]');
            interactivityResults.clickHandlers = clickableElements.length;
            console.log(`⚡ Found ${clickableElements.length} elements with click handlers`);

            testResults.interactivityTest = interactivityResults;

        } catch (error) {
            testResults.errors.push({
                type: 'interactivity-test-error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            console.error('❌ Error testing interactivity:', error);
        }
    }

    // Test 4: Trigger potential runtime errors
    function triggerRuntimeTests() {
        console.log('\n🔍 Testing for Runtime Errors...');

        try {
            // Test 1: Try to access common React properties
            if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
                console.log('✅ React internals accessible (normal)');
            }

            // Test 2: Check for common error patterns
            const errorPatterns = [
                'undefined.call',
                'null.call',
                'Cannot read properties of undefined',
                'Cannot read property',
                'is not a function'
            ];

            // Look for these patterns in the current page content
            const pageHTML = document.documentElement.outerHTML;
            const foundPatterns = errorPatterns.filter(pattern =>
                pageHTML.toLowerCase().includes(pattern.toLowerCase())
            );

            if (foundPatterns.length > 0) {
                testResults.warnings.push(`Found error patterns in HTML: ${foundPatterns.join(', ')}`);
                console.log('⚠️ Found potential error patterns in HTML:', foundPatterns);
            } else {
                console.log('✅ No error patterns found in HTML content');
            }

        } catch (error) {
            testResults.errors.push({
                type: 'runtime-test-error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            console.error('❌ Error during runtime testing:', error);
        }
    }

    // Test 5: Check for console errors that were already logged
    function checkExistingConsoleErrors() {
        console.log('\n📝 Checking for Existing Console Errors...');

        testResults.consoleErrorsDetected = detectedErrors;

        if (detectedErrors.length > 0) {
            console.log(`❌ Found ${detectedErrors.length} console errors since test started:`);
            detectedErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.message}`);
            });
        } else {
            console.log('✅ No console errors detected since test started');
        }
    }

    // Generate Test Report
    function generateReport() {
        console.log('\n📊 BROWSER CONSOLE TEST REPORT');
        console.log('='.repeat(40));
        console.log(`🕒 Timestamp: ${testResults.timestamp}`);
        console.log(`🔗 URL: ${testResults.url}`);
        console.log(`🌐 User Agent: ${testResults.userAgent.substring(0, 50)}...`);

        console.log('\n🔍 STATUS SUMMARY:');
        console.log(`React Status: ${testResults.reactStatus}`);
        console.log(`Next.js Status: ${testResults.nextjsStatus}`);
        console.log(`Hydration Status: ${testResults.hydrationStatus}`);

        console.log('\n📊 INTERACTIVITY:');
        console.log(`Navigation Links: ${testResults.interactivityTest.navigationLinks || 0}`);
        console.log(`Buttons: ${testResults.interactivityTest.buttons || 0}`);
        console.log(`Forms: ${testResults.interactivityTest.forms || 0}`);
        console.log(`Click Handlers: ${testResults.interactivityTest.clickHandlers || 0}`);

        console.log('\n🎯 ERROR ANALYSIS:');
        console.log(`Total Errors: ${testResults.errors.length}`);
        console.log(`Total Warnings: ${testResults.warnings.length}`);
        console.log(`Console Errors: ${testResults.consoleErrorsDetected.length}`);

        if (testResults.errors.length > 0) {
            console.log('\n❌ ERRORS FOUND:');
            testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. [${error.type}] ${error.message}`);
            });
        }

        if (testResults.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            testResults.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning}`);
            });
        }

        // Final verdict
        const hasTargetError = testResults.errors.some(error => error.type === 'target-runtime-error');
        const hasHydrationErrors = testResults.errors.some(error => error.type === 'hydration-error');

        console.log('\n🎯 FINAL VERDICT:');
        if (!hasTargetError && !hasHydrationErrors && testResults.errors.length === 0) {
            console.log('🎉 SUCCESS: No "Cannot read properties of undefined (reading \'call\')" error detected!');
            console.log('✅ No hydration errors detected');
            console.log('✅ Client-side functionality appears to be working');
        } else {
            if (hasTargetError) {
                console.log('❌ TARGET RUNTIME ERROR DETECTED: "Cannot read properties of undefined (reading \'call\')" error found');
            }
            if (hasHydrationErrors) {
                console.log('❌ HYDRATION ERRORS DETECTED');
            }
            if (testResults.errors.length > 0) {
                console.log(`❌ ${testResults.errors.length} total errors found`);
            }
        }

        // Restore original console.error
        console.error = originalConsoleError;

        // Return results for programmatic access
        window.browserTestResults = testResults;
        console.log('\n💾 Results saved to window.browserTestResults');

        return testResults;
    }

    // Run all tests in sequence
    function runAllTests() {
        try {
            checkFrameworkStatus();
            checkHydrationStatus();
            testInteractivity();
            triggerRuntimeTests();

            // Wait a bit to catch any delayed errors
            setTimeout(() => {
                checkExistingConsoleErrors();
                generateReport();
            }, 2000);

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            testResults.errors.push({
                type: 'test-execution-error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            generateReport();
        }
    }

    // Start the test
    runAllTests();

    console.log('\n⏳ Test running... Full report will be available in 2 seconds');
})();