import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | Strata Noble',
  description: 'Get in touch about pipeline infrastructure for your service business.',
};

/**
 * Contact Page - Pipeline-focused
 *
 * Simple, single-purpose contact page.
 * Primary CTA: Start Lead Rescue
 * Secondary: Direct contact methods
 */

const contactMethods = [
  {
    label: 'Phone',
    value: '(702) 721-3566',
    href: 'tel:+17027213566',
  },
  {
    label: 'Email',
    value: 'contact@stratanoble.com',
    href: 'mailto:contact@stratanoble.com',
  },
  {
    label: 'Location',
    value: 'Las Vegas, NV',
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero - Simple, pipeline focused */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to fix your pipeline?
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Most leads die in the follow-up gap. We close it in 48 hours.
          </p>
          <Link
            href="/lead-rescue"
            className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
          >
            Start the 48-Hour Lead Rescue
          </Link>
        </div>
      </section>

      {/* Contact Methods - Simple grid */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-12">
            Or reach us directly
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method) => (
              <div key={method.label} className="text-center">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {method.label}
                </h3>
                {method.href ? (
                  <a
                    href={method.href}
                    className="text-lg font-medium text-navy hover:text-emerald-600 transition-colors"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-navy">{method.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">
            Need more than a quick fix?
          </h2>
          <p className="text-gray-600 mb-8">
            The 21-Day Pipeline Buildout installs complete intake, follow-up automation, and deal tracking infrastructure.
          </p>
          <Link
            href="/phase-3"
            className="inline-flex items-center border-2 border-navy text-navy px-8 py-4 rounded-lg font-semibold hover:bg-navy hover:text-white transition-all"
          >
            Apply for Pipeline Buildout
          </Link>
        </div>
      </section>
    </main>
  );
}
