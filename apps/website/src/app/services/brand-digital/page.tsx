'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CTA_LABELS } from '@/lib/cta-labels';


const packages = [
  {
    name: 'Starter',
    price: '$1,500',
    features: [
      'Logo design',
      'Brand guidelines',
      'Basic website',
      'Social media setup',
    ],
  },
  {
    name: 'Growth',
    price: '$3,500',
    features: [
      'Full brand identity',
      'Custom website',
      'Content strategy',
      'Social media management',
      'SEO optimization',
    ],
  },
  {
    name: 'Authority',
    price: '$7,500',
    features: [
      'Complete brand suite',
      'Advanced website',
      'Content creation',
      'Marketing automation',
      'Ongoing support',
    ],
  },
];

const portfolio = [
  {
    name: "Nimbus Chronicles",
    image: "/img/logo.svg",
    description: "Brand identity, web, and launch campaign for a SaaS startup."
  },
  {
    name: "Megan's Munchies",
    image: "/img/logo.svg",
    description: "Logo, packaging, and digital presence for a DTC food brand."
  }
];

function IntakeForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    industry: '',
    style: '',
    inspiration: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: '', // Optional field not in intake form
          topic: 'Brand & Digital Presence',
          message: `Industry: ${form.industry}\nStyle Preferences: ${form.style}\nInspiration Links: ${form.inspiration}\n\nMessage: ${form.message}`,
          source: 'brand-digital-intake'
        }),
      });

      if (response.ok) {
        setForm({
          name: '',
          email: '',
          industry: '',
          style: '',
          inspiration: '',
          message: ''
        });
        alert('Intake submitted successfully! We\'ll be in touch soon.');
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      alert('There was an error submitting your form. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/10 p-6 rounded-2xl border border-white/20">
      <h3 className="text-xl font-bold text-white mb-2">Client Intake Form</h3>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20" />
      <input name="industry" value={form.industry} onChange={handleChange} placeholder="Industry" className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20" />
      <input name="style" value={form.style} onChange={handleChange} placeholder="Style Preferences" className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20" />
      <input name="inspiration" value={form.inspiration} onChange={handleChange} placeholder="Inspiration Links" className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20" />
      <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your project..." className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20" />
      <button type="submit" className="w-full bg-[#50C878] hover:bg-[#3DB067] text-white font-medium rounded-lg py-3 px-6">Submit</button>
    </form>
  );
}

export default function BrandDigitalPage() {
  const showPricing = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';
  
  // Handle quote request - redirect to contact page with service context
  const handleQuoteRequest = (packageName?: string) => {
    const params = new URLSearchParams({
      service: 'Brand & Digital Presence',
      ...(packageName && { package: packageName })
    });
    window.location.href = `/contact?${params.toString()}`;
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244]">
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
              Brand & Digital Presence Packages
            </h1>
            <p className="text-lg leading-8 text-[#C0C0C0] mb-8">
              Build a compelling brand identity and digital presence that resonates with your audience.
            </p>
          </div>

          {/* Package Matrix */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Package Matrix</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, idx) => (
                <div key={idx} className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  {showPricing ? (
                    <div className="text-3xl font-bold text-[#50C878] mb-4">{pkg.price}</div>
                  ) : (
                    <div className="text-lg text-[#50C878] mb-4">Custom Quote Available</div>
                  )}
                  <ul className="mb-6 space-y-2">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="text-[#C0C0C0] flex items-center justify-center"><span className="text-[#50C878] mr-2">✓</span>{f}</li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleQuoteRequest(pkg.name)}
                    className="w-full bg-[#50C878] hover:bg-[#3DB067] text-white font-medium rounded-lg py-2 px-4 transition-colors"
                  >
{CTA_LABELS.REQUEST_QUOTE}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Mock-ups */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Visual Mock-ups</h2>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              <div className="w-80 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-white/20 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="text-sm font-medium">Before: Basic Brand</div>
                </div>
              </div>
              <div className="w-80 h-48 bg-gradient-to-br from-emerald-100 to-navy-100 rounded-xl border border-white/20 flex items-center justify-center">
                <div className="text-center text-navy-700">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-sm font-medium">After: Professional Suite</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Transparency */}
          <div className="mb-16 text-center">
            {showPricing ? (
              <span className="inline-block bg-[#50C878] text-white px-6 py-2 rounded-full font-bold text-lg mb-4">From $1,500</span>
            ) : (
              <span className="inline-block bg-[#50C878] text-white px-6 py-2 rounded-full font-bold text-lg mb-4">Contact for Custom Quote</span>
            )}
            <div>
              <button 
                onClick={() => handleQuoteRequest()}
                className="text-[#50C878] underline font-medium bg-transparent border-none cursor-pointer hover:text-[#3DB067] transition-colors"
              >
{CTA_LABELS.REQUEST_QUOTE}
              </button>
            </div>
          </div>

          {/* Project Timeline Graphic */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Project Timeline</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#C0C0C0]">Discovery</span>
                  <span className="text-[#C0C0C0]">Concept</span>
                  <span className="text-[#C0C0C0]">Delivery</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full relative">
                  <div className="absolute left-0 top-0 h-3 bg-[#50C878] rounded-full" style={{ width: '33%' }}></div>
                  <div className="absolute left-1/3 top-0 h-3 bg-[#50C878] rounded-full" style={{ width: '33%' }}></div>
                  <div className="absolute left-2/3 top-0 h-3 bg-[#50C878] rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Intake Form & Portfolio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <IntakeForm />
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Portfolio Gallery</h2>
              <div className="grid grid-cols-1 gap-6">
                {portfolio.map((item, idx) => (
                  <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/20 flex items-center gap-4">
                    <Image src={item.image} alt={`${item.name} brand identity project showcasing logo and visual design`} width={64} height={64} className="rounded-lg border border-white/20" />
                    <div>
                      <div className="text-white font-semibold">{item.name}</div>
                      <div className="text-[#C0C0C0] text-sm">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
