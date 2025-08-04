import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-r from-navy-600 to-emerald-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main CTA Content */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6">
            Ready to Turn Your <span className="text-emerald-200">Passion</span> Into{' '}
            <span className="text-emerald-200">Profit</span>?
          </h2>

          <p className="text-xl leading-8 text-navy-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of entrepreneurs who have transformed their ideas into thriving businesses
            with our proven strategies and expert guidance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="btn bg-white text-navy-900 hover:bg-silver-100 btn-lg group"
            >
              Start Your Journey Today
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/case-studies"
              className="btn border-2 border-white text-white hover:bg-white hover:text-navy-900 btn-lg"
            >
              View Success Stories
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-navy-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>Free Strategy Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>No Long-term Commitments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>Proven Results</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16">
            <p className="text-sm text-navy-200 mb-4">Transforming passion into profit through strategic excellence</p>
          </div>
        </div>
      </div>
    </section>
  );
}
