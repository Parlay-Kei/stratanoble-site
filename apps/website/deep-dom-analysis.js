const { chromium } = require('playwright');
const fs = require('fs');

async function deepDOMAnalysis() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('🔍 Starting deep DOM and runtime analysis...');

    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

        // Capture full DOM state
        const domAnalysis = await page.evaluate(() => {
            const analysis = {
                documentType: document.doctype ? document.doctype.name : 'unknown',
                htmlAttributes: {},
                headScripts: [],
                bodyScripts: [],
                reactElements: [],
                nextJsElements: [],
                errorElements: [],
                suspiciousElements: [],
                componentMounts: [],
                eventListeners: []
            };

            // Check HTML attributes
            if (document.documentElement.attributes) {
                for (let attr of document.documentElement.attributes) {
                    analysis.htmlAttributes[attr.name] = attr.value;
                }
            }

            // Analyze all scripts
            document.querySelectorAll('script').forEach((script, index) => {
                const scriptInfo = {
                    index,
                    src: script.src || 'inline',
                    type: script.type || 'text/javascript',
                    async: script.async,
                    defer: script.defer,
                    integrity: script.integrity || null,
                    crossOrigin: script.crossOrigin || null,
                    textContent: script.src ? null : script.textContent?.substring(0, 200) + '...'
                };

                if (script.parentElement.tagName === 'HEAD') {
                    analysis.headScripts.push(scriptInfo);
                } else {
                    analysis.bodyScripts.push(scriptInfo);
                }
            });

            // Look for React elements
            document.querySelectorAll('[data-reactroot], [data-react-helmet], .react-component, [data-testid]').forEach(el => {
                analysis.reactElements.push({
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className,
                    dataAttributes: Object.fromEntries([...el.attributes].filter(attr => attr.name.startsWith('data-')).map(attr => [attr.name, attr.value]))
                });
            });

            // Look for Next.js specific elements
            document.querySelectorAll('[id^="__next"], [data-next-], .next-'),
            document.getElementById('__next') && analysis.nextJsElements.push({
                found: true,
                element: '__next',
                content: document.getElementById('__next')?.innerHTML?.length || 0
            });

            // Look for error boundaries or error messages
            document.querySelectorAll('.error, .Error, [class*="error"], [id*="error"]').forEach(el => {
                analysis.errorElements.push({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id,
                    text: el.textContent?.substring(0, 100)
                });
            });

            // Look for suspicious empty or problematic elements
            document.querySelectorAll('div:empty, span:empty, [style*="display:none"]').forEach(el => {
                if (el.id || el.className) {
                    analysis.suspiciousElements.push({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        hidden: el.style.display === 'none'
                    });
                }
            });

            // Check for component mount indicators
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                analysis.componentMounts.push('React DevTools Hook present');
            }

            if (window._reactInternalFiber || window._reactInternalInstance) {
                analysis.componentMounts.push('React internals detected');
            }

            // Check for Next.js hydration
            if (window.__NEXT_HYDRATED) {
                analysis.componentMounts.push('Next.js hydrated');
            }

            return analysis;
        });

        // Check for potential build issues
        const buildAnalysis = await page.evaluate(() => {
            return {
                nextData: window.__NEXT_DATA__ ? 'Present' : 'Missing',
                buildId: window.__NEXT_DATA__?.buildId || 'Not found',
                props: window.__NEXT_DATA__?.props ? 'Present' : 'Missing',
                reactVersion: window.React?.version || 'Not detected',
                nodeEnv: process?.env?.NODE_ENV || 'Not accessible'
            };
        });

        // Test if the page is truly server-side rendered vs client-side
        const renderingAnalysis = await page.evaluate(() => {
            const body = document.body;
            const hasServerRenderedContent = body.innerHTML.includes('class=') || body.innerHTML.includes('style=');
            const hasReactIds = body.innerHTML.includes('data-react') || body.innerHTML.includes('data-testid');

            return {
                hasServerRenderedContent,
                hasReactIds,
                bodyLength: body.innerHTML.length,
                contentType: document.contentType,
                readyState: document.readyState,
                scripts: document.scripts.length,
                stylesheets: document.styleSheets.length
            };
        });

        // Check for the specific "call" error by examining all function calls
        const functionAnalysis = await page.evaluate(() => {
            const errors = [];
            const originalConsoleError = console.error;

            console.error = function(...args) {
                if (args.some(arg => arg && arg.toString && arg.toString().includes('call'))) {
                    errors.push({
                        type: 'console.error with call',
                        args: args.map(arg => arg.toString())
                    });
                }
                return originalConsoleError.apply(console, args);
            };

            // Try to trigger potential errors
            try {
                // Test React render functions
                if (window.React) {
                    // This might trigger the call error if there's an issue
                    window.React.version;
                }

                // Test Next.js functions
                if (window.__NEXT_DATA__) {
                    JSON.stringify(window.__NEXT_DATA__);
                }
            } catch (e) {
                errors.push({
                    type: 'evaluation-error',
                    message: e.message,
                    stack: e.stack
                });
            }

            console.error = originalConsoleError;
            return errors;
        });

        const fullReport = {
            timestamp: new Date().toISOString(),
            url: 'http://localhost:3000',
            domAnalysis,
            buildAnalysis,
            renderingAnalysis,
            functionAnalysis,
            summary: {
                totalScripts: domAnalysis.headScripts.length + domAnalysis.bodyScripts.length,
                reactElementsFound: domAnalysis.reactElements.length,
                errorElementsFound: domAnalysis.errorElements.length,
                suspiciousElementsFound: domAnalysis.suspiciousElements.length,
                isServerRendered: renderingAnalysis.hasServerRenderedContent,
                hasReactComponents: renderingAnalysis.hasReactIds
            }
        };

        fs.writeFileSync('C:\\Dev\\StrataNoble\\apps\\website\\DEEP_DOM_ANALYSIS.json', JSON.stringify(fullReport, null, 2));

        console.log('📊 Deep DOM Analysis Results:');
        console.log(`- Total Scripts: ${fullReport.summary.totalScripts}`);
        console.log(`- React Elements: ${fullReport.summary.reactElementsFound}`);
        console.log(`- Error Elements: ${fullReport.summary.errorElementsFound}`);
        console.log(`- Build ID: ${buildAnalysis.buildId}`);
        console.log(`- Server Rendered: ${fullReport.summary.isServerRendered}`);
        console.log(`- React Components: ${fullReport.summary.hasReactComponents}`);

        if (functionAnalysis.length > 0) {
            console.log('🚨 Function Analysis Errors:', functionAnalysis);
        }

        return fullReport;

    } catch (error) {
        console.error('❌ Deep analysis failed:', error);
        return { failed: true, error: error.message };
    } finally {
        await browser.close();
    }
}

deepDOMAnalysis().then(report => {
    console.log('Deep analysis completed');
}).catch(console.error);