import React from 'react';

export const dynamic = 'force-dynamic';


export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-command-navy mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Strata Noble's services, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily access the materials (information or software) on Strata Noble's
              platform for personal, non-commercial transitory viewing only.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on Strata Noble's platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">3. Account Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the security of your account and password. Strata Noble
              cannot and will not be liable for any loss or damage from your failure to comply with this
              security obligation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">4. Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Subscription fees are charged in advance on a monthly or annual basis. All fees are non-refundable
              except as required by law. We reserve the right to change pricing with 30 days notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">5. Cancellation and Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              You are solely responsible for properly canceling your account. You can cancel your subscription
              at any time through your account settings. Upon cancellation, your access will continue until
              the end of your current billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The platform and its original content, features, and functionality are owned by Strata Noble
              and are protected by international copyright, trademark, patent, trade secret, and other
              intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Strata Noble shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">8. Third-Party Platform Integrations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Strata Noble operates <strong>Strata Noble Publisher</strong>, an internal content publishing
              application used to distribute operational and consulting content to third-party social media
              platforms, including TikTok, via their respective APIs (e.g., the TikTok Content Posting API).
              Use of Strata Noble Publisher is governed by these Terms of Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By authorizing Strata Noble Publisher to connect to a third-party platform, you grant Strata Noble
              permission to publish content on your behalf using only the scopes you have explicitly approved.
              You may revoke this authorization at any time through the relevant platform&apos;s account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-command-navy mb-4">9. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@stratanoble.com" className="text-forest-green hover:text-forest-green">
                legal@stratanoble.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
