import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Strata Noble',
  description: 'We build lead-to-customer pipelines for service businesses. No fluff. Just systems that work.',
};

export default function AboutPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">About Strata Noble</h1>

        {/* What We Build */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold">What We Build</h2>
          <p className="text-lg text-muted-foreground mt-4">
            Lead-to-customer pipelines. We install intake systems, follow-up automation,
            and progress tracking for service businesses. No branding. No websites.
            Just the infrastructure that turns leads into customers.
          </p>
        </div>

        {/* Who We Serve */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Who We Serve</h2>
          <ul className="mt-4 space-y-3 text-lg text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              Service businesses with leads but no system
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              Operators who know they're losing deals in follow-up
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              Teams ready for process, not just more leads
            </li>
          </ul>
        </div>

        {/* How We Work */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold">How We Work</h2>
          <div className="mt-4 grid gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium">1. Scoped Engagements</h3>
              <p className="text-muted-foreground mt-1">
                48-hour rescues or 21-day buildouts. Clear deliverables, fixed timelines.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium">2. Manual-First</h3>
              <p className="text-muted-foreground mt-1">
                We build with proven tools today. Automation layer ships later.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium">3. Built in Public</h3>
              <p className="text-muted-foreground mt-1">
                Track our platform development. Early clients get priority migration.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-xl text-center">
          <h2 className="text-2xl font-bold">Ready to Stop Losing Leads?</h2>
          <p className="text-muted-foreground mt-2">
            Start with a 48-hour rescue or apply for the full buildout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link href="/lead-rescue" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold">
              Get the Lead Rescue
            </Link>
            <Link href="/phase-3" className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold">
              Apply for Phase 3
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
