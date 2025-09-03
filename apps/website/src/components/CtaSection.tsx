import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { CTA_LABELS } from '@/lib/cta-labels';

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-r from-accent-red to-navy-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          {/* Market Reality Header */}
          <div className="mb-8">
            <div className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/30 mb-4">
              ⏰ The Market Won't Wait
            </div>
          </div>

          {/* Revolutionary CTA Content */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6">
            The Question Isn't <span className="text-orange-200">If</span> the Market Will Change...
          </h2>

          <p className="text-xl leading-8 text-orange-100 mb-10 max-w-3xl mx-auto">
            It's whether you'll be prepared when it does. While others wait and hope, you can build 
            the AI skills and systems that create your own opportunities.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/contact?utm_source=cta_primary"
              className="btn bg-white text-accent-red hover:bg-orange-50 btn-lg group shadow-xl hover:shadow-2xl"
            >
              Don't Wait - Start Building Now
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact?utm_source=cta_secondary&type=consultation"
              className="btn border-2 border-white text-white hover:bg-white hover:text-accent-red btn-lg"
            >
              Get Free Market Analysis
            </Link>
          </div>

          {/* Market-Focused Trust Indicators */}
          <div className="mb-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-orange-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-300"></div>
              <span>AI Skills Training</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-300"></div>
              <span>Market Intelligence Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-300"></div>
              <span>Income Generation Systems</span>
            </div>
          </div>

          {/* Urgency-Driven Social Proof */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white mb-1">2,400+</div>
                <div className="text-sm text-orange-200">Professionals Learning AI</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">$2,800</div>
                <div className="text-sm text-orange-200">Average Monthly Income Increase</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">96%</div>
                <div className="text-sm text-orange-200">Success Rate</div>
              </div>
            </div>
            <p className="text-sm text-orange-100 mt-6 font-medium">
              While 78% of professionals are unprepared for AI disruption, our community is building the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
