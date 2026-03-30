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

function SignInContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      } catch { setError('Authentication is unavailable. Please try again later.'); }
      const err = searchParams?.get('error');
      if (err) {
        const messages: Record<string, string> = {
          OAuthSignin: 'Could not start Google sign-in. Please try again.',
          OAuthCallback: 'Google sign-in cancelled or misconfigured.',
          Configuration: 'Auth is not configured correctly.',
          EmailSignin: 'Email sign-in is currently unavailable.',
          Verification: 'We could not send the verification email.',
        };
        setError(messages[err] || 'An unexpected error occurred. Please try again.');
      }
    };
    init();
  }, [router, callbackUrl]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
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
        setError('Failed to send sign-in email. Please try again.');
      } else {
        router.push('/auth/verify-request?email=' + encodeURIComponent(email));
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
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
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Strata Noble account to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Google Sign In */}
          {providers?.google ? (
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full flex items-center gap-3"
            >
              <FcGoogle size={20} />
              Continue with Google
            </Button>
          ) : (
            <div className="w-full">
              <Button
                variant="outline"
                disabled
                className="w-full flex items-center gap-3 opacity-60"
                title="Google sign-in is not available right now"
              >
                <FcGoogle size={20} />
                Google sign-in unavailable
              </Button>
            </div>
          )}

          {providers?.credentials || providers?.email ? (
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-muted-foreground">or</span>
              </div>
            </div>
          ) : null}

          {/* Dev Login (Credentials) */}
          {providers?.credentials && (
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="dev-email" className="text-sm font-medium">
                  Dev Login Email
                </label>
                <Input
                  id="dev-email"
                  type="email"
                  placeholder="Enter any email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dev-password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="dev-password"
                  type="password"
                  placeholder="Enter 'dev'"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full flex items-center gap-2"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in (Dev)
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Email Sign In */}
          {providers?.email && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full flex items-center gap-2"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Continue with Email
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
          )}

          {!providers?.credentials && !providers?.email && !providers?.google && (
            <div className="text-sm text-muted-foreground text-center">
              No sign-in methods are currently available. Please contact support.
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground space-y-3">
            <p>
              By continuing, you agree to our{' '}
              <a href="/legal/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/legal/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
            <p>
              Don't have an account?{' '}
              <a href="/auth/signup" className="text-primary hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthSigninPageClient() {
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
      <SignInContent />
    </Suspense>
  );
}
