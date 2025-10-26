import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  SESv2Client,
  GetAccountCommand,
  GetEmailIdentityCommand,
} from '@aws-sdk/client-sesv2';

function hasAwsCreds() {
  return (
    !!(process.env.STRATANOBLE_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
    !!(
      process.env.STRATANOBLE_AWS_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      process.env.AWS_SES_SECRET
    )
  );
}

function prismaAvailable() {
  return !!process.env.DATABASE_URL && process.env.AUTH_USE_PRISMA !== 'false';
}

async function checkDatabase() {
  if (!prismaAvailable()) return { ok: false, reason: 'DATABASE_URL missing or prisma disabled' };
  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'db check failed' };
  }
}

async function checkSes() {
  const from = process.env.SES_FROM_EMAIL;
  if (!from || !hasAwsCreds()) {
    return { ok: false, reason: 'SES_FROM_EMAIL or AWS creds missing' };
  }
  try {
    const region = process.env.STRATANOBLE_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
    const client = new SESv2Client({ region });

    let productionAccess: boolean | undefined = undefined;
    try {
      const acct = await client.send(new GetAccountCommand({}));
      productionAccess = acct?.SendingEnabled ?? true;
    } catch {}

    const identity = from.includes('@') ? from : `${from}`;
    let identityVerified: boolean | undefined = undefined;
    try {
      const resp = await client.send(new GetEmailIdentityCommand({ EmailIdentity: identity }));
      identityVerified = (resp?.IdentityType && resp?.VerifiedForSendingStatus) || false;
    } catch {
      try {
        const domain = from.split('@')[1];
        if (domain) {
          const resp2 = await client.send(new GetEmailIdentityCommand({ EmailIdentity: domain }));
          identityVerified = (resp2?.IdentityType && resp2?.VerifiedForSendingStatus) || false;
        }
      } catch {
        identityVerified = undefined;
      }
    }

    const ok = identityVerified !== false;
    return { ok, productionAccess, identityVerified };
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'ses check failed' };
  }
}

export async function GET() {
  const [db, ses] = await Promise.all([checkDatabase(), checkSes()]);
  const emailEnabledEnv = !!process.env.SES_FROM_EMAIL && hasAwsCreds();
  const providerEnabled = emailEnabledEnv && prismaAvailable();
  const ok = providerEnabled && db.ok && ses.ok;
  return NextResponse.json({
    ok,
    providerEnabled,
    database: db,
    ses,
  });
}
