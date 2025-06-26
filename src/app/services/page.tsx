import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-6xl">
              Our Services
            </h1>
            <p className="mt-6 text-lg leading-8 text-navy-600">
              Comprehensive solutions to transform your passion into a profitable business
            </p>
          </div>
          
          {/* Service sections will be implemented in future sprints */}
          <div className="mt-16 space-y-32">
            <section id="idea-to-execution" className="scroll-mt-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">
                  Idea to Execution Strategy
                </h2>
                <p className="text-navy-600">
                  Content coming soon...
                </p>
              </div>
            </section>

            <section id="ai-nocode-stack" className="scroll-mt-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">
                  AI/No-Code Stack Setup
                </h2>
                <p className="text-navy-600">
                  Content coming soon...
                </p>
              </div>
            </section>

            <section id="ops-blueprint" className="scroll-mt-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">
                  Ops & Delegation Blueprint
                </h2>
                <p className="text-navy-600">
                  Content coming soon...
                </p>
              </div>
            </section>

            <section id="workshops" className="scroll-mt-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">
                  1:1 Workshops & Advisory
                </h2>
                <p className="text-navy-600">
                  Content coming soon...
                </p>
              </div>
            </section>

            <section id="analytics" className="scroll-mt-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">
                  Performance Analytics
                </h2>
                <p className="text-navy-600">
                  Content coming soon...
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
} 