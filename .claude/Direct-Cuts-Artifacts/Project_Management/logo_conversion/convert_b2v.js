
const b2v = require('bitmap2vector');

// Check if b2v is a function or object
console.log('Type of b2v:', typeof b2v);

// Attempt conversion
// The API might be convert(inputPath, outputPath, options) or similar
// Or maybe it returns a promise.

async function run() {
    try {
        if (typeof b2v.convert === 'function') {
            await b2v.convert('logo.png', 'logo.svg');
            console.log('Converted using b2v.convert');
        } else if (typeof b2v === 'function') {
            // Some libraries are the function themselves
            await b2v('logo.png', 'logo.svg');
            console.log('Converted using b2v()');
        } else {
            console.log('Unknown API structure', b2v);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
