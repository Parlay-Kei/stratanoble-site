'use client';

import { useState } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';

interface CaseStudy {
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  savings: string;
  image: string;
}

const caseStudies: CaseStudy[] = [
  {
    title: 'Waste Management Optimization',
    company: 'Waste-Ops Pilot',
    industry: 'Manufacturing',
    challenge: 'Inefficient waste disposal processes leading to 40% cost overruns and compliance risks',
    solution: 'Implemented data-driven waste tracking system with automated reporting and predictive analytics',
    results: [
      'Reduced waste disposal costs by 35%',
      'Improved compliance reporting accuracy by 95%',
      'Streamlined operations with 60% time savings',
      'Identified $150K in annual cost reduction opportunities'
    ],
    savings: '$75,000 annually',
    image: '/img/waste-ops-case-study.png'
  },
  {
    title: 'Returns Processing Optimization',
    company: 'DHL Returns Division',
    industry: 'Logistics',
    challenge: 'Complex returns processing causing delays and customer dissatisfaction',
    solution: 'Developed intelligent routing system with real-time analytics and automated decision making',
    results: [
      'Reduced processing time by 45%',
      'Improved customer satisfaction scores by 30%',
      'Decreased operational costs by 25%',
      'Enhanced tracking accuracy to 99.8%'
    ],
    savings: '$200,000 annually',
    image: '/img/dhl-case-study.png'
  }
];

