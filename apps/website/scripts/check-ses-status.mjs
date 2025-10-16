#!/usr/bin/env node
/**
 * AWS SES Email Verification Status Checker
 * Checks which email addresses/domains are verified in AWS SES
 * and displays account sending limits and DMARC compliance status
 */

import { SESv2Client, ListEmailIdentitiesCommand, GetEmailIdentityCommand, GetAccountCommand } from '@aws-sdk/client-sesv2';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;

console.log('🔍 AWS SES Configuration Check\n');
console.log('Configuration:');
console.log(`  Region: ${AWS_REGION}`);
console.log(`  Access Key: ${AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`  Secret Key: ${AWS_SECRET_ACCESS_KEY ? '***' + AWS_SECRET_ACCESS_KEY.substring(AWS_SECRET_ACCESS_KEY.length - 4) : 'NOT SET'}`);
console.log(`  From Email: ${SES_FROM_EMAIL || 'NOT SET'}\n`);

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS credentials not configured in .env.local');
  process.exit(1);
}

const sesClient = new SESv2Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

async function checkSESStatus() {
  try {
    // Check account status and sending limits
    console.log('📊 Checking AWS SES Account Status...\n');
    const accountCommand = new GetAccountCommand({});
    const accountData = await sesClient.send(accountCommand);

    console.log('Account Details:');
    console.log(`  Production Access: ${accountData.ProductionAccessEnabled ? '✅ YES' : '❌ NO (Sandbox Mode)'}`);
    console.log(`  Sending Enabled: ${accountData.SendingEnabled ? '✅ YES' : '❌ NO'}`);

    if (!accountData.ProductionAccessEnabled) {
      console.log('\n⚠️  WARNING: Account is in SANDBOX MODE');
      console.log('   You can only send emails to verified addresses.');
      console.log('   Request production access: https://console.aws.amazon.com/ses/home#/account\n');
    }

    if (accountData.SendQuota) {
      console.log('\nSending Limits:');
      console.log(`  Max 24hr: ${accountData.SendQuota.Max24HourSend} emails`);
      console.log(`  Max/Second: ${accountData.SendQuota.MaxSendRate} emails/sec`);
      console.log(`  Sent Today: ${accountData.SendQuota.SentLast24Hours}`);
    }

    // List all verified identities
    console.log('\n📧 Verified Email Identities:\n');
    const listCommand = new ListEmailIdentitiesCommand({});
    const listData = await sesClient.send(listCommand);

    if (!listData.EmailIdentities || listData.EmailIdentities.length === 0) {
      console.log('❌ No verified email addresses or domains found!');
      console.log('\nTo verify an email address:');
      console.log('1. Go to: https://console.aws.amazon.com/ses/home#/verified-identities');
      console.log('2. Click "Create identity"');
      console.log(`3. Verify: ${SES_FROM_EMAIL || 'no-reply@stratanoble.com'}`);
      console.log('4. Check your email for verification link\n');
      return;
    }

    for (const identity of listData.EmailIdentities) {
      const detailCommand = new GetEmailIdentityCommand({
        EmailIdentity: identity.IdentityName,
      });
      const detail = await sesClient.send(detailCommand);

      const isVerified = detail.VerifiedForSendingStatus;
      const identityType = identity.IdentityType;
      const icon = isVerified ? '✅' : '❌';

      console.log(`${icon} ${identity.IdentityName} (${identityType})`);
      console.log(`   Status: ${isVerified ? 'VERIFIED' : 'PENDING'}`);

      // Check DMARC policy
      if (detail.DkimAttributes) {
        const dmarcStatus = detail.DkimAttributes.Status;
        const dmarcIcon = dmarcStatus === 'SUCCESS' ? '✅' : '⚠️';
        console.log(`   ${dmarcIcon} DKIM: ${dmarcStatus || 'NOT CONFIGURED'}`);
      }

      // Check if this is the FROM email
      if (SES_FROM_EMAIL && identity.IdentityName === SES_FROM_EMAIL) {
        console.log('   🎯 This is your configured FROM email');
      }

      console.log('');
    }

    // Check if FROM email is verified
    if (SES_FROM_EMAIL) {
      const fromEmailVerified = listData.EmailIdentities.some(
        identity => identity.IdentityName === SES_FROM_EMAIL && identity.IdentityType === 'EMAIL_ADDRESS'
      );

      const fromDomainVerified = listData.EmailIdentities.some(
        identity => {
          const domain = SES_FROM_EMAIL.split('@')[1];
          return identity.IdentityName === domain && identity.IdentityType === 'DOMAIN';
        }
      );

      if (!fromEmailVerified && !fromDomainVerified) {
        console.log(`\n⚠️  WARNING: Your configured FROM email (${SES_FROM_EMAIL}) is NOT verified!`);
        console.log('\nTo fix this:');
        console.log('1. Go to: https://console.aws.amazon.com/ses/home#/verified-identities');
        console.log('2. Click "Create identity"');
        console.log(`3. Verify: ${SES_FROM_EMAIL}`);
        console.log('4. Check your email inbox for the verification link');
        console.log('5. Click the verification link to complete verification\n');
      } else {
        console.log(`✅ Your FROM email (${SES_FROM_EMAIL}) is verified!\n`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error checking SES status:');
    console.error(`   ${error.message}\n`);

    if (error.name === 'InvalidClientTokenId' || error.name === 'SignatureDoesNotMatch') {
      console.error('🔑 AWS credentials are invalid or expired.');
      console.error('   Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY\n');
    } else if (error.name === 'AccessDeniedException') {
      console.error('🔒 Your AWS credentials don\'t have SES permissions.');
      console.error('   Required permissions: ses:GetAccount, ses:ListEmailIdentities, ses:GetEmailIdentity\n');
    }

    process.exit(1);
  }
}

checkSESStatus();
