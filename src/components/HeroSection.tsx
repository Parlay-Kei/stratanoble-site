import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-50 to-silver-50 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Tagline Banner */}
          <div className="mb-8 inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="mr-2">✨</span>
            Passion to Prosperity
            <span className="ml-2">✨</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-6xl lg:text-7xl">
            Transform Your{' '}
            <span className="gradient-text">Passion</span>
            <br />
            Into{' '}
            <span className="gradient-text">Profit</span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 text-lg leading-8 text-navy-600 sm:text-xl">
            Expert guidance to turn your vision into a thriving business. 
            From idea to execution, we provide the strategy, tools, and support 
            you need to build sustainable success.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/contact"
              className="btn-primary btn-lg group"
            >
              Start Your Journey
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/services"
              className="btn-outline btn-lg"
            >
              Explore Services
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex items-center justify-center gap-x-8 text-sm text-navy-500">
            <div className="flex items-center gap-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Proven Strategies</span>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Expert Guidance</span>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Results-Driven</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-emerald-400 to-navy-400 opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
      </div>
    </section>
  )
}
