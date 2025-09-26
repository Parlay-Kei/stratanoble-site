// Quick test using Node.js to simulate browser environment issues
const https = require('https');
const http = require('http');

console.log('🚀 Quick Runtime Error Test for localhost:3000');
console.log('================================================\n');

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                headers: res.headers,
                body: data
            }));
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function analyzeJavaScriptErrors() {
    try {
        console.log('📥 Fetching page content...');
        const response = await fetchPage('http://localhost:3000');

        console.log(`✅ HTTP Status: ${response.status}`);
        console.log(`✅ Content-Type: ${response.headers['content-type']}`);
        console.log(`✅ Content Length: ${response.body.length} bytes\n`);

        // Analyze the HTML for potential error indicators
        const html = response.body;

        // Check for Next.js specific elements
        const hasNextData = html.includes('__NEXT_DATA__');
        const hasNextScripts = html.includes('/_next/static');
        const hasReactRoot = html.includes('data-reactroot') || html.includes('id="__next"');

        console.log('🔍 Next.js Analysis:');
        console.log(`${hasNextData ? '✅' : '⚠️'} __NEXT_DATA__ present: ${hasNextData}`);
        console.log(`${hasNextScripts ? '✅' : '❌'} Next.js scripts found: ${hasNextScripts}`);
        console.log(`${hasReactRoot ? '✅' : '⚠️'} React root element: ${hasReactRoot}\n`);

        // Look for error-related patterns
        console.log('🔍 Error Pattern Analysis:');

        const errorPatterns = [
            { name: 'Runtime Error indicators', pattern: /runtime.{0,20}error|error.{0,20}runtime/gi },
            { name: 'Hydration issues', pattern: /hydration.{0,20}(error|mismatch|failed)/gi },
            { name: 'Function call errors', pattern: /cannot.{0,30}call|call.{0,20}undefined/gi },
            { name: 'Property access errors', pattern: /cannot.{0,30}read.{0,20}properties/gi },
            { name: 'Console error calls', pattern: /console\.error/gi },
            { name: 'Unhandled promise rejections', pattern: /unhandled.{0,20}promise/gi },
        ];

        let errorsFound = 0;
        errorPatterns.forEach(({name, pattern}) => {
            const matches = html.match(pattern);
            if (matches) {
                errorsFound++;
                console.log(`❌ ${name}: ${matches.length} occurrence(s)`);
                // Show first few matches
                matches.slice(0, 3).forEach((match, index) => {
                    console.log(`   ${index + 1}. "${match}"`);
                });
            } else {
                console.log(`✅ ${name}: None found`);
            }
        });

        if (errorsFound === 0) {
            console.log('\n🎉 No obvious error patterns found in HTML response');
        } else {
            console.log(`\n⚠️ Found ${errorsFound} potential error patterns`);
        }

        // Check for specific components that might cause issues
        console.log('\n🔍 Component Analysis:');
        const suspiciousPatterns = [
            'useCallback',
            'useMemo',
            'useEffect',
            '.bind(',
            '.call(',
            '.apply(',
            'undefined'
        ];

        suspiciousPatterns.forEach(pattern => {
            if (html.includes(pattern)) {
                console.log(`⚠️ Found pattern: ${pattern}`);
            }
        });

        // Extract and analyze script src attributes
        console.log('\n🔍 Script Analysis:');
        const scriptMatches = html.match(/<script[^>]*src="([^"]*)"[^>]*>/g) || [];
        console.log(`Found ${scriptMatches.length} external scripts:`);

        scriptMatches.slice(0, 5).forEach(script => {
            const srcMatch = script.match(/src="([^"]*)"/);
            if (srcMatch) {
                console.log(`   • ${srcMatch[1]}`);
            }
        });

        // Check for inline scripts that might contain errors
        const inlineScripts = html.match(/<script[^>]*>([^<]*)<\/script>/g) || [];
        console.log(`\n🔍 Found ${inlineScripts.length} inline scripts`);

        let hasCallErrors = false;
        inlineScripts.forEach((script, index) => {
            if (script.includes('.call(') || script.includes('undefined')) {
                console.log(`⚠️ Inline script ${index + 1} contains suspicious patterns`);
                hasCallErrors = true;
            }
        });

        console.log('\n📊 ANALYSIS RESULTS:');
        console.log('===================');

        if (response.status !== 200) {
            console.log('❌ CRITICAL: Server not responding correctly');
        } else if (!hasNextScripts) {
            console.log('❌ CRITICAL: Next.js scripts missing - build issue');
        } else if (!hasNextData) {
            console.log('⚠️ WARNING: Missing __NEXT_DATA__ - possible hydration issues');
            console.log('   This could cause client-side JavaScript errors');
        } else if (hasCallErrors) {
            console.log('⚠️ WARNING: Suspicious JavaScript patterns found');
        } else {
            console.log('✅ HTML analysis looks good - errors likely happen during runtime');
        }

        console.log('\n🔧 RECOMMENDATIONS:');
        console.log('===================');
        console.log('1. Open browser DevTools (F12) and navigate to http://localhost:3000');
        console.log('2. Check Console tab for "Cannot read properties of undefined (reading \'call\')" error');
        console.log('3. Look for errors in React hooks (useEffect, useCallback, useMemo)');
        console.log('4. Check Network tab for failed JavaScript file loads');
        console.log('5. Look for hydration mismatch warnings');

        if (!hasNextData) {
            console.log('6. ⚠️ FOCUS: Investigate hydration issues - this is likely the root cause');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

analyzeJavaScriptErrors();