function CaseStudyCard({ caseStudy, index }: { caseStudy: CaseStudy; index: number }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{caseStudy.title}</h3>
          <p className="text-[#50C878] text-sm">{caseStudy.company} • {caseStudy.industry}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#50C878]">{caseStudy.savings}</div>
          <div className="text-sm text-[#C0C0C0]">Annual Savings</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-[#50C878] font-semibold mb-2">Challenge:</h4>
          <p className="text-[#C0C0C0] text-sm">{caseStudy.challenge}</p>
        </div>

        <div>
          <h4 className="text-[#50C878] font-semibold mb-2">Solution:</h4>
          <p className="text-[#C0C0C0] text-sm">{caseStudy.solution}</p>
        </div>

        <div>
          <h4 className="text-[#50C878] font-semibold mb-2">Results:</h4>
          <ul className="space-y-1">
            {caseStudy.results.map((result, idx) => (
              <li key={idx} className="flex items-start text-[#C0C0C0] text-sm">
                <span className="text-[#50C878] mr-2 mt-1">✓</span>
                {result}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function InquiryForm() {
  const [formData, setFormData] = useState({
    companySize: '',
    dataPainPoint: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Inquiry submitted:', formData);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Request Sample Analysis</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[#50C878] text-sm font-medium mb-2">Company Size</label>
          <select
            value={formData.companySize}
            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#50C878]"
            required
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="200+">200+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-[#50C878] text-sm font-medium mb-2">Primary Data Pain Point</label>
          <select
            value={formData.dataPainPoint}
            onChange={(e) => setFormData({ ...formData, dataPainPoint: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#50C878]"
            required
          >
            <option value="">Select pain point</option>
            <option value="cost-optimization">Cost optimization</option>
            <option value="process-efficiency">Process efficiency</option>
            <option value="data-visibility">Data visibility</option>
            <option value="compliance-reporting">Compliance reporting</option>
            <option value="customer-insights">Customer insights</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#50C878] text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#50C878]"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-[#50C878] text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#50C878]"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[#50C878] text-sm font-medium mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#50C878]"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-[#50C878] text-sm font-medium mb-2">Additional Details</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#50C878]"
            placeholder="Tell us more about your data challenges..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#50C878] hover:bg-[#3DB067] transition-colors text-white font-medium rounded-lg py-3 px-6"
        >
          Request Sample Analysis
        </button>
      </form>
    </div>
  );
}

export default function DataAnalysisPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244]">
      <Header />
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
              Data & Operations Analysis
            </h1>
            <p className="text-lg leading-8 text-[#C0C0C0] mb-8">
              Unlock hidden opportunities in your operations with comprehensive data analysis and actionable recommendations
            </p>
            
            {/* ROI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#50C878] mb-2">35%</div>
                <div className="text-[#C0C0C0] text-sm">Average Cost Reduction</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#50C878] mb-2">60%</div>
                <div className="text-[#C0C0C0] text-sm">Process Efficiency Gain</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-[#50C878] mb-2">$150K</div>
                <div className="text-[#C0C0C0] text-sm">Average Annual Savings</div>
              </div>
            </div>
          </div>

          {/* Service Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">What We Deliver</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-[#50C878] mr-3 mt-1">📊</span>
                  <div>
                    <h3 className="text-white font-semibold">KPI Dashboard Setup</h3>
                    <p className="text-[#C0C0C0] text-sm">Custom dashboards that track your most important metrics in real-time</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-[#50C878] mr-3 mt-1">🔍</span>
                  <div>
                    <h3 className="text-white font-semibold">Data Collection Strategy</h3>
                    <p className="text-[#C0C0C0] text-sm">Systematic approach to gathering and organizing your operational data</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-[#50C878] mr-3 mt-1">📈</span>
                  <div>
                    <h3 className="text-white font-semibold">Performance Reports</h3>
                    <p className="text-[#C0C0C0] text-sm">Detailed analysis with actionable insights and improvement recommendations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-[#50C878] mr-3 mt-1">🎯</span>
                  <div>
                    <h3 className="text-white font-semibold">Optimization Roadmap</h3>
                    <p className="text-[#C0C0C0] text-sm">Step-by-step implementation plan to achieve your efficiency goals</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Sample KPI Dashboard</h2>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                {/* Dashboard Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white font-semibold">Operations Dashboard</h3>
                    <p className="text-[#C0C0C0] text-sm">Real-time performance metrics</p>
                  </div>
                  <div className="text-[#50C878] text-sm">Live Data</div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-[#50C878]">$45K</div>
                    <div className="text-[#C0C0C0] text-xs">Monthly Savings</div>
                    <div className="text-[#50C878] text-xs">↑ 12% vs last month</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-[#50C878]">87%</div>
                    <div className="text-[#C0C0C0] text-xs">Efficiency Score</div>
                    <div className="text-[#50C878] text-xs">↑ 5% vs last month</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-[#50C878]">2.3hrs</div>
                    <div className="text-[#C0C0C0] text-xs">Avg. Process Time</div>
                    <div className="text-[#50C878] text-xs">↓ 15% vs last month</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-[#50C878]">99.2%</div>
                    <div className="text-[#C0C0C0] text-xs">Accuracy Rate</div>
                    <div className="text-[#50C878] text-xs">↑ 0.8% vs last month</div>
                  </div>
                </div>

                {/* Trend Chart Placeholder */}
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white text-sm font-medium">Cost Savings Trend</span>
                    <span className="text-[#C0C0C0] text-xs">Last 6 months</span>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-[#50C878]/20 to-[#50C878]/40 rounded flex items-end justify-between px-2">
                    <div className="w-3 bg-[#50C878] rounded-t" style={{height: '40%'}}></div>
                    <div className="w-3 bg-[#50C878] rounded-t" style={{height: '55%'}}></div>
                    <div className="w-3 bg-[#50C878] rounded-t" style={{height: '45%'}}></div>
                    <div className="w-3 bg-[#50C878] rounded-t" style={{height: '70%'}}></div>
                    <div className="w-3 bg-[#50C878] rounded-t" style={{height: '65%'}}></div>
                    <div className="w-3 bg-[#50C878] rounded-t" style={{height: '85%'}}></div>
                  </div>
                </div>

                {/* Live Walk-through CTA */}
                <div className="text-center">
                  <button className="bg-[#50C878] hover:bg-[#3DB067] transition-colors text-white font-semibold py-3 px-6 rounded-lg mb-3">
                    Request Live Walk-through
                  </button>
                  <p className="text-[#C0C0C0] text-xs">
                    See this dashboard in action with your data
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Case Studies */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {caseStudies.map((caseStudy, index) => (
                <CaseStudyCard key={index} caseStudy={caseStudy} index={index} />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Optimize?</h2>
              <p className="text-[#C0C0C0] mb-6">
                Get a free sample analysis of your operations. We&apos;ll identify potential savings and efficiency improvements specific to your business.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-[#C0C0C0]">
                  <span className="text-[#50C878] mr-3">✓</span>
                  No obligation consultation
                </div>
                <div className="flex items-center text-[#C0C0C0]">
                  <span className="text-[#50C878] mr-3">✓</span>
                  Custom analysis report
                </div>
                <div className="flex items-center text-[#C0C0C0]">
                  <span className="text-[#50C878] mr-3">✓</span>
                  Implementation roadmap
                </div>
              </div>
            </div>
            <InquiryForm />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 