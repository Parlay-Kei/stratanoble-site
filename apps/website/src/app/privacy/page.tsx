import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Strata Noble',
  description: 'Privacy policy for Strata Noble - how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-brand-dark dark:text-white mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
          <p className="text-lg mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
              Information We Collect
            </h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Fill out our contact forms</li>
              <li>Schedule discovery calls</li>
              <li>Subscribe to our newsletter</li>
              <li>Engage with our services</li>
            </ul>
            <p>
              This may include your name, email address, phone number, company information, 
              and any other details you choose to provide.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
              How We Use Your Information
            </h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Respond to your inquiries and provide customer support</li>
              <li>Schedule and conduct discovery calls</li>
              <li>Send you relevant business information and updates</li>
              <li>Improve our services and website</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
              Information Sharing
            </h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share your information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>With service providers who assist us in operating our business</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
              Data Security
            </h2>
            <p>
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
              Your Rights
            </h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access and update your personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a 
                href="mailto:contact@stratanoble.com" 
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                contact@stratanoble.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
