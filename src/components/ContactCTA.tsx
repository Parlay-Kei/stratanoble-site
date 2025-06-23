import { buttonVariants } from '@/lib/ui';
import { workshops } from '../data/workshops';

const ContactCTA = () => (
  <section className="py-20 md:py-24 bg-gradient-to-br from-background to-white">
    <div className="container mx-auto px-4 flex justify-center">
      <div className="bg-white rounded-xl shadow-card p-10 max-w-xl w-full flex flex-col items-center text-center border border-accent/40">
        <h2 className="font-headings text-2xl md:text-3xl font-bold text-primary mb-4">
          Let's Build Something That Works
        </h2>
        <p className="text-primary/80 mb-8 text-lg">
          Not ready? <a href="/workshops" className="text-highlight font-medium underline hover:text-cta transition-colors">Start with a workshop.</a>
        </p>
        <form
          className="w-full flex flex-col sm:flex-row gap-4 justify-center"
          action="mailto:hello@stratanoble.com"
          method="POST"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Your email address"
            className="input flex-1 min-w-0"
            aria-label="Your email address"
          />
          <button
            type="submit"
            className={buttonVariants({
              variant: 'cta',
              size: 'lg',
              className: 'font-bold px-8 py-3',
            })}
          >
            Get in Touch
          </button>
        </form>
        <div className="mt-6">
          <a href="/booking" className="text-primary/70 underline hover:text-highlight font-medium transition-colors">
            Or book a call
          </a>
        </div>
        <div className="mt-10 w-full">
          <h3 className="font-headings text-lg font-semibold text-primary mb-4 text-left">Upcoming Workshops</h3>
          <div className="flex flex-col gap-4">
            {workshops.slice(0, 2).map((workshop) => (
              <div key={workshop.title} className="bg-accent/20 rounded-lg p-4 text-left">
                <div className="text-sm text-primary/70 mb-1">{new Date(workshop.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="font-headings text-base font-bold text-primary mb-1">{workshop.title}</div>
                <div className="text-primary/80 mb-2 text-sm">{workshop.description}</div>
                <a href={workshop.link} className="text-cta font-medium hover:underline hover:text-highlight transition-colors text-sm">Learn More →</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ContactCTA; 