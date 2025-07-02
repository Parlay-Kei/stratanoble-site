import { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Container } from '@/components/ui/container';
import { caseStudies, getFeaturedCaseStudies } from '@/data/caseStudies';

export const metadata: Metadata = {
  title: 'Case Studies | Strata Noble',
  description: 'Explore real results from our strategic partnerships. See how we\'ve helped businesses achieve transformative growth and operational excellence.',
  openGraph: {
    title: 'Case Studies | Strata Noble',
    description: 'Discover how we\'ve helped businesses achieve 340% revenue growth, 80% cost reduction, and market leadership through strategic innovation.',
  },
};

export default function CaseStudiesPage() {
  const featuredCaseStudies = getFeaturedCaseStudies();

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-900 text-white py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Real Results, Real Impact
            </h1>
            <p className="text-xl md:text-2xl text-navy-100 leading-relaxed">
              Discover how our strategic approach has transformed businesses across industries.
            </p>
          </div>
        </Container>
      </section>

      {/* Featured Case Studies */}
      <section className="py-20 bg-navy-50">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
                Featured Success Stories
              </h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto mb-8"></div>
              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                These case studies showcase the transformative impact of strategic innovation across different industries and challenges.
              </p>
            </div>

            <div className="space-y-16">
              {featuredCaseStudies.map((caseStudy, index) => (
                <div key={caseStudy.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} md:flex`}>
                  {/* Image Section */}
                  <div className="md:w-1/2">
                    <div className="aspect-video bg-gradient-to-br from-navy-100 to-emerald-100 flex items-center justify-center">
                      <div className="text-6xl text-navy-300">📊</div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="md:w-1/2 p-8 md:p-12">
                    <div className="mb-4">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
                        {caseStudy.industry}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4">
                      {caseStudy.title}
                    </h3>
                    
                    <p className="text-lg text-navy-600 mb-6">
                      {caseStudy.subtitle}
                    </p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {caseStudy.kpis.slice(0, 2).map((kpi, kpiIndex) => (
                        <div key={kpiIndex} className="text-center p-4 bg-navy-50 rounded-lg">
                          <div className="text-2xl font-bold text-emerald-600">{kpi.improvement}</div>
                          <div className="text-sm text-navy-600">{kpi.metric}</div>
                        </div>
                      ))}
                    </div>

                    {/* Pull Quote */}
                    <blockquote className="border-l-4 border-emerald-500 pl-4 mb-6">
                      <p className="text-navy-700 italic mb-2">&ldquo;{caseStudy.pullQuote}&rdquo;</p>
                      <footer className="text-sm text-navy-600">
                        <strong>{caseStudy.pullQuoteAuthor}</strong>, {caseStudy.pullQuoteRole}
                      </footer>
                    </blockquote>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {caseStudy.services.map((service, serviceIndex) => (
                        <span key={serviceIndex} className="bg-navy-100 text-navy-700 text-sm px-3 py-1 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>

                    <a
                      href={`/case-studies/${caseStudy.id}`}
                      className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Read Full Case Study
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* All Case Studies Grid */}
      <section className="py-20 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
                All Case Studies
              </h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto mb-8"></div>
              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                Explore our complete portfolio of strategic transformations and business success stories.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy) => (
                <div key={caseStudy.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-navy-100 to-emerald-100 flex items-center justify-center">
                    <div className="text-4xl text-navy-300">📊</div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full">
                        {caseStudy.industry}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-navy-900 mb-2">
                      {caseStudy.title}
                    </h3>
                    
                    <p className="text-navy-600 text-sm mb-4">
                      {caseStudy.subtitle}
                    </p>

                    {/* Top KPI */}
                    <div className="mb-4 p-3 bg-navy-50 rounded-lg text-center">
                      <div className="text-xl font-bold text-emerald-600">{caseStudy.kpis[0].improvement}</div>
                      <div className="text-xs text-navy-600">{caseStudy.kpis[0].metric}</div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {caseStudy.services.slice(0, 2).map((service, serviceIndex) => (
                        <span key={serviceIndex} className="bg-navy-100 text-navy-700 text-xs px-2 py-1 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>

                    <a
                      href={`/case-studies/${caseStudy.id}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                    >
                      Read Full Case Study →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy-900 to-emerald-900 text-white">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Your Success Story?
            </h2>
            <p className="text-xl text-navy-100 mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss how our strategic approach can help you achieve similar transformative results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/discovery"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Start Your Transformation
              </a>
              <a
                href="/contact"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-navy-900 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
