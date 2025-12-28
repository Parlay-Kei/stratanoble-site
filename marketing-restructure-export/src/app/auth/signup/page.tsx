import { Metadata } from 'next';
import { AuthSignupPageClient } from '@/components/pages/AuthSignupPageClient';

export const metadata: Metadata = {
  title: 'AuthSignup | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function SignUp() {
  return <AuthSignupPageClient />;
}
