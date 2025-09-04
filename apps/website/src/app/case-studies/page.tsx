import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Case Studies | Strata Noble',
  description: 'Explore our case studies featuring proven business results and transformative solutions across multiple industries.',
  openGraph: {
    title: 'Case Studies | Strata Noble',
    description: 'Explore our case studies featuring proven business results and transformative solutions across multiple industries.',
  },
};

const caseStudies = [
  {
    title: 'Waste Operations Optimization',
    industry: 'Waste Management',
    challenge: 'Manual reporting processes causing inefficiencies and compliance risks',
    solution: 'Automated data collection and intelligent analytics dashboard with real-time monitoring',
    results: [
      'Improved compliance reporting accuracy by 95%',
      'Streamlined operations with 60% time savings',
      'Identified $150K in annual cost reduction opportunities'
    ],
    savings: '$75,000 annually'
  }
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Proven{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Results
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real transformations delivering measurable business value through data-driven solutions
            and strategic automation across multiple industries.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-200 shadow-sm">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                      <CheckCircleIcon className="h-4 w-4" />
                      {study.industry}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">{study.title}</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Challenge</h4>
                        <p className="text-gray-600">{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Solution</h4>
                        <p className="text-gray-600">{study.solution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8">
                    <h4 className="text-2xl font-bold text-gray-900 mb-6">Results Achieved</h4>
                    <div className="space-y-4 mb-6">
                      {study.results.map((result, resultIndex) => (
                        <div key={resultIndex} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{result}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">{study.savings}</div>
                      <div className="text-sm text-gray-600">Annual Savings</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Let's create measurable results for your business through strategic automation
            and data-driven solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-emerald-700 transition-colors inline-flex items-center justify-center"
            >
              Start Your Transformation
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/methodology"
              className="border-2 border-emerald-600 text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:bg-emerald-50 transition-colors"
            >
              View Our Methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
