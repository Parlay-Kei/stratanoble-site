import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About Steve - StrataNoble | The Architect for One-Person Empires',
  description: 'I help people build businesses when they don\'t have money, a network, or a clean map to follow. Strategic clarity for serious builders.',
  openGraph: {
    title: 'About Steve - StrataNoble | The Architect for One-Person Empires',
    description: 'Meet Steve, the strategic mind behind StrataNoble. Building businesses with clarity, speed, and precision.',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-dark-purple text-silver-100">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,51,102,0.3)_0%,transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(4,120,87,0.2)_0%,transparent_50%),#30232d]" />
        <div className="absolute left-[10%] top-0 w-px h-screen bg-gradient-to-b from-transparent via-emerald-600/20 to-transparent hidden lg:block" />
        <div className="absolute right-[10%] top-0 w-px h-screen bg-gradient-to-b from-transparent via-navy-600/30 to-transparent hidden lg:block" />
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-32 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-16 lg:gap-24 items-center">
            <div>
              <div className="inline-block text-xs font-bold text-emerald-600 uppercase tracking-[2px] mb-10 pb-5 border-b-2 border-emerald-600/30">
                About Steve
              </div>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none mb-10 tracking-tight text-white">
                The Architect<br />
                for <span className="bg-gradient-to-br from-emerald-600 to-emerald-700 bg-clip-text text-transparent">One-Person<br />Empires</span>
              </h1>
              <p className="text-xl md:text-2xl text-silver-200 leading-relaxed max-w-2xl">
                I help people build businesses when they don't have money, a network, or a clean map to follow.
              </p>
            </div>
            <div className="flex flex-col gap-12 lg:gap-16">
              <div className="border-l-2 border-emerald-600/30 pl-8">
                <div className="font-serif text-5xl md:text-6xl font-black text-emerald-600 leading-none mb-3">94%</div>
                <div className="text-sm text-silver-300 uppercase tracking-wider">Market Validation</div>
              </div>
              <div className="border-l-2 border-emerald-600/30 pl-8">
                <div className="font-serif text-5xl md:text-6xl font-black text-emerald-600 leading-none mb-3">8wk</div>
                <div className="text-sm text-silver-300 uppercase tracking-wider">Avg Time to Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-transparent via-navy-900/20 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20">
            <h2 className="text-base font-bold text-emerald-600 uppercase tracking-[2px] mb-8">The Problem</h2>
            <div className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-16 max-w-4xl">
              Most people stall because advice is either too fluffy or too expensive
            </div>
          </div>

          <div className="space-y-10 max-w-4xl">
            <p className="text-2xl md:text-3xl text-white leading-relaxed">
              I spent years watching small operators â€” solo founders, side hustlers, first-time consultants â€” stall out because advice was either too fluffy or too expensive.
            </p>
            
            <p className="text-xl md:text-2xl text-silver-200 leading-relaxed">
              I started digging into what actually moves the needle: how to spot a niche before spending a dime, how to design a business model that doesn't collapse under customer acquisition costs, how to test an idea without betting the house.
            </p>
            
            <p className="text-xl md:text-2xl text-silver-200 leading-relaxed">
              My work sits at the crossroads of business design, market intelligence, and risk reduction. I build clear, practical paths for people who want to create income and independence but can't afford to guess their way there.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-32 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              What I Do
            </h2>
            <p className="text-xl text-silver-300">
              Strategic capabilities that turn uncertainty into action
            </p>
          </div>
          
          <div className="space-y-0">
            {[
              {
                number: '01',
                title: 'Low-Capital Entry Points',
                description: 'Ways to get in and prove demand fast without burning through savings or taking unnecessary risks.'
              },
              {
                number: '02',
                title: 'Business Model Engineering',
                description: 'Pricing strategies, recurring revenue structures, and hidden profit centers that actually work.'
              },
              {
                number: '03',
                title: 'Market Research',
                description: 'Pulling competitive intelligence and spotting quiet opportunities others miss.'
              },
              {
                number: '04',
                title: 'Practical Tech Leverage',
                description: "AI, no-code, automation — only what's useful now, without the overwhelm."
              },
              {
                number: '05',
                title: 'Fear Reduction',
                description: 'Giving overwhelmed starters a first safe move that builds confidence and momentum.'
              },
              {
                number: '06',
                title: 'Strategic Blueprint Design',
                description: "I design the blueprint before you spend money on bricks — clarity before capital."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="grid md:grid-cols-[80px_200px_1fr] gap-8 md:gap-10 py-12 md:py-16 border-b border-emerald-600/10 first:border-t transition-all duration-300 hover:pl-5 hover:border-emerald-600/30"
              >
                <div className="font-serif text-4xl md:text-5xl font-black text-emerald-600/20 leading-none">
                  {item.number}
                </div>
                <div className="font-serif text-xl md:text-2xl font-bold text-white leading-tight">
                  {item.title}
                </div>
                <div className="text-base md:text-lg text-silver-200 leading-relaxed">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-transparent via-navy-900/15 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="relative pl-12 md:pl-20">
            <div className="absolute left-0 -top-5 font-serif text-8xl md:text-9xl text-emerald-600/20 font-black leading-none select-none">
              &quot;
            </div>
            <p className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-snug text-white mb-12 md:mb-16">
              I think of myself like an architect for one-person empires â€” I design the blueprint before you spend money on bricks.
            </p>
            <div className="flex items-center gap-5 text-lg md:text-xl text-emerald-600 font-semibold">
              <div className="w-12 md:w-16 h-0.5 bg-emerald-600" />
              <span>Steve</span>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Philosophy Section */}
      <section className="py-32 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            <div>
              <h3 className="text-base font-bold text-emerald-600 uppercase tracking-[2px] mb-8">Location</h3>
              <h4 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8">
                Based in Las Vegas
              </h4>
              <p className="text-lg md:text-xl text-silver-200 leading-relaxed">
                Building a practice helping small businesses and individuals design their next move with clarity, speed, and strategy.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-600 uppercase tracking-[2px] mb-8">Philosophy</h3>
              <h4 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8">
                Clarity Before Capital
              </h4>
              <p className="text-lg md:text-xl text-silver-200 leading-relaxed">
                Every decision should be informed by intelligence, not desperation. I help you see the terrain before you cross it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-4 md:px-8 lg:px-16 text-center bg-gradient-to-b from-transparent to-navy-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-10">
            Ready to Build<br />Without the Guesswork?
          </h2>
          <p className="text-xl md:text-2xl text-silver-200 leading-relaxed mb-16 max-w-2xl mx-auto">
            If you're trying to build something but don't want to burn cash or wander in circles, this is where we start.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-12 md:px-16 py-5 md:py-6 bg-emerald-600 text-white text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 hover:bg-emerald-700 hover:shadow-[0_20px_60px_rgba(4,120,87,0.3)] relative overflow-hidden group"
          >
            <span className="relative z-10">Let's Talk Strategy</span>
            <ChevronRightIcon className="h-5 w-5 relative z-10" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 md:px-8 lg:px-16 border-t border-emerald-600/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5 text-center md:text-left">
            <div className="font-serif text-xl font-bold text-emerald-600">
              StrataNoble
            </div>
            <div className="text-sm text-silver-400">
              &copy; 2025 Architecting one-person empires with precision
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

