import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resources | Strata Noble',
  description: 'Free templates and guides to improve your lead capture and follow-up process.',
};

const resources = [
  {
    id: 'discovery-scorecard',
    title: 'Discovery Call Scorecard',
    description: 'Rate your discovery calls and identify gaps in your qualification process.',
    format: 'PDF',
    gated: false,
    downloadUrl: '/downloads/discovery-call-scorecard.pdf',
  },
  {
    id: 'follow-up-sequence',
    title: 'Follow-up Email Sequence',
    description: 'Three proven emails to nurture leads without being pushy.',
    format: '3 Emails',
    gated: true, // requires email
  },
  {
    id: 'pipeline-template',
    title: 'Pipeline Tracking Template',
    description: 'Notion or Airtable template to track every lead from first touch to close.',
    format: 'Template',
    gated: false,
    downloadUrl: 'https://notion.so/template-link',
  },
];

export default function ResourcesPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Resources</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Free tools to help you stop losing leads and start closing more deals.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} {...resource} />
        ))}
      </div>

      {/* CTA */}
      <section className="text-center mt-16">
        <p className="text-muted-foreground">
          Want more than templates?
        </p>
        <Link href="/lead-rescue" className="text-primary font-semibold hover:underline">
          Get the 48-Hour Lead Rescue →
        </Link>
      </section>
    </main>
  );
}

function ResourceCard({ title, description, format, gated, downloadUrl, id }: typeof resources[0]) {
  return (
    <div className="border rounded-xl p-6 flex flex-col">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {format}
      </span>
      <h3 className="text-lg font-semibold mt-2">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 flex-grow">{description}</p>

      {gated ? (
        <ResourceGateForm resourceId={id} />
      ) : (
        <a
          href={downloadUrl}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
          download
        >
          Download Free
        </a>
      )}
    </div>
  );
}

function ResourceGateForm({ resourceId }: { resourceId: string }) {
  // Simple email gate - submits to /api/intake/resource-download
  return (
    <form className="mt-4 space-y-2">
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-3 py-2 border rounded-lg text-sm"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
      >
        Get Access
      </button>
    </form>
  );
}
