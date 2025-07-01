export function MissionSection() {
  return (
    <section className="pt-14 sm:pt-18 lg:pt-20 pb-14 sm:pb-18 lg:pb-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Our Mission & Vision
            </h2>
            <p className="mt-4 text-lg leading-8 text-navy-600">
              Guiding entrepreneurs from passion to prosperity through strategic excellence
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Mission */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-500 rounded-full opacity-20"></div>
              <div className="relative bg-gradient-to-br from-navy-50 to-silver-50 rounded-2xl p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900">Our Mission</h3>
                </div>
                <p className="text-lg leading-relaxed text-navy-700 mb-6">
                  To empower passionate entrepreneurs with the strategic framework, operational
                  excellence, and technological tools needed to transform their vision into
                  sustainable, profitable businesses.
                </p>
                <ul className="space-y-3 text-navy-600">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Provide proven business strategies and frameworks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Implement cutting-edge AI and automation solutions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Build scalable operational systems</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Vision */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-navy-500 rounded-full opacity-20"></div>
              <div className="relative bg-gradient-to-br from-emerald-50 to-silver-50 rounded-2xl p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900">Our Vision</h3>
                </div>
                <p className="text-lg leading-relaxed text-navy-700 mb-6">
                  To be the leading catalyst for entrepreneurial success, creating a world where
                  every passionate individual has the knowledge, tools, and support to build
                  thriving businesses that make a positive impact.
                </p>
                <ul className="space-y-3 text-navy-600">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-navy-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Democratize access to business expertise</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-navy-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Foster innovation through technology integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-navy-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Create sustainable economic growth</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center text-navy-900 mb-12">Our Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h4 className="text-lg font-semibold text-navy-900 mb-2">Innovation</h4>
                <p className="text-navy-600">Embracing new technologies and creative solutions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h4 className="text-lg font-semibold text-navy-900 mb-2">Partnership</h4>
                <p className="text-navy-600">
                  Building lasting relationships based on trust and results
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-silver-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="text-lg font-semibold text-navy-900 mb-2">Excellence</h4>
                <p className="text-navy-600">
                  Delivering exceptional value and measurable outcomes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
