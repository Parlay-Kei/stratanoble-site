'use client'

import { signIn, getSession, getProviders } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from '@strata-noble/ui';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Logo } from '@/components/Logo';

function SignUpContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Record<string, any> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
        return;
      }
      try {
        const prov = await getProviders();
        setProviders(prov || {});
      } catch {}
      const err = searchParams?.get('error');
      if (err) {
        const messages: Record<string, string> = {
          OAuthSignin: 'Could not start Google sign-up. Please try again.',
          OAuthCallback: 'Google sign-up cancelled or misconfigured.',
          Configuration: 'Auth is not configured correctly.',
          EmailSignin: 'Email sign-up is currently unavailable.',
          Verification: 'We could not send the verification email.',
        };
        setError(messages[err] || 'An unexpected error occurred. Please try again.');
      }
    };
    init();
  }, [router, callbackUrl]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to send sign-up email. Please try again.');
      } else {
        router.push('/auth/verify-request?email=' + encodeURIComponent(email));
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Logo className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          <CardDescription>
            Join Strata Noble to access the ACHIEVERY platform and start building your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Google OAuth */}
          {providers?.google && (
            <Button
              onClick={handleGoogleSignUp}
              disabled={loading}
              variant="outline"
              className="w-full flex items-center gap-3"
            >
              <FcGoogle size={20} />
              Continue with Google
            </Button>
          )}

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have a Google account?{' '}
              <a href="/contact" className="text-primary hover:underline font-medium">
                Contact us
              </a>{' '}
              for alternative signup options.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-3">
            <p>
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
            <p>
              Already have an account?{' '}
              <a href="/auth/signin" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthSignupPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <Logo className="h-16 w-auto" />
            </div>
            <div className="animate-pulse">Loading...</div>
          </CardHeader>
        </Card>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
