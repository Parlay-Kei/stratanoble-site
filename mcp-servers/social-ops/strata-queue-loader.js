/**
 * Loads Posts 1–14 from the approved Strata Noble TikTok markdown queue.
 * Source of truth: docs/social/tiktok/STRATA_NOBLE_TIKTOK_POSTING_QUEUE_001.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Resolved path to the approved queue file (repo-relative from social-ops). */
export function getStrataNobleTikTokQueuePath() {
  return path.resolve(__dirname, '../../docs/social/tiktok/STRATA_NOBLE_TIKTOK_POSTING_QUEUE_001.md');
}

/**
 * Parses the publishing queue table. Returns posts 1–14 when present.
 */
export function loadStrataNobleTikTokQueue() {
  const queuePath = getStrataNobleTikTokQueuePath();
  if (!fs.existsSync(queuePath)) {
    return {
      queuePath,
      exists: false,
      postCount: 0,
      posts: [],
      error: `Queue file not found at ${queuePath}`,
    };
  }

  const raw = fs.readFileSync(queuePath, 'utf8');
  const posts = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed.split('|').map((c) => c.trim());
    if (cells.length < 11) continue;

    const num = parseInt(cells[1], 10);
    if (Number.isNaN(num) || num < 1 || num > 14) continue;

    posts.push({
      postNumber: num,
      suggestedDate: cells[2],
      suggestedTime: cells[3],
      format: cells[4],
      caption: cells[5],
      hashtags: cells[6],
      overlayText: cells[7],
      cta: cells[8],
      productionRequirement: cells[9],
      status: cells[10],
    });
  }

  posts.sort((a, b) => a.postNumber - b.postNumber);

  return {
    queuePath,
    exists: true,
    postCount: posts.length,
    posts,
  };
}
