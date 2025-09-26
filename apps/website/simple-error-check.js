const http = require('http');

function checkServerStatus() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Server is responding');
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Content-Type: ${res.headers['content-type']}`);

                // Check for common error indicators in HTML
                if (data.includes('Application error') ||
                    data.includes('Runtime Error') ||
                    data.includes('Unhandled Runtime Error')) {
                    console.log('❌ Found error indicators in HTML response');
                    console.log('HTML contains error messages');
                } else {
                    console.log('✅ No obvious error indicators in HTML response');
                }

                // Check if it looks like a proper Next.js page
                if (data.includes('__NEXT_DATA__')) {
                    console.log('✅ Next.js application detected (__NEXT_DATA__ found)');
                } else {
                    console.log('⚠️ Next.js __NEXT_DATA__ not found - might indicate hydration issues');
                }

                // Look for React components
                if (data.includes('react') || data.includes('React')) {
                    console.log('✅ React references found');
                } else {
                    console.log('⚠️ No React references found');
                }

                // Check for script errors or console.error calls
                if (data.includes('console.error') || data.includes('onerror')) {
                    console.log('⚠️ Found potential error handling code');
                }

                resolve(data);
            });
        });

        req.on('error', (err) => {
            console.error('❌ Server connection error:', err.message);
            reject(err);
        });

        req.setTimeout(10000, () => {
            console.error('❌ Request timeout');
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function main() {
    console.log('Checking localhost:3000 status...');
    try {
        const html = await checkServerStatus();

        // Save HTML for inspection
        const fs = require('fs');
        fs.writeFileSync('localhost-response.html', html);
        console.log('HTML response saved to localhost-response.html');

        // Show first 500 chars of response
        console.log('\nFirst 500 characters of response:');
        console.log(html.substring(0, 500));
        console.log('...');

    } catch (error) {
        console.error('Failed to check server:', error.message);
    }
}

main();