// Gate 3 Test Script
// Run this in browser console on http://localhost:5173/home/nearby

async function runGate3Test() {
    console.log('=== Gate 3 Test Starting ===');
    
    // Reset counters
    MapService.resetCounters();
    console.log('✓ Counters reset');
    
    // Simulate 5 quick location/radius changes
    const testBboxes = [
        { minLng: -115.2, minLat: 36.1, maxLng: -115.1, maxLat: 36.2 },
        { minLng: -115.15, minLat: 36.12, maxLng: -115.05, maxLat: 36.22 },
        { minLng: -115.1, minLat: 36.15, maxLng: -115.0, maxLat: 36.25 },
        { minLng: -115.2, minLat: 36.1, maxLng: -115.1, maxLat: 36.2 }, // Repeat for cache
        { minLng: -115.25, minLat: 36.08, maxLng: -115.15, maxLat: 36.18 },
    ];
    
    console.log('Simulating 5 quick location changes...');
    
    // Start requests quickly (some should be aborted)
    const promises = testBboxes.map((bbox, i) => {
        console.log(`Request ${i + 1} started`);
        return MapService.getShops(bbox, 36.17, -115.14).catch(err => {
            if (err.name === 'AbortError') {
                console.log(`Request ${i + 1} aborted (expected)`);
            }
            return null;
        });
    });
    
    await Promise.all(promises);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const counters = MapService.getCounters();
    
    console.log('=== Gate 3 Results ===');
    console.log(JSON.stringify(counters, null, 2));
    
    // Check pass criteria
    const checks = {
        'requests_completed <= requests_started': counters.requests_completed <= counters.requests_started,
        'requests_started matches changes': counters.requests_started > 0 && counters.requests_started < 10,
        'requests_aborted > 0': counters.requests_aborted > 0,
        'cache_hits > 0': counters.cache_hits > 0
    };
    
    console.log('=== Pass Criteria ===');
    Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✓' : '✗'} ${check}`);
    });
    
    const allPass = Object.values(checks).every(v => v);
    console.log(`\n${allPass ? '✓ ALL TESTS PASS' : '✗ SOME TESTS FAILED'}`);
    
    return counters;
}

// Export for easy copy-paste
console.log('Gate 3 test function loaded. Run: runGate3Test()');

