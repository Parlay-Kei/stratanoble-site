import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Platform Roadmap | Built in Public | Strata Noble',
  description: 'Track the Strata Noble platform development. See what\'s shipped, what\'s next, and what you get access to as an early client.',
};

const phases = [
  {
    phase: 0,
    title: 'Foundation',
    status: 'complete' as const,
    items: ['Lead intake forms', 'Basic CRM integration', 'Email notifications'],
  },
  {
    phase: 1,
    title: 'Core Pipeline',
    status: 'complete' as const,
    items: ['Lead scoring', 'Follow-up sequences', 'Progress tracking'],
  },
  {
    phase: 2,
    title: 'Dashboard',
    status: 'complete' as const,
    items: ['Milestone visibility', 'Pipeline analytics', 'Team collaboration'],
  },
  {
    phase: 3,
    title: 'Automation Layer',
    status: 'in-progress' as const,
    items: ['Zapier alternative', 'Custom workflows', 'Trigger automation'],
  },
  {
    phase: 4,
    title: 'AI Enhancement',
    status: 'planned' as const,
    items: ['Smart lead routing', 'Response suggestions', 'Pattern detection'],
  },
  {
    phase: 5,
    title: 'Scale Features',
    status: 'planned' as const,
    items: ['Multi-team support', 'Advanced permissions', 'White-label option'],
  },
  {
    phase: 6,
    title: 'Integration Hub',
    status: 'planned' as const,
    items: ['Native integrations', 'API access', 'Webhook management'],
  },
  {
    phase: 7,
    title: 'Enterprise',
    status: 'planned' as const,
    items: ['Custom deployment', 'SLA guarantees', 'Dedicated support'],
  },
];

export default function PlatformPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          Built in Public
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-2">
          Platform Roadmap
        </h1>
        <p className="text-xl text-muted-foreground mt-4">
          We're building the automation layer in the open. Here's what's shipped,
          what we're working on, and what's coming.
        </p>
      </section>

      {/* What Clients Get Now vs Later */}
      <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-primary">What You Get Now</h2>
          <ul className="mt-4 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Manual-first pipeline installation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Working CRM + follow-up system
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Dashboard for pipeline visibility
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Priority migration when platform ships
            </li>
          </ul>
        </div>

        <div className="bg-muted/50 border rounded-xl p-6">
          <h2 className="text-xl font-semibold">What You Get Later</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span>→</span>
              Unified automation platform
            </li>
            <li className="flex items-start gap-2">
              <span>→</span>
              No-code workflow builder
            </li>
            <li className="flex items-start gap-2">
              <span>→</span>
              AI-powered insights
            </li>
            <li className="flex items-start gap-2">
              <span>→</span>
              Free migration from current tools
            </li>
          </ul>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Development Roadmap</h2>
        <div className="space-y-6">
          {phases.map((phase) => (
            <PhaseCard key={phase.phase} {...phase} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mt-16 py-12 bg-muted/30 rounded-xl">
        <h2 className="text-2xl font-bold">Ready to Start?</h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Don't wait for the platform. Get a working pipeline now and upgrade seamlessly later.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link href="/lead-rescue" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold">
            Get the 48-Hour Lead Rescue
          </Link>
          <Link href="/phase-3" className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold">
            Apply for Phase 3
          </Link>
        </div>
      </section>
    </main>
  );
}

function PhaseCard({ phase, title, status, items }: typeof phases[0]) {
  const statusStyles = {
    'complete': 'bg-green-100 text-green-800 border-green-200',
    'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'planned': 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const statusLabels = {
    'complete': 'Complete',
    'in-progress': 'In Progress',
    'planned': 'Planned',
  };

  return (
    <div className={`border rounded-lg p-6 ${status === 'complete' ? 'border-green-200 bg-green-50/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-muted-foreground">Phase {phase}</span>
          <h3 className="text-xl font-semibold mt-1">{title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <ul className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
            {status === 'complete' ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-muted-foreground/50">○</span>
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
