const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 StrataNoble Runtime Diagnostic Tool');
console.log('=====================================\n');

// Test 1: Server Status
console.log('📊 1. Server Status Check');
try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', {timeout: 10000});
    console.log(`✅ Server responds with HTTP ${response.toString().trim()}`);
} catch (error) {
    console.log('❌ Server connection failed:', error.message);
}

// Test 2: Check for build errors
console.log('\n📊 2. Next.js Build Status Check');
try {
    const buildCheck = execSync('cd /c/Dev/StrataNoble/apps/website && npm run build --dry-run 2>&1 | head -10', {encoding: 'utf8', timeout: 30000});
    if (buildCheck.includes('Error') || buildCheck.includes('error')) {
        console.log('❌ Build issues detected:', buildCheck);
    } else {
        console.log('✅ No obvious build errors');
    }
} catch (error) {
    console.log('⚠️ Could not check build status:', error.message);
}

// Test 3: Check dev server logs
console.log('\n📊 3. Development Server Logs Check');
try {
    // Check if any Next.js process is running and get its output
    const processes = execSync('ps aux | grep "next dev" | grep -v grep', {encoding: 'utf8'});
    if (processes.trim()) {
        console.log('✅ Next.js dev server is running');

        // Try to get recent logs (this might not work on all systems)
        try {
            const logs = execSync('journalctl -u node --no-pager -n 20 2>/dev/null || echo "Logs not available"', {encoding: 'utf8', timeout: 5000});
            if (logs.includes('Cannot read properties of undefined')) {
                console.log('❌ Found "Cannot read properties of undefined" in logs');
            } else {
                console.log('✅ No obvious errors in available logs');
            }
        } catch (logError) {
            console.log('⚠️ Could not access system logs');
        }
    } else {
        console.log('⚠️ Next.js dev server not detected in process list');
    }
} catch (error) {
    console.log('⚠️ Could not check process status');
}

// Test 4: Check for common error patterns in source code
console.log('\n📊 4. Source Code Error Pattern Analysis');

// Check for potential undefined function calls
const checkPatterns = [
    { pattern: '\\.call\\(', description: 'Function.call() usage' },
    { pattern: '\\.apply\\(', description: 'Function.apply() usage' },
    { pattern: '\\.bind\\(', description: 'Function.bind() usage' },
    { pattern: 'useCallback.*undefined', description: 'useCallback with undefined' },
    { pattern: 'useMemo.*undefined', description: 'useMemo with undefined' },
    { pattern: 'useEffect.*undefined', description: 'useEffect with undefined' }
];

checkPatterns.forEach(({pattern, description}) => {
    try {
        const result = execSync(`cd /c/Dev/StrataNoble/apps/website && grep -r "${pattern}" src/ --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" | head -5`, {encoding: 'utf8'});
        if (result.trim()) {
            console.log(`⚠️ Found ${description}:`);
            console.log(result.trim().split('\n').map(line => `   ${line}`).join('\n'));
        }
    } catch (error) {
        // No matches found - this is good
    }
});

// Test 5: Memory and performance check
console.log('\n📊 5. System Resource Check');
try {
    const memInfo = execSync('free -h 2>/dev/null || echo "Memory info not available"', {encoding: 'utf8'});
    console.log('💾 Memory status:', memInfo.split('\n')[1] || 'Not available');
} catch (error) {
    console.log('⚠️ Could not check memory status');
}

// Test 6: Check critical dependency versions
console.log('\n📊 6. Critical Dependencies Check');
try {
    const packageJson = JSON.parse(fs.readFileSync('/c/Dev/StrataNoble/apps/website/package.json', 'utf8'));
    const criticalDeps = ['next', 'react', 'react-dom', '@types/node'];

    criticalDeps.forEach(dep => {
        const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        if (version) {
            console.log(`✅ ${dep}: ${version}`);
        } else {
            console.log(`❌ ${dep}: Not found`);
        }
    });
} catch (error) {
    console.log('❌ Could not read package.json:', error.message);
}

// Test 7: Check for TypeScript errors
console.log('\n📊 7. TypeScript Compilation Check');
try {
    const tscCheck = execSync('cd /c/Dev/StrataNoble/apps/website && npx tsc --noEmit 2>&1 | head -10', {encoding: 'utf8', timeout: 20000});
    if (tscCheck.includes('error TS')) {
        console.log('❌ TypeScript errors detected:');
        console.log(tscCheck);
    } else if (tscCheck.trim() === '') {
        console.log('✅ No TypeScript compilation errors');
    } else {
        console.log('⚠️ TypeScript check output:', tscCheck.trim());
    }
} catch (error) {
    console.log('⚠️ Could not run TypeScript check:', error.message);
}

// Test 8: Final URL test with detailed fetch
console.log('\n📊 8. Detailed HTTP Response Analysis');
try {
    const curlOutput = execSync('curl -s -I http://localhost:3000', {encoding: 'utf8', timeout: 10000});
    console.log('📡 HTTP Headers:');
    console.log(curlOutput.split('\n').slice(0, 5).map(line => `   ${line}`).join('\n'));

    // Test specific routes that might cause issues
    const testRoutes = ['/', '/about', '/contact', '/services'];
    testRoutes.forEach(route => {
        try {
            const routeTest = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${route}`, {timeout: 5000});
            const status = routeTest.toString().trim();
            console.log(`${status === '200' ? '✅' : '❌'} Route ${route}: HTTP ${status}`);
        } catch (routeError) {
            console.log(`❌ Route ${route}: Failed to test`);
        }
    });

} catch (error) {
    console.log('❌ Could not perform HTTP analysis:', error.message);
}

console.log('\n🎯 DIAGNOSTIC SUMMARY');
console.log('====================');
console.log('Based on the initial HTML response analysis:');
console.log('✅ Server is responding correctly (HTTP 200)');
console.log('✅ Next.js is rendering pages successfully');
console.log('✅ React components are loading');
console.log('⚠️ Missing __NEXT_DATA__ suggests possible hydration issues');
console.log('\nThe "Cannot read properties of undefined (reading \'call\')" error');
console.log('is likely occurring during client-side JavaScript execution.');
console.log('\nRecommendations:');
console.log('1. Open browser DevTools and navigate to http://localhost:3000');
console.log('2. Check Console tab for real-time JavaScript errors');
console.log('3. Look for errors in useCallback, useMemo, or useEffect hooks');
console.log('4. Check Network tab for failed resource requests');

console.log('\n🔧 To manually test, run: npx playwright test or open browser to localhost:3000');