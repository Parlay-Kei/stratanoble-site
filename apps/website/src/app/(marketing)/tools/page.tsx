import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tools | Strata Noble',
  description: 'Internal tools we build and deploy for pipeline operations. ACHIEVERY, ProofLoop, and ANX Vault.',
};

const tools = [
  {
    name: 'ProofLoop',
    tagline: 'Trust engine for every delivery',
    description: 'Every pipeline install includes ProofLoop receipts. These prove the build passes, flows work, and handoff is complete. No "trust me bro" delivery.',
    status: 'Included',
    features: [
      'Build integrity receipts',
      'Auth flow verification',
      'Deployment proof pack',
      'Handoff documentation',
    ],
    gradient: 'from-blue-500 to-indigo-500',
    included: 'Lead Rescue: Receipt pack. Pipeline Buildout: Full verification suite.',
  },
  {
    name: 'ANX Vault',
    tagline: 'Your delivery folder',
    description: 'All assets, docs, credentials, Looms, and receipts stored in a private vault. You own it. We hand it off.',
    status: 'Included',
    features: [
      'Secure asset storage',
      'Credential management',
      'Video walkthroughs',
      'Complete handoff docs',
    ],
    gradient: 'from-purple-500 to-pink-500',
    included: 'Every install includes vault access with all deliverables.',
  },
  {
    name: 'ACHIEVERY',
    tagline: 'Operator scorecard (Coming Soon)',
    description: 'Progress tracking for service business operators. See what moved, what stalled, and what needs attention.',
    status: 'In Development',
    features: [
      'Daily progress tracking',
      'Pipeline health scores',
      'Team visibility',
      'Milestone alerts',
    ],
    gradient: 'from-emerald-500 to-teal-500',
    included: 'Early access included with Pipeline Buildout engagements.',
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Tools Included With Every Install
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              These tools ship with your pipeline. You don&apos;t buy them separately.
            </p>
            <p className="text-base text-gray-400">
              ProofLoop receipts prove the work. ANX Vault delivers the assets. ACHIEVERY tracks progress.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${tool.gradient} p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white">{tool.name}</h3>
                    <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm">{tool.tagline}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">{tool.description}</p>

                  <h4 className="text-sm font-semibold text-gray-900 mb-3">What You Get</h4>
                  <ul className="space-y-2 mb-6">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-gray-600">
                        <svg
                          className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Included with */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{tool.included}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need pipeline infrastructure?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            We install these tools as part of your pipeline buildout. Start with the 48-Hour Lead Rescue to see how they work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lead-rescue"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-shadow inline-block"
            >
              Start the 48-Hour Lead Rescue
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
