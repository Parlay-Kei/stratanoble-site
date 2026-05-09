import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | Strata Noble',
  description:
    'Reach Strata Noble for Systems Audit, Operations Buildout, Q SUITE licensing, Operations Command, ACHIEVERY, or a general inquiry. Phone, email, or start with a diagnostic.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | Strata Noble',
    description: 'Digital infrastructure, Q SUITE, and consulting. Get in touch.',
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
    title: 'I need clarity fast',
    description: 'Systems Audit: scoped fixes with ProofLoop receipts (typically 48 to 72 hours).',
    href: '/systems-audit',
  },
  {
    title: 'I need a full install',
    description: 'Operations Buildout: 21-day operational infrastructure with training and handoff.',
    href: '/operations-buildout',
  },
  {
    title: 'I want ongoing support',
    description: 'Operations Command: weekly rhythm and continuous tuning.',
    href: '/contact?service=operations-command',
  },
  {
    title: 'Tell me about Q SUITE',
    description: 'Five business modules, clear licensing, installed through consulting.',
    href: '/q-suite',
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ service?: string }>;
}) {
  const params = await searchParams
  return <ContactPageContent searchParams={params} />;
}

const SERVICE_INTENT: Record<string, { label: string; nextStep: string }> = {
  diagnostic: {
    label: 'Free Diagnostic',
    nextStep: 'We will confirm fit and recommend Systems Audit, a Sprint, or Operations Buildout.',
  },
  'lead-rescue': {
    label: 'Systems Audit',
    nextStep: 'Legacy link. Use the Systems Audit intake to begin the scoped audit window.',
  },
  'systems-audit': {
    label: 'Systems Audit',
    nextStep: 'Use the Systems Audit intake to begin the scoped audit window.',
  },
  'pipeline-buildout': {
    label: 'Operations Buildout',
    nextStep: 'Apply for the 21-day operational infrastructure install.',
  },
  'operations-buildout': {
    label: 'Operations Buildout',
    nextStep: 'Apply for the 21-day operational infrastructure install.',
  },
  'operations-command': {
    label: 'Operations Command',
    nextStep: 'Request an operations fit review for ongoing support.',
  },
  'q-suite': {
    label: 'Q SUITE',
    nextStep: 'Request a walkthrough and licensing discussion.',
  },
  'achievery-pro': {
    label: 'ACHIEVERY Pro',
    nextStep: 'Share your use case and we will route you to the right product path.',
  },
  'process-improvement-sprint': {
    label: 'Process Improvement Sprint',
    nextStep: 'Tell us which single process is broken. We will confirm scope for the 10-day sprint.',
  },
};

function ContactPageContent({
  searchParams,
}: {
  searchParams?: { service?: string };
}) {
  const intent = searchParams?.service ? SERVICE_INTENT[searchParams.service] : null;

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-command-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Get in touch</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you need a scoped audit, a full buildout, or want to discuss how Q SUITE fits your operation,
            start here.
          </p>
          <Link
            href="/contact?service=diagnostic"
            className="inline-flex items-center bg-forest-green text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
          >
            Start with the Free Diagnostic
          </Link>
          {intent && (
            <div className="mt-6 inline-flex flex-col rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-left text-sm">
              <span className="font-semibold text-white">Selected path: {intent.label}</span>
              <span className="text-gray-200">{intent.nextStep}</span>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 border-b border-slate-grey/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-command-navy text-center mb-4">How can we help?</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pick the path that matches where you are. You can always reach us by phone or email below.
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
            Systems Audit, Process Improvement Sprint, Operations Buildout, Operations Command, and Q SUITE, all in one place.
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
