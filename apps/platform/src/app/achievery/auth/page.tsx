'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AchieveryAuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function handleAuth() {
      try {
        // Check if user is already authenticated in Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setStatus('error');
          setErrorMessage('Authentication failed. Please try again.');
          return;
        }

        if (session) {
          // User is authenticated, redirect to ACHIEVERY
          setStatus('redirecting');
          
          // Check if running locally or in production
          const achieveryUrl = process.env.NEXT_PUBLIC_ACHIEVERY_URL || 'http://localhost:5173';
          
          // Create a secure token for ACHIEVERY
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          
          if (refreshedSession) {
            // Redirect to ACHIEVERY with authentication token
            window.location.href = `${achieveryUrl}?token=${refreshedSession.access_token}`;
          } else {
            // If no session, redirect to ACHIEVERY login
            window.location.href = achieveryUrl;
          }
        } else {
          // No session, redirect to platform login or show login form
          setStatus('error');
          setErrorMessage('Please sign in to access ACHIEVERY. You need to be authenticated first.');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
        <div className="text-center">
          {/* Logo/Brand */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">ACHIEVERY</h1>
            <p className="text-white/70">by StrataNoble</p>
          </div>

          {/* Status Messages */}
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
              <p className="text-white">Authenticating...</p>
              <p className="text-white/60 text-sm">
                Connecting to ACHIEVERY platform
              </p>
            </div>
          )}

          {status === 'redirecting' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg 
                  className="w-12 h-12 text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <p className="text-white">Authentication successful!</p>
              <p className="text-white/60 text-sm">
                Redirecting to ACHIEVERY...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg 
                  className="w-12 h-12 text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <p className="text-white">{errorMessage}</p>
              <div className="space-y-2 mt-6">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="w-full bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                >
                  Back to StrataNoble
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/60 text-xs text-center">
            Having trouble? Contact support@stratabole.com
          </p>
        </div>
      </div>
    </div>
  );
}