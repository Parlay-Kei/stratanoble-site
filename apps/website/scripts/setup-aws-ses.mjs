#!/usr/bin/env node
/**
 * Setup AWS SES for Email Authentication
 *
 * This script helps configure AWS SES for NextAuth email magic links.
 *
 * Usage: node scripts/setup-aws-ses.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import { appendFileSync, readFileSync } from 'fs';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');
config({ path: envPath });

console.log('📧 AWS SES Email Authentication Setup\n');

// Step 1: Check if AWS CLI is configured
console.log('Step 1: Checking AWS CLI configuration...\n');

try {
  const identity = execSync('aws sts get-caller-identity --output json', { encoding: 'utf8' });
  const identityData = JSON.parse(identity);
  console.log('✅ AWS CLI is configured');
  console.log(`   Account: ${identityData.Account}`);
  console.log(`   User ARN: ${identityData.Arn}\n`);
} catch (error) {
  console.log('❌ AWS CLI not configured\n');
  console.log('Please configure AWS CLI first:');
  console.log('  1. Run: aws configure');
  console.log('  2. Enter your AWS Access Key ID');
  console.log('  3. Enter your AWS Secret Access Key');
  console.log('  4. Enter region: us-east-1 (or your preferred region)');
  console.log('  5. Enter output format: json\n');
  console.log('Get credentials from: https://console.aws.amazon.com/iam/home#/security_credentials\n');
  process.exit(1);
}

// Step 2: Check SES sending limits
console.log('Step 2: Checking SES account status...\n');

try {
  const quota = execSync('aws ses get-send-quota --output json', { encoding: 'utf8' });
  const quotaData = JSON.parse(quota);

  console.log('📊 SES Account Status:');
  console.log(`   Daily Quota: ${quotaData.Max24HourSend} emails/day`);
  console.log(`   Sent Today: ${quotaData.SentLast24Hours}`);
  console.log(`   Send Rate: ${quotaData.MaxSendRate} emails/second\n`);

  if (quotaData.Max24HourSend < 200) {
    console.log('⚠️  Your account is in SES Sandbox mode (limited to 200 emails/day)');
    console.log('   To increase limits, request production access:');
    console.log('   https://console.aws.amazon.com/ses/home#/account\n');
  }
} catch (error) {
  console.log('ℹ️  Could not get SES quota information');
  console.log('   This is normal if SES is not yet enabled in this region\n');
}

// Step 3: List verified email addresses
console.log('Step 3: Checking verified email addresses...\n');

try {
  const identities = execSync('aws ses list-identities --output json', { encoding: 'utf8' });
  const identitiesData = JSON.parse(identities);

  if (identitiesData.Identities && identitiesData.Identities.length > 0) {
    console.log('✅ Verified email addresses:');
    identitiesData.Identities.forEach(email => {
      console.log(`   - ${email}`);
    });
    console.log('');
  } else {
    console.log('⚠️  No verified email addresses found\n');
  }
} catch (error) {
  console.log('ℹ️  Could not list email identities\n');
}

// Step 4: Prompt for email verification (if needed)
console.log('Step 4: Email Address Configuration\n');
console.log('For NextAuth email magic links, you need a verified sender email.\n');
console.log('Recommended format: no-reply@stratanoble.com\n');
console.log('To verify an email address:');
console.log('  aws ses verify-email-identity --email-address no-reply@stratanoble.com\n');
console.log('You will receive a verification email with a link to click.\n');

// Step 5: Get AWS credentials from CLI config
console.log('Step 5: Extracting AWS credentials...\n');

try {
  const credentials = execSync('aws configure list --output text', { encoding: 'utf8' });
  const lines = credentials.split('\n');

  let accessKeyId = null;
  let secretAccessKey = null;
  let region = 'us-east-1';

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === 'access_key' && parts[2] !== 'None') {
      accessKeyId = parts[2];
    }
    if (parts[0] === 'region' && parts[2] !== 'None') {
      region = parts[2];
    }
  }

  if (!accessKeyId) {
    console.log('⚠️  Could not extract credentials from AWS CLI config');
    console.log('   You will need to manually add them to .env.local\n');
  }

  console.log('📝 Add these to your .env.local:\n');
  console.log('# AWS SES Configuration for Email Authentication');
  console.log(`AWS_REGION=${region}`);

  if (accessKeyId) {
    console.log(`AWS_ACCESS_KEY_ID=${accessKeyId}`);
    console.log('AWS_SECRET_ACCESS_KEY=<from ~/.aws/credentials>');
  } else {
    console.log('AWS_ACCESS_KEY_ID=<your-access-key-id>');
    console.log('AWS_SECRET_ACCESS_KEY=<your-secret-access-key>');
  }

  console.log('SES_FROM_EMAIL=no-reply@stratanoble.com');
  console.log('');

  // Offer to add automatically
  console.log('💡 To add automatically, run:');
  console.log('   node scripts/add-ses-to-env.mjs\n');

} catch (error) {
  console.log('❌ Error extracting credentials:', error.message);
}

// Step 6: Test email sending (if configured)
console.log('Step 6: Testing Email Sending\n');

const hasCredentials = process.env.AWS_ACCESS_KEY_ID &&
                       process.env.AWS_SECRET_ACCESS_KEY &&
                       process.env.SES_FROM_EMAIL;

if (hasCredentials) {
  console.log('✅ AWS credentials found in .env.local');
  console.log('\nTo test email sending, run:');
  console.log('   node scripts/test-auth-email.mjs your-email@example.com\n');
} else {
  console.log('⏳ AWS credentials not yet in .env.local');
  console.log('\nAfter adding credentials, test with:');
  console.log('   node scripts/test-auth-email.mjs your-email@example.com\n');
}

console.log('✅ AWS SES setup guide complete!\n');
console.log('📚 Next Steps:');
console.log('   1. Verify your sender email address in AWS SES');
console.log('   2. Add AWS credentials to .env.local');
console.log('   3. Test email sending');
console.log('   4. (Optional) Request production access to remove sandbox limits\n');
