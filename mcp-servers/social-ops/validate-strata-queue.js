/**
 * Validates that the approved Strata Noble TikTok queue loads 14 posts.
 * Usage: node validate-strata-queue.js
 */

import { loadStrataNobleTikTokQueue } from './strata-queue-loader.js';

const q = loadStrataNobleTikTokQueue();

if (!q.exists) {
  console.error(q.error || 'Queue missing');
  process.exit(1);
}

if (q.postCount !== 14) {
  console.error(`Expected 14 posts, got ${q.postCount}`);
  process.exit(1);
}

console.log(`OK: ${q.postCount} posts from approved queue`);
console.log(q.queuePath);
process.exit(0);
