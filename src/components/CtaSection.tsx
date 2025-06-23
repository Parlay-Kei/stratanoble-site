import { ArrowUpRight } from 'lucide-react';

export const CtaSection = () => {
  return (
    <section id="contact" className="py-20 bg-accent text-background">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Let&apos;s Build Something Worthy of Legacy.
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
          Take the first step toward building a sustainable, profitable business that aligns with
          your vision.
        </p>
        <a
          href="/contact"
          className="inline-block bg-primary hover:bg-primary/90 text-background px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 text-lg flex items-center justify-center mx-auto"
          style={{
            maxWidth: '300px',
          }}
        >
          Book a Free Strategy Call
          <ArrowUpRight className="w-5 h-5 ml-2" />
        </a>
      </div>
    </section>
  );
};
