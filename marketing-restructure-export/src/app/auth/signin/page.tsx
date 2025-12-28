import { Metadata } from 'next';
import { AuthSigninPageClient } from '@/components/pages/AuthSigninPageClient';

export const metadata: Metadata = {
  title: 'AuthSignin | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function SignIn() {
  return <AuthSigninPageClient />;
}
