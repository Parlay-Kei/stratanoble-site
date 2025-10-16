#!/usr/bin/env node
/**
 * Test Magic Link Email Authentication
 * Simulates sending a magic link email to test@example.com
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Import the sendEmail function
const { sendEmail } = await import('../src/lib/mailer.ts');

const TEST_EMAIL = 'Mr.Steve.Hubbard@outlook.com';
const MAGIC_LINK_URL = 'http://localhost:3000/auth/callback/email?token=test-token-12345&email=' + encodeURIComponent(TEST_EMAIL);

console.log('🧪 Testing Magic Link Email Delivery\n');
console.log(`To: ${TEST_EMAIL}`);
console.log(`From: ${process.env.SES_FROM_EMAIL}`);
console.log(`Link: ${MAGIC_LINK_URL}\n`);

const subject = 'Sign in to Strata Noble';
const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">Sign in to Strata Noble</h1>
    </div>

    <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Click the link below to sign in to your Strata Noble account:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${MAGIC_LINK_URL}"
           style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Sign In to Dashboard
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        If you didn't request this email, you can safely ignore it.
      </p>

      <p style="color: #666; font-size: 14px;">
        This link will expire in 24 hours.
      </p>
    </div>

    <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
      <p>© 2025 Strata Noble. All rights reserved.</p>
    </div>
  </div>
`;

try {
  console.log('📧 Sending email via AWS SES...\n');
  await sendEmail(TEST_EMAIL, subject, html);
  console.log('✅ Email sent successfully!');
  console.log('\n📬 Check your inbox at:', TEST_EMAIL);
  console.log('   Look in spam folder if you don\'t see it\n');
} catch (error) {
  console.error('❌ Failed to send email:');
  console.error('   ', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
