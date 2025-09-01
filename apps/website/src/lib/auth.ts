import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { supabase } from './supabase';
import { sendEmail } from './mailer';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      },
      from: SES_FROM_EMAIL,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
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
                <a href="${url}" 
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

        await sendEmail(email, subject, html);
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      // Enrich session from Supabase clients if available via email
      if (session.user?.email) {
        const { data: client } = await (supabase as any)
          .from('clients')
          .select('tier, stripe_customer_id')
          .eq('id', session.user.email)
          .maybeSingle?.() ?? { data: null };
        session.user.tier = client?.tier;
        session.user.stripeCustomerId = client?.stripe_customer_id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign-in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign-in
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async createUser({ user }) {
      // User creation event
    },
    async signIn({ user, account, profile, isNewUser }) {
      if (isNewUser) {
        // First-time sign-in event
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: NEXTAUTH_SECRET,
};