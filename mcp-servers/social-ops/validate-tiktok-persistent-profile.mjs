#!/usr/bin/env node
/**
 * CLI equivalent of MCP tool validate_tiktok_persistent_profile.
 * Loads .env then reads process.env (set vars in the shell before invoking).
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { TikTokPlaywrightPoster } from './tiktok-playwright-poster.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../../apps/website/.env.local') });

const config = {
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    socialMediaDbId: process.env.NOTION_SOCIAL_MEDIA_DB_ID,
  },
  linkedin: {
    enabled: process.env.LINKEDIN_ENABLED !== 'false',
    accountType: process.env.LINKEDIN_ACCOUNT_TYPE || 'personal',
    sessionCookies: process.env.LINKEDIN_SESSION_COOKIES,
  },
  tiktok: {
    enabled: process.env.TIKTOK_ENABLED !== 'false',
    accountType: process.env.TIKTOK_ACCOUNT_TYPE || 'personal',
    sessionCookies: process.env.TIKTOK_SESSION_COOKIES,
    usePersistentProfile: process.env.TIKTOK_USE_PERSISTENT_PROFILE === 'true',
    profileDir: process.env.TIKTOK_PROFILE_DIR || '.auth/tiktok-profile',
  },
  approval: {
    method: process.env.APPROVAL_METHOD || 'notion',
  },
  dryRun: process.env.DRY_RUN_MODE === 'true',
};

async function main() {
  if (!config.tiktok.enabled) {
    console.log(JSON.stringify({ success: false, error: 'TikTok posting disabled via kill switch' }, null, 2));
    process.exit(1);
  }
  if (!config.tiktok.usePersistentProfile) {
    console.log(
      JSON.stringify(
        {
          success: false,
          error: 'Set TIKTOK_USE_PERSISTENT_PROFILE=true to validate the saved Chromium profile.',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const posterConfig = {
    notion: config.notion,
    linkedin: config.linkedin,
    tiktok: config.tiktok,
    approval: config.approval,
    dryRun: false,
  };

  const poster = new TikTokPlaywrightPoster(posterConfig);
  try {
    const result = await poster.validatePersistentProfileAndAccount();
    await poster.close();
    const ready = result.finalStatus === 'READY_FOR_DRAFT_TEST';
    console.log(JSON.stringify({ success: ready, ...result }, null, 2));
    process.exit(ready ? 0 : 2);
  } catch (err) {
    await poster.close().catch(() => {});
    console.log(JSON.stringify({ success: false, error: err.message }, null, 2));
    process.exit(1);
  }
}

main();
