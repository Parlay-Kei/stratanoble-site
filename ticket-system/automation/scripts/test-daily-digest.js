import { sendDailyDigest } from '../src/index.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing daily digest...\n');

sendDailyDigest()
    .then(() => {
        console.log('\n✅ Test complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
