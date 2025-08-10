export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check your email
          </h1>
          
          <p className="text-gray-600 mb-6">
            A sign-in link has been sent to your email address. Click the link in your email to access your Strata Noble dashboard.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Pro tip:</strong> Check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          <p>The link will expire in 24 hours for security reasons.</p>
        </div>

        <div className="mt-6">
          <a 
            href="/auth/signin" 
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}