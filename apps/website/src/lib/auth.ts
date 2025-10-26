import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import AzureADProvider from 'next-auth/providers/azure-ad';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { supabase } from './supabase';
import { sendEmail } from './mailer';

// Initialize Prisma Client
let prisma: PrismaClient | null = null;
try {
  if (process.env.DATABASE_URL && process.env.AUTH_USE_PRISMA !== 'false') {
    prisma = new PrismaClient();
  }
} catch (e) {
  prisma = null;
}

// OAuth and email configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;
const AZURE_AD_CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET;
const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;\nconst HAS_AWS_CREDS = !!(process.env.STRATANOBLE_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) && !!(process.env.STRATANOBLE_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET);

// Required: NextAuth secret for JWT encryption
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

const providers: any[] = [];

// Optional dev credentials login (only if explicitly enabled)
if (process.env.NEXTAUTH_DEV_LOGIN === 'true') {
  providers.push(
    CredentialsProvider({
      name: 'Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const expected = process.env.DEV_LOGIN_PASSWORD || 'dev';
        if (!email || !password || password !== expected) return null;
        return { id: `dev:${email}`, name: email, email } as any;
      },
    })
  );
}

// Google OAuth Provider (optional)
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })
  );
}

// GitHub OAuth Provider (optional)
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({ clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET })
  );
}

// Microsoft Azure AD Provider (optional)
if (AZURE_AD_CLIENT_ID && AZURE_AD_CLIENT_SECRET && AZURE_AD_TENANT_ID) {
  providers.push(
    AzureADProvider({
      clientId: AZURE_AD_CLIENT_ID,
      clientSecret: AZURE_AD_CLIENT_SECRET,
      tenantId: AZURE_AD_TENANT_ID,
    })
  );
}

// Email Magic Link Provider via SES (optional)\nconst EMAIL_ENABLED = !!SES_FROM_EMAIL && (HAS_AWS_CREDS || process.env.ALLOW_EMAIL_SIGNUP === 'true');\nif (EMAIL_ENABLED) {
  providers.push(
    EmailProvider({
      server: {
        host: 'localhost', // Required by NextAuth but unused (we use AWS SES API instead)
        port: 587,
        auth: { user: 'unused', pass: 'unused' },
      },
      from: SES_FROM_EMAIL,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const subject = 'Sign in to Strata Noble';
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Sign in to Strata Noble</h1>
            </div>
            <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Click the link below to sign in to your Strata Noble account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Sign In to Dashboard</a>
              </div>
              <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
              <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            </div>
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
              <p>© 2025 Strata Noble. All rights reserved.</p>
            </div>
          </div>
        `;

        await sendEmail(email, subject, html);
        console.log(`Magic link email sent to ${email}`);
      },
    })
  );
}

// Avoid noisy error during CI/build environments; NextAuth enforces this at runtime
if (!NEXTAUTH_SECRET) {
  const isCI = process.env.CI === 'true' || process.env.NETLIFY === 'true' || !!process.env.GITHUB_ACTIONS;
  if (!isCI) {
    console.warn('NEXTAUTH_SECRET is not set. Authentication will fail in production.');
  }
}

export const authOptions: NextAuthOptions = {
  ...(prisma ? { adapter: PrismaAdapter(prisma) as any } : {}),
  providers,
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        const { data: client } = await (supabase as any)
          .from('clients')
          .select('tier, stripe_customer_id')
          .eq('id', session.user.email)
          .maybeSingle?.() ?? { data: null };
        (session.user as any).tier = client?.tier;
        (session.user as any).stripeCustomerId = client?.stripe_customer_id;
      }
      if (process.env.NEXTAUTH_DEV_LOGIN === 'true' && session?.user) {
        (session.user as any).role = 'super_admin';
      }
      return session;
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  events: {},
  session: {
    strategy: prisma ? (process.env.AUTH_USE_PRISMA === 'false' ? 'jwt' : 'database') : 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: NEXTAUTH_SECRET,
};





