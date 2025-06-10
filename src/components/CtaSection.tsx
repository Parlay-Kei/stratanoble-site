import { ArrowUpRight } from 'lucide-react';

export const CtaSection = () => {
  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-br from-[#003366] to-[#002244] text-white"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Let's Turn Your Idea Into Impact</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
          Take the first step toward building a sustainable, profitable business that aligns with
          your vision.
        </p>
        <a
          href="#"
          className="inline-block bg-[#50C878] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-[#50C878]/20 text-lg flex items-center justify-center mx-auto"
          style={{
            maxWidth: '300px',
          }}
        >
          Schedule Your Free Discovery Call
          <ArrowUpRight className="w-5 h-5 ml-2" />
        </a>
      </div>
    </section>
  );
};
