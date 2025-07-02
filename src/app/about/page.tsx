import { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'About Strata Noble | Building Prosperity Through Strategic Innovation',
  description: 'Learn about Strata Noble\'s mission to transform businesses through strategic innovation, data-driven insights, and proven methodologies.',
  openGraph: {
    title: 'About Strata Noble | Building Prosperity Through Strategic Innovation',
    description: 'Discover our story, mission, and the team behind Strata Noble\'s success in transforming businesses.',
  },
};

const teamMembers = [
  {
    name: 'Alex Hubbard',
    role: 'Founder & Strategic Director',
    bio: 'With over 15 years of experience in business strategy and digital transformation, Alex leads Strata Noble\'s mission to democratize strategic innovation. His background spans from Fortune 500 consulting to scaling startups, giving him unique insights into what drives sustainable business growth.',
    image: '/img/team/alex-hubbard.jpg',
  },
  {
    name: 'Sarah Chen',
    role: 'Head of Data & Analytics',
    bio: 'Sarah brings deep expertise in data science and business intelligence, having helped dozens of companies unlock the power of their data. She specializes in translating complex analytics into actionable business strategies that drive measurable results.',
    image: '/img/team/sarah-chen.jpg',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Digital Strategy Lead',
    bio: 'Marcus is a digital transformation expert with a track record of helping businesses modernize their operations and customer experiences. His approach combines cutting-edge technology with timeless business principles to create lasting competitive advantages.',
    image: '/img/team/marcus-rodriguez.jpg',
  },
];

const values = [
  {
    title: 'Strategic Innovation',
    description: 'We believe in challenging conventional thinking to discover breakthrough solutions that create lasting competitive advantages.',
    icon: '🚀',
  },
  {
    title: 'Data-Driven Decisions',
    description: 'Every recommendation we make is backed by solid data and analytics, ensuring our strategies are both innovative and evidence-based.',
    icon: '📊',
  },
  {
    title: 'Client Partnership',
    description: 'We work as an extension of your team, building deep relationships that go beyond traditional consulting to drive real, sustainable results.',
    icon: '🤝',
  },
  {
    title: 'Continuous Learning',
    description: 'We stay at the forefront of business trends and technologies, constantly evolving our methodologies to deliver cutting-edge solutions.',
    icon: '🎓',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-900 text-white py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Building Prosperity Through Strategic Innovation
            </h1>
            <p className="text-xl md:text-2xl text-navy-100 leading-relaxed">
              We transform businesses by combining data-driven insights with proven strategic methodologies.
            </p>
          </div>
        </Container>
      </section>

      {/* Origin Story */}
      <section className="py-20 bg-navy-50">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
                Our Story
              </h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto"></div>
            </div>
            
            <div className="prose prose-lg mx-auto text-navy-700">
              <p className="text-xl leading-relaxed mb-6">
                Strata Noble was born from a simple observation: too many businesses were struggling with the same fundamental challenges, 
                yet the solutions available were either too expensive for most companies or too generic to be truly effective.
              </p>
              
              <p className="text-xl leading-relaxed mb-6">
                Our founder, Alex Hubbard, spent years working with both Fortune 500 companies and scrappy startups, witnessing firsthand 
                how strategic innovation could transform businesses of any size. But he also saw how traditional consulting firms often 
                left smaller companies behind, focusing only on enterprise clients who could afford their premium services.
              </p>
              
              <p className="text-xl leading-relaxed">
                That&apos;s why we created Strata Noble – to democratize strategic innovation. We believe that every business, regardless of size, 
                deserves access to world-class strategic thinking, data-driven insights, and proven methodologies that can drive real, 
                measurable growth. Our mission is to help businesses build sustainable prosperity through strategic innovation that&apos;s 
                accessible, actionable, and results-driven.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-white">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
                Our Mission & Values
              </h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto mb-8"></div>
                              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                  We&apos;re driven by a clear mission and guided by core values that shape everything we do.
                </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-emerald-50 to-navy-50 rounded-2xl p-8 md:p-12 mb-16">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-navy-900 mb-6">
                  Our Mission
                </h3>
                <p className="text-xl md:text-2xl text-navy-700 leading-relaxed max-w-4xl mx-auto">
                  To democratize strategic innovation by making world-class business strategy accessible, 
                  actionable, and results-driven for businesses of all sizes.
                </p>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-white shadow-lg border border-navy-100 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-3">{value.title}</h3>
                  <p className="text-navy-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-navy-50">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
                Meet Our Team
              </h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto mb-8"></div>
                              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                  The strategic minds behind Strata Noble&apos;s success in transforming businesses.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-navy-100 to-emerald-100 flex items-center justify-center">
                    <div className="text-6xl text-navy-300">👤</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-navy-900 mb-2">{member.name}</h3>
                    <p className="text-emerald-600 font-medium mb-4">{member.role}</p>
                    <p className="text-navy-600 leading-relaxed">{member.bio}</p>
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
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-navy-100 mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss how our strategic approach can help you build sustainable prosperity and competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Get Started
              </a>
              <a
                href="/discovery"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-navy-900 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Free Discovery Call
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
