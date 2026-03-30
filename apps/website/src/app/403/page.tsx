import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '403 - Access Forbidden | Strata Noble',
  description: 'You do not have permission to access this resource'
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void/30 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Forbidden</h2>
          <p className="text-gray-600 mb-8">
            You do not have permission to access this resource. This area is restricted to administrators only.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Home
          </Link>
          <Link
            href="/auth/signin"
            className="block w-full bg-void/40 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Sign In with Different Account
          </Link>
        </div>

        <div className="mt-8 text-sm text-slate-grey">
          <p>If you believe you should have access to this area, please contact your system administrator.</p>
        </div>
      </div>
    </div>
  );
}
