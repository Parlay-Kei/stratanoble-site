// Global TypeScript declarations
import { DefaultSession, DefaultUser } from 'next-auth';

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      parameters: Record<string, unknown>
    ) => void;
  }
}

// NextAuth type extensions
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      tier?: string;
      stripeCustomerId?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    tier?: string;
    stripeCustomerId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    tier?: string;
    stripeCustomerId?: string;
  }
}

export {};