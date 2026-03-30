import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | Strata Noble',
  description:
    'Reach Strata Noble for Lead Rescue, pipeline buildout, Q SUITE licensing, Operations Command, or a general inquiry — phone, email, or start with a diagnostic.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | Strata Noble',
    description: 'Operational infrastructure, Q SUITE, and consulting — get in touch.',
    url: '/contact',
  },
};

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

const engagementPaths = [
  {
    title: 'My leads are leaking',
    description: '48-hour intake and follow-up fix with ProofLoop receipts.',
    href: '/lead-rescue',
  },
  {
    title: 'I need a full system',
    description: '21-day pipeline buildout — intake through revenue visibility.',
    href: '/pipeline-buildout',
  },
  {
    title: 'I want ongoing support',
    description: 'Operations Command — weekly rhythm and continuous tuning.',
    href: '/contact?service=operations-command',
  },
  {
    title: 'Tell me about Q SUITE',
    description: 'Modular operational control — five modules, clear licensing.',
    href: '/q-suite',
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-command-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Get in touch</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you need a quick pipeline fix, a full system install, or want to discuss how Q SUITE fits your
            operation — start here.
          </p>
          <Link
            href="/lead-rescue"
            className="inline-flex items-center bg-forest-green text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
          >
            Start with the Free Diagnostic
          </Link>
        </div>
      </section>

      <section className="py-16 border-b border-slate-grey/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-command-navy text-center mb-4">How can we help?</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pick the path that matches where you are — you can always reach us by phone or email below.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {engagementPaths.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="block rounded-xl border border-slate-grey/25 p-6 hover:border-forest-green/40 hover:shadow-md transition-all bg-white"
              >
                <h3 className="text-lg font-semibold text-command-navy mb-2">{path.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{path.description}</p>
                <span className="inline-block mt-4 text-sm font-semibold text-primary">Continue →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-command-navy text-center mb-12">Or reach us directly</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method) => (
              <div key={method.label} className="text-center">
                <h3 className="text-sm font-semibold text-slate-grey uppercase tracking-wide mb-2">{method.label}</h3>
                {method.href ? (
                  <a
                    href={method.href}
                    className="text-lg font-medium text-command-navy hover:text-forest-green transition-colors"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-command-navy">{method.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-void/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-command-navy mb-4">Compare every engagement</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Lead Rescue, Pipeline Buildout, Operations Command, and how Q SUITE fits — all in one place.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center border-2 border-command-navy text-command-navy px-8 py-4 rounded-lg font-semibold hover:bg-command-navy hover:text-white transition-all"
          >
            See all engagement options
          </Link>
        </div>
      </section>
    </main>
  );
}
