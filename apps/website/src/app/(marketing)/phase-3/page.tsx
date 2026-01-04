import { Metadata } from 'next';
import { Phase3ApplicationForm } from '@/components/forms/Phase3ApplicationForm';

export const metadata: Metadata = {
  title: 'Phase 3 Buildout | Strata Noble',
  description:
    'Get a complete lead-to-customer pipeline built in 21 days. CRM, email sequences, automations, and milestone tracking.',
  openGraph: {
    title: 'Phase 3 Buildout | Strata Noble',
    description:
      'Get a complete lead-to-customer pipeline built in 21 days. CRM, email sequences, automations, and milestone tracking.',
  },
};

export default function Phase3Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Phase 3: 21-Day Pipeline Buildout',
    description:
      'Complete lead-to-customer pipeline with CRM, email sequences, automations, and milestone tracking',
    provider: {
      '@type': 'Organization',
      name: 'Strata Noble',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto py-12 px-4">
        <section className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Phase 3: 21-Day Pipeline Buildout</h1>
          <p className="text-xl text-muted-foreground mt-4">
            We build your complete lead-to-customer system: CRM, email sequences, automations, and
            milestone dashboard. Manual-first, automated later.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8">
            <OutcomePromise />
            <DeliverablesSection />
            <TimelineSection />
            <ManualNowAutomationLater />
            <WhoItsFor />
            <Investment />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Apply for Phase 3</h2>
              <Phase3ApplicationForm />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <Phase3FAQ />

        {/* Bottom CTA */}
        <BottomCTA />
      </main>
    </>
  );
}

function OutcomePromise() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-3">The Outcome</h2>
      <p className="text-lg leading-relaxed">
        In 21 days, you'll have a working pipeline that captures every lead, follows up
        automatically, and shows you exactly where each deal stands.
      </p>
      <div className="mt-4 pt-4 border-t border-primary/20">
        <p className="text-sm text-muted-foreground">
          No more spreadsheet chaos. No more forgotten follow-ups. Just a system that works.
        </p>
      </div>
    </div>
  );
}

function DeliverablesSection() {
  const deliverables = [
    {
      title: 'Custom CRM Setup',
      description: 'Notion, Airtable, or HubSpot configured for your business',
    },
    {
      title: 'Email Sequences',
      description: 'Nurture and follow-up sequences with copy written for you',
    },
    {
      title: '2 Automation Workflows',
      description: 'Lead routing, task creation, or notification triggers',
    },
    {
      title: 'Milestone Tracking Dashboard',
      description: 'Visual pipeline showing where each deal stands',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Deliverables (Scope Capped)</h2>
      <div className="space-y-4">
        {deliverables.map((item, i) => (
          <div key={i} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold text-lg flex-shrink-0">{i + 1}</span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-amber-900">
          <strong>Scope is intentionally capped.</strong> We deliver these four things well, not 20
          things poorly. Need more? We can discuss add-ons after delivery.
        </p>
      </div>
    </div>
  );
}

function TimelineSection() {
  const weeks = [
    {
      week: 'Week 1',
      title: 'Discovery & Setup',
      tasks: ['Kickoff call', 'Tool selection', 'CRM structure design'],
    },
    {
      week: 'Week 2',
      title: 'Build & Configure',
      tasks: ['Email sequences', 'Automations', 'Dashboard setup'],
    },
    {
      week: 'Week 3',
      title: 'Test & Handoff',
      tasks: ['Test with real data', 'Documentation', 'Training walkthrough'],
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Timeline</h2>
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-3xl font-bold text-primary">21 Days</p>
        <p className="text-muted-foreground mt-1">From kickoff to working pipeline</p>
      </div>
      <div className="space-y-3 mt-4">
        {weeks.map((week, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-primary">{week.week}</span>
              <span className="font-semibold">→ {week.title}</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {week.tasks.map((task, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualNowAutomationLater() {
  return (
    <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-blue-900">Manual Now, Automated Later</h2>
      <p className="text-blue-900">
        We deliver working systems using proven tools (Notion, Zapier, etc.) today. As the Strata
        Noble platform ships, we migrate your workflows into the unified automation layer—no extra
        cost, no disruption.
      </p>
      <div className="bg-white rounded-md p-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Translation:</strong> You get results now. We handle the upgrade path. You don't
          pay twice.
        </p>
      </div>
    </div>
  );
}

function WhoItsFor() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Who This Is For</h2>
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>Service businesses getting 10+ leads per month</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>Teams ready to invest in systems, not just tactics</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>Operators who know their close process but lack the infrastructure</span>
        </li>
      </ul>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3">Who This Is NOT For</h3>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>Businesses with less than 10 leads/month (try Lead Rescue instead)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>Teams that need branding, website, or content work first</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>Anyone looking for ongoing marketing retainers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Investment() {
  return (
    <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
      <h2 className="text-2xl font-semibold mb-3">Investment</h2>
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">Starting at</span>
        <p className="text-3xl font-bold text-primary">$4,997</p>
      </div>
      <p className="text-sm text-muted-foreground mt-2">One-time fee. No recurring costs.</p>
      <div className="mt-4 pt-4 border-t border-primary/20">
        <p className="text-sm font-semibold mb-2">What's included:</p>
        <ul className="text-sm space-y-1.5 text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>Complete CRM setup & configuration</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>Email sequences with custom copy</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>2 automation workflows</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>Milestone tracking dashboard</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>Documentation & training</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>Future platform migration (when available)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Phase3FAQ() {
  const faqs = [
    {
      q: 'What if I need more than 2 automations?',
      a: 'We can discuss add-ons, but the base scope is intentionally capped to ensure quality delivery. Most businesses need to nail the basics before scaling complexity.',
    },
    {
      q: 'What access do you need?',
      a: "We'll need admin access to your CRM/database and email tool. We provide setup guides and can work with whatever tools you're already using (or recommend new ones).",
    },
    {
      q: 'What tools do you work with?',
      a: "Most common: Notion, Airtable, HubSpot, Zapier, Make, Mailchimp, ConvertKit. If you have a unique setup, we'll discuss compatibility on the kickoff call.",
    },
    {
      q: 'Do you write the email copy?',
      a: 'Yes. We write all email sequences based on your offer, voice, and customer journey. You review and approve before we connect them to the automation.',
    },
    {
      q: "What don't you do?",
      a: "We don't do branding, website design, or content creation. This is pure pipeline infrastructure—the system that turns leads into customers.",
    },
    {
      q: 'What happens after the 21 days?',
      a: "You own the system. We provide full documentation and training. If you need ongoing support, we can discuss a support package, but it's not required.",
    },
    {
      q: 'How is this different from Lead Rescue?',
      a: "Lead Rescue is a 48-hour sprint focused on lead capture. Phase 3 is a 21-day buildout that includes CRM, automations, and a complete pipeline. If you're just starting, go with Lead Rescue. If you're ready to scale, Phase 3 is the move.",
    },
  ];

  return (
    <section className="max-w-3xl mx-auto mt-20">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="border rounded-lg p-4 hover:border-primary/50 transition-colors group"
          >
            <summary className="font-medium cursor-pointer flex items-center justify-between">
              <span>{faq.q}</span>
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-muted-foreground leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="max-w-2xl mx-auto mt-20 text-center bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-4">Ready to Build Your Pipeline?</h2>
      <p className="text-muted-foreground mb-6">
        Fill out the application above and we'll schedule a strategy call within 48 hours to
        discuss your business and confirm fit.
      </p>
      <a
        href="#top"
        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
      >
        Apply for Phase 3
      </a>
    </section>
  );
}
