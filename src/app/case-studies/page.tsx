import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies - Coming Soon | Strata Noble',
  description: 'Our case studies section is currently being updated. Contact us to learn about our client success stories and transformative results.',
  openGraph: {
    title: 'Case Studies - Coming Soon | Strata Noble',
    description: 'Our case studies section is currently being updated. Contact us to learn about our client success stories.',
  },
};

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-2xl text-center">
        <div className="w-20 h-20 bg-[#50C878]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#50C878]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Case Studies Coming Soon
        </h1>
        
        <p className="text-[#C0C0C0] mb-8 text-lg leading-relaxed">
          We're currently updating our case studies section to showcase our latest client success stories and transformative results. 
          In the meantime, we'd love to discuss how we can help transform your business.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center text-[#C0C0C0]">
            <svg className="w-5 h-5 text-[#50C878] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Strategic Business Consulting
          </div>
          <div className="flex items-center justify-center text-[#C0C0C0]">
            <svg className="w-5 h-5 text-[#50C878] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Proven Business Frameworks
          </div>
          <div className="flex items-center justify-center text-[#C0C0C0]">
            <svg className="w-5 h-5 text-[#50C878] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Transformative Results
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className="bg-[#50C878] hover:bg-[#3DB067] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Contact Us
          </a>
          <a
            href="/services"
            className="bg-transparent border-2 border-white/30 hover:border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Services
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-sm text-[#C0C0C0]">
            Want to learn about our client results? 
            <a href="/contact" className="text-[#50C878] hover:text-[#3DB067] ml-1 underline">
              Get in touch
            </a> 
            {' '}and we'll share relevant success stories.
          </p>
        </div>
      </div>
    </main>
  );
}
