#!/usr/bin/env node
// Conditionally run `prisma db push` only when DATABASE_URL is present
const { execSync } = require('node:child_process');

const url = process.env.DATABASE_URL;
if (!url) {
  console.log('[build] Skipping `prisma db push`: DATABASE_URL not set');
  process.exit(0);
}

try {
  console.log('[build] Running `prisma db push`...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('[build] Prisma schema pushed successfully.');
} catch (err) {
  console.error('[build] Prisma db push failed:', err?.message || err);
  process.exit(1);
}
