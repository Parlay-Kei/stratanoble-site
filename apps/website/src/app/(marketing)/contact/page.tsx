import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | Strata Noble',
  description:
    'Reach Strata Noble for an AI Fit Call, AI Operations Review, First AI Workday Setup, expansion, or quarterly tune-up.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | Strata Noble',
    description: 'Practical AI setup for owner-led professional firms. Get in touch.',
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
    title: 'I want to know if AI fits',
    description: 'AI Fit Call: a short check for one frequent, reviewable office task.',
    href: '/contact?service=ai-fit-call',
  },
  {
    title: 'I need the best place to start',
    description: 'AI Operations Review: process map, risk notes, and one fixed-scope setup recommendation.',
    href: '/contact?service=ai-operations-review',
  },
  {
    title: 'I want one routine set up',
    description: 'First AI Workday Setup: one useful routine built, tested, taught, and handed over.',
    href: '/contact?service=first-ai-workday-setup',
  },
  {
    title: 'We already have one working',
    description: 'Expansion or Tune-Up: add the next routine or improve the one already in use.',
    href: '/contact?service=ai-workday-expansion',
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
    label: 'AI Fit Call',
    nextStep: 'Legacy link. We will confirm whether one recurring office task is a fit for practical AI setup.',
  },
  'ai-fit-call': {
    label: 'AI Fit Call',
    nextStep: 'We will confirm whether one recurring office task is a fit for practical AI setup.',
  },
  'ai-operations-review': {
    label: 'AI Operations Review',
    nextStep: 'We will map one process, identify risks, and recommend the best first setup.',
  },
  'first-ai-workday-setup': {
    label: 'First AI Workday Setup',
    nextStep: 'We will confirm scope for one safe, human-reviewed AI-assisted routine.',
  },
  'ai-workday-expansion': {
    label: 'AI Workday Expansion',
    nextStep: 'We will discuss the next routine after the first setup is working.',
  },
  'quarterly-ai-tune-up': {
    label: 'Quarterly AI Tune-Up',
    nextStep: 'We will review adoption, update use rules, and scope one bounded improvement.',
  },
  'lead-rescue': {
    label: 'AI Operations Review',
    nextStep: 'Legacy link. We will route you to the new AI Operations Review path.',
  },
  'systems-audit': {
    label: 'AI Operations Review',
    nextStep: 'Legacy link. We will route you to the new AI Operations Review path.',
  },
  'pipeline-buildout': {
    label: 'First AI Workday Setup',
    nextStep: 'Legacy link. We will route you to the new First AI Workday Setup path.',
  },
  'operations-buildout': {
    label: 'First AI Workday Setup',
    nextStep: 'Legacy link. We will route you to the new First AI Workday Setup path.',
  },
  'operations-command': {
    label: 'Quarterly AI Tune-Up',
    nextStep: 'Legacy link. We now keep recurring support bounded to a quarterly tune-up.',
  },
  'q-suite': {
    label: 'AI Workday Setup',
    nextStep: 'Legacy link. We will route you to the practical AI setup path.',
  },
  'achievery-pro': {
    label: 'AI Operations Review',
    nextStep: 'Legacy link. We will route you to the AI Operations Review path.',
  },
  'process-improvement-sprint': {
    label: 'First AI Workday Setup',
    nextStep: 'Tell us which repeated office task is piling up. We will confirm whether it fits one AI-assisted routine.',
  },
  'business-systems-audit': {
    label: 'AI Operations Review',
    nextStep: 'Legacy link. We will route you to the AI Operations Review path.',
  },
  'business-systems-intake': {
    label: 'AI Fit Call',
    nextStep: 'Legacy link. We will confirm whether one recurring office task is a fit for practical AI setup.',
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
            Tell us about the repeated office work your team has to rewrite, search for, summarize,
            organize, or chase every week.
          </p>
          <Link
            href="/contact?service=ai-fit-call"
            className="inline-flex items-center bg-forest-green text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
          >
            Start with an AI Fit Call
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
                <span className="inline-block mt-4 text-sm font-semibold text-primary">Continue -&gt;</span>
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
            Review the AI Operations Review, First AI Workday Setup, expansion path, and Quarterly AI Tune-Up.
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

