'use client'

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the authentication configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link is invalid or has expired.',
  Default: 'An unexpected error occurred during authentication.',
};

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Default';

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/auth/signin')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            If this problem persists, please{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}