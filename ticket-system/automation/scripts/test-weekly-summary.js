import { sendWeeklySummary } from '../src/index.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing weekly summary...\n');

sendWeeklySummary()
    .then(() => {
        console.log('\n✅ Test complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
