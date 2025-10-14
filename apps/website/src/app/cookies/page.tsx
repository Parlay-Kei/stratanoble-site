import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-navy-900 mb-8">Cookie Policy</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. They help us
              provide you with a better experience by remembering your preferences and understanding how you use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Track your browsing habits to deliver relevant advertisements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">Types of Cookies We Use</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-navy-800 mb-2">Session Cookies</h3>
              <p className="text-gray-700 leading-relaxed">
                Temporary cookies that expire when you close your browser. Used for authentication and navigation.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-navy-800 mb-2">Persistent Cookies</h3>
              <p className="text-gray-700 leading-relaxed">
                Remain on your device for a set period. Used to remember your preferences across visits.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-navy-800 mb-2">Third-Party Cookies</h3>
              <p className="text-gray-700 leading-relaxed">
                Set by external services we use, such as analytics providers (Google Analytics) and payment processors (Stripe).
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or delete existing ones</li>
              <li><strong>Opt-Out Tools:</strong> Many advertising networks provide opt-out mechanisms</li>
              <li><strong>Cookie Preferences:</strong> Use our cookie preference center to customize your settings</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Note: Disabling certain cookies may impact the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">Cookie Duration</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b">Cookie Type</th>
                    <th className="px-4 py-2 text-left border-b">Duration</th>
                    <th className="px-4 py-2 text-left border-b">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">Authentication</td>
                    <td className="px-4 py-2 border-b">Session</td>
                    <td className="px-4 py-2 border-b">Keep you logged in</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Preferences</td>
                    <td className="px-4 py-2 border-b">1 year</td>
                    <td className="px-4 py-2 border-b">Remember settings</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">Analytics</td>
                    <td className="px-4 py-2 border-b">2 years</td>
                    <td className="px-4 py-2 border-b">Understand usage patterns</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting
              the new policy on this page with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@stratanoble.com" className="text-emerald-600 hover:text-emerald-700">
                privacy@stratanoble.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
