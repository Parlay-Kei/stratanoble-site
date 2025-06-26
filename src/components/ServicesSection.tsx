import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { services } from '@/data/services'

export function ServicesSection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-br from-silver-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Our Services
            </h2>
            <p className="mt-4 text-lg leading-8 text-navy-600">
              Comprehensive solutions to transform your passion into a profitable business
            </p>
        </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-silver-200 hover:border-emerald-200"
              >
                {/* Service Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-navy-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                </div>

                {/* Service Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-emerald-600 transition-colors">
                  {service.title}
                </h3>
                  <p className="text-navy-600 leading-relaxed">
                    {service.subtitle}
                  </p>
                </div>

                {/* Learn More Link */}
                <div className="mt-6">
                  <Link
                    href={service.link}
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium group/link"
                  >
                    Learn more
                    <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-navy-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
                  ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-navy-600 to-emerald-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Let's discuss how we can help you achieve your goals
              </p>
              <Link
                href="/contact"
                className="btn bg-white text-navy-900 hover:bg-silver-100 btn-lg inline-flex items-center"
              >
                Schedule a Consultation
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
