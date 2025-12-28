import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Studio | Strata Noble',
  description: 'Projects we\'ve built and systems we\'ve installed for operators.',
};

const projects = [
  {
    id: 'data-solutions-lv',
    title: 'Data Solutions LV',
    description: 'Voice AI cold calling system with OpenAI Realtime API integration.',
    demonstrates: 'AI voice automation, lead qualification, Twilio integration',
    status: 'Live' as const,
    link: null, // or URL
  },
  {
    id: 'pipeline-install-1',
    title: 'Service Business Pipeline',
    description: 'End-to-end lead capture and follow-up system for a local services company.',
    demonstrates: 'CRM setup, email automation, progress tracking',
    status: 'Complete' as const,
    link: null,
  },
  // Add more projects as needed
];

export default function StudioPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Studio</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Systems we've built. Problems we've solved.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>

      {/* CTA */}
      <section className="text-center mt-16 py-12 bg-muted/30 rounded-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold">Want to Be Next?</h2>
        <p className="text-muted-foreground mt-2">
          Let's build your lead-to-customer pipeline.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link href="/lead-rescue" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold">
            Start with Lead Rescue
          </Link>
        </div>
      </section>
    </main>
  );
}

function ProjectCard({ title, description, demonstrates, status, link }: typeof projects[0]) {
  const statusStyles = {
    'Live': 'bg-green-100 text-green-800',
    'Complete': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="border rounded-xl p-6 hover:border-primary/50 transition">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[status] || 'bg-gray-100'}`}>
          {status}
        </span>
      </div>
      <p className="text-muted-foreground">{description}</p>
      <div className="mt-4 pt-4 border-t">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Demonstrates
        </span>
        <p className="text-sm mt-1">{demonstrates}</p>
      </div>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-primary font-medium hover:underline">
          View Project →
        </a>
      ) : (
        <span className="mt-4 inline-block text-muted-foreground text-sm">
          Case study coming soon
        </span>
      )}
    </div>
  );
}